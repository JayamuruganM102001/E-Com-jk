import React from 'react';
import { FiUsers, FiBox, FiBarChart } from 'react-icons/fi';

export const Tabs = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row gap-6 w-full max-w-[1700px] mx-auto ">
      {children}
    </div>
  );
};

export const TabsList = ({ children, className }) => {
  return (
    <div className={`flex flex-row lg:flex-col gap-2 w-full lg:max-w-[250px] overflow-x-auto lg:overflow-visible whitespace-nowrap 
                  p-2 scrollbar-hide ${className}`}>
      {children}
    </div>
  );
};

export const TabsTrigger = ({ value, children, onClick }) => {
   const iconMap = {
    users: <FiUsers className="text-lg mr-2" />,
    inventory: <FiBox className="text-lg mr-2" />,
    sales: <FiBarChart className="text-lg mr-2" />,
  };
  return (
    <button
      className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm lg:text-xl font-normal rounded tracking-normal transition duration-200 flex items-center gap-3"
      onClick={() => {
        // const event = new CustomEvent('tabChange', { detail: value });
        // window.dispatchEvent(event);
        onClick();
      }}
    >
      <span className="flex-shrink-0">{iconMap[value]}</span>
      <span className="text-left">{children}</span>
    </button>
  );
};
