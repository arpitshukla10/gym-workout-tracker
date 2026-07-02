import React from 'react';
import { X } from 'lucide-react';

export const Dialog = ({ isOpen, onClose, children, className = '' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 bg-stone-900/30 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      <div className={`relative z-10 w-full max-w-lg rounded-[1.6rem] bg-white border border-border/90 shadow-xl p-6 transition-all duration-300 animate-in fade-in zoom-in-95 ${className}`}>
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-stone-500 hover:text-stone-900"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
        {children}
      </div>
    </div>
  );
};
