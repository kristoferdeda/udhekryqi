import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function Header() {
  const { user, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const navigate = useNavigate();

  const categories = ['Teologji', 'Filozofi', 'Kulturë', 'Politikë', 'Histori'];

  return (
    <header className="border-b border-gray-200 shadow-sm bg-white w-full">
      {/* Top Row: Hamburger | Centered Logo | User/Auth */}
      <div className="max-w-7xl mx-auto relative h-20 flex items-center px-4">
        {/* Left: Hamburger (mobile only) */}
        <div className="absolute left-4 md:hidden">
          <button
            onClick={() => setShowMobileNav(!showMobileNav)}
            className="text-2xl"
          >
            ☰
          </button>
        </div>

        {/* Center: Logo */}
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <Link to="/">
            <img
              src="/Logo-horizontal.png"
              alt="Udhëkryqi Logo"
              className="h-12 md:h-16 w-auto"
            />
          </Link>
        </div>

        {/* Right: User icon or auth */}
        <div 
          style={{ fontFamily: 'Georgia, serif' }}
          className="absolute right-4 flex items-center gap-2">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="w-9 h-9 rounded-full bg-gray-800 text-white text-center"
              >
                {user.name[0].toUpperCase()}
              </button>
              {showMenu && (
                <div className="absolute right-0 mt-2 bg-white border rounded shadow-lg w-40 z-10">
                  {user.role === 'admin' ? (
                    <>
                      <Link
                        to="/admin"
                        className="block px-4 py-2 hover:bg-gray-100"
                        onClick={() => setShowMenu(false)}
                      >
                        Paneli
                      </Link>
                      <Link
                        to="/admin/new-post"
                        className="block px-4 py-2 hover:bg-gray-100"
                        onClick={() => setShowMenu(false)}
                      >
                        Posto Artikull
                      </Link>
                    </>
                  ) : (
                    <Link
                      to="/dashboard"
                      className="block px-4 py-2 hover:bg-gray-100"
                      onClick={() => setShowMenu(false)}
                    >
                      Paneli
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      logout();
                      navigate('/');
                      setShowMenu(false);
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Dil
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-1 border border-gray-400 rounded hover:bg-gray-100"
              >
                Hyj
              </Link>
              <Link
                to="/register"
                className="px-4 py-1 bg-black text-white rounded hover:bg-gray-800"
              >
                Rregjistrohu
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Desktop Nav */}
      <nav 
      style={{ fontFamily: 'Georgia, serif' }}
      className="hidden md:flex max-w-7xl mx-auto justify-center gap-5 px-4 py-2 text-sm font-bold">
        <Link to="/">Home</Link>
        {categories.map((cat) => (
          <Link key={cat} to={`/category/${encodeURIComponent(cat.toLowerCase())}`}>
            {cat}
          </Link>
        ))}
        <Link to="/rreth-nesh">Rreth Nesh</Link>
      </nav>

      {/* Mobile Dropdown Nav */}
      {showMobileNav && (
        <nav 
          style={{ fontFamily: 'Georgia, serif' }}
          className="md:hidden px-4 pb-4 space-y-2 text-sm font-medium bg-white border-t shadow-sm">
          <Link
            to="/"
            className="block"
            onClick={() => setShowMobileNav(false)}
          >
            Home
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat}
              to={`/category/${encodeURIComponent(cat.toLowerCase())}`}
              className="block"
              onClick={() => setShowMobileNav(false)}
            >
              {cat}
            </Link>
          ))}
          <Link
            to="/rreth-nesh"
            className="block"
            onClick={() => setShowMobileNav(false)}
          >
            Rreth Nesh
          </Link>
        </nav>
      )}
    </header>
  );
}
