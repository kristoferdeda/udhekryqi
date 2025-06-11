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
      <div className="max-w-6xl mx-auto h-20 flex items-center justify-between px-4 relative">
        {/* Left: Hamburger for mobile */}
        <button
          onClick={() => setShowMobileNav(!showMobileNav)}
          className="md:hidden text-2xl absolute left-4"
        >
          ☰
        </button>

        {/* Center: Logo */}
        <div className="flex-1 flex justify-center min-w-0">
          <Link to="/" className="flex items-center justify-center">
            <img
              src="/Logo-horizontal.png"
              alt="Udhëkryqi Logo"
              className="h-10 md:h-16 w-auto max-w-[100%] sm:max-w-[100%] md:max-w-full transition-all duration-200"
            />
          </Link>
        </div>

        {/* Right: Auth Buttons/User Icon */}
        <div
          style={{ fontFamily: 'Georgia, serif' }}
          className={`absolute right-4 pr-2 sm:pr-4 flex flex-wrap justify-end ${
            user
              ? 'flex-row items-center gap-2'
              : 'flex-col items-center gap-1 sm:flex-row sm:gap-2'
          }`}
        >
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="w-9 h-9 rounded-full bg-gray-800 text-white"
              >
                {user.name[0].toUpperCase()}
              </button>
              {showMenu && (
                <div className="absolute right-0 mt-2 bg-white border rounded shadow-lg w-40 z-10 divide-y divide-gray-200">
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
              {/* Mobile HYJ dropdown */}
              <div className="relative flex sm:hidden">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="w-20 text-center py-1 border border-gray-400 rounded text-sm hover:bg-gray-100"
                >
                  HYJ
                </button>
                {showMenu && (
                  <div className="absolute right-0 mt-7 bg-white border rounded shadow-lg w-36 z-10 divide-y divide-gray-200">
                    <Link
                      to="/login"
                      className="block px-4 py-2 hover:bg-gray-100"
                      onClick={() => setShowMenu(false)}
                    >
                      Hyj
                    </Link>
                    <Link
                      to="/register"
                      className="block px-4 py-2 hover:bg-gray-100"
                      onClick={() => setShowMenu(false)}
                    >
                      Regjistrohu
                    </Link>
                  </div>
                )}
              </div>

              {/* Desktop buttons */}
              <div className="hidden sm:flex gap-2">
                <Link
                  to="/login"
                  className="w-24 text-center py-1 border border-gray-400 rounded text-sm hover:bg-gray-100"
                >
                  Hyj
                </Link>
                <Link
                  to="/register"
                  className="w-24 text-center py-1 bg-black text-white rounded text-sm hover:bg-gray-800"
                >
                  Regjistrohu
                </Link>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Desktop Navigation */}
      <nav
        style={{ fontFamily: 'Georgia, serif' }}
        className="hidden md:flex max-w-6xl mx-auto justify-center gap-5 px-4 py-2 text-sm font-bold"
      >
        <Link to="/">Home</Link>
        {categories.map((cat) => (
          <Link key={cat} to={`/category/${encodeURIComponent(cat.toLowerCase())}`}>
            {cat}
          </Link>
        ))}
        <Link to="/rreth-nesh">Rreth Nesh</Link>
      </nav>

      {/* Mobile Navigation */}
      {showMobileNav && (
        <nav
          style={{ fontFamily: 'Georgia, serif' }}
          className="md:hidden max-w-6xl mx-auto px-4 pb-4 pt-2 divide-y divide-gray-200 text-sm font-medium bg-white border-t shadow-sm"
        >
          <Link to="/" className="block py-2" onClick={() => setShowMobileNav(false)}>
            Home
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat}
              to={`/category/${encodeURIComponent(cat.toLowerCase())}`}
              className="block py-2"
              onClick={() => setShowMobileNav(false)}
            >
              {cat}
            </Link>
          ))}
          <Link
            to="/rreth-nesh"
            className="block py-2"
            onClick={() => setShowMobileNav(false)}
          >
            Rreth Nesh
          </Link>
        </nav>
      )}
    </header>
  );
}
