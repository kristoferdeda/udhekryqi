const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const VerifyToken = require('../models/VerifyToken');
const sendEmail = require('../utils/sendEmail');
const Post = require('../models/Post');


const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;

    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const { name, password } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'User updated',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Update failed', error: err.message });
  }
};


const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const deletePosts = req.query.deletePosts === 'true';

    if (req.user.role !== 'admin' && req.user.id !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (deletePosts) {
      await Post.deleteMany({ 'author._id': userId });
    }

    res.status(200).json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Delete failed', error: err.message });
  }
};


const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already in use' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'user',        // ✅ always user
      verified: false,
    });

    const tokenString = crypto.randomBytes(32).toString('hex');
    const token = new VerifyToken({
      userId: user._id,
      token: tokenString,
    });
    await token.save();

    const verifyUrl = `http://localhost:5000/api/auth/verify/${token.token}`;
    const html = `
      <p>Hi ${user.name},</p>
      <p>Please verify your email by clicking the link below:</p>
      <a href="${verifyUrl}">${verifyUrl}</a>
    `;
    await sendEmail(user.email, 'Verify your email', html);

    res.status(201).json({ message: 'User registered. Please verify your email.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
};




const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid email or password' });

    // Check if user is verified
    if (!user.verified) {
      return res.status(403).json({ message: 'Please verify your email before logging in.' });
    }

    // Compare passwords
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: 'Invalid email or password' });

    // Generate token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        verified: user.verified,
        adminApproved: user.adminApproved || false,
      }

    });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const token = req.params.token;

    // Find token document
    const tokenDoc = await VerifyToken.findOne({ token });
    if (!tokenDoc) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    // Find the user
    const user = await User.findById(tokenDoc.userId);
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Handle normal user flow
    if (!user.verified) {
      user.verified = true;
      await user.save();
      await tokenDoc.deleteOne();
      return res.status(200).json({ message: 'Email verified successfully. You can now log in.' });
    } else {
      return res.status(200).json({ message: 'Email already verified.' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Email verification failed', error: err.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: 'User not found' });

    const tokenString = crypto.randomBytes(32).toString('hex');
    const token = new VerifyToken({ userId: user._id, token: tokenString });
    await token.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${tokenString}`;
    const html = `
      <p>Hi ${user.name},</p>
      <p>You requested a password reset. Click the link below to set a new password:</p>
      <a href="${resetUrl}">${resetUrl}</a>
    `;

    await sendEmail(user.email, 'Reset your password', html);
    res.status(200).json({ message: 'Password reset email sent' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to process request', error: err.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    const tokenDoc = await VerifyToken.findOne({ token });
    if (!tokenDoc) return res.status(400).json({ message: 'Invalid or expired token' });

    const user = await User.findById(tokenDoc.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();
    await tokenDoc.deleteOne();

    res.status(200).json({ message: 'Password reset successful. You can now log in.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to reset password', error: err.message });
  }
};


const sendContactMessage = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return res.status(400).json({ message: 'Të gjitha fushat janë të detyrueshme.' });
    }

    // Email to Udhëkryqi admin
    const subjectToAdmin = `Kontakt nga ${name}`;
    const htmlToAdmin = `
      <p><strong>Emri:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Mesazhi:</strong><br/>${message}</p>
    `;
    await sendEmail('mail@udhekryqi.com', subjectToAdmin, htmlToAdmin);

    // Auto-reply to user
    const subjectToUser = 'Udhëkryqi: Mesazhi juaj është pranuar';
    const htmlToUser = `
      <p>I nderuar/ë ${name},</p>
      <p>Faleminderit që na kontaktuat. Mesazhi juaj është pranuar dhe do të shqyrtohet sa më shpejt.</p>
      <p>Ju mund të përgjigjeni në këtë email nëse dëshironi të shtoni diçka.</p>
      <p><em>Udhëkryqi</em></p>
    `;
    await sendEmail(email, subjectToUser, htmlToUser);

    res.status(200).json({ message: 'Mesazhi u dërgua me sukses.' });
  } catch (err) {
    console.error('Gabim gjatë dërgimit të kontaktit:', err);
    res.status(500).json({ message: 'Dërgimi dështoi.', error: err.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  verifyEmail,
  updateUser,
  deleteUser,
  forgotPassword,
  resetPassword,
  sendContactMessage
};
