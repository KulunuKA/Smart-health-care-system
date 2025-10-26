import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  CreditCard, 
  DollarSign, 
  Search, 
  Filter,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import Card, { StatCard } from '../components/common/Card';
import Loader from '../components/common/Loader';
import Modal, { FormModal } from '../components/common/Modal';
import PaymentMethodIcon from '../components/common/PaymentMethodIcon';
import CheckoutButton from '../components/common/CheckoutButton';
import { paymentService } from '../services/paymentService';
import { toast } from 'react-toastify';


/**
 * Payments Page Component
 * Manage payments, billing, and financial transactions
 * 
 * Test Card Numbers (for development):
 * - Visa: 4111 1111 1111 1111
 * - Mastercard: 5555 5555 5555 4444
 * - American Express: 3782 822463 10005
 * - Discover: 6011 1111 1111 1117
 */
const PaymentsPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [bills, setBills] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [showPaymentDetailsModal, setShowPaymentDetailsModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [paymentData, setPaymentData] = useState({
    method: 'stripe',
    amount: 0,
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });

  useEffect(() => {
    fetchPayments();
    fetchBills();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      // Fetch real payment history from the backend
      const data = await paymentService.getPaymentHistory(user?._id);
      const payments = data.data.map(payment => ({
        id: payment._id,
        patientName: `${payment.userId.firstName} ${payment.userId.lastName}`,
        amount: payment.amount,
        date: new Date(payment.paidAt).toISOString().split('T')[0],
        method: payment.paymentMethod === 'card' ? 'Credit Card' : 
                payment.paymentMethod === 'bank' ? 'Bank Transfer' : 'Digital Wallet',
        status: payment.status,
        transactionId: payment.transactionId,
        description: payment.appointmentId?.reason || 'Appointment fee'
      }));
      
      setPayments(payments);
    } catch (error) {
      console.error('Error fetching payments:', error);
      // Fallback to mock data
      const mockPayments = [
        {
          id: 1,
          patientName: 'John Doe',
          amount: 150.00,
          date: '2024-12-10',
          method: 'Visa',
          status: 'paid',
          transactionId: 'TXN123456789',
          description: 'Appointment fee'
        },
        {
          id: 2,
          patientName: 'Jane Smith',
          amount: 75.00,
          date: '2024-12-09',
          method: 'Mastercard',
          status: 'verified',
          transactionId: 'TXN987654321',
          description: 'Lab test fee'
        },
        {
          id: 3,
          patientName: 'Bob Wilson',
          amount: 200.00,
          date: '2024-12-08',
          method: 'PayPal',
          status: 'unpaid',
          transactionId: 'TXN456789123',
          description: 'Consultation fee'
        },
        {
          id: 4,
          patientName: 'Alice Johnson',
          amount: 125.00,
          date: '2024-12-07',
          method: 'American Express',
          status: 'paid',
          transactionId: 'TXN789123456',
          description: 'Follow-up appointment'
        },
        {
          id: 5,
          patientName: 'Charlie Brown',
          amount: 90.00,
          date: '2024-12-06',
          method: 'Bank Transfer',
          status: 'overdue',
          transactionId: 'TXN321654987',
          description: 'Prescription refill'
        },
        {
          id: 6,
          patientName: 'Diana Prince',
          amount: 300.00,
          date: '2024-12-05',
          method: 'Apple Pay',
          status: 'verified',
          transactionId: 'TXN654987321',
          description: 'Emergency consultation'
        }
      ];
      setPayments(mockPayments);
    } finally {
      setLoading(false);
    }
  };

  const fetchBills = async () => {
    try {
      // Fetch real unpaid bills from the backend
      const data = await paymentService.getUnpaidBills(user?._id);
      const bills = data.data.map(bill => ({
        id: bill._id,
        patientName: `${bill.userId.firstName} ${bill.userId.lastName}`,
        amount: bill.amount,
        dueDate: new Date(bill.date).toISOString().split('T')[0],
        status: bill.status,
        description: bill.appointmentId?.reason || 'Appointment fee',
        services: ['Appointment', 'Consultation'],
        appointmentId: bill.appointmentId?._id,
        doctorName: `Dr. ${bill.doctorId.firstName} ${bill.doctorId.lastName}`
      }));
      
      setBills(bills);
    } catch (error) {
      console.error('Error fetching bills:', error);
      // Fallback to mock data
      const mockBills = [
        {
          id: 1,
          patientName: 'John Doe',
          amount: 300.00,
          dueDate: '2024-12-20',
          status: 'unpaid',
          description: 'Monthly treatment plan',
          services: ['Consultation', 'Lab Tests', 'Medication']
        },
        {
          id: 2,
          patientName: 'Jane Smith',
          amount: 125.00,
          dueDate: '2024-12-15',
          status: 'overdue',
          description: 'Follow-up appointment',
          services: ['Appointment', 'Prescription']
        }
      ];
      setBills(mockBills);
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'verified': return 'bg-blue-100 text-blue-800';
      case 'unpaid': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      // Legacy support for payment history statuses
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid': return <CheckCircle className="w-4 h-4" />;
      case 'verified': return <CheckCircle className="w-4 h-4" />;
      case 'unpaid': return <Clock className="w-4 h-4" />;
      case 'overdue': return <AlertCircle className="w-4 h-4" />;
      // Legacy support for payment history statuses
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'failed': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const detectCardType = (cardNumber) => {
    const number = cardNumber.replace(/\s/g, '');
    if (number.startsWith('4')) return 'visa';
    if (number.startsWith('5') || number.startsWith('2')) return 'mastercard';
    if (number.startsWith('3')) return 'amex';
    if (number.startsWith('6')) return 'discover';
    return 'card';
  };

  const formatCardNumber = (value) => {
    // Remove all non-digits
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    // Add spaces every 4 digits
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const validateCardNumber = (cardNumber) => {
    const number = cardNumber.replace(/\s/g, '');
    
    // Check if it's all digits and proper length
    if (!/^\d+$/.test(number)) return false;
    
    // Check length based on card type
    const cardType = detectCardType(number);
    const validLengths = {
      'visa': [13, 16],
      'mastercard': [16],
      'amex': [15],
      'discover': [16],
      'card': [13, 14, 15, 16]
    };
    
    if (!validLengths[cardType].includes(number.length)) return false;
    
    // Luhn algorithm validation
    let sum = 0;
    let isEven = false;
    
    // Process digits from right to left
    for (let i = number.length - 1; i >= 0; i--) {
      let digit = parseInt(number.charAt(i), 10);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    return sum % 10 === 0;
  };

  const handleCardNumberChange = (e) => {
    const formattedValue = formatCardNumber(e.target.value);
    setPaymentData({...paymentData, cardNumber: formattedValue});
  };

  const formatExpiryDate = (value) => {
    // Remove all non-digits
    const v = value.replace(/\D/g, '');
    
    // Add slash after 2 digits
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const validateExpiryDate = (expiryDate) => {
    if (!expiryDate || expiryDate.length !== 5) return false;
    
    const [month, year] = expiryDate.split('/');
    const monthNum = parseInt(month, 10);
    const yearNum = parseInt('20' + year, 10);
    
    if (monthNum < 1 || monthNum > 12) return false;
    
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    
    if (yearNum < currentYear) return false;
    if (yearNum === currentYear && monthNum < currentMonth) return false;
    
    return true;
  };

  const handleExpiryDateChange = (e) => {
    const formattedValue = formatExpiryDate(e.target.value);
    setPaymentData({...paymentData, expiryDate: formattedValue});
  };

  const validateCVV = (cvv) => {
    if (!cvv) return false;
    return /^\d{3,4}$/.test(cvv);
  };

  const handleCVVChange = (e) => {
    // Only allow digits and limit to 4 characters
    const value = e.target.value.replace(/\D/g, '').substring(0, 4);
    setPaymentData({...paymentData, cvv: value});
  };

  const handlePayment = (bill) => {
    setSelectedBill(bill);
    setPaymentData({
      method: 'stripe',
      amount: bill.amount,
      cardNumber: '',
      expiryDate: '',
      cvv: ''
    });
    setShowPaymentModal(true);
  };

  const handleViewPaymentDetails = (payment) => {
    setSelectedPayment(payment);
    setShowPaymentDetailsModal(true);
  };

  const processPayment = async () => {
    try {
      // Validate required fields
      if (!paymentData.method || !paymentData.amount) {
        toast.error('Please fill in all required fields');
        return;
      }

      // For manual payment method, validate card details
      if (paymentData.method === 'manual') {
        if (!paymentData.cardNumber || !paymentData.expiryDate || !paymentData.cvv) {
          toast.error('Please fill in all card details');
          return;
        }

        // Validate card number
        if (!validateCardNumber(paymentData.cardNumber)) {
          toast.error('Please enter a valid card number');
          return;
        }

        // Validate expiry date
        if (!validateExpiryDate(paymentData.expiryDate)) {
          toast.error('Please enter a valid expiry date');
          return;
        }

        // Validate CVV
        if (!validateCVV(paymentData.cvv)) {
          toast.error('Please enter a valid CVV');
          return;
        }
      }

      // Map frontend payment method to backend expected values
      const backendPaymentMethod = paymentData.method === 'manual' ? 'card' : paymentData.method;

      const paymentPayload = {
        billId: selectedBill.id,
        paymentMethod: backendPaymentMethod,
        amount: paymentData.amount,
        paymentDetails: paymentData.method === 'manual' ? {
          cardNumber: paymentData.cardNumber,
          expiryDate: paymentData.expiryDate,
          cvv: paymentData.cvv
        } : {
          method: paymentData.method
        }
      };

      const result = await paymentService.processPayment(paymentPayload);
      console.log('Payment processed successfully:', result);
      
      setShowPaymentModal(false);
      setSelectedBill(null);
      setPaymentData({
        method: 'stripe',
        amount: 0,
        cardNumber: '',
        expiryDate: '',
        cvv: ''
      });
      
      // Refresh data
      fetchPayments();
      fetchBills();
      
      toast.success('Payment processed successfully!');
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('Payment failed. Please try again.');
    }
  };

  const totalRevenue = payments
    .filter(p => p.status === 'paid' || p.status === 'verified')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingPayments = payments.filter(p => p.status === 'unpaid').length;
  const unpaidBills = bills.filter(b => b.status === 'unpaid' || b.status === 'overdue').length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" text="Loading payments..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Payments & Billing</h1>
          <p className="text-gray-600 mt-2">Manage financial transactions and billing</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Revenue"
            value={`$${totalRevenue.toLocaleString()}`}
            change="+12%"
            changeType="positive"
            icon={DollarSign}
          />
          <StatCard
            title="Unpaid Payments"
            value={pendingPayments.toString()}
            change="+2"
            changeType="neutral"
            icon={Clock}
          />
          <StatCard
            title="Unpaid Bills"
            value={unpaidBills.toString()}
            change="-1"
            changeType="positive"
            icon={AlertCircle}
          />
          <StatCard
            title="Payment Success Rate"
            value="98.5%"
            change="+0.5%"
            changeType="positive"
            icon={CheckCircle}
          />
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button className="border-b-2 border-primary-500 py-2 px-1 text-sm font-medium text-primary-600">
                Payment History
              </button>
              <button className="border-b-2 border-transparent py-2 px-1 text-sm font-medium text-gray-500 hover:text-gray-700">
                Outstanding Bills
              </button>
              <button className="border-b-2 border-transparent py-2 px-1 text-sm font-medium text-gray-500 hover:text-gray-700">
                Reports
              </button>
            </nav>
          </div>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search payments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="input-field"
              >
                <option value="all">All Status</option>
                <option value="paid">Paid</option>
                <option value="verified">Verified</option>
                <option value="unpaid">Unpaid</option>
                <option value="overdue">Overdue</option>
                {/* Legacy payment history statuses */}
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Payments List */}
        <div className="space-y-4">
          {filteredPayments.length === 0 ? (
            <Card className="p-8 text-center">
              <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No payments found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
            </Card>
          ) : (
            filteredPayments.map((payment) => (
              <Card key={payment.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                      <PaymentMethodIcon method={payment.method} size="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {payment.patientName}
                      </h3>
                      <p className="text-gray-600">{payment.description}</p>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-sm text-gray-500">
                          Transaction: {payment.transactionId}
                        </span>
                        <span className="text-sm text-gray-500">
                          {payment.date}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">
                        ${payment.amount.toFixed(2)}
                      </p>
                      <div className="flex items-center justify-end space-x-2 mt-1">
                        <PaymentMethodIcon method={payment.method} size="w-4 h-4" />
                        <p className="text-sm text-gray-500">{payment.method}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${getStatusColor(payment.status)}`}>
                        {getStatusIcon(payment.status)}
                        <span className="ml-1">{payment.status}</span>
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 flex space-x-2">
                  <button 
                    className="btn-outline text-sm px-3 py-1"
                    onClick={() => handleViewPaymentDetails(payment)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View Details
                  </button>
                  <button className="btn-outline text-sm px-3 py-1">
                    <Download className="w-4 h-4 mr-1" />
                    Download Receipt
                  </button>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Outstanding Bills */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Outstanding Bills</h2>
          <div className="space-y-4">
            {bills.map((bill) => (
              <Card key={bill.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                      <AlertCircle className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {bill.patientName}
                      </h3>
                      <p className="text-gray-600">{bill.description}</p>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-sm text-gray-500">
                          Due: {bill.dueDate}
                        </span>
                        <span className="text-sm text-gray-500">
                          Services: {bill.services.join(', ')}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">
                        ${bill.amount.toFixed(2)}
                      </p>
                      <p className={`text-sm font-medium ${
                        bill.status === 'overdue' ? 'text-red-600' : 'text-yellow-600'
                      }`}>
                        {bill.status === 'overdue' ? 'Overdue' : 'Unpaid'}
                      </p>
                    </div>
                    
                    <button
                      onClick={() => handlePayment(bill)}
                      className="btn-primary"
                    >
                      Pay Now
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Payment Modal */}
        <FormModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedBill(null);
            setPaymentData({
              method: 'stripe',
              amount: 0,
              cardNumber: '',
              expiryDate: '',
              cvv: ''
            });
          }}
          onSubmit={paymentData.method === 'manual' ? processPayment : undefined}
          title="Process Payment"
          size="lg"
        
        >
          {selectedBill && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Bill Details</h3>
                <p className="text-sm text-gray-600">Patient: {selectedBill.patientName}</p>
                <p className="text-sm text-gray-600">Amount: ${selectedBill.amount.toFixed(2)}</p>
                <p className="text-sm text-gray-600">Description: {selectedBill.description}</p>
              </div>

              <div>
                <label className="label">Payment Method *</label>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <button
                    type="button"
                    onClick={() => setPaymentData({...paymentData, method: 'stripe'})}
                    className={`p-3 border rounded-lg flex flex-col items-center space-y-2 transition-colors ${
                      paymentData.method === 'stripe' 
                        ? 'border-primary-500 bg-primary-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <PaymentMethodIcon method="stripe" size="w-8 h-8" />
                    <span className="text-sm font-medium">Stripe Checkout</span>
                    <span className="text-xs text-gray-500">Recommended</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentData({...paymentData, method: 'manual'})}
                    className={`p-3 border rounded-lg flex flex-col items-center space-y-2 transition-colors ${
                      paymentData.method === 'manual' 
                        ? 'border-primary-500 bg-primary-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <PaymentMethodIcon method="card" size="w-8 h-8" />
                    <span className="text-sm font-medium">Manual Entry</span>
                    <span className="text-xs text-gray-500">Legacy</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="label">Amount to Pay *</label>
                <input 
                  type="number" 
                  className="input-field" 
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData({...paymentData, amount: parseFloat(e.target.value) || 0})}
                  step="0.01"
                  required
                />
              </div>

              {/* Stripe Checkout Option */}
              {paymentData.method === 'stripe' && (
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">Secure Payment with Stripe</h3>
                  <p className="text-sm text-blue-700 mb-4">
                    Stripe Checkout provides a secure, hosted payment experience with support for all major cards, 
                    digital wallets, and local payment methods. No need to enter card details manually.
                  </p>
                  <CheckoutButton
                    amount={paymentData.amount}
                    productName={selectedBill?.description || 'Appointment Payment'}
                    billId={selectedBill?.id}
                    userId={user?._id}
                    doctorId={selectedBill?.doctorId}
                    appointmentId={selectedBill?.appointmentId}
                    customerEmail={user?.email}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                    disabled={!paymentData.amount || paymentData.amount <= 0}
                  >
                    Pay ${paymentData.amount?.toFixed(2)} Securely
                  </CheckoutButton>
                  <div className="mt-3 text-xs text-blue-600">
                    <p className="font-medium">Test Cards:</p>
                    <p>Visa: 4242 4242 4242 4242</p>
                    <p>Mastercard: 5555 5555 5555 4444</p>
                  </div>
                </div>
              )}

              {/* Manual Card Entry (Legacy) */}
              {paymentData.method === 'manual' && (
                <div className="space-y-4">
                  <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                    <p className="text-sm text-yellow-700">
                      ⚠️ Manual card entry is less secure. We recommend using Stripe Checkout above.
                    </p>
                  </div>
                  
                  <div>
                    <label className="label">Card Number *</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        className={`input-field pr-12 ${
                          paymentData.cardNumber && !validateCardNumber(paymentData.cardNumber) 
                            ? 'border-red-500 focus:border-red-500' 
                            : paymentData.cardNumber && validateCardNumber(paymentData.cardNumber)
                            ? 'border-green-500 focus:border-green-500'
                            : ''
                        }`}
                        placeholder="1234 5678 9012 3456"
                        value={paymentData.cardNumber}
                        onChange={handleCardNumberChange}
                        maxLength={19} // 16 digits + 3 spaces
                        required
                      />
                      {paymentData.cardNumber && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <PaymentMethodIcon 
                            method={detectCardType(paymentData.cardNumber)} 
                            size="w-6 h-6" 
                          />
                        </div>
                      )}
                      {paymentData.cardNumber && (
                        <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
                          {validateCardNumber(paymentData.cardNumber) ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-500" />
                          )}
                        </div>
                      )}
                    </div>
                    {paymentData.cardNumber && !validateCardNumber(paymentData.cardNumber) && (
                      <p className="text-red-500 text-sm mt-1">
                        Please enter a valid card number
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">Expiry Date *</label>
                      <div className="relative">
                        <input 
                          type="text" 
                          className={`input-field ${
                            paymentData.expiryDate && !validateExpiryDate(paymentData.expiryDate) 
                              ? 'border-red-500 focus:border-red-500' 
                              : paymentData.expiryDate && validateExpiryDate(paymentData.expiryDate)
                              ? 'border-green-500 focus:border-green-500'
                              : ''
                          }`}
                          placeholder="MM/YY"
                          value={paymentData.expiryDate}
                          onChange={handleExpiryDateChange}
                          maxLength={5}
                          required
                        />
                        {paymentData.expiryDate && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            {validateExpiryDate(paymentData.expiryDate) ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-500" />
                            )}
                          </div>
                        )}
                      </div>
                      {paymentData.expiryDate && !validateExpiryDate(paymentData.expiryDate) && (
                        <p className="text-red-500 text-sm mt-1">
                          Please enter a valid expiry date
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="label">CVV *</label>
                      <div className="relative">
                        <input 
                          type="text" 
                          className={`input-field ${
                            paymentData.cvv && !validateCVV(paymentData.cvv) 
                              ? 'border-red-500 focus:border-red-500' 
                              : paymentData.cvv && validateCVV(paymentData.cvv)
                              ? 'border-green-500 focus:border-green-500'
                              : ''
                          }`}
                          placeholder="123"
                          value={paymentData.cvv}
                          onChange={handleCVVChange}
                          maxLength={4}
                          required
                        />
                        {paymentData.cvv && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            {validateCVV(paymentData.cvv) ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-500" />
                            )}
                          </div>
                        )}
                      </div>
                      {paymentData.cvv && !validateCVV(paymentData.cvv) && (
                        <p className="text-red-500 text-sm mt-1">
                          Please enter a valid CVV (3-4 digits)
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Manual Payment Submit Button */}
              {paymentData.method === 'manual' && (
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPaymentModal(false);
                      setSelectedBill(null);
                      setPaymentData({
                        method: 'stripe',
                        amount: 0,
                        cardNumber: '',
                        expiryDate: '',
                        cvv: ''
                      });
                    }}
                    className="btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={processPayment}
                    className="btn-primary"
                  >
                    Process Payment
                  </button>
                </div>
              )}
            </div>
          )}
        </FormModal>

        {/* Payment Details Modal */}
        <Modal
          isOpen={showPaymentDetailsModal}
          onClose={() => {
            setShowPaymentDetailsModal(false);
            setSelectedPayment(null);
          }}
          title="Payment Details"
          size="lg"
        >
          {selectedPayment && (
            <div className="space-y-6">
              {/* Payment Header */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">Payment Information</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${getStatusColor(selectedPayment.status)}`}>
                    {getStatusIcon(selectedPayment.status)}
                    <span className="ml-1">{selectedPayment.status}</span>
                  </span>
                </div>
                <p className="text-sm text-gray-600">Payment ID: {selectedPayment.id}</p>
              </div>

              {/* Payment Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Amount</label>
                    <p className="text-lg font-semibold text-gray-900">${selectedPayment.amount.toFixed(2)}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Payment Method</label>
                    <div className="flex items-center mt-1">
                      <PaymentMethodIcon method={selectedPayment.method} size="w-6 h-6" />
                      <span className="ml-2 text-gray-900 capitalize">{selectedPayment.method}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Transaction ID</label>
                    <p className="text-gray-900 font-mono text-sm">{selectedPayment.transactionId || 'N/A'}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Payment Date</label>
                    <p className="text-gray-900">{new Date(selectedPayment.paidAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</p>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Patient</label>
                    <p className="text-gray-900">{selectedPayment.patientName}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Doctor</label>
                    <p className="text-gray-900">{selectedPayment.doctorName}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Appointment Date</label>
                    <p className="text-gray-900">{selectedPayment.appointmentDate ? new Date(selectedPayment.appointmentDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 'N/A'}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Description</label>
                    <p className="text-gray-900">{selectedPayment.description || 'Appointment Payment'}</p>
                  </div>
                </div>
              </div>

              {/* Payment Details (if available) */}
              {selectedPayment.paymentDetails && (
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-3">Additional Details</h4>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                      {JSON.stringify(selectedPayment.paymentDetails, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowPaymentDetailsModal(false);
                    setSelectedPayment(null);
                  }}
                  className="btn-outline"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    // TODO: Implement download receipt functionality
                    toast.info('Download receipt functionality coming soon!');
                  }}
                  className="btn-primary"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Receipt
                </button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default PaymentsPage;