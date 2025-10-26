import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { 
  Menu, 
  X, 
  Bell, 
  User, 
  LogOut, 
  Settings,
  Calendar,
  FileText,
  CreditCard,
  BarChart3,
  Shield
} from 'lucide-react';

/**
 * Navigation Bar Component
 * Provides main navigation with role-based menu items
 */
const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { unreadCount } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();


  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getRoleBasedMenuItems = () => {
    if (!user) return [];

    const baseItems = [
      { name: 'Dashboard', path: '/dashboard', icon: BarChart3 },
    ];

    switch (user.role) {
      case 'patient':
        return [
          ...baseItems,
          { name: 'Appointments', path: '/appointments', icon: Calendar },
          { name: 'Medical Records', path: '/records', icon: FileText },
          { name: 'Payments', path: '/payments', icon: CreditCard },
        ];
      case 'doctor':
        return [
          ...baseItems,
          { name: 'Appointments', path: '/appointments', icon: Calendar },
          { name: 'Patient Records', path: '/records', icon: FileText },
        ];
      case 'staff':
        return [
          ...baseItems,
          { name: 'Appointments', path: '/appointments', icon: Calendar },
          { name: 'Patient Records', path: '/records', icon: FileText },
          { name: 'Payments', path: '/payments', icon: CreditCard },
        ];
      case 'admin':
        return [
          ...baseItems,
          { name: 'Appointments', path: '/appointments', icon: Calendar },
          { name: 'Patient Records', path: '/records', icon: FileText },
          { name: 'Payments', path: '/payments', icon: CreditCard },
          { name: 'Reports', path: '/reports', icon: BarChart3 },
          { name: 'Admin Panel', path: '/admin', icon: Shield },
        ];
      case 'manager':
        return [
          ...baseItems,
          { name: 'Reports', path: '/reports', icon: BarChart3 },
          { name: 'Admin Panel', path: '/admin', icon: Shield },
        ];
      default:
        return baseItems;
    }
  };

  const menuItems = getRoleBasedMenuItems();

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SH</span>
              </div>
              <span className="text-xl font-bold text-gradient">
                Smart Healthcare
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {isAuthenticated && (
              <>
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActivePath(item.path)
                          ? 'bg-primary-100 text-primary-700'
                          : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </>
            )}
          </div>

          {/* Right side items */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                    className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded-md transition-colors relative"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notification Dropdown */}
                  {isNotificationOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                      <div className="p-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                      </div>
                      <div className="p-4">
                        <Link
                          to="/notifications"
                          className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                        >
                          View all notifications
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* User Menu */}
                <div className="relative">
                  <button className="flex items-center space-x-2 p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded-md transition-colors">
                    <User className="w-5 h-5" />
                    <span className="hidden sm:block text-sm font-medium">
                      {user?.name || 'User'}
                    </span>
                  </button>
                </div>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="hidden sm:block text-sm font-medium">Logout</span>
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="btn-primary"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded-md transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {isAuthenticated ? (
                <>
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        to={item.path}
                        onClick={() => setIsMenuOpen(false)}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                          isActivePath(item.path)
                            ? 'bg-primary-100 text-primary-700'
                            : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 px-3 py-2 text-base font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors w-full"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Logout</span>
                    </button>
                  </div>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded-md transition-colors"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;