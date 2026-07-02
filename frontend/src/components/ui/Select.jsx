import React from 'react';

export const Select = ({
  options = [],
  value,
  onChange,
  className = '',
  disabled = false,
  placeholder,
  ...props
}) => {
  return (
    <select
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`flex h-11 w-full rounded-2xl border border-border/90 bg-white px-4 py-2 text-sm text-stone-900 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all ${className}`}
      {...props}
    >
      {placeholder && <option value="" disabled className="bg-white text-stone-500">{placeholder}</option>}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value} className="bg-white text-stone-900">
          {opt.label}
        </option>
      ))}
    </select>
  );
};
