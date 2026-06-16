import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../hooks/useNotifications';
import {
  LayoutDashboard,
  Database,
  Briefcase,
  Award,
  Sparkles,
  MessageSquare,
  Bot,
  Brain,
  History,
  TrendingUp,
  Settings,
  Shield,
  LogOut,
  Bell,
  Menu,
  X
} from 'lucide-react';

interface SidebarItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  roles?: ('user' | 'recruiter' | 'admin')[];
}

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const { unreadCount, notifications, markAllAsRead } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-darkBg text-gray-100">
        <Brain className="w-16 h-16 text-electricCyan animate-bounce mb-4" />
        <h2 className="text-xl font-bold">Checking authentication credentials...</h2>
      </div>
    );
  }

  const menuItems: SidebarItem[] = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'Knowledge Base', path: '/knowledge', icon: <Database className="w-5 h-5" /> },
    { name: 'Projects', path: '/projects', icon: <Briefcase className="w-5 h-5" /> },
    { name: 'Experience', path: '/experience', icon: <Briefcase className="w-5 h-5" /> },
    { name: 'Certificates', path: '/certificates', icon: <Award className="w-5 h-5" /> },
    { name: 'Memories', path: '/memories', icon: <History className="w-5 h-5" /> },
    { name: 'AI Assistant', path: '/assistant', icon: <Bot className="w-5 h-5" /> },
    { name: 'Career Center', path: '/career', icon: <Sparkles className="w-5 h-5" /> },
    { name: 'Portfolio', path: `/u/${user.username}`, icon: <Compass className="w-5 h-5" /> },
    { name: 'Analytics', path: '/analytics', icon: <TrendingUp className="w-5 h-5" /> },
    { name: 'Settings', path: '/settings', icon: <Settings className="w-5 h-5" /> },
    { name: 'Admin Panel', path: '/admin', icon: <Shield className="w-5 h-5" />, roles: ['admin'] },
  ];

  // Filter items by role
  const visibleItems = menuItems.filter(
    (item) => !item.roles || item.roles.includes(user.role)
  );

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const Compass = Sparkles; // local mapping for missing import

  return (
    <div className="flex min-h-screen bg-darkBg text-gray-100 overflow-x-hidden relative font-sans">
      {/* Mesh Glow Background */}
      <div className="absolute inset-0 bg-mesh opacity-60 pointer-events-none" />

      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-borderGlass bg-[#0F172A]/40 backdrop-blur-md sticky top-0 h-screen z-20">
        <div className="flex items-center space-x-2 px-6 py-5 border-b border-borderGlass">
          <Brain className="w-7 h-7 text-electricCyan" />
          <span className="font-header text-md font-bold tracking-wider bg-gradient-to-r from-electricCyan to-neonPurple bg-clip-text text-transparent">
            TWIN DASHBOARD
          </span>
        </div>

        {/* User Card */}
        <div className="p-4 border-b border-borderGlass">
          <div className="flex items-center space-x-3 p-2 rounded-xl bg-white/5 border border-white/5">
            <img
              src={user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.displayName}`}
              alt="Avatar"
              className="w-10 h-10 rounded-full border border-electricCyan/30"
            />
            <div className="overflow-hidden">
              <h4 className="text-sm font-bold truncate">{user.displayName}</h4>
              <span className="text-xs text-electricCyan uppercase font-semibold">{user.role}</span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {visibleItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
            return (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-r from-electricCyan/20 to-neonPurple/20 border border-electricCyan/40 text-electricCyan shadow-glowCyan'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/5 border border-transparent'
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-borderGlass">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-300"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Navigation Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-darkBg/90 backdrop-blur-sm">
          <div className="w-64 bg-[#0F172A] border-r border-borderGlass flex flex-col h-full relative">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-200"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="flex items-center space-x-2 px-6 py-5 border-b border-borderGlass">
              <Brain className="w-7 h-7 text-electricCyan" />
              <span className="font-header text-md font-bold tracking-wider bg-gradient-to-r from-electricCyan to-neonPurple bg-clip-text text-transparent">
                TWIN DASHBOARD
              </span>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
              {visibleItems.map((item) => {
                const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
                return (
                  <button
                    key={item.name}
                    onClick={() => {
                      navigate(item.path);
                      setMobileOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
                      isActive
                        ? 'bg-gradient-to-r from-electricCyan/20 to-neonPurple/20 border border-electricCyan/40 text-electricCyan shadow-glowCyan'
                        : 'text-gray-400 hover:text-gray-200 hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </nav>

            <div className="p-4 border-t border-borderGlass">
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-500/10 transition"
              >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
          <div className="flex-1" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 border-b border-borderGlass bg-darkBg/60 backdrop-blur-md">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-1.5 rounded-lg border border-borderGlass hover:bg-white/5 lg:hidden"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold font-header tracking-wide hidden sm:block">
              {location.pathname === '/dashboard' && 'Control Panel'}
              {location.pathname === '/knowledge' && 'Personal Knowledge Base'}
              {location.pathname === '/projects' && 'Projects Portfolio'}
              {location.pathname === '/experience' && 'Professional Experience'}
              {location.pathname === '/certificates' && 'Credentials & Certifications'}
              {location.pathname === '/memories' && 'Digital Memory Timeline'}
              {location.pathname === '/assistant' && 'AI Clone Assistant'}
              {location.pathname === '/career' && 'AI Recruiter Center'}
              {location.pathname === '/analytics' && 'Traffic & Skill Growth'}
              {location.pathname === '/settings' && 'Brand Profile Settings'}
              {location.pathname === '/admin' && 'System Admin Controls'}
            </h2>
          </div>

          <div className="flex items-center space-x-4">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-xl border border-borderGlass hover:bg-white/5 relative"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full text-xs font-bold flex items-center justify-center text-white scale-90">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 glass-panel rounded-2xl overflow-hidden shadow-2xl z-40 border border-white/10">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                    <span className="font-bold text-sm">Notifications</span>
                    <button
                      onClick={() => {
                        markAllAsRead();
                        setShowNotifications(false);
                      }}
                      className="text-xs text-electricCyan hover:underline"
                    >
                      Clear Unread
                    </button>
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-white/5">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-500 text-xs">No notifications yet.</div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif._id}
                          className={`p-4 text-xs hover:bg-white/5 transition ${!notif.read ? 'bg-electricCyan/5 border-l-2 border-electricCyan' : ''}`}
                        >
                          <p className="text-gray-200 mb-1">{notif.message}</p>
                          <span className="text-[10px] text-gray-500">
                            {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Info Mobile */}
            <div className="flex items-center space-x-2">
              <img
                src={user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.displayName}`}
                alt="Avatar"
                className="w-8 h-8 rounded-full border border-electricCyan/40"
              />
              <span className="text-sm font-semibold truncate max-w-[100px] hidden md:block">
                {user.displayName.split(' ')[0]}
              </span>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-6 z-10 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
