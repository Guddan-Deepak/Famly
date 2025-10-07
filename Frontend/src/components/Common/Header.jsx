// src/components/Layout/Header.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../utils/authContext";
import { useTheme } from "../../utils/ThemeContext";
import famlyLogo from "../../assets/famly-logo.png";
import { Sun, Moon, Menu, X, LogOut } from "lucide-react";
import NotificationsPage from "../../pages/notifications/NotificationPage";
import { Bell } from "lucide-react";
import About from "../../pages/About/About";
import Home from "../../pages/Home/HomePage";


const Header = () => {
  const navigate = useNavigate();
  const { auth, logout } = useAuth();
  const user = auth?.user;

  const [menuOpen, setMenuOpen] = useState(false);


  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className={`sticky top-0 z-50 backdrop-blur-lg transition-all duration-300 
      ${theme === "dark" ? "bg-gray-900/90 border-b border-gray-700 shadow-md"
        : "bg-white/80 border-b border-gray-200 shadow-md"}`}>
      
      {/* Container - Switched to a flex layout with space-between on mobile/logo, then a sophisticated split for desktop */}
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
        
        {/* Logo/Left Side - Must be first for mobile ordering */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <img
            src={famlyLogo}
            alt="Logo"
            className={`w-10 h-10 object-cover rounded-lg shadow-md 
              ${theme === "dark" ? "border border-gray-600" : "border border-gray-300"}`}
          />
          <span className={`text-2xl font-extrabold tracking-wide 
            ${theme === "dark" ? "text-purple-300" : "text-purple-700"}`}>
            FAMLY
          </span>
        </Link>

        {/* Desktop Navigation - Centered Main Links */}
        {/* We use flex-grow and justify-center to push this section to the middle */}
        <nav className="hidden md:flex flex-grow items-center justify-center font-semibold text-lg cursor-pointer">
          <div className="flex items-center gap-6">
            {["Home", "About", "Contact"].map((page) => {
              const path = page === "Home" ? "/" : `/${page.toLowerCase()}`;
              return (
                <Link
                  key={page}
                  to={path}
                  className={`transition-colors duration-200 hover:underline
            ${theme === "dark" ? "text-gray-200 hover:text-white" : "text-purple-700 hover:text-purple-500"}`}
                >
                  {page}
                </Link>
              );
            })}
            
            {user && (
              /* Private Group Link (Desktop) - Placed with other centered links */
              <Link
                to="/private-group"
                className={`transition-colors duration-200 hover:underline
                  ${theme === "dark" ? "text-green-400 hover:text-green-300" : "text-green-600 hover:text-green-700"}`}
              >
                Private Group
              </Link>
            )}
          </div>
        </nav>

        {/* Right Side - Auth and Theme Toggle */}
        <div className="hidden md:flex items-center gap-6 flex-shrink-0">
          {!user ? (
            <Link
              to="/auth"
              className={`px-5 py-2 rounded-full font-medium shadow-md transition-all duration-300 cursor-pointer
                ${theme === "dark"
                  ? "bg-purple-700 text-white hover:bg-purple-600"
                  : "bg-purple-500 text-white hover:bg-purple-600"}`}
            >
              Login / Signup
            </Link>
          ) : (
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/dashboard")}
                className="flex items-center gap-2 transition-all hover:scale-105"
              >
                <img
                  src={user.profilePhoto}
                  alt="Profile"
                  className="w-10 h-10 rounded-full border-2 border-purple-400 shadow-lg object-cover cursor-pointer"
                />
              </button>
              <button
                onClick={handleLogout}
                className={`flex items-center gap-1 font-medium transition-colors cursor-pointer
                  ${theme === "dark" ? "text-red-400 hover:text-red-300" : "text-red-500 hover:text-red-400"}`}
              >
                <LogOut size={18} /> Logout
              </button>
              <button
                onClick={() => navigate("/notifications")} // ✅ navigate to page
                className={`flex items-center gap-1 font-medium transition-colors
    ${theme === "dark" ? "text-purple-300 hover:text-purple-200" : "text-purple-700 hover:text-purple-500"}`}
              >
                <Bell size={18} /> Notifications
              </button>

            </div>
          )}

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`ml-3 p-2 rounded-full transition-all hover:scale-110 cursor-pointer
              ${theme === "dark" ? "bg-gray-700 text-yellow-400 hover:bg-gray-600"
                : "bg-purple-100 text-purple-600 hover:bg-purple-200"}`}
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        {/* Mobile Menu Button (Stays on the far right on mobile) */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className={`md:hidden p-2 rounded-full transition-all hover:scale-110
            ${theme === "dark" ? "bg-gray-700 text-gray-200" : "bg-purple-100 text-purple-700"}`}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className={`md:hidden py-4 px-6 space-y-4 text-center transition-all duration-300
          ${theme === "dark" ? "bg-gray-900/95 border-t border-gray-700"
            : "bg-white/90 border-t border-gray-200"}`}>
          {["Home", "About", "Contact"].map((page) => (
            <Link
              key={page}
              to={page === "Home" ? "/" : `/${page.toLowerCase()}`}
              onClick={() => setMenuOpen(false)}
              className={`block font-medium transition-colors duration-200 hover:underline
                ${theme === "dark" ? "text-gray-200 hover:text-white" : "text-purple-700 hover:text-purple-500"}`}
            >
              {page}
            </Link>
          ))}
          
          {user && (
            /* Private Group Button (Mobile) - Visible when logged in */
            <Link
              to="/private-group"
              onClick={() => setMenuOpen(false)}
              className={`block font-medium transition-colors duration-200 hover:underline
                ${theme === "dark" ? "text-green-400 hover:text-green-300" : "text-green-600 hover:text-green-700"}`}
            >
              Private Group
            </Link>
          )}

          {!user ? (
            <Link
              to="/auth"
              onClick={() => setMenuOpen(false)}
              className={`inline-block px-5 py-2 rounded-full font-medium shadow-md transition-all duration-300
                ${theme === "dark" ? "bg-purple-700 text-white hover:bg-purple-600"
                  : "bg-purple-500 text-white hover:bg-purple-600"}`}
            >
              Login / Signup
            </Link>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <button
                onClick={() => {
                  navigate("/dashboard");
                  setMenuOpen(false);
                }}
                className="flex items-center gap-2 transition-all hover:scale-105"
              >
                <img
                  src={user.profilePhoto}
                  alt="Profile"
                  className="w-12 h-12 rounded-full border-2 border-purple-400 shadow-lg object-cover"
                />
                <span className={theme === "dark" ? "text-gray-200 font-semibold" : "text-purple-700 font-semibold"}>
                  {user.fullname}
                </span>
              </button>

              <button
                onClick={handleLogout}
                className={`flex items-center gap-2 justify-center font-medium transition-colors
                  ${theme === "dark" ? "text-red-400 hover:text-red-300" : "text-red-500 hover:text-red-400"}`}
              >
                <LogOut size={18} /> Logout
              </button>
            </div>
          )}

          {/* Theme Toggle in Mobile */}
          <button
            onClick={toggleTheme}
            className={`mt-3 p-2 rounded-full transition-all hover:scale-110
              ${theme === "dark" ? "bg-gray-700 text-yellow-400 hover:bg-gray-600"
                : "bg-purple-100 text-purple-600 hover:bg-purple-200"}`}
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;