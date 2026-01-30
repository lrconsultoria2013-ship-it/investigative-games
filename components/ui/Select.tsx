import React, { SelectHTMLAttributes, forwardRef } from 'react';
import { AlertCircle, ChevronDown } from 'lucide-react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  options: { value: string; label: string }[];
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = '', ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        <label className="block text-sm font-medium text-slate-700">
          {label}
        </label>
        <div className="relative">
          <select
            ref={ref}
            className={`
              block w-full rounded-lg border appearance-none
              pl-3 pr-10 py-2.5 
              text-slate-900 bg-white
              focus:ring-2 focus:ring-brand-600 focus:border-brand-600 focus:outline-none
              transition duration-200 ease-in-out
              ${error ? 'border-red-500 focus:ring-red-200 focus:border-red-500' : 'border-slate-300'}
              ${className}
            `}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
            <ChevronDown size={18} />
          </div>
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

Select.displayName = 'Select';

export default Select;