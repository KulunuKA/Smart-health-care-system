import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import Card from '../components/common/Card';

/**
 * Payment Success Page
 * Displays confirmation after successful Stripe payment
 */
const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const sessionId = searchParams.get('session_id');
  const billId = searchParams.get('bill_id');

  useEffect(() => {
    const handlePaymentSuccess = async () => {
      try {
        if (!sessionId) {
          setError('No session ID provided');
          setLoading(false);
          return;
        }

        // Call backend to verify and process the payment
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api'}/payments/checkout-success?session_id=${sessionId}&bill_id=${billId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to verify payment');
        }

        setPaymentData(data.data);
        console.log('Payment verified successfully:', data.data);

      } catch (error) {
        console.error('Error verifying payment:', error);
        setError(error.message || 'Failed to verify payment');
      } finally {
        setLoading(false);
      }
    };

    handlePaymentSuccess();
  }, [sessionId, billId]);

  const handleContinue = () => {
    navigate('/payments');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="p-8 text-center max-w-md">
          <Loader className="w-12 h-12 text-primary-600 mx-auto mb-4 animate-spin" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Verifying Payment...</h2>
          <p className="text-gray-600">Please wait while we confirm your payment.</p>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="p-8 text-center max-w-md">
          <XCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Payment Verification Failed</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={handleContinue}
            className="btn-primary"
          >
            Return to Payments
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="p-8 text-center max-w-md">
        <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Payment Successful!</h2>
        <p className="text-gray-600 mb-6">
          Your payment has been processed successfully.
        </p>

        {paymentData && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
            <h3 className="font-semibold text-gray-900 mb-2">Payment Details</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p><span className="font-medium">Amount:</span> ${paymentData.amount?.toFixed(2)}</p>
              <p><span className="font-medium">Status:</span> {paymentData.status}</p>
              <p><span className="font-medium">Transaction ID:</span> {paymentData.paymentIntent}</p>
              {paymentData.bill && (
                <>
                  <p><span className="font-medium">Bill ID:</span> {paymentData.bill._id}</p>
                  <p><span className="font-medium">Patient:</span> {paymentData.bill.userId?.firstName} {paymentData.bill.userId?.lastName}</p>
                </>
              )}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleContinue}
            className="btn-primary w-full"
          >
            Return to Payments
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-outline w-full"
          >
            Go to Dashboard
          </button>
        </div>
      </Card>
    </div>
  );
};

export default PaymentSuccessPage;
