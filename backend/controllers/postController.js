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
      authorName: user.role === 'admin' && req.body.authorName?.trim()
        ? req.body.authorName.trim()
        : user.name,
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


module.exports = {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
  toggleLike,
  addComment,
  deleteComment
};
