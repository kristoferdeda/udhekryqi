// server.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Import routers/controllers
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const { getPostPreview } = require('./controllers/postController');

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);

// Ensure the preview route is reachable even if SPA fallback comes later
// (If you use separate postRoutes with preview, this may not be necessary,
// but it's safe to ensure it here)
app.get('/api/posts/preview/:id', getPostPreview);

// Serve your front-end build (adjust folder name if different)
const clientPath = path.join(__dirname, 'frontend', 'dist');
app.use(express.static(clientPath));

// Fallback to index.html for all other non-API routes (SPA routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(clientPath, 'index.html'));
});

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
  });
