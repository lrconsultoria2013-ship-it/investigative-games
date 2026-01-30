import React, { TextareaHTMLAttributes, forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        <label className="block text-sm font-medium text-slate-700">
          {label}
        </label>
        <div className="relative">
          <textarea
            ref={ref}
            className={`
              block w-full rounded-lg border 
              p-3
              text-slate-900 placeholder:text-slate-400
              focus:ring-2 focus:ring-brand-600 focus:border-brand-600 focus:outline-none
              transition duration-200 ease-in-out
              ${error ? 'border-red-500 focus:ring-red-200 focus:border-red-500' : 'border-slate-300'}
              ${className}
            `}
            {...props}
          />
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

TextArea.displayName = 'TextArea';

export default TextArea;