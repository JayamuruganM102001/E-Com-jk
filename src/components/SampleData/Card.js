import React from 'react';

export const Card = ({ children }) => {
  return (
    // <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 sm:overflow-x-auto">
    //   {children}
    // </div>
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 hover:shadow-2xl sm:overflow-x-auto">
      {children}
    </div>
  );
};

export const CardContent = ({ children }) => {
  return <div>{children}</div>;
};
