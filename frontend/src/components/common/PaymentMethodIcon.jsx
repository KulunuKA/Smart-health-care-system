import React from 'react';

/**
 * Payment Method Icon Component
 * Displays SVG icons for different payment methods
 */
const PaymentMethodIcon = ({ method, size = 'w-8 h-8', className = '' }) => {
  const iconProps = {
    className: `${size} ${className}`,
    viewBox: '0 0 24 24',
    fill: 'currentColor'
  };

  const getIcon = () => {
    switch (method.toLowerCase()) {
      case 'visa':
        return (
          <svg {...iconProps}>
            <rect width="24" height="24" rx="3" fill="#1A1F71"/>
            <path d="M9.5 8.5h-1.2l-1.4 7h1.2l.3-1.5h1.4l.3 1.5h1.2l-1.4-7zm-1.1 4.5l.5-2.5.1.5.3 2h-.9zm4.1-4.5h-1.2l-1.4 7h1.2l.3-1.5h1.4l.3 1.5h1.2l-1.4-7zm-1.1 4.5l.5-2.5.1.5.3 2h-.9zm6.1-4.5h-1.2l-1.4 7h1.2l.3-1.5h1.4l.3 1.5h1.2l-1.4-7zm-1.1 4.5l.5-2.5.1.5.3 2h-.9z" fill="white"/>
          </svg>
        );
      
      case 'mastercard':
        return (
          <svg {...iconProps}>
            <rect width="24" height="24" rx="3" fill="#EB001B"/>
            <circle cx="9" cy="12" r="6" fill="#F79E1B"/>
            <circle cx="15" cy="12" r="6" fill="#FF5F00"/>
            <path d="M12 6c-3.3 0-6 2.7-6 6s2.7 6 6 6 6-2.7 6-6-2.7-6-6-6z" fill="#FF5F00"/>
          </svg>
        );
      
      case 'amex':
      case 'american express':
        return (
          <svg {...iconProps}>
            <rect width="24" height="24" rx="3" fill="#006FCF"/>
            <path d="M6 8h12v8H6V8zm1 1v6h10V9H7zm1.5 1h7v4h-7v-4z" fill="white"/>
            <text x="12" y="13" textAnchor="middle" fontSize="6" fill="#006FCF" fontWeight="bold">AMEX</text>
          </svg>
        );
      
      case 'discover':
        return (
          <svg {...iconProps}>
            <rect width="24" height="24" rx="3" fill="#FF6000"/>
            <circle cx="12" cy="12" r="8" fill="white"/>
            <path d="M8 8h8v8H8V8zm1 1v6h6V9H9zm2 2h2v2H11v-2z" fill="#FF6000"/>
          </svg>
        );
      
      case 'paypal':
        return (
          <svg {...iconProps}>
            <rect width="24" height="24" rx="3" fill="#0070BA"/>
            <path d="M7.5 6c-1.4 0-2.5 1.1-2.5 2.5v6c0 1.4 1.1 2.5 2.5 2.5h1.5v2.5l2.5-2.5h3c1.4 0 2.5-1.1 2.5-2.5V8.5c0-1.4-1.1-2.5-2.5-2.5H7.5z" fill="white"/>
          </svg>
        );
      
      case 'apple pay':
        return (
          <svg {...iconProps}>
            <rect width="24" height="24" rx="3" fill="#000000"/>
            <path d="M12 4c-4.4 0-8 3.6-8 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm0 14c-3.3 0-6-2.7-6-6s2.7-6 6-6 6 2.7 6 6-2.7 6-6 6z" fill="white"/>
            <path d="M12 6c-3.3 0-6 2.7-6 6s2.7 6 6 6 6-2.7 6-6-2.7-6-6-6zm0 10c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4z" fill="#000000"/>
          </svg>
        );
      
      case 'google pay':
        return (
          <svg {...iconProps}>
            <rect width="24" height="24" rx="3" fill="#4285F4"/>
            <path d="M12 4c-4.4 0-8 3.6-8 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm0 14c-3.3 0-6-2.7-6-6s2.7-6 6-6 6 2.7 6 6-2.7 6-6 6z" fill="white"/>
            <path d="M12 6c-3.3 0-6 2.7-6 6s2.7 6 6 6 6-2.7 6-6-2.7-6-6-6zm0 10c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4z" fill="#4285F4"/>
          </svg>
        );
      
      case 'bank':
      case 'bank transfer':
        return (
          <svg {...iconProps}>
            <rect width="24" height="24" rx="3" fill="#1E40AF"/>
            <path d="M4 8h16v2H4V8zm0 4h16v2H4v-2zm0 4h16v2H4v-2z" fill="white"/>
            <circle cx="6" cy="9" r="1" fill="white"/>
            <circle cx="18" cy="9" r="1" fill="white"/>
          </svg>
        );
      
      case 'wallet':
      case 'digital wallet':
        return (
          <svg {...iconProps}>
            <rect width="24" height="24" rx="3" fill="#10B981"/>
            <path d="M6 6h12c1.1 0 2 .9 2 2v8c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V8c0-1.1.9-2 2-2zm0 2v8h12V8H6zm2 2h8v4H8v-4z" fill="white"/>
            <circle cx="10" cy="12" r="1" fill="#10B981"/>
          </svg>
        );
      
      case 'stripe':
        return (
          <svg {...iconProps}>
            <rect width="24" height="24" rx="3" fill="#635BFF"/>
            <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.274 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.958 3.445 1.597 3.445 2.655 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z" fill="white"/>
          </svg>
        );
      
      case 'card':
      case 'credit card':
      case 'debit card':
      default:
        return (
          <svg {...iconProps}>
            <rect width="24" height="24" rx="3" fill="#6B7280"/>
            <rect x="4" y="8" width="16" height="10" rx="2" fill="white"/>
            <rect x="4" y="8" width="16" height="3" fill="#E5E7EB"/>
            <circle cx="8" cy="14" r="1" fill="#6B7280"/>
            <rect x="12" y="13" width="4" height="2" rx="1" fill="#6B7280"/>
          </svg>
        );
    }
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      {getIcon()}
    </div>
  );
};

export default PaymentMethodIcon;
