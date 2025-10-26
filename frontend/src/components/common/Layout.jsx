import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from './Navbar';
import AdminNavbar from './AdminNavbar';
import Footer from './Footer';

/**
 * Layout Component
 * Conditionally renders navbar and footer based on user role
 */
const Layout = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  
  // Show admin layout for admin users regardless of route
  const showAdminLayout = isAuthenticated && user?.role === 'admin';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Conditional Navbar */}
      {showAdminLayout ? <AdminNavbar /> : <Navbar />}
      
      {/* Main Content */}
      <main className="min-h-screen">
        {children}
      </main>
      
      {/* Conditional Footer - Don't show footer for admin users */}
      {!showAdminLayout && <Footer />}
    </div>
  );
};

export default Layout;
