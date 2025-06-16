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
  // Start the server only after DB is connected
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
})
.catch((error) => {
  console.error('❌ MongoDB connection failed:', error.message);
});

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);
const postRoutes = require('./routes/postRoutes');
app.use('/api/posts', postRoutes);
