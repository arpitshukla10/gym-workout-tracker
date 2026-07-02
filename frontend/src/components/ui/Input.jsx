import React from 'react';

export const Input = React.forwardRef(({
  type = 'text',
  className = '',
  placeholder,
  value,
  onChange,
  disabled = false,
  ...props
}, ref) => {
  return (
    <input
      ref={ref}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`flex h-11 w-full rounded-2xl border border-border/90 bg-white px-4 py-2 text-sm text-stone-900 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-stone-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all ${className}`}
      {...props}
    />
  );
});

Input.displayName = 'Input';
