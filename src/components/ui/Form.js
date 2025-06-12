import React from 'react';
import classNames from 'classnames';

const Form = ({ children, onSubmit, className = '', ...props }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.(e);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={classNames('space-y-6', className)}
      {...props}
    >
      {children}
    </form>
  );
};

const Group = ({ children, className = '', ...props }) => {
  return (
    <div className={classNames('space-y-1', className)} {...props}>
      {children}
    </div>
  );
};

const Label = ({ children, htmlFor, required, className = '', ...props }) => {
  return (
    <label
      htmlFor={htmlFor}
      className={classNames(
        'block text-sm font-medium text-gray-700',
        className
      )}
      {...props}
    >
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
};

const ErrorMessage = ({ children, className = '', ...props }) => {
  if (!children) return null;
  
  return (
    <p
      className={classNames(
        'mt-1 text-sm text-red-600',
        className
      )}
      {...props}
    >
      {children}
    </p>
  );
};

const Description = ({ children, className = '', ...props }) => {
  return (
    <p
      className={classNames(
        'mt-1 text-sm text-gray-500',
        className
      )}
      {...props}
    >
      {children}
    </p>
  );
};

Form.Group = Group;
Form.Label = Label;
Form.ErrorMessage = ErrorMessage;
Form.Description = Description;

export default Form; 