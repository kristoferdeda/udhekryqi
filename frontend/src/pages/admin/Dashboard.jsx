import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const POSTS_PER_PAGE = 12;

export default function Dashboard() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/posts`);
        const filtered = res.data.filter(post => post.author?._id === user.id);
        setPosts(filtered);
      } catch (err) {
        console.error('Failed to fetch posts:', err);
      }
    };

    if (user) {
      fetchPosts();
    }
  }, [user]);

  const handleAccountDelete = async () => {
    const confirmDelete = window.confirm('Are you sure you want to delete your account? This cannot be undone.');
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/user/${user.id}?deletePosts=true`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/');
      window.location.reload();
    } catch (err) {
      console.error('Failed to delete account:', err);
      alert('Account deletion failed. Please try again.');
    }
  };

  const handlePostDelete = async (id) => {
    const confirmed = confirm('Delete this post?');
    if (!confirmed) return;

    try {
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/posts/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setPosts(prev => prev.filter(p => p._id !== id));
    } catch (err) {
      alert('Error deleting post.');
      console.error(err);
    }
  };

  const truncateText = (html, limit = 90) => {
    const clean = html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    return clean.length > limit ? clean.slice(0, limit) + '...' : clean;
  };

  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);
  const paginatedPosts = posts.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  );

  if (!user || user.role !== 'admin') {
    return <p className="text-center mt-10 text-red-600">Access denied.</p>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Mirësevjen, {user.name}</h1>
        <p className="text-gray-700 mb-4">Artikuj të publikuar: {posts.length}</p>
        <div className="flex gap-4 flex-wrap">
          <Link to="/admin/new-post" className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800">
            Krijo artikull
          </Link>
          <Link to="/admin/edit-account" className="border px-4 py-2 rounded hover:bg-gray-100">
            Ndrysho të dhënat e llogarisë
          </Link>
          <button
            onClick={handleAccountDelete}
            className="border border-red-600 text-red-600 px-4 py-2 rounded hover:bg-red-50"
          >
            Fshij llogarinë
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {paginatedPosts.map(post => (
          <div
            key={post._id}
            className="group border rounded overflow-hidden bg-white shadow-sm hover:shadow-md transition relative"
          >
            <div className="absolute top-2 right-2 flex gap-2 z-10">
              <Link to={`/edit-post/${post._id}`} className="text-xs">✏️</Link>
              <button onClick={() => handlePostDelete(post._id)} className="text-xs">❌</button>
            </div>

            <Link to={`/posts/${post._id}`}>
              {post.media?.[0] && (
                <img
                  src={post.media[0]}
                  alt={post.title}
                  className="h-48 w-full object-cover"
                />
              )}
              <div className="p-4 space-y-2">
                <h3 className="text-lg font-bold group-hover:underline">{post.title}</h3>
                <p className="text-xs uppercase text-gray-500 font-semibold">
                  {post.author?.name || post.authorName}
                </p>
                <p className="text-sm text-gray-600 break-words">
                  {truncateText(post.content)}
                </p>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-8 space-x-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded ${
                currentPage === i + 1
                  ? 'bg-black text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
