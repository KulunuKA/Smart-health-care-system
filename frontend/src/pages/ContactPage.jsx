import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import Card from '../components/common/Card';
import { validateRequired, isValidEmail } from '../utils/validators';

/**
 * Contact Page Component
 * Contact form and hospital information
 */
const ContactPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm();

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSubmitStatus('success');
      reset();
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: 'Address',
      details: [
        '123 Healthcare Street',
        'Medical City, MC 12345',
        'United States'
      ]
    },
    {
      icon: Phone,
      title: 'Phone',
      details: [
        'Main: +1 (555) 123-4567',
        'Emergency: +1 (555) 123-4568',
        'Fax: +1 (555) 123-4569'
      ]
    },
    {
      icon: Mail,
      title: 'Email',
      details: [
        'General: info@smarthealthcare.com',
        'Support: support@smarthealthcare.com',
        'Emergency: emergency@smarthealthcare.com'
      ]
    },
    {
      icon: Clock,
      title: 'Hours',
      details: [
        'Monday - Friday: 8:00 AM - 6:00 PM',
        'Saturday: 9:00 AM - 4:00 PM',
        'Sunday: Emergency Only'
      ]
    }
  ];

  const departments = [
    { name: 'General Inquiries', email: 'info@smarthealthcare.com' },
    { name: 'Technical Support', email: 'support@smarthealthcare.com' },
    { name: 'Billing Questions', email: 'billing@smarthealthcare.com' },
    { name: 'Medical Records', email: 'records@smarthealthcare.com' },
    { name: 'Appointments', email: 'appointments@smarthealthcare.com' },
    { name: 'Emergency', email: 'emergency@smarthealthcare.com' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-secondary-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Contact Us
            </h1>
            <p className="text-xl text-primary-100 max-w-3xl mx-auto">
              Get in touch with our healthcare team. We're here to help with 
              any questions or support you need.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <Card className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Send us a Message
                </h2>
                
                {submitStatus === 'success' && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                    <span className="text-green-800">
                      Thank you! Your message has been sent successfully.
                    </span>
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
                    <span className="text-red-800">
                      Sorry, there was an error sending your message. Please try again.
                    </span>
                  </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="label">First Name</label>
                      <input
                        {...register('firstName', { 
                          validate: (value) => validateRequired(value, 'First name').isValid || 'First name is required'
                        })}
                        className="input-field"
                        placeholder="Enter your first name"
                      />
                      {errors.firstName && (
                        <p className="text-red-600 text-sm mt-1">{errors.firstName.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="label">Last Name</label>
                      <input
                        {...register('lastName', { 
                          validate: (value) => validateRequired(value, 'Last name').isValid || 'Last name is required'
                        })}
                        className="input-field"
                        placeholder="Enter your last name"
                      />
                      {errors.lastName && (
                        <p className="text-red-600 text-sm mt-1">{errors.lastName.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="label">Email Address</label>
                    <input
                      {...register('email', { 
                        validate: (value) => {
                          if (!value) return 'Email is required';
                          if (!isValidEmail(value)) return 'Invalid email format';
                          return true;
                        }
                      })}
                      type="email"
                      className="input-field"
                      placeholder="Enter your email address"
                    />
                    {errors.email && (
                      <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="label">Phone Number</label>
                    <input
                      {...register('phone')}
                      type="tel"
                      className="input-field"
                      placeholder="Enter your phone number (optional)"
                    />
                  </div>

                  <div>
                    <label className="label">Subject</label>
                    <select
                      {...register('subject', { 
                        validate: (value) => validateRequired(value, 'Subject').isValid || 'Please select a subject'
                      })}
                      className="input-field"
                    >
                      <option value="">Select a subject</option>
                      <option value="general">General Inquiry</option>
                      <option value="technical">Technical Support</option>
                      <option value="billing">Billing Question</option>
                      <option value="appointment">Appointment Related</option>
                      <option value="medical">Medical Records</option>
                      <option value="other">Other</option>
                    </select>
                    {errors.subject && (
                      <p className="text-red-600 text-sm mt-1">{errors.subject.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="label">Message</label>
                    <textarea
                      {...register('message', { 
                        validate: (value) => validateRequired(value, 'Message').isValid || 'Message is required'
                      })}
                      rows={6}
                      className="input-field"
                      placeholder="Enter your message"
                    />
                    {errors.message && (
                      <p className="text-red-600 text-sm mt-1">{errors.message.message}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary w-full flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              </Card>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Get in Touch
                </h2>
                <div className="space-y-6">
                  {contactInfo.map((info, index) => {
                    const Icon = info.icon;
                    return (
                      <Card key={index} className="p-6">
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Icon className="w-6 h-6 text-primary-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              {info.title}
                            </h3>
                            {info.details.map((detail, detailIndex) => (
                              <p key={detailIndex} className="text-gray-600">
                                {detail}
                              </p>
                            ))}
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* Department Contacts */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Department Contacts
                </h3>
                <div className="space-y-3">
                  {departments.map((dept, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                      <span className="text-gray-700">{dept.name}</span>
                      <a
                        href={`mailto:${dept.email}`}
                        className="text-primary-600 hover:text-primary-700 text-sm"
                      >
                        {dept.email}
                      </a>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Visit Our Location
            </h2>
            <p className="text-xl text-gray-600">
              Located in the heart of the medical district
            </p>
          </div>
          
          <Card className="p-8">
            <div className="bg-gray-200 rounded-lg h-96 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  Interactive Map
                </h3>
                <p className="text-gray-500">
                  Google Maps integration would be implemented here
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  123 Healthcare Street, Medical City, MC 12345
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Emergency Contact */}
      <section className="py-20 bg-red-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Emergency Contact
            </h2>
            <p className="text-xl text-gray-600 mb-6">
              For medical emergencies, please call our emergency line immediately.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <a
                href="tel:+15551234568"
                className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-4 rounded-lg text-xl transition-colors"
              >
                Emergency: (555) 123-4568
              </a>
              <span className="text-gray-500">or</span>
              <a
                href="tel:911"
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold px-8 py-4 rounded-lg text-xl transition-colors"
              >
                Call 911
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;