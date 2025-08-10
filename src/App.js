// import React,{useState} from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import Login from './components/Login';
// import AdminDashboard from './components/AdminDashboard';
// import UserDashboard from './components/UserDashboard';
// import CheckoutPage from './components/CheckoutPage';
// import PlaceOrder from './components/PlaceOrder';
// import Invoice from './components/Invoice';

// import { ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import Sample from './components/Sample';

// import MyOrders from './components/MyOrders';

// //import StockItems from './components/StockItem';

// const ProtectedRoute = ({ children, allowedRole }) => {
//   const token = localStorage.getItem('token');
//   const role = localStorage.getItem('role');

//   if (!token) {
//     return <Navigate to="/login" />;
//   }

//   if (role !== allowedRole) {
//     return <Navigate to="/login" />;
//   }

//   return children;
// };

// function App() {
//   const [cart, setCart] = useState(() => {
//     const saved = localStorage.getItem('cart');
//     return saved ? JSON.parse(saved) : [];
//   });

//   const handleOrderSuccess = (invoiceData) => {
//     // Clear cart after successful order
//     setCart([]);
//     localStorage.removeItem('cart');
//     // You can add additional success handling here
//   };

//   return (
//     <>
//     <Router>
//       <Routes>
//         <Route path="/login" element={<Login />} />
//         <Route
//           path="/admin-dashboard"
//           element={
//             <ProtectedRoute allowedRole="ADMIN">
//               <AdminDashboard />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/user-dashboard"
//           element={
//             <ProtectedRoute allowedRole="USER">
//               <UserDashboard />
//             </ProtectedRoute>
//           }
//         />
//         <Route path="*" element={<Navigate to="/login" />} />
//         <Route
//           path="/checkout"
//           element={
//             <ProtectedRoute allowedRole="USER">
//               <CheckoutPage />
//             </ProtectedRoute>
//           }
//         />

//         <Route path="/place-order" element={
//           <ProtectedRoute allowedRole="USER">
//             <PlaceOrder cart={cart} onOrderSuccess={handleOrderSuccess} />
//           </ProtectedRoute>
//         } />
//         <Route path="/invoice" element={
//           <ProtectedRoute allowedRole="USER">
//             <Invoice />
//           </ProtectedRoute>
//         } />
//         <Route path="/sample" element={<Sample/>}/>
// <Route path="/my-orders" element={<MyOrders />} />
//       </Routes>
//     </Router>

//     <ToastContainer
//         position="top-right"
//         autoClose={3000}
//         hideProgressBar={false}
//         newestOnTop={false}
//         closeOnClick
//         pauseOnFocusLoss
//         draggable
//         pauseOnHover
//         theme="light"
//       />

//     </>
//   );
// }

// export default App;

import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Home from "./components/home"; // ✅ NEW
import Login from "./components/Login";
import AdminDashboard from "./components/AdminDashboard";
import UserDashboard from "./components/UserDashboard";
import CheckoutPage from "./components/CheckoutPage";
import PlaceOrder from "./components/PlaceOrder";
import Invoice from "./components/Invoice";
import Sample from "./components/Sample";
import MyOrders from "./components/MyOrders";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import StockItems from "./components/StockItem";
// import StockItems from "./components/StockItem";

const ProtectedRoute = ({ children, allowedRole }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token || role !== allowedRole) {
    return <Navigate to="/login" />;
  }

  return children;
};

function App() {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });

  const handleOrderSuccess = (invoiceData) => {
    setCart([]);
    localStorage.removeItem("cart");
  };

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />{" "}
          {/* ✅ Home as starting route */}
          <Route path="/login" element={<Login />} />
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute allowedRole="ADMIN">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user-dashboard"
            element={
              <ProtectedRoute allowedRole="USER">
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute allowedRole="USER">
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/place-order"
            element={
              <ProtectedRoute allowedRole="USER">
                <PlaceOrder cart={cart} onOrderSuccess={handleOrderSuccess} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/invoice"
            element={
              <ProtectedRoute allowedRole="USER">
                <Invoice />
              </ProtectedRoute>
            }
          />
          <Route path="/sample" element={<Sample />} />
          <Route path="/stockItems" element={<StockItems/>}/>
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="*" element={<Navigate to="/" />} />{" "}
          {/* ✅ Default fallback */}
        </Routes>
      </Router>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
}

export default App;
