const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    tags: [
      {
        type: String,
        lowercase: true,
        trim: true,
      },
    ],
    media: [
      {
        type: String, // Cloudinary URL for image or video
      },
    ],
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    authorName: {
      type: String, // snapshot of author's name
      required: true,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      }
    ],
    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        name: {
          type: String, // snapshot of user's name at time of comment
          required: true,
        },
        content: {
          type: String,
          required: true,
          trim: true,
        },
        parentId: {
          type: mongoose.Schema.Types.ObjectId,
          default: null,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        }
      }
    ]
  },
  { timestamps: true } // adds createdAt and updatedAt
);

module.exports = mongoose.model('Post', postSchema);
