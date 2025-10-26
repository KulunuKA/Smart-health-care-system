import React, { useState, useEffect } from 'react';
import { CreditCard, Loader } from 'lucide-react';
import { toast } from 'react-toastify';

/**
 * Stripe Checkout Button Component
 * Handles Stripe Checkout session creation and opens embedded checkout
 */
const CheckoutButton = ({ 
  amount, 
  productName, 
  billId, 
  userId, 
  doctorId, 
  appointmentId,
  customerEmail,
  className = "btn-primary",
  disabled = false,
  children = "Pay with Stripe",
  onSuccess = () => {},
  onCancel = () => {}
}) => {
  const [loading, setLoading] = useState(false);
  const [stripeLoaded, setStripeLoaded] = useState(false);

  // Load Stripe.js
  useEffect(() => {
    const loadStripe = async () => {
      if (window.Stripe) {
        setStripeLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/';
      script.async = true;
      script.onload = () => setStripeLoaded(true);
      document.head.appendChild(script);
    };

    loadStripe();
  }, []);

  /**
   * Handle Stripe Checkout button click
   * Creates a checkout session and opens Stripe's embedded checkout
   */
  const handleCheckout = async () => {
    try {
      setLoading(true);

      // Validate required fields
      if (!amount || !productName) {
        toast.error('Amount and product name are required');
        return;
      }

      if (!stripeLoaded) {
        toast.error('Stripe is still loading, please try again');
        return;
      }

      // Prepare request payload
      const payload = {
        amount: parseFloat(amount),
        productName,
        billId: billId || undefined,
        userId: userId || undefined,
        doctorId: doctorId || undefined,
        appointmentId: appointmentId || undefined,
        customerEmail: customerEmail || undefined,
      };

      console.log('Creating Stripe Checkout session with payload:', payload);

      // Send request to backend to create checkout session
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api'}/payments/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Add auth token if needed
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create checkout session');
      }

      if (!data.data?.url) {
        throw new Error('No checkout URL received from server');
      }

      console.log('Checkout session created, opening Stripe checkout');

      // Initialize Stripe
      const stripe = window.Stripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_publishable_key_here');
      
      if (!stripe) {
        throw new Error('Stripe failed to initialize');
      }

      // Extract session ID from URL
      const sessionId = data.data.url.split('/').pop().split('#')[0];
      
      // Redirect to Stripe Checkout (this will open in the same window)
      const { error } = await stripe.redirectToCheckout({
        sessionId: sessionId
      });

      if (error) {
        console.error('Stripe checkout error:', error);
        toast.error(error.message || 'Failed to open payment form');
      }

    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast.error(error.message || 'Failed to process payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={disabled || loading || !stripeLoaded}
      className={`${className} ${loading || !stripeLoaded ? 'opacity-50 cursor-not-allowed' : ''} flex items-center justify-center space-x-2`}
    >
      {loading ? (
        <>
          <Loader className="w-4 h-4 animate-spin" />
          <span>Processing...</span>
        </>
      ) : !stripeLoaded ? (
        <>
          <Loader className="w-4 h-4 animate-spin" />
          <span>Loading...</span>
        </>
      ) : (
        <>
          <CreditCard className="w-4 h-4" />
          <span>{children}</span>
        </>
      )}
    </button>
  );
};

export default CheckoutButton;
