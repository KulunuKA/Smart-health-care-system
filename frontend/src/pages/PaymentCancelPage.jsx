import React from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle } from 'lucide-react';
import Card from '../components/common/Card';

/**
 * Payment Cancel Page
 * Displays when user cancels Stripe payment
 */
const PaymentCancelPage = () => {
  const navigate = useNavigate();

  const handleRetry = () => {
    navigate('/payments');
  };

  const handleDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="p-8 text-center max-w-md">
        <XCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Payment Cancelled</h2>
        <p className="text-gray-600 mb-6">
          Your payment was cancelled. No charges have been made to your account.
        </p>

        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6">
          <h3 className="font-semibold text-yellow-800 mb-2">What happened?</h3>
          <p className="text-sm text-yellow-700">
            You cancelled the payment process or there was an issue with the payment. 
            Your appointment remains scheduled but unpaid.
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleRetry}
            className="btn-primary w-full"
          >
            Try Payment Again
          </button>
          <button
            onClick={handleDashboard}
            className="btn-outline w-full"
          >
            Go to Dashboard
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-2">Need Help?</h3>
          <p className="text-sm text-gray-600 mb-3">
            If you're experiencing issues with payments, please contact our support team.
          </p>
          <button
            onClick={() => navigate('/contact')}
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            Contact Support
          </button>
        </div>
      </Card>
    </div>
  );
};

export default PaymentCancelPage;
