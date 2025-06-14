import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import striptags from 'striptags';
import { useAuth } from '../contexts/AuthContext';

const POSTS_PER_PAGE = 12;

export default function CategoryPage() {
  const { name } = useParams();
  const decodedName = decodeURIComponent(name);
  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/posts`);
        const filtered = res.data.filter(post =>
          post.tags.some(tag => tag.toLowerCase() === decodedName.toLowerCase())
        );
        setPosts(filtered);
        setCurrentPage(1);
      } catch (err) {
        console.error('Failed to load posts:', err);
      }
    };
    fetchPosts();
  }, [decodedName]);

  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);
  const paginatedPosts = posts.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  );
  function decodeEntities(html) {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
  }

  const truncateText = (html, limit = 90) => {
    const clean = striptags(html || '').replace(/\s+/g, ' ').trim();
    const decoded = decodeEntities(clean);
    return decoded.length > limit ? decoded.slice(0, limit) + '...' : decoded;
  };


  const handleDelete = async (id) => {
    const confirmed = confirm('Delete this post?');
    if (!confirmed) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/posts/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setPosts(prev => prev.filter(p => p._id !== id));
    } catch (err) {
      alert('Error deleting post.');
      console.error(err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-14">
      <h1 
        style={{ fontFamily: 'Georgia, serif' }}
        className="text-3xl font-bold mb-6 capitalize"
      >
        {decodedName}
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {paginatedPosts.map(post => (
          <div
            key={post._id}
            className="group border rounded overflow-hidden bg-white shadow-sm hover:shadow-md transition relative"
          >
            {isAdmin && (
              <div className="absolute top-2 right-2 flex gap-2 z-10">
                <Link to={`/edit-post/${post._id}`} className="text-xs">✏️</Link>
                <button onClick={() => handleDelete(post._id)} className="text-xs">❌</button>
              </div>
            )}

            <Link to={`/posts/${post._id}`}>
              {post.media?.[0] && (
                <img
                  src={post.media[0]}
                  alt={post.title}
                  className="h-48 w-full object-cover"
                />
              )}
              <div className="p-4 space-y-2">
                <h3 
                  style={{ fontFamily: 'Georgia, serif' }}
                  className="text-lg font-bold group-hover:underline"
                >
                  {post.title}
                </h3>
                <p className="text-xs uppercase text-red-700 font-semibold">
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
