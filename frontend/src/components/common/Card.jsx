import React from 'react';
import { clsx } from 'clsx';

/**
 * Card Component
 * Reusable card component with customizable styling
 */
const Card = ({ 
  children, 
  className = '', 
  padding = 'p-6',
  shadow = 'shadow-md',
  hover = true,
  gradient = false,
  ...props 
}) => {
  const cardClasses = clsx(
    'bg-white rounded-lg transition-all duration-200',
    padding,
    shadow,
    hover && 'hover:shadow-lg transform hover:-translate-y-1',
    gradient && 'bg-gradient-to-br from-white to-gray-50',
    className
  );

  return (
    <div className={cardClasses} {...props}>
      {children}
    </div>
  );
};

/**
 * Card Header Component
 */
export const CardHeader = ({ children, className = '', ...props }) => {
  const headerClasses = clsx(
    'border-b border-gray-200 pb-4 mb-4',
    className
  );

  return (
    <div className={headerClasses} {...props}>
      {children}
    </div>
  );
};

/**
 * Card Title Component
 */
export const CardTitle = ({ children, className = '', size = 'lg', ...props }) => {
  const titleClasses = clsx(
    'font-semibold text-gray-900',
    {
      'text-lg': size === 'lg',
      'text-xl': size === 'xl',
      'text-2xl': size === '2xl',
    },
    className
  );

  return (
    <h3 className={titleClasses} {...props}>
      {children}
    </h3>
  );
};

/**
 * Card Description Component
 */
export const CardDescription = ({ children, className = '', ...props }) => {
  const descriptionClasses = clsx(
    'text-gray-600 text-sm',
    className
  );

  return (
    <p className={descriptionClasses} {...props}>
      {children}
    </p>
  );
};

/**
 * Card Content Component
 */
export const CardContent = ({ children, className = '', ...props }) => {
  const contentClasses = clsx(
    'text-gray-700',
    className
  );

  return (
    <div className={contentClasses} {...props}>
      {children}
    </div>
  );
};

/**
 * Card Footer Component
 */
export const CardFooter = ({ children, className = '', ...props }) => {
  const footerClasses = clsx(
    'border-t border-gray-200 pt-4 mt-4',
    className
  );

  return (
    <div className={footerClasses} {...props}>
      {children}
    </div>
  );
};

/**
 * Stat Card Component
 */
export const StatCard = ({ 
  title, 
  value, 
  change, 
  changeType = 'positive',
  icon: Icon,
  className = '',
  ...props 
}) => {
  const changeClasses = clsx(
    'text-sm font-medium',
    {
      'text-green-600': changeType === 'positive',
      'text-red-600': changeType === 'negative',
      'text-gray-600': changeType === 'neutral',
    }
  );

  return (
    <Card className={clsx('relative overflow-hidden', className)} {...props}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className={changeClasses}>
              {changeType === 'positive' && '+'}
              {change}
            </p>
          )}
        </div>
        {Icon && (
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <Icon className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

/**
 * Feature Card Component
 */
export const FeatureCard = ({ 
  title, 
  description, 
  icon: Icon,
  className = '',
  ...props 
}) => {
  return (
    <Card className={clsx('text-center', className)} {...props}>
      {Icon && (
        <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon className="w-8 h-8 text-white" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </Card>
  );
};

export default Card;