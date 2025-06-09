const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  verifyEmail, 
  updateUser, 
  deleteUser,
  forgotPassword,
  resetPassword,
  sendContactMessage
} = require('../controllers/authController');

const { verifyToken, isAdmin } = require('../middleware/auth');

// POST /api/auth/register
router.post('/register', registerUser);

// POST /api/auth/login
router.post('/login', loginUser);

router.get('/verify/:token', verifyEmail);

// Update user by ID (admin only)
router.put('/user/:id', verifyToken, updateUser);

// Delete user by ID (admin or self)
router.delete('/user/:id', verifyToken, deleteUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.post('/contact', sendContactMessage);

module.exports = router;
