import React, { InputHTMLAttributes, forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, rightElement, className = '', ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        <label className="block text-sm font-medium text-slate-700">
          {label}
        </label>
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`
              block w-full rounded-lg border 
              ${icon ? 'pl-10' : 'pl-3'} 
              ${rightElement ? 'pr-10' : 'pr-3'} 
              py-2.5 
              text-slate-900 placeholder:text-slate-400
              focus:ring-2 focus:ring-brand-600 focus:border-brand-600 focus:outline-none
              transition duration-200 ease-in-out
              ${error ? 'border-red-500 focus:ring-red-200 focus:border-red-500' : 'border-slate-300'}
              ${className}
            `}
            {...props}
          />
          {rightElement && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              {rightElement}
            </div>
          )}
        </div>
        {error && (
          <div className="flex items-center space-x-1 text-red-600 text-xs mt-1 animate-fadeIn">
            <AlertCircle size={12} />
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;