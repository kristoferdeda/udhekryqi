import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import striptags from 'striptags';
import { useAuth } from '../contexts/AuthContext';

const categories = ['teologji', 'filozofi', 'kulturë', 'politikë', 'histori'];

export default function Home() {
  const [posts, setPosts] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_BASE_URL}/api/posts`)
      .then((res) => setPosts(res.data))
      .catch((err) => console.error('Failed to fetch posts:', err));
  }, []);

  const latest = posts.slice(0, 5);
  const [featured, ...recent] = latest;

  const handleDelete = async (id) => {
    const confirmed = confirm('Delete this post?');
    if (!confirmed) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/posts/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setPosts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      alert('Error deleting post.');
      console.error(err);
    }
  };

  const truncateText = (text, limit = 90) => {
    if (!text) return '';
    const clean = striptags(text).replace(/\s+/g, ' ');
    return clean.length > limit ? clean.slice(0, limit) + '...' : clean;
  };

  return (
    <div className="max-w-6xl mx-auto mt-14 mb-14 px-4 sm:px-6">
      {/* 🔥 Hero Section */}
      {featured && (
        <div className="grid md:grid-cols-3 gap-6 border-b pb-14">
          {/* Left: Featured Post */}
          <div className="md:col-span-2">
            <Link to={`/posts/${featured._id}`} className="block">
              {featured.media?.[0] && (
                <img
                  src={featured.media[0]}
                  alt={featured.title}
                  className="w-full h-72 object-cover rounded mb-4"
                />
              )}
              <h1 
                style={{ fontFamily: 'Georgia, serif' }}
                className="text-3xl md:text-4xl font-bold mb-2">{featured.title}
              </h1>
              <p className="text-sm md:text-base uppercase text-red-700 font-semibold mb-3">
                {featured.author?.name}
              </p>
              <p 
              style={{ fontFamily: 'Georgia, serif' }}
              className="text-gray-700 text-base md:text-lg break-words">
                {truncateText(featured.content, 200)}
              </p>
            </Link>
          </div>

          {/* Right: Latest Sidebar */}
          <div className="border-l pl-6">
            <h2 
              style={{ fontFamily: 'Georgia, serif' }}
              className="text-2xl md:text-3xl font-semibold text-gray-500 mb-4 tracking-wider uppercase">
                TË FUNDIT
            </h2>
            <div className="space-y-4">
              {latest.map((post) => (
                <Link
                  key={post._id}
                  to={`/posts/${post._id}`}
                  className="block group border-b pb-3"
                >
                  <h4 
                    style={{ fontFamily: 'Georgia, serif' }}
                    className="text-base md:text-lg font-bold group-hover:underline">
                    {post.title}
                  </h4>
                  <p className="text-xs md:text-sm text-red-700 uppercase font-medium">
                    {post.author?.name}
                  </p>
                </Link>
              ))}
            </div>

            <Link
              to="/all"
              style={{ fontFamily: 'Georgia, serif' }}
              className="mt-4 inline-block text-sm font-bold uppercase text-black hover:text-red-700"
            >
              TË TJERË →
            </Link>
          </div>
        </div>
      )}

      {/* 📚 Category Sections */}
      {categories.map((cat, index) => {
        const catPosts = posts
          .filter((p) => p.tags.includes(cat))
          .slice(0, 3);

        if (catPosts.length === 0) return null;

        return (
          <section
            key={cat}
            className={`space-y-4 pt-14 pb-14 ${index === 0 ? '' : 'border-t'}`}
          >
            <h2 
              style={{ fontFamily: 'Georgia, serif' }}
              className="text-3xl md:text-4xl font-semibold text-gray-500 mb-4 tracking-wider uppercase"
            >
              {cat}
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              {catPosts.map((post) => (
                <div
                  key={post._id}
                  className="group border rounded overflow-hidden bg-white shadow-sm hover:shadow-md transition relative"
                >
                  {user?.role === 'admin' && (
                    <div className="absolute top-2 right-2 flex gap-2 z-10">
                      <Link to={`/edit-post/${post._id}`} className="text-xs">
                        ✏️
                      </Link>
                      <button onClick={() => handleDelete(post._id)} className="text-xs">
                        ❌
                      </button>
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
                        className="text-lg md:text-xl font-bold group-hover:underline">
                          {post.title}
                      </h3>
                      <p className="text-xs md:text-sm uppercase text-red-700 font-semibold">
                        {post.author?.name}
                      </p>
                      <p className="text-sm md:text-base text-gray-600 break-words">
                        {truncateText(post.content, 90)}
                      </p>
                    </div>
                  </Link>
                </div>
              ))}
            </div>

            <div className="pt-4 text-center">
              <Link
                to={`/category/${cat}`}
                className="inline-block px-6 py-2 rounded bg-red-700 text-white text-sm font-semibold uppercase hover:bg-red-800 transition"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                Më shumë {cat}
              </Link>
            </div>
          </section>
        );
      })}
    </div>
  );
}
