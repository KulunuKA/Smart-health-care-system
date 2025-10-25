import React from 'react';
import { clsx } from 'clsx';

/**
 * Loader Component
 * Reusable loading spinner component
 */
const Loader = ({ 
  size = 'md',
  color = 'primary',
  className = '',
  text = '',
  fullScreen = false,
  ...props 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const colorClasses = {
    primary: 'text-primary-600',
    secondary: 'text-secondary-600',
    white: 'text-white',
    gray: 'text-gray-600'
  };

  const spinnerClasses = clsx(
    'animate-spin rounded-full border-2 border-gray-200',
    sizeClasses[size],
    colorClasses[color],
    'border-t-transparent',
    className
  );

  const content = (
    <div className="flex flex-col items-center justify-center space-y-2" {...props}>
      <div className={spinnerClasses} />
      {text && (
        <p className="text-sm text-gray-600 animate-pulse">{text}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return content;
};

/**
 * Skeleton Loader Component
 */
export const SkeletonLoader = ({ 
  lines = 3,
  className = '',
  ...props 
}) => {
  return (
    <div className={clsx('animate-pulse', className)} {...props}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={clsx(
            'bg-gray-200 rounded',
            index === lines - 1 ? 'w-3/4' : 'w-full',
            'h-4 mb-2'
          )}
        />
      ))}
    </div>
  );
};

/**
 * Table Skeleton Loader
 */
export const TableSkeletonLoader = ({ 
  rows = 5,
  columns = 4,
  className = '',
  ...props 
}) => {
  return (
    <div className={clsx('animate-pulse', className)} {...props}>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex space-x-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div
                key={colIndex}
                className={clsx(
                  'bg-gray-200 rounded h-4',
                  colIndex === 0 ? 'w-1/4' : 'w-1/6'
                )}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Card Skeleton Loader
 */
export const CardSkeletonLoader = ({ 
  className = '',
  ...props 
}) => {
  return (
    <div className={clsx('animate-pulse', className)} {...props}>
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded w-full"></div>
          <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          <div className="h-3 bg-gray-200 rounded w-4/6"></div>
        </div>
      </div>
    </div>
  );
};

/**
 * Button Skeleton Loader
 */
export const ButtonSkeletonLoader = ({ 
  className = '',
  ...props 
}) => {
  return (
    <div className={clsx('animate-pulse', className)} {...props}>
      <div className="h-10 bg-gray-200 rounded-lg w-24"></div>
    </div>
  );
};

/**
 * Inline Loader Component
 */
export const InlineLoader = ({ 
  text = 'Loading...',
  className = '',
  ...props 
}) => {
  return (
    <div className={clsx('flex items-center space-x-2 text-sm text-gray-600', className)} {...props}>
      <div className="w-4 h-4 border-2 border-gray-200 border-t-primary-600 rounded-full animate-spin"></div>
      <span>{text}</span>
    </div>
  );
};

/**
 * Progress Loader Component
 */
export const ProgressLoader = ({ 
  progress = 0,
  text = '',
  className = '',
  ...props 
}) => {
  return (
    <div className={clsx('w-full', className)} {...props}>
      {text && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">{text}</span>
          <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        ></div>
      </div>
    </div>
  );
};

export default Loader;