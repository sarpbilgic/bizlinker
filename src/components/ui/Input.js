import React, { forwardRef } from 'react';
import classNames from 'classnames';

const Input = forwardRef(({
  type = 'text',
  label,
  error,
  icon: Icon,
  className = '',
  fullWidth = false,
  disabled = false,
  ...props
}, ref) => {
  const inputClasses = classNames(
    'block rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm',
    error && 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500',
    disabled && 'bg-gray-100 cursor-not-allowed',
    fullWidth && 'w-full',
    className
  );

  const containerClasses = classNames(
    'relative',
    fullWidth && 'w-full'
  );

  return (
    <div className={containerClasses}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative rounded-md shadow-sm">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
        )}
        <input
          ref={ref}
          type={type}
          className={inputClasses}
          disabled={disabled}
          style={Icon ? { paddingLeft: '2.5rem' } : undefined}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input; 