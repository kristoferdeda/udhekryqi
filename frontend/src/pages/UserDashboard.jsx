import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

export default function UserDashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [likedPosts, setLikedPosts] = useState([]);
  const [userComments, setUserComments] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/posts`);
        const allPosts = res.data;

        const liked = allPosts.filter(post =>
          post.likes.includes(user.id)
        );

        const comments = [];
        allPosts.forEach(post => {
          post.comments.forEach(comment => {
            if (comment.user === user.id) {
              comments.push({
                postId: post._id,
                postTitle: post.title,
                content: comment.content,
                createdAt: comment.createdAt,
              });
            }
          });
        });

        setLikedPosts(liked);
        setUserComments(comments);
      } catch (err) {
        console.error(err);
        setMessage('Failed to load activity.');
      }
    };

    fetchActivity();
  }, [user]);

  // 🔴 DELETE ACCOUNT HANDLER
  const handleDelete = async () => {
    const confirmDelete = window.confirm('Are you sure you want to delete your account? This cannot be undone.');
    if (!confirmDelete) return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/user/${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Cleanup and redirect
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/');
      window.location.reload();
    } catch (err) {
      console.error('Failed to delete account:', err);
      alert('Account deletion failed. Please try again.');
    }
  };


  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">Mirësevjen, {user.name}</h1>

      {/* Account Actions */}
      <div className="mb-10 flex flex-wrap gap-4">
        <Link
          to="/edit-account"
          className="border px-4 py-2 rounded hover:bg-gray-100"
        >
          Ndrysho llogarinë
        </Link>
        <button
          onClick={handleDelete}
          className="border border-red-600 text-red-600 px-4 py-2 rounded hover:bg-red-50"
        >
          Fshij llogarinë
        </button>
      </div>

      {message && <p className="text-red-600 mb-6">{message}</p>}

      {/* Liked Posts */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-3">Artikujt e pëlqyer</h2>
        {likedPosts.length === 0 ? (
          <p className="text-gray-600">Nuk keni pëlqyer asnjë artikull akoma.</p>
        ) : (
          <ul className="list-disc list-inside space-y-2">
            {likedPosts.map(post => (
              <li key={post._id}>
                <Link to={`/posts/${post._id}`} className="text-red-700 hover:underline">
                  {post.title}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* User Comments */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Komentet tuaja</h2>
        {userComments.length === 0 ? (
          <p className="text-gray-600">Nuk keni komentuar akoma.</p>
        ) : (
          <ul className="space-y-4">
            {userComments.map((cmt, idx) => (
              <li key={idx} className="border rounded p-4 bg-white shadow-sm">
                <p className="text-sm text-gray-600 mb-2">
                  On:{" "}
                  <Link to={`/posts/${cmt.postId}`} className="text-red-700 hover:underline">
                    {cmt.postTitle}
                  </Link>{" "}
                  — {new Date(cmt.createdAt).toLocaleDateString()}
                </p>
                <p>{cmt.content}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
