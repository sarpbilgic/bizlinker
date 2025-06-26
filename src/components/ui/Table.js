import React from 'react';
import classNames from 'classnames';

const Table = ({ children, className = '', ...props }) => {
  return (
    <div className="overflow-x-auto">
      <table
        className={classNames(
          'min-w-full divide-y divide-gray-300',
          className
        )}
        {...props}
      >
        {children}
      </table>
    </div>
  );
};

const Head = ({ children, className = '', ...props }) => {
  return (
    <thead
      className={classNames('bg-gray-50', className)}
      {...props}
    >
      {children}
    </thead>
  );
};

const Body = ({ children, className = '', ...props }) => {
  return (
    <tbody
      className={classNames(
        'divide-y divide-gray-200 bg-white',
        className
      )}
      {...props}
    >
      {children}
    </tbody>
  );
};

const Row = ({ children, className = '', isHeader = false, ...props }) => {
  return (
    <tr
      className={classNames(
        !isHeader && 'hover:bg-gray-50',
        className
      )}
      {...props}
    >
      {children}
    </tr>
  );
};

const Cell = ({
  children,
  className = '',
  isHeader = false,
  align = 'left',
  ...props
}) => {
  const Component = isHeader ? 'th' : 'td';
  
  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  return (
    <Component
      className={classNames(
        'whitespace-nowrap px-3 py-4 text-sm',
        isHeader
          ? 'font-semibold text-gray-900'
          : 'text-gray-500',
        alignmentClasses[align],
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
};

const Empty = ({ children, colSpan, className = '', ...props }) => {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className={classNames(
          'px-3 py-8 text-center text-sm text-gray-500',
          className
        )}
        {...props}
      >
        {children}
      </td>
    </tr>
  );
};

Table.Head = Head;
Table.Body = Body;
Table.Row = Row;
Table.Cell = Cell;
Table.Empty = Empty;

export default Table; 