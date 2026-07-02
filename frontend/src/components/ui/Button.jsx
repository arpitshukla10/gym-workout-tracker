import React from 'react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  onClick,
  disabled = false,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:pointer-events-none active:scale-[0.99]';
  
  const variants = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/92 shadow-sm',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-stone-200 border border-border/80',
    outline: 'border border-border/90 text-foreground hover:bg-stone-100 hover:text-accent-foreground bg-transparent',
    ghost: 'hover:bg-stone-100 hover:text-accent-foreground text-foreground bg-transparent',
    danger: 'bg-red-600 text-white hover:bg-red-700 shadow-md shadow-red-600/10',
  };

  const sizes = {
    sm: 'text-xs px-3.5 py-2 gap-1.5',
    md: 'text-sm px-5 py-2.5 gap-2',
    lg: 'text-base px-6 py-3 gap-2.5',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
