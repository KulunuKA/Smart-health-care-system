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
import { paymentService } from '../services/paymentService';

/**
 * Payments Page Component
 * Manage payments, billing, and financial transactions
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
  const [paymentData, setPaymentData] = useState({
    method: 'card',
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
          method: 'Credit Card',
          status: 'completed',
          transactionId: 'TXN123456789',
          description: 'Appointment fee'
        },
        {
          id: 2,
          patientName: 'Jane Smith',
          amount: 75.00,
          date: '2024-12-09',
          method: 'Bank Transfer',
          status: 'completed',
          transactionId: 'TXN987654321',
          description: 'Lab test fee'
        },
        {
          id: 3,
          patientName: 'Bob Wilson',
          amount: 200.00,
          date: '2024-12-08',
          method: 'Digital Wallet',
          status: 'pending',
          transactionId: 'TXN456789123',
          description: 'Consultation fee'
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
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'failed': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const handlePayment = (bill) => {
    setSelectedBill(bill);
    setPaymentData({
      method: 'card',
      amount: bill.amount,
      cardNumber: '',
      expiryDate: '',
      cvv: ''
    });
    setShowPaymentModal(true);
  };

  const processPayment = async () => {
    try {
      // Validate required fields
      if (!paymentData.method || !paymentData.amount || !paymentData.cardNumber || !paymentData.expiryDate || !paymentData.cvv) {
        alert('Please fill in all required fields');
        return;
      }

      const paymentPayload = {
        billId: selectedBill.id,
        paymentMethod: paymentData.method,
        amount: paymentData.amount,
        paymentDetails: {
          cardNumber: paymentData.cardNumber,
          expiryDate: paymentData.expiryDate,
          cvv: paymentData.cvv
        }
      };

      const result = await paymentService.processPayment(paymentPayload);
      console.log('Payment processed successfully:', result);
      
      setShowPaymentModal(false);
      setSelectedBill(null);
      setPaymentData({
        method: 'card',
        amount: 0,
        cardNumber: '',
        expiryDate: '',
        cvv: ''
      });
      
      // Refresh data
      fetchPayments();
      fetchBills();
      
      alert('Payment processed successfully!');
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Payment failed. Please try again.');
    }
  };

  const totalRevenue = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingPayments = payments.filter(p => p.status === 'pending').length;
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
            title="Pending Payments"
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
            title="Success Rate"
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
                      <CreditCard className="w-6 h-6 text-primary-600" />
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
                      <p className="text-sm text-gray-500">{payment.method}</p>
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
                  <button className="btn-outline text-sm px-3 py-1">
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
              method: 'card',
              amount: 0,
              cardNumber: '',
              expiryDate: '',
              cvv: ''
            });
          }}
          onSubmit={processPayment}
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
                <select 
                  className="input-field"
                  value={paymentData.method}
                  onChange={(e) => setPaymentData({...paymentData, method: e.target.value})}
                  required
                >
                  <option value="card">Credit Card</option>
                  <option value="bank">Bank Transfer</option>
                  <option value="wallet">Digital Wallet</option>
                </select>
              </div>

              <div>
                <label className="label">Card Number *</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="1234 5678 9012 3456"
                  value={paymentData.cardNumber}
                  onChange={(e) => setPaymentData({...paymentData, cardNumber: e.target.value})}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Expiry Date *</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="MM/YY"
                    value={paymentData.expiryDate}
                    onChange={(e) => setPaymentData({...paymentData, expiryDate: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="label">CVV *</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="123"
                    value={paymentData.cvv}
                    onChange={(e) => setPaymentData({...paymentData, cvv: e.target.value})}
                    required
                  />
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
            </div>
          )}
        </FormModal>
      </div>
    </div>
  );
};

export default PaymentsPage;