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

// 1) BOT PREVIEW for /posts/:id
app.get('/posts/:id', async (req, res) => {
  const ua    = req.headers['user-agent'] || '';
  const isBot = /facebookexternalhit|twitterbot|linkedinbot|discordbot|telegrambot|whatsapp/i.test(ua);

  if (isBot) {
    try {
      const post = await Post.findById(req.params.id);
      if (!post) return res.status(404).send('Not found');

      const desc = (post.content || '')
        .replace(/<[^>]+>/g, '')
        .slice(0, 160);
      const img = post.media?.[0] || `${process.env.CLIENT_URL}/Logo-horizontal.png`;
      const url = `${process.env.CLIENT_URL}/posts/${post._id}`;

      return res.send(`<!DOCTYPE html>
<html lang="sq">
<head>
  <meta charset="utf-8">
  <title>${post.title}</title>
  <meta name="description"       content="${desc}">
  <meta property="og:type"        content="article">
  <meta property="og:title"       content="${post.title}">
  <meta property="og:description" content="${desc}">
  <meta property="og:image"       content="${img}">
  <meta property="og:url"         content="${url}">
  <meta name="twitter:card"       content="summary_large_image">
  <meta http-equiv="refresh"      content="0; url=${url}">
</head><body>Redirecting…</body></html>`);
    } catch (err) {
      console.error('Preview error:', err);
      return res.status(500).send('Error generating preview');
    }
  }

  // Not a bot → fall through to React
  res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});

// 2) YOUR API ROUTES
app.use('/api/auth',  require('./routes/authRoutes'));
app.use('/api/posts', require('./routes/postRoutes'));

// 3) STATIC ASSETS (React build)
app.use(express.static(path.join(__dirname, 'client/dist')));

// 4) CATCH-ALL (client-side routing)
//    This RegExp matches any path (without confusing path-to-regexp)
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});

// 5) START SERVER & CONNECT DB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser:true, useUnifiedTopology:true })
  .then(() => {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Listening on port ${PORT}`));
  })
  .catch(err => {
    console.error('DB connection failed:', err);
    process.exit(1);
  });
