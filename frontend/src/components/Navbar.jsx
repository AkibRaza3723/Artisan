// ─── Navbar ────────────────────────────────────────────────────────────────
// Auth-aware navigation bar. Shows different links based on auth state.

import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-sandlewood/10 backdrop-blur-md bg-carbon/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-plum to-sandlewood flex items-center justify-center shadow-brand-sm group-hover:shadow-gold-glow transition-shadow duration-300">
              <span className="text-almond font-display font-bold text-sm">A</span>
            </div>
            <span className="text-almond font-display font-semibold text-lg hidden sm:block">
              Artisans&apos; Canvas
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            <button
              onClick={toggleTheme}
              className="p-2 mr-2 text-almond/70 hover:text-almond hover:bg-sandlewood/10 rounded-lg transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "light" ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </button>

            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive("/dashboard")
                      ? "bg-plum/50 text-almond border border-sandlewood/30"
                      : "text-almond/60 hover:text-almond hover:bg-sandlewood/10"
                  }`}
                >
                  Dashboard
                </Link>
                {user?.username && (
                  <Link
                    to={`/portfolio/${user.username}`}
                    target="_blank"
                    className="px-4 py-2 rounded-lg text-sm font-medium text-almond/60 hover:text-almond hover:bg-sandlewood/10 transition-all duration-200 flex items-center gap-1"
                  >
                    My Portfolio
                    <svg className="w-3 h-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </Link>
                )}
                <div className="w-px h-4 bg-sandlewood/20 mx-2" />
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.fullName} className="w-8 h-8 rounded-full object-cover border border-sandlewood/30" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-plum flex items-center justify-center border border-sandlewood/30">
                        <span className="text-almond text-xs font-semibold">
                          {user?.fullName?.[0]?.toUpperCase()}
                        </span>
                      </div>
                    )}
                    <span className="text-almond/70 text-sm font-medium hidden lg:block">{user?.fullName}</span>
                  </div>
                  <button onClick={handleLogout} className="btn-secondary text-sm px-4 py-2">
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary text-sm px-4 py-2">Login</Link>
                <Link to="/register" className="btn-primary text-sm px-4 py-2">Get Started</Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-almond/60 hover:text-almond hover:bg-sandlewood/10 transition-all"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden py-4 border-t border-sandlewood/10 flex flex-col gap-2 animate-slide-up">
            <button
              onClick={toggleTheme}
              className="px-4 py-2 text-left text-almond/70 hover:text-almond text-sm flex items-center gap-3"
            >
              {theme === "light" ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
              {theme === "light" ? "Dark Mode" : "Light Mode"}
            </button>
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="px-4 py-2 text-almond/70 hover:text-almond text-sm" onClick={() => setMobileOpen(false)}>Dashboard</Link>
                {user?.username && (
                  <Link to={`/portfolio/${user.username}`} className="px-4 py-2 text-almond/70 hover:text-almond text-sm" onClick={() => setMobileOpen(false)}>My Portfolio</Link>
                )}
                <button onClick={handleLogout} className="px-4 py-2 text-left text-almond/70 hover:text-almond text-sm">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 text-almond/70 hover:text-almond text-sm" onClick={() => setMobileOpen(false)}>Login</Link>
                <Link to="/register" className="px-4 py-2 text-almond/70 hover:text-almond text-sm" onClick={() => setMobileOpen(false)}>Get Started</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
