import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { FaInstagram, FaYoutube, FaXTwitter, FaFacebook } from 'react-icons/fa6';

const categories = ['Teologji', 'Filozofi', 'Kulturë', 'Politikë', 'Histori'];

export default function Footer() {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      navigate(`/all?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  useEffect(() => {
    if (!location.pathname.startsWith('/all')) {
      setSearchTerm('');
    }
  }, [location.pathname]);

  return (
    <footer className="bg-gray-100 border-t text-sm text-gray-700 py-10">
      <div className="max-w-6xl mx-auto px-4 flex flex-col items-center gap-6">

        {/* Centered Logo */}
        <Link to="/">
          <img
            src="/Logo-horizontal.png"
            alt="Udhëkryqi"
            className="h-10 md:h-16 w-auto transition-all duration-200"
          />
        </Link>

        {/* Horizontal Row: Tags - Socials - Search */}
        <div className="w-full flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

          {/* Left: Category Links */}
          <div className="flex flex-wrap justify-center gap-4 md:justify-start">
            {categories.map(cat => (
              <Link
                key={cat}
                to={`/all?search=${encodeURIComponent(cat)}`}
                className="text-gray-700 hover:text-red-600 hover:underline font-medium"
              >
                {cat}
              </Link>
            ))}
          </div>

          {/* Center: Social Media Icons (in-line!) */}
          <div className="flex justify-center gap-5 text-xl">
            <a href="https://x.com/udhekryqi" target="_blank" rel="noopener noreferrer">
              <FaXTwitter className="hover:text-red-600 cursor-pointer" />
            </a>
            <a href="https://www.instagram.com/revista.udhekryqi/" target="_blank" rel="noopener noreferrer">
              <FaInstagram className="hover:text-red-600 cursor-pointer" />
            </a>
            <a href="https://www.youtube.com/channel/UCm9ar2kaThxhIJjbQicrEAA" target="_blank" rel="noopener noreferrer">
              <FaYoutube className="hover:text-red-600 cursor-pointer" />
            </a>
              <a href="https://www.facebook.com/udhekryqi" target="_blank" rel="noopener noreferrer">
              <FaFacebook className="hover:text-red-600 cursor-pointer" />
            </a>
          </div>

          {/* Right: Search */}
          <div className="flex justify-center">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onKeyDown={handleSearch}
              className="w-75 border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring focus:ring-red-200"
            />
          </div>
        </div>
      </div>
    </footer>
  );
}
