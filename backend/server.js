// server.js
const express  = require('express');
const mongoose = require('mongoose');
const dotenv   = require('dotenv');
const cors     = require('cors');
const path     = require('path');
const Post     = require('./models/Post');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Precompile a broader bot‐UA regex:
// facebookexternalhit, Facebot, twitterbot, linkedinbot, discordbot, telegrambot, whatsapp, slackbot
const BOT_REGEX = /(facebookexternalhit|facebot|twitterbot|linkedinbot|discordbot|telegrambot|whatsapp|slackbot)/i;

// Helper to strip trailing slash from CLIENT_URL
const baseURL = (process.env.CLIENT_URL || '').replace(/\/$/, '');

// 1) BOT PREVIEW handler for both GET and HEAD
['get','head'].forEach(method => {
  app[method]('/posts/:id', async (req, res, next) => {
    const ua = req.headers['user-agent'] || '';
    if (!BOT_REGEX.test(ua)) {
      // Not a bot → pass through to React SPA
      return next();
    }

    try {
      const post = await Post.findById(req.params.id);
      if (!post) return res.status(404).send('Not found');

      const description = (post.content || '')
        .replace(/<[^>]+>/g, '')
        .slice(0, 160);
      const imageUrl = post.media?.[0] || `${baseURL}/Logo-horizontal.png`;
      const postUrl  = `${baseURL}/posts/${post._id}`;

      return res.send(`<!DOCTYPE html>
<html lang="sq">
<head>
  <meta charset="utf-8">
  <title>${post.title}</title>
  <meta name="description"       content="${description}">
  <meta property="og:type"        content="article">
  <meta property="og:title"       content="${post.title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image"       content="${imageUrl}">
  <meta property="og:url"         content="${postUrl}">
  <meta name="twitter:card"       content="summary_large_image">
  <meta http-equiv="refresh"      content="0; url=${postUrl}">
</head>
<body>Redirecting…</body></html>`);
    } catch (err) {
      console.error('Preview error:', err);
      return res.status(500).send('Error generating preview');
    }
  });
});

// 2) API routes
app.use('/api/auth',  require('./routes/authRoutes'));
app.use('/api/posts', require('./routes/postRoutes'));

// 3) Serve React build assets
app.use(express.static(path.join(__dirname, 'client/dist')));

// 4) Catch-all: for any other route, send React app
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});

// 5) Connect to MongoDB & start server
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser:    true,
  useUnifiedTopology: true,
})
.then(() => {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 Listening on port ${PORT}`));
})
.catch(err => {
  console.error('DB connection failed:', err);
  process.exit(1);
});
