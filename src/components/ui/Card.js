import React from 'react';
import classNames from 'classnames';

const Card = ({ children, className = '', ...props }) => {
  return (
    <div
      className={classNames(
        'bg-white rounded-lg border border-gray-200 shadow-sm',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

const Header = ({ children, className = '', ...props }) => {
  return (
    <div
      className={classNames(
        'px-4 py-5 border-b border-gray-200 sm:px-6',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

const Body = ({ children, className = '', ...props }) => {
  return (
    <div
      className={classNames('px-4 py-5 sm:p-6', className)}
      {...props}
    >
      {children}
    </div>
  );
};

const Footer = ({ children, className = '', ...props }) => {
  return (
    <div
      className={classNames(
        'px-4 py-4 border-t border-gray-200 sm:px-6',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

Card.Header = Header;
Card.Body = Body;
Card.Footer = Footer;

export default Card; 