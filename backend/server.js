const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const Post = require('./models/Post'); // Your Post model

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
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
  process.exit(1);
});

// Social media preview route (must be BEFORE /api/posts routes)
app.get('/posts/:id', async (req, res) => {
  const userAgent = req.headers['user-agent'] || '';
  const isBot = /facebookexternalhit|twitterbot|linkedinbot|discordbot|telegrambot|whatsapp/i.test(userAgent);
  const postId = req.params.id;

  if (isBot) {
    try {
      const post = await Post.findById(postId);
      if (!post) return res.status(404).send('Post not found');

      // Clean description for meta
      const description = (post.content || '').replace(/<[^>]+>/g, '').slice(0, 160) || 'Lexo artikullin në Udhëkryqi.';
      const imageUrl = post.media?.[0] || process.env.DEFAULT_IMAGE_URL || 'https://udhekryqi.com/Logo-horizontal.png';
      const frontendUrl = process.env.FRONTEND_URL
      const fullUrl = `${frontendUrl}/posts/${post._id}`;

      const html = `
        <!DOCTYPE html>
        <html lang="sq">
          <head>
            <meta charset="UTF-8" />
            <title>${post.title}</title>
            <meta name="description" content="${description}">
            <meta property="og:type" content="article">
            <meta property="og:title" content="${post.title}">
            <meta property="og:description" content="${description}">
            <meta property="og:image" content="${imageUrl}">
            <meta property="og:url" content="${fullUrl}">
            <meta name="twitter:card" content="summary_large_image">
            <meta name="twitter:title" content="${post.title}">
            <meta name="twitter:description" content="${description}">
            <meta name="twitter:image" content="${imageUrl}">
            <meta http-equiv="refresh" content="0; url=${fullUrl}" />
          </head>
          <body>
            <p>Redirecting to <a href="${fullUrl}">${fullUrl}</a></p>
          </body>
        </html>
      `;
      return res.send(html);
    } catch (err) {
      console.error('Error generating preview:', err);
      return res.status(500).send('Error generating preview');
    }
  }

  // Not a bot, serve 404 or pass to React frontend (if you serve frontend here)
  res.status(404).send('Not found');
});

// Register your API routes here
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const postRoutes = require('./routes/postRoutes');
app.use('/api/posts', postRoutes);
