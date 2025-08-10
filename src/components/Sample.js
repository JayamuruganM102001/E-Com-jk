import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiLogOut, FiHome, FiUsers, FiBox, FiClipboard, FiMenu, FiX } from "react-icons/fi";
import { Card, CardContent } from "../components/SampleData/Card";
import StockInventory from "./StockInventory";
import ManageUser from "./ManageUser";
import SalesOverview from "./SalesOverview";
import OrdersList from "./OrdersList";
import { toast } from "react-toastify";
import { setupAuthMonitor } from "./authMonitor";

const Sample = () => {
  const [tab, setTab] = useState("sales");
  const [loggedInUsername, setLoggedInUsername] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const username = localStorage.getItem("username");
    const role = localStorage.getItem("role");

    if (role !== "ADMIN") {
      navigate("/login");
      return;
    }

    if (username) {
      setLoggedInUsername(username);
    }

    const cleanupAuthMonitor = setupAuthMonitor();
    return cleanupAuthMonitor;
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
    toast.success("Logged out successfully");
  };

  // Close mobile menu when a tab is selected
  const handleTabChange = (tabName) => {
    setTab(tabName);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
      {/* Header with mobile menu button */}
      <header className="bg-gray-800 shadow-md sticky top-0 z-50 py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {/* Mobile menu button */}
              <button 
                className="md:hidden text-white mr-4"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
              </button>
              
              <div
                className="flex items-center cursor-pointer group"
                onClick={() => navigate("/sample")}
              >
                <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white p-3 rounded-xl mr-3 shadow-lg transform group-hover:rotate-6 transition duration-300">
                  <FiBox size={28} />
                </div>
                <h1 className="text-3xl font-extrabold text-gray-200 tracking-tight group-hover:text-blue-700 transition duration-300">
                  StockHub
                </h1>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="hidden sm:inline text-white font-medium">
                Welcome, {loggedInUsername}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-500 px-3 py-2 rounded flex items-center gap-2 hover:bg-red-600 text-white"
              >
                <FiLogOut className="text-lg" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex flex-1">
        {/* Mobile sidebar overlay */}
        {mobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar Navigation - Mobile & Desktop */}
        <aside className={`fixed md:relative z-50 mt-5 ml-5 rounded-xl md:z-auto transform ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out bg-white/90 backdrop-blur-sm md:bg-gray-200 w-64 min-h-full border border-gray-300 p-5 md:block`}>
          <nav className="space-y-2">
            <button
              onClick={() => handleTabChange("sales")}
              className={`flex items-center gap-3 w-full px-4 py-3 mt-2 rounded-lg transition-all ${
                tab === "sales" 
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg"
                  : "hover:bg-gray-200/50 text-gray-700 hover:shadow-md"
              }`}
            >
              <FiHome className="text-lg" /> 
              <span className="font-medium">Overview</span>
            </button>
            <button
              onClick={() => handleTabChange("users")}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-all ${
                tab === "users" 
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg"
                  : "hover:bg-gray-200/50 text-gray-700 hover:shadow-md"
              }`}
            >
              <FiUsers className="text-lg" /> 
              <span className="font-medium">Manage Users</span>
            </button>
            <button
              onClick={() => handleTabChange("inventory")}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-all ${
                tab === "inventory"
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg"
                  : "hover:bg-gray-200/50 text-gray-700 hover:shadow-md"
              }`}
            >
              <FiBox className="text-lg" /> 
              <span className="font-medium">Manage Inventory</span>
            </button>
            <button
              onClick={() => handleTabChange("orders")}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-all ${
                tab === "orders"
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg"
                  : "hover:bg-gray-200/50 text-gray-700 hover:shadow-md"
              }`}
            >
              <FiClipboard className="text-lg" /> 
              <span className="font-medium">Manage Orders</span>
            </button>
          </nav>
          
          {/* Sidebar footer */}
          <div className="mt-8 pt-4 border-t border-gray-300">
            <div className="text-sm text-gray-500 p-2 rounded-lg bg-gray-100/50">
              <p>Current view: <span className="font-medium capitalize text-blue-600">{tab}</span></p>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-4 md:p-6">
          {/* Mobile tab indicator - only shows on small screens */}
          <div className="md:hidden mb-4 p-3 bg-white rounded-lg shadow-sm flex justify-between items-center">
            <span className="font-medium text-gray-700">Current Tab:</span>
            <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm font-medium capitalize">
              {tab}
            </span>
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="text-blue-600 hover:text-blue-800"
            >
              <FiMenu size={20} />
            </button>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="">
              {tab === "sales" && <SalesOverview />}
              {tab === "users" && <ManageUser />}
              {tab === "inventory" && <StockInventory />}
              {tab === "orders" && <OrdersList />}
            </div>
          </div>
        </main>
      </div>

      {/* Footer remains unchanged */}
      <footer className="bg-gray-800 text-white py-8 mt-auto shadow-inner">
        <div className="container mx-auto px-4 text-center">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 border-b border-gray-700 pb-6">
            <div className="flex items-center mb-4 md:mb-0">
              <FiBox className="text-blue-400 text-4xl mr-3" />
              <span className="text-3xl font-extrabold text-white">
                StockHub
              </span>
            </div>
            <nav className="flex space-x-6">
              <a
                href="#"
                className="hover:text-blue-400 transition duration-200"
              >
                About Us
              </a>
              <a
                href="#"
                className="hover:text-blue-400 transition duration-200"
              >
                Contact
              </a>
              <a
                href="#"
                className="hover:text-blue-400 transition duration-200"
              >
                Privacy Policy
              </a>
            </nav>
          </div>
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} StockHub. All rights reserved.
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Your ultimate solution for seamless inventory management and online
            shopping.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Sample;