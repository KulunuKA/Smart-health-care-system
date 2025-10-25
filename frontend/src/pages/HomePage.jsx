import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  FileText, 
  CreditCard, 
  BarChart3, 
  Shield, 
  Bell,
  Users,
  Heart,
  ArrowRight,
  CheckCircle
} from 'lucide-react';
import Card, { FeatureCard, StatCard } from '../components/common/Card';

/**
 * Home Page Component
 * Landing page with system overview and navigation
 */
const HomePage = () => {
  const features = [
    {
      title: 'Appointment Management',
      description: 'Book, reschedule, and manage appointments with real-time availability.',
      icon: Calendar,
      link: '/appointments'
    },
    {
      title: 'Patient Records',
      description: 'Digital health cards and comprehensive patient record management.',
      icon: FileText,
      link: '/records'
    },
    {
      title: 'Payment & Billing',
      description: 'Secure payment processing with digital receipts and billing history.',
      icon: CreditCard,
      link: '/payments'
    },
    {
      title: 'Analytics & Reports',
      description: 'Comprehensive healthcare analytics and reporting dashboard.',
      icon: BarChart3,
      link: '/reports'
    },
    {
      title: 'Notifications',
      description: 'Real-time alerts and notifications for appointments and payments.',
      icon: Bell,
      link: '/notifications'
    },
    {
      title: 'Admin Panel',
      description: 'Complete administrative control and system management.',
      icon: Shield,
      link: '/admin'
    }
  ];

  const stats = [
    { title: 'Active Patients', value: '2,847', change: '+12%', changeType: 'positive' },
    { title: 'Appointments Today', value: '156', change: '+8%', changeType: 'positive' },
    { title: 'Revenue This Month', value: '$45,230', change: '+15%', changeType: 'positive' },
    { title: 'System Uptime', value: '99.9%', change: '+0.1%', changeType: 'positive' }
  ];

  const benefits = [
    'Digital health card integration',
    'Real-time appointment scheduling',
    'Secure payment processing',
    'Comprehensive patient records',
    'Advanced analytics and reporting',
    'Multi-role access control',
    'Mobile-responsive design',
    'HIPAA compliant security'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Smart Healthcare
              <span className="block text-gradient">System</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Digitalizing hospital management for urban healthcare systems. 
              Providing seamless patient care through modern technology.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link to="/login" className="btn-primary text-lg px-8 py-3">
                Get Started
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link to="/about" className="btn-outline text-lg px-8 py-3">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <StatCard
                key={index}
                title={stat.title}
                value={stat.value}
                change={stat.change}
                changeType={stat.changeType}
                icon={index === 0 ? Users : index === 1 ? Calendar : index === 2 ? CreditCard : Heart}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Complete Healthcare Management
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to manage a modern healthcare facility in one integrated platform.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Link
                  key={index}
                  to={feature.link}
                  className="group block"
                >
                  <Card className="h-full group-hover:shadow-xl transition-all duration-300">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600">
                        {feature.description}
                      </p>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Why Choose Smart Healthcare?
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Our comprehensive platform streamlines healthcare operations, 
                improves patient experience, and enhances clinical outcomes.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-4">Ready to Transform Your Healthcare?</h3>
                <p className="text-primary-100 mb-6">
                  Join thousands of healthcare providers who have already 
                  digitalized their operations with our platform.
                </p>
                <Link
                  to="/contact"
                  className="inline-flex items-center bg-white text-primary-600 font-semibold px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Contact Us Today
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Start Your Digital Healthcare Journey
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Experience the future of healthcare management with our comprehensive, 
            secure, and user-friendly platform.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link
              to="/login"
              className="bg-white text-primary-600 hover:bg-gray-50 font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              Get Started Now
            </Link>
            <Link
              to="/about"
              className="border-2 border-white text-white hover:bg-white hover:text-primary-600 font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;