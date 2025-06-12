import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import classNames from 'classnames';

const Modal = ({
  children,
  isOpen,
  onClose,
  size = 'medium',
  className = '',
  ...props
}) => {
  const sizes = {
    small: 'sm:max-w-sm',
    medium: 'sm:max-w-md',
    large: 'sm:max-w-lg',
    xlarge: 'sm:max-w-xl',
    full: 'sm:max-w-full sm:m-4',
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={onClose}
        {...props}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel
                className={classNames(
                  'relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all w-full',
                  sizes[size],
                  className
                )}
              >
                {children}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

const Header = ({ children, className = '', onClose, showCloseButton = true, ...props }) => {
  return (
    <div
      className={classNames(
        'bg-white px-4 py-4 border-b border-gray-200 sm:px-6',
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between">
        <Dialog.Title className="text-lg font-medium text-gray-900">
          {children}
        </Dialog.Title>
        {showCloseButton && onClose && (
          <button
            type="button"
            className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={onClose}
          >
            <span className="sr-only">Close</span>
            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
          </button>
        )}
      </div>
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
        'bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

Modal.Header = Header;
Modal.Body = Body;
Modal.Footer = Footer;

export default Modal; 