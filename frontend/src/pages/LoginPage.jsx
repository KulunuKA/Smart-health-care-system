import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { validateLoginForm } from '../utils/validators';
import { Eye, EyeOff, Lock, Mail, Heart } from 'lucide-react';
import Card from '../components/common/Card';
import Loader from '../components/common/Loader';

/**
 * Login Page Component
 * User authentication with role-based redirection
 */
const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, isAuthenticated, user } = useAuth();
  const { showSuccess, showError } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      // Role-based redirection
      let redirectPath = '/dashboard';
      
      if (user.role === 'admin') {
        redirectPath = '/admin';
      } else if (user.role === 'doctor') {
        redirectPath = '/dashboard';
      } else if (user.role === 'patient') {
        redirectPath = '/dashboard';
      }
      
      const from = location.state?.from?.pathname || redirectPath;
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, user, navigate, location]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    
    try {
      // Use regular login for all users - backend will handle role validation
      const result = await login(data);
      
      if (result.success) {
        // Determine success message based on user role
        const userRole = result.user?.role || 'user';
        const roleMessage = userRole === 'admin' ? 'Admin login successful! Welcome back.' : 'Login successful! Welcome back.';
        showSuccess(roleMessage);
        
        // Role-based redirection will be handled by useEffect
        const from = location.state?.from?.pathname || '/dashboard';
        navigate(from, { replace: true });
      } else {
        showError(result.error || 'Login failed');
      }
    } catch (error) {
      showError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" text="Redirecting..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center">
              <Heart className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your Smart Healthcare account
          </p>
        </div>

        {/* Login Form */}
        <Card className="p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('email', {
                    validate: (value) => {
                      const validation = validateLoginForm({ email: value, password: '' });
                      return validation.errors.email || true;
                    }
                  })}
                  type="email"
                  className="input-field pl-10"
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('password', {
                    validate: (value) => {
                      const validation = validateLoginForm({ email: '', password: value });
                      return validation.errors.password || true;
                    }
                  })}
                  type={showPassword ? 'text' : 'password'}
                  className="input-field pl-10 pr-10"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
                  Forgot your password?
                </a>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          {/* Demo Accounts */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-4">Demo Accounts</h3>
            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Patient:</span>
                <span>patient@demo.com / password123</span>
              </div>
              <div className="flex justify-between">
                <span>Doctor:</span>
                <span>doctor@demo.com / password123</span>
              </div>
              <div className="flex justify-between bg-yellow-50 p-2 rounded border-l-4 border-yellow-400">
                <span className="font-medium text-yellow-800">Admin:</span>
                <span className="font-medium text-yellow-800">admin@demo.com / password123</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Footer Links */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/contact" className="font-medium text-primary-600 hover:text-primary-500">
              Contact us to get started
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;