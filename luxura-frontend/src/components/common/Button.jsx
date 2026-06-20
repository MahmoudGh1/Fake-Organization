import React from 'react';
import { RefreshCw } from 'lucide-react';

export const Button = ({ 
  children, 
  variant = 'primary', 
  isLoading = false, 
  disabled = false, 
  type = 'button',
  onClick,
  className = '',
  ...props 
}) => {
  const baseStyles = 'h-11 px-6 text-xs font-bold uppercase tracking-widest flex items-center justify-center space-x-2 transition-all duration-300 rounded-sm border focus:outline-none';
  
  const variants = {
    primary: 'bg-luxury-dark text-luxury-bg border-luxury-dark hover:bg-transparent hover:text-luxury-dark disabled:opacity-50',
    outline: 'bg-transparent text-luxury-dark border-luxury-dark hover:bg-luxury-dark hover:text-luxury-bg disabled:opacity-40',
    gold: 'bg-luxury-gold text-white border-luxury-gold hover:bg-luxury-dark hover:border-luxury-dark disabled:opacity-50',
    danger: 'bg-red-50 text-red-600 border-transparent hover:border-red-200 hover:bg-red-100 disabled:opacity-50'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <RefreshCw size={12} className="animate-spin" />
          <span>Processing...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};