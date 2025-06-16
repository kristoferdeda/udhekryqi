const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

// Load .env variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Parse JSON bodies

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('❌ MongoDB connection failed:', error.message);
  });

// API Routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const postRoutes = require('./routes/postRoutes');
app.use('/api/posts', postRoutes);

// Serve frontend (React) - only for non-API routes
const clientPath = path.join(__dirname, 'client', 'dist'); // change if you're using another folder

app.use(express.static(clientPath));

// 🛑 Make sure this comes AFTER your /api routes
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next(); // skip if API
  res.sendFile(path.join(clientPath, 'index.html'));
});
