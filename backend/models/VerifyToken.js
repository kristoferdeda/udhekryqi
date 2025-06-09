const mongoose = require('mongoose');

const verifyTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  token: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    default: () => Date.now() + 1000 * 60 * 60 // 1 hour
  }
});

module.exports = mongoose.model('VerifyToken', verifyTokenSchema);
