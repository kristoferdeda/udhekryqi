import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import striptags from 'striptags';
import { useAuth } from '../contexts/AuthContext';

const POSTS_PER_PAGE = 12;

export default function AllArticlesPage() {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const location = useLocation();

  // Pull search term from query param if present
  useEffect(() => {
    const query = new URLSearchParams(location.search).get('search');
    if (query) setSearchTerm(query);
  }, [location.search]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/posts`);
        setPosts(res.data);
        setFilteredPosts(res.data);
      } catch (err) {
        console.error('Failed to load posts:', err);
      }
    };
    fetchPosts();
  }, []);

  useEffect(() => {
    const normalize = str =>
      (str || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

    let filtered = [...posts];

    if (searchTerm.trim()) {
      const term = normalize(searchTerm);
      filtered = filtered.filter(post => {
        const titleMatch = normalize(post.title).includes(term);
        const contentMatch = normalize(striptags(post.content)).includes(term);
        const tagMatch = (post.tags || []).some(tag => normalize(tag).includes(term));
        const authorMatch = normalize(post.author?.name || post.authorName || '').includes(term);
        return titleMatch || contentMatch || tagMatch || authorMatch;
      });
    }

    if (selectedTag) {
      filtered = filtered.filter(post =>
        post.tags.some(tag => tag.toLowerCase() === selectedTag.toLowerCase())
      );
    }

    setFilteredPosts(filtered);
    setCurrentPage(1);
  }, [searchTerm, selectedTag, posts]);

  const uniqueTags = [...new Set(posts.flatMap(post => post.tags || []))];
  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  );

  const truncateText = (html, limit = 90) => {
    const clean = striptags(html || '').replace(/\s+/g, ' ').trim();
    return clean.length > limit ? clean.slice(0, limit) + '...' : clean;
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this post?')) return;
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
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">All Articles</h1>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Search articles..."
          className="border p-2 rounded w-full sm:w-1/2"
        />
        <select
          value={selectedTag}
          onChange={e => setSelectedTag(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All Tags</option>
          {uniqueTags.map((tag, i) => (
            <option key={i} value={tag}>
              {tag}
            </option>
          ))}
        </select>
      </div>

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
