const Post = require('../models/Post');
const User = require('../models/User');

const createPost = async (req, res) => {
  try {
    const { title, content, tags, media } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'Author not found' });

    const newPost = await Post.create({
      title,
      content,
      tags,
      media,
      author: user._id,
      authorName: user.name,
    });

    res.status(201).json(newPost);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create post', error: err.message });
  }
};


// Get all posts
const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find().populate('author', 'name role').sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch posts', error: err.message });
  }
};

// Get single post by ID
const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('author', 'name role');
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch post', error: err.message });
  }
};

// Update post
const updatePost = async (req, res) => {
  try {
    const updated = await Post.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ message: 'Post not found' });
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update post', error: err.message });
  }
};

// Delete post
const deletePost = async (req, res) => {
  try {
    const deleted = await Post.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Post not found' });
    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete post', error: err.message });
  }
};

const toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const userId = req.user.id;
    const liked = post.likes.includes(userId);

    if (liked) {
      post.likes.pull(userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();

    res.status(200).json({
      liked: !liked,
      likesCount: post.likes.length,
      likes: post.likes,  // <--- send updated likes array
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to toggle like', error: err.message });
  }
};


const addComment = async (req, res) => {
  try {
    const { content, parentId, name } = req.body;

    if (!name || !content) {
      return res.status(400).json({ error: 'Name and content are required' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const newComment = {
      user: req.user.id,  
      name,
      content,
      parentId: parentId || null,
      createdAt: new Date()
    };

    post.comments.push(newComment);
    await post.save();

    res.status(201).json({ comment: post.comments[post.comments.length - 1] });
  } catch (err) {
    console.error('Error adding comment:', err);
    res.status(500).json({ error: 'Server error while adding comment' });
  }
};

const deleteComment = async (req, res) => {
  const { postId, commentId } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;

  try {
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    // Only author or admin can delete
    if (comment.user.toString() !== userId && userRole !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    // Remove the comment
    comment.deleteOne();

    await post.save();
    res.status(200).json({ message: 'Comment deleted' });
  } catch (err) {
    console.error('Error deleting comment:', err);
    res.status(500).json({ message: 'Failed to delete comment', error: err.message });
  }
};

// Social media preview route
const getPostPreview = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).send('Post not found');

    const cleanDescription = post.content
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .slice(0, 160)
      .trim();

    const image = post.media?.[0] || 'https://udhekryqi.com/default.jpg';

    const author = post.authorName || 'Redaksia Udhekryqi';
    const published = new Date(post.createdAt).toISOString();

    res.setHeader('Content-Type', 'text/html');
    res.send(`<!DOCTYPE html>
<html lang="sq">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${post.title}</title>
  
  <!-- Open Graph -->
  <meta property="og:type" content="article" />
  <meta property="og:site_name" content="Udhëkryqi" />
  <meta property="og:title" content="${post.title}" />
  <meta property="og:description" content="${cleanDescription}" />
  <meta property="og:image" content="${image}" />
  <meta property="og:url" content="https://udhekryqi.com/posts/${post._id}" />
  <meta property="article:author" content="${author}" />
  <meta property="article:published_time" content="${published}" />

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="@udhekryqi" />
  <meta name="twitter:title" content="${post.title}" />
  <meta name="twitter:description" content="${cleanDescription}" />
  <meta name="twitter:image" content="${image}" />

  <!-- Redirect -->
  <meta http-equiv="refresh" content="0; url=https://udhekryqi.com/posts/${post._id}" />
</head>
<body>
  <p>Redirecting to article...</p>
</body>
</html>`);
  } catch (err) {
    console.error('Preview Error:', err);
    res.status(500).send('Internal server error');
  }
};


module.exports = {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
  toggleLike,
  addComment,
  deleteComment,
  getPostPreview
};
