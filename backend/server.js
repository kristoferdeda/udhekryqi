const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => console.error('❌ DB connection failed:', err));

// API routes
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);

// Serve static frontend (adjust path if needed)
const clientPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(clientPath));

// 🎯 Catch-all for client-side routing (name the wildcard!)
app.all('/*catchall', (req, res) => {
  res.sendFile(path.join(clientPath, 'index.html'));
});
