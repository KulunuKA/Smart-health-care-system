import React from 'react';
import { 
  Heart, 
  Users, 
  Shield, 
  Award, 
  Target, 
  Eye,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import Card from '../components/common/Card';

/**
 * About Page Component
 * Information about the Smart Healthcare System
 */
const AboutPage = () => {
  const values = [
    {
      title: 'Patient-Centered Care',
      description: 'Every feature is designed with patient well-being and experience at the forefront.',
      icon: Heart
    },
    {
      title: 'Clinical Excellence',
      description: 'Supporting healthcare providers with tools that enhance clinical outcomes.',
      icon: Award
    },
    {
      title: 'Data Security',
      description: 'HIPAA-compliant security measures to protect sensitive patient information.',
      icon: Shield
    },
    {
      title: 'Innovation',
      description: 'Leveraging cutting-edge technology to modernize healthcare delivery.',
      icon: Target
    }
  ];

  const team = [
    {
      name: 'Dr. Sarah Johnson',
      role: 'Chief Medical Officer',
      description: 'Leading our medical advisory board with 20+ years of healthcare experience.'
    },
    {
      name: 'Michael Chen',
      role: 'Chief Technology Officer',
      description: 'Technology visionary with expertise in healthcare digital transformation.'
    },
    {
      name: 'Dr. Emily Rodriguez',
      role: 'Head of Clinical Operations',
      description: 'Ensuring our platform meets the highest clinical standards and workflows.'
    },
    {
      name: 'David Kim',
      role: 'Head of Security',
      description: 'Cybersecurity expert focused on protecting patient data and privacy.'
    }
  ];

  const achievements = [
    'HIPAA Compliant Platform',
    '99.9% System Uptime',
    '50,000+ Patient Records Managed',
    '100+ Healthcare Partners',
    'ISO 27001 Certified',
    'SOC 2 Type II Compliant'
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-secondary-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              About Smart Healthcare System
            </h1>
            <p className="text-xl text-primary-100 max-w-3xl mx-auto">
              Transforming healthcare delivery through innovative technology, 
              comprehensive patient management, and seamless digital workflows.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <Card className="p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mr-4">
                  <Target className="w-6 h-6 text-primary-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Our Mission</h2>
              </div>
              <p className="text-gray-600 text-lg leading-relaxed">
                To revolutionize healthcare delivery by providing comprehensive, 
                secure, and user-friendly digital solutions that enhance patient 
                care, streamline operations, and improve clinical outcomes for 
                healthcare providers worldwide.
              </p>
            </Card>

            <Card className="p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center mr-4">
                  <Eye className="w-6 h-6 text-secondary-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Our Vision</h2>
              </div>
              <p className="text-gray-600 text-lg leading-relaxed">
                To be the leading digital healthcare platform that connects 
                patients, providers, and healthcare systems, creating a 
                seamless ecosystem that improves health outcomes and transforms 
                the way healthcare is delivered.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Core Values
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The principles that guide everything we do in healthcare technology.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card key={index} className="text-center p-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {value.title}
                  </h3>
                  <p className="text-gray-600">
                    {value.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Meet Our Team
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Healthcare and technology experts working together to transform 
              the future of healthcare delivery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="text-center p-6">
                <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {member.name}
                </h3>
                <p className="text-primary-600 font-medium mb-3">
                  {member.role}
                </p>
                <p className="text-gray-600 text-sm">
                  {member.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Our Achievements
            </h2>
            <p className="text-xl text-primary-100 max-w-3xl mx-auto">
              Recognized excellence in healthcare technology and patient care.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map((achievement, index) => (
              <div key={index} className="flex items-center space-x-3 bg-white bg-opacity-10 rounded-lg p-4">
                <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
                <span className="text-white font-medium">{achievement}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Built with Modern Technology
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Our platform leverages cutting-edge technologies to ensure 
                security, scalability, and performance.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  <span className="text-gray-700">React 18+ for modern user interfaces</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  <span className="text-gray-700">Spring Boot for robust backend services</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  <span className="text-gray-700">HIPAA-compliant data encryption</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  <span className="text-gray-700">Cloud-native architecture for scalability</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  <span className="text-gray-700">Real-time notifications and updates</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Technology Stack</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-primary-600">React 18+</div>
                    <div className="text-sm text-gray-600">Frontend</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-secondary-600">Spring Boot</div>
                    <div className="text-sm text-gray-600">Backend</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">PostgreSQL</div>
                    <div className="text-sm text-gray-600">Database</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">AWS</div>
                    <div className="text-sm text-gray-600">Cloud</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Ready to Transform Your Healthcare?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join the healthcare revolution and experience the future of 
            patient care management.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <a
              href="/login"
              className="btn-primary text-lg px-8 py-3 inline-flex items-center"
            >
              Get Started Today
              <ArrowRight className="w-5 h-5 ml-2" />
            </a>
            <a
              href="/contact"
              className="btn-outline text-lg px-8 py-3"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;