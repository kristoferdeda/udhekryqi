import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

export default function PostPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [error, setError] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [showShare, setShowShare] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/posts/${id}`);
        setPost(res.data);
        setLikeCount(res.data.likes.length);
        setComments(res.data.comments || []);
        if (user) {
          setIsLiked(res.data.likes.includes(user.id));
        }
      } catch (err) {
        setError('Post not found or server error.');
      }
    };
    fetchPost();
  }, [id, user]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/posts/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      navigate('/');
    } catch (err) {
      alert('Failed to delete post.');
    }
  };

  const handleLike = async () => {
    if (!user) return alert('Please log in to like posts');
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/posts/${id}/like`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      setIsLiked(res.data.liked);
      setLikeCount(res.data.likesCount);
      setPost(prev => ({
        ...prev,
        likes: res.data.likes,
      }));
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert('Please log in to comment');
    if (!newComment.trim()) return;

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/posts/${id}/comments`,
        { content: newComment, name: user.name },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      setComments([...comments, res.data.comment]);
      setNewComment('');
    } catch (err) {
      alert('Failed to post comment.');
      console.error(err);
    }
  };

  const handleReplySubmit = async (e, parentId) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/posts/${id}/comments`,
        { content: replyText, parentId, name: user.name },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      setComments([...comments, res.data.comment]);
      setReplyText('');
      setActiveReplyId(null);
    } catch (err) {
      alert('Failed to post reply.');
      console.error(err);
    }
  };

  const deleteCommentAndChildren = (commentId) => {
    const findAllDescendants = (id) => {
      const directReplies = comments.filter(c => c.parentId === id);
      return directReplies.reduce(
        (acc, reply) => [...acc, reply._id, ...findAllDescendants(reply._id)],
        []
      );
    };
    const toDelete = [commentId, ...findAllDescendants(commentId)];
    setComments(comments.filter(c => !toDelete.includes(c._id)));
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm('Delete this comment and all its replies?')) return;
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/api/posts/${id}/comments/${commentId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      deleteCommentAndChildren(commentId);
    } catch (err) {
      alert('Failed to delete comment.');
      console.error(err);
    }
  };

  const renderComments = (parentId = null, level = 0) => {
    return comments
      .filter(comment => comment.parentId === parentId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map(comment => (
        <div key={comment._id} className={`ml-${level * 4} border-l pl-4 mt-4`}>
          <p className="text-sm text-gray-600 mb-1">
            <span className="font-medium">{comment.name}</span> •{' '}
            {new Date(comment.createdAt).toLocaleDateString()}
          </p>
          <p className="text-gray-800">{comment.content}</p>

          <div className="flex items-center gap-2 mt-1">
            <button
              onClick={() => {
                setActiveReplyId(comment._id);
                setReplyText('');
              }}
              className="text-xs text-blue-600 hover:underline"
            >
              Përgjigju
            </button>
            {(user?.role === 'admin' || user?.name === comment.name) && (
              <button
                onClick={() => handleDeleteComment(comment._id)}
                className="text-xs text-red-600 hover:underline"
              >
                Fshij
              </button>
            )}
          </div>

          {user && activeReplyId === comment._id && (
            <form
              onSubmit={(e) => handleReplySubmit(e, comment._id)}
              className="mt-2"
            >
              <textarea
                className="w-full p-2 border rounded mb-2"
                rows={2}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Shkruaj një përgjigje..."
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                >
                  Posto Përgjigjen
                </button>
                <button
                  type="button"
                  className="text-sm text-gray-500 hover:underline"
                  onClick={() => setActiveReplyId(null)}
                >
                  Anulloje
                </button>
              </div>
            </form>
          )}

          {renderComments(comment._id, level + 1)}
        </div>
      ));
  };

  if (error) return <div className="text-center text-red-500 mt-10">{error}</div>;
  if (!post) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold font-serif mb-2">{post.title}</h1>
      <p className="text-sm text-gray-500 mb-4">
        Nga <span className="font-medium">{post.author?.name || post.authorName}</span> •{' '}
        {new Date(post.createdAt).toLocaleDateString()}
      </p>

      <div className="mb-4 flex flex-wrap gap-2">
        {post.tags.map((tag, idx) => (
          <span key={idx} className="text-xs px-2 py-1 bg-gray-200 rounded-full capitalize">
            {tag}
          </span>
        ))}
      </div>

      {user?.role === 'admin' && (
        <div className="mb-4 flex gap-3">
          <Link
            to={`/edit-post/${post._id}`}
            className="px-4 py-1 border rounded text-sm font-medium hover:bg-gray-100"
          >
            ✏️ Ndrysho Artikullin
          </Link>
          <button
            onClick={handleDelete}
            className="px-4 py-1 border border-red-600 text-red-600 rounded text-sm font-medium hover:bg-red-50"
          >
            ❌ Fshij Artikullin
          </button>
        </div>
      )}

      {post.media?.filter(url => url && url.trim() !== '').length > 0 && (
        <div className="mb-4">
          {post.media
            .filter(url => url && url.trim() !== '')
            .map((url, idx) => (
              <img
                key={idx}
                src={url}
                alt={`media-${idx}`}
                className="rounded w-full mb-4"
                onError={(e) => (e.target.style.display = 'none')}
              />
            ))}
        </div>
      )}

      <div
        className="prose prose-lg max-w-none mb-6 [&>p]:mb-4"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      <div className="relative mb-6">
        <button
          onClick={() => setShowShare(!showShare)}
          className="bg-red-700 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-red-800"
        >
          Ndaje Artikullin
        </button>
        {showShare && (
          <div className="absolute mt-2 bg-red-700 shadow-md rounded p-3 border border-gray-200 z-10">
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-white font-semibold hover:underline text-sm mb-2"
            >
              Facebook
            </a>
            <a
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(post.title)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-white font-semibold hover:underline text-sm mb-2"
            >
              X
            </a>
            <a
              href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(post.title)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-white font-semibold hover:underline text-sm mb-2"
            >
              LinkedIn
            </a>
          </div>
        )}
      </div>

      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={handleLike}
          className={`text-2xl focus:outline-none ${isLiked ? 'text-red-600' : 'text-gray-400'}`}
          title={isLiked ? 'Unlike' : 'Like'}
        >
          {isLiked ? '❤️' : '🤍'}
        </button>
        <span className="text-sm text-gray-600">
          {likeCount} {likeCount === 1 ? 'pëlqim' : 'pëlqime'}
        </span>
      </div>

      <div className="mt-10">
        <h3 className="text-xl font-semibold mb-2">💬 Komentet</h3>

        {user && (
          <form onSubmit={handleCommentSubmit} className="mb-6">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full p-3 border rounded mb-2"
              rows={3}
              placeholder="Shkruaj një koment..."
            />
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
            >
              Posto Komentin
            </button>
          </form>
        )}

        <div>{renderComments()}</div>

        {!comments.length && (
          <p className="text-gray-500 text-sm mt-4">Asnjë koment akoma. Komento i pari!</p>
        )}
      </div>
    </div>
  );
}
