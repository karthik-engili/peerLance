import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { Bell, Menu, X, LogOut, User, FolderPlus, Compass, MessageSquare, Bookmark, Briefcase } from "lucide-react";
import { useAuth } from "../store/authStore";
import { useNotification } from "../store/notificationStore";
import { NotificationDropdown } from "./NotificationDropdown";
import { Button } from "./Button";
import { io } from "socket.io-client";

export const Navbar = () => {
  const { currentUser, logout, isAuthenticated } = useAuth();
  const { unreadCount, addNotification, fetchNotifications } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notiDropdownOpen, setNotiDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Close mobile drawer / dropdowns on route changes
  useEffect(() => {
    setMobileMenuOpen(false);
    setNotiDropdownOpen(false);
    setUserDropdownOpen(false);
  }, [location.pathname]);

  // Real-time socket notification listening
  useEffect(() => {
    if (currentUser) {
      const socket = io(import.meta.env.VITE_API_URL || "http://localhost:6868", { withCredentials: true });
      socket.emit("join-user", currentUser._id);
      
      const handleNewNotification = (noti) => {
        addNotification(noti);
      };

      socket.on("new-bid", handleNewNotification);
      socket.on("bid-accepted", handleNewNotification);
      socket.on("bid-rejected", handleNewNotification);
      socket.on("project-completed", handleNewNotification);
      socket.on("new-review", handleNewNotification);

      return () => {
        socket.disconnect();
      };
    }
  }, [currentUser, addNotification]);

  // Initial notification fetch
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    }
  }, [isAuthenticated, fetchNotifications]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const isClient = currentUser?.role === "CLIENT";
  const isFreelancer = currentUser?.role === "FREELANCER";

  return (
    <nav className="sticky top-0 z-40 w-full glass-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-1.5 font-black text-xl text-white tracking-wider">
              <span className="text-[#1DB954]">peer</span>
              <span>Lance</span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            {!isAuthenticated ? (
              <>
                <Link to="/#benefits" className="text-sm font-medium text-[#B3B3B3] hover:text-white transition-colors">
                  Benefits
                </Link>
                <Link to="/#how-it-works" className="text-sm font-medium text-[#B3B3B3] hover:text-white transition-colors">
                  How It Works
                </Link>
                <Link to="/projects" className="text-sm font-medium text-[#B3B3B3] hover:text-white transition-colors">
                  Explore Projects
                </Link>
              </>
            ) : (
              <>
                {/* Client Navigation */}
                {isClient && (
                  <>
                    <Link to="/client/dashboard" className="text-sm font-medium text-[#B3B3B3] hover:text-white transition-colors">
                      Dashboard
                    </Link>
                    <Link to="/project/post" className="text-sm font-medium text-[#B3B3B3] hover:text-white transition-colors flex items-center gap-1.5">
                      <FolderPlus className="w-4 h-4 text-[#1DB954]" /> Post Project
                    </Link>
                    <Link to="/client/projects" className="text-sm font-medium text-[#B3B3B3] hover:text-white transition-colors">
                      My Projects
                    </Link>
                  </>
                )}

                {/* Freelancer Navigation */}
                {isFreelancer && (
                  <>
                    <Link to="/freelancer/dashboard" className="text-sm font-medium text-[#B3B3B3] hover:text-white transition-colors">
                      Dashboard
                    </Link>
                    <Link to="/projects" className="text-sm font-medium text-[#B3B3B3] hover:text-white transition-colors flex items-center gap-1.5">
                      <Compass className="w-4 h-4 text-[#1DB954]" /> Find Work
                    </Link>
                    <Link to="/freelancer/bids" className="text-sm font-medium text-[#B3B3B3] hover:text-white transition-colors">
                      My Bids
                    </Link>
                    <Link to="/freelancer/saved" className="text-sm font-medium text-[#B3B3B3] hover:text-white transition-colors flex items-center gap-1.5">
                      <Bookmark className="w-4 h-4" /> Saved
                    </Link>
                  </>
                )}
                
                {/* Shared Chat Link */}
                <Link to="/chat" className="text-sm font-medium text-[#B3B3B3] hover:text-white transition-colors flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4" /> Chat
                </Link>
              </>
            )}
          </div>

          {/* Desktop Right Side Controls */}
          <div className="hidden md:flex items-center gap-4">
            {!isAuthenticated ? (
              <>
                <Link to="/login">
                  <Button variant="text" size="sm">Login</Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">Get Started</Button>
                </Link>
              </>
            ) : (
              <>
                {/* Notification Bell */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setNotiDropdownOpen(!notiDropdownOpen);
                      setUserDropdownOpen(false);
                    }}
                    className="p-2 rounded-full text-[#B3B3B3] hover:text-white hover:bg-[#212121] transition-colors relative"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#1DB954] text-[9px] font-black text-white ring-2 ring-[#121212]">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  <NotificationDropdown
                    isOpen={notiDropdownOpen}
                    onClose={() => setNotiDropdownOpen(false)}
                  />
                </div>

                {/* User Dropdown Profile Toggle */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setUserDropdownOpen(!userDropdownOpen);
                      setNotiDropdownOpen(false);
                    }}
                    className="flex items-center gap-2 focus:outline-none cursor-pointer"
                  >
                    <img
                      src={currentUser.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${currentUser.firstName}`}
                      alt={currentUser.firstName}
                      className="w-8 h-8 rounded-full object-cover bg-[#212121] border border-[#2A2A2A]"
                    />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-3 w-48 bg-[#181818] border border-[#2A2A2A] rounded-xl shadow-2xl z-50 overflow-hidden divide-y divide-[#2A2A2A]">
                      <div className="px-4 py-3 bg-[#212121]">
                        <p className="text-sm font-bold text-white leading-none mb-1">
                          {currentUser.firstName} {currentUser.lastName || ""}
                        </p>
                        <p className="text-xs text-[#B3B3B3] truncate">
                          {currentUser.role}
                        </p>
                      </div>
                      <div className="py-1">
                        <Link
                          to="/profile"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#B3B3B3] hover:text-white hover:bg-[#212121] transition-colors"
                        >
                          <User className="w-4 h-4" /> My Profile
                        </Link>
                      </div>
                      <div className="py-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-[#212121] transition-colors text-left"
                        >
                          <LogOut className="w-4 h-4" /> Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Mobile hamburger menu */}
          <div className="md:hidden flex items-center gap-3">
            {isAuthenticated && (
              <div className="relative">
                <button
                  onClick={() => setNotiDropdownOpen(!notiDropdownOpen)}
                  className="p-1.5 rounded-full text-[#B3B3B3] hover:text-white relative"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#1DB954] text-[8px] font-black text-white">
                      {unreadCount}
                    </span>
                  )}
                </button>
                <NotificationDropdown
                  isOpen={notiDropdownOpen}
                  onClose={() => setNotiDropdownOpen(false)}
                />
              </div>
            )}
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-full text-[#B3B3B3] hover:text-white focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-30 flex">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-[#000000]/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-[#181818] border-r border-[#2A2A2A] pt-5 pb-4 transition-transform duration-300">
            <div className="flex items-center justify-between px-4 pb-4 border-b border-[#2A2A2A]">
              <span className="font-black text-lg text-white tracking-wider">
                <span className="text-[#1DB954]">peer</span>Lance
              </span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-full text-[#B3B3B3] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Drawer Links */}
            <div className="mt-4 flex-1 h-0 overflow-y-auto px-2 space-y-1">
              {!isAuthenticated ? (
                <>
                  <Link to="/login" className="flex items-center px-4 py-3 text-sm font-semibold text-[#B3B3B3] hover:text-white rounded-lg hover:bg-[#212121]">
                    Login
                  </Link>
                  <Link to="/register" className="flex items-center px-4 py-3 text-sm font-semibold text-[#B3B3B3] hover:text-white rounded-lg hover:bg-[#212121]">
                    Register
                  </Link>
                  <Link to="/projects" className="flex items-center px-4 py-3 text-sm font-semibold text-[#B3B3B3] hover:text-white rounded-lg hover:bg-[#212121]">
                    Explore Projects
                  </Link>
                </>
              ) : (
                <>
                  {/* Mobile Role Specific Links */}
                  {isClient && (
                    <>
                      <Link to="/client/dashboard" className="flex items-center px-4 py-3 text-sm font-semibold text-[#B3B3B3] hover:text-white rounded-lg hover:bg-[#212121]">
                        Dashboard
                      </Link>
                      <Link to="/project/post" className="flex items-center px-4 py-3 text-sm font-semibold text-[#B3B3B3] hover:text-white rounded-lg hover:bg-[#212121]">
                        Post Project
                      </Link>
                      <Link to="/client/projects" className="flex items-center px-4 py-3 text-sm font-semibold text-[#B3B3B3] hover:text-white rounded-lg hover:bg-[#212121]">
                        My Projects
                      </Link>
                    </>
                  )}

                  {isFreelancer && (
                    <>
                      <Link to="/freelancer/dashboard" className="flex items-center px-4 py-3 text-sm font-semibold text-[#B3B3B3] hover:text-white rounded-lg hover:bg-[#212121]">
                        Dashboard
                      </Link>
                      <Link to="/projects" className="flex items-center px-4 py-3 text-sm font-semibold text-[#B3B3B3] hover:text-white rounded-lg hover:bg-[#212121]">
                        Find Work
                      </Link>
                      <Link to="/freelancer/bids" className="flex items-center px-4 py-3 text-sm font-semibold text-[#B3B3B3] hover:text-white rounded-lg hover:bg-[#212121]">
                        My Bids
                      </Link>
                      <Link to="/freelancer/saved" className="flex items-center px-4 py-3 text-sm font-semibold text-[#B3B3B3] hover:text-white rounded-lg hover:bg-[#212121]">
                        Saved Projects
                      </Link>
                    </>
                  )}

                  <Link to="/chat" className="flex items-center px-4 py-3 text-sm font-semibold text-[#B3B3B3] hover:text-white rounded-lg hover:bg-[#212121]">
                    Chat Rooms
                  </Link>
                  <Link to="/profile" className="flex items-center px-4 py-3 text-sm font-semibold text-[#B3B3B3] hover:text-white rounded-lg hover:bg-[#212121]">
                    My Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-3 text-sm font-semibold text-red-400 hover:text-red-300 rounded-lg hover:bg-[#212121]"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
