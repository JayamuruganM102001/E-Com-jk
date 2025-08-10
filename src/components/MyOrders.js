// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { toast } from "react-toastify";
// import {
//   FiPackage,
//   FiCalendar,
//   FiDollarSign,
//   FiTruck,
//   FiChevronRight,
//   FiCheckCircle,
//   FiXCircle,
//   FiRefreshCw,
//   FiHome,
//   FiShoppingBag
// } from "react-icons/fi";
// import { useNavigate } from "react-router-dom";

// const BASE_URL = `${process.env.REACT_APP_API_URL}/api`;

// const MyOrders = () => {
//   const [orders, setOrders] = useState([]);
//   const [selectedOrder, setSelectedOrder] = useState(null);
//   const [deliveryTimeline, setDeliveryTimeline] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [timelineLoading, setTimelineLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [timelineError, setTimelineError] = useState(null);

//   const navigate = useNavigate();

//   const statusSequence = [
//     { status: "ORDER PLACED", label: "Order Placed", icon: FiCalendar, color: "bg-purple-500" },
//     { status: "PROCESSING", label: "Processing", icon: FiRefreshCw, color: "bg-blue-500" },
//     { status: "SHIPPED", label: "Shipped", icon: FiTruck, color: "bg-yellow-500" },
//     { status: "DELIVERED", label: "Delivered", icon: FiCheckCircle, color: "bg-green-500" },
//   ];

//   useEffect(() => {
//     const fetchOrders = async () => {
//       setLoading(true);
//       try {
//         const token = localStorage.getItem("token");
//         if (!token) {
//           setError("You are not logged in. Please log in to view your orders.");
//           return;
//         }

//         const response = await axios.get(`${BASE_URL}/orders/my-orders`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         setOrders(response.data);
//       } catch (err) {
//         setError(err.response?.data?.message || "Failed to load orders.");
//         toast.error("Failed to load orders.");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchOrders();
//   }, []);

//   const fetchOrderTimeline = async (orderId) => {
//     setTimelineLoading(true);
//     setTimelineError(null);
//     setDeliveryTimeline([]);
//     try {
//       const token = localStorage.getItem("token");
//       const response = await axios.get(
//         `${BASE_URL}/orders/${orderId}/timeline`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );
//       const sortedTimeline = response.data.sort(
//         (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
//       );
//       setDeliveryTimeline(sortedTimeline);
//     } catch (err) {
//       setTimelineError(
//         err.response?.data?.message || "Failed to load delivery timeline."
//       );
//       toast.error("Failed to load delivery timeline.");
//     } finally {
//       setTimelineLoading(false);
//     }
//   };

//   const handleOrderSelect = (order) => {
//     setSelectedOrder(order);
//     fetchOrderTimeline(order.id);
//   };

//   const getStatusColor = (status) => {
//     switch (status) {
//       case "DELIVERED":
//         return "bg-green-100 text-green-800 border-green-300";
//       case "SHIPPED":
//         return "bg-yellow-100 text-yellow-800 border-yellow-300";
//       case "PROCESSING":
//         return "bg-blue-100 text-blue-800 border-blue-300";
//       case "PENDING":
//         return "bg-orange-100 text-orange-800 border-orange-300";
//       case "CANCELLED":
//         return "bg-red-100 text-red-800 border-red-300";
//       default:
//         return "bg-gray-100 text-gray-800 border-gray-300";
//     }
//   };

//   const goToHome = () => {
//     navigate("/sample");
//   };

//   if (loading) {
//     return (
//       <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
//         <FiShoppingBag className="text-blue-500 text-5xl mb-4" />
//         <h1 className="text-2xl font-bold text-gray-800 mb-2">Loading Your Orders</h1>
//         <p className="text-gray-600">Please wait while we fetch your purchase history</p>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="max-w-md mx-auto mt-20 p-8 bg-gray-300 rounded-xl shadow-lg border border-red-200 text-center">
//         <FiXCircle className="text-red-500 text-5xl mx-auto mb-4" />
//         <h3 className="text-xl font-bold text-gray-800 mb-3">Error Loading Orders</h3>
//         <p className="text-gray-600 mb-6">{error}</p>
//         {error.includes("not logged in") && (
//           <button
//             onClick={() => navigate("/login")}
//             className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//           >
//             Go to Login
//           </button>
//         )}
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-300 p-4 md:p-8">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
//           <button
//             onClick={goToHome}
//             className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800"
//           >
//             <FiHome /> Back to Shop
//           </button>

//           <h1 className="text-3xl md:text-4xl font-bold text-gray-800 text-center">
//             Your Order History
//           </h1>

//           {orders.length > 0 && (
//             <div className="px-3 py-1 bg-white rounded-full border border-gray-200">
//               <span className="font-medium text-gray-700">
//                 {orders.length} {orders.length === 1 ? "Order" : "Orders"}
//               </span>
//             </div>
//           )}
//         </div>

//         {orders.length === 0 ? (
//           <div className="bg-white p-8 rounded-xl shadow-md max-w-md mx-auto text-center border border-gray-200">
//             <FiPackage size={60} className="text-gray-400 mx-auto mb-4" />
//             <h3 className="text-xl font-bold text-gray-800 mb-3">No Orders Yet</h3>
//             <p className="text-gray-600 mb-6">
//               Your order history is empty. Start shopping to see your orders here!
//             </p>
//             <button
//               onClick={() => navigate("/sample")}
//               className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//             >
//               Browse Products
//             </button>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//             {/* Orders List */}
//             <div className="lg:col-span-1 bg-white rounded-xl shadow-md h-[80vh] overflow-y-auto">
//               <div className="sticky top-0 bg-white p-4 border-b border-gray-200">
//                 <h2 className="text-xl font-bold text-gray-800">Your Orders</h2>
//               </div>
//               <div className="p-4 space-y-4">
//                 {orders.map((order, index) => (
//                   <div
//                     key={order.id}
//                     className={`p-4 rounded-lg border cursor-pointer transition-colors ${
//                       selectedOrder?.id === order.id
//                         ? "bg-blue-50 border-blue-400"
//                         : "bg-white hover:bg-gray-50 border-gray-200"
//                     }`}
//                     onClick={() => handleOrderSelect(order)}
//                   >
//                     <div className="flex justify-between items-center">
//                       <div>
//                         <p className="font-bold text-gray-800">Order #{index + 1}</p>
//                         <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
//                           <FiCalendar size={14} />
//                           {new Date(order.orderDate).toLocaleDateString("en-IN")}
//                         </div>
//                         <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
//                           <FiDollarSign size={14} />
//                           ₹{order.totalAmount.toLocaleString("en-IN")}
//                         </div>
//                       </div>
//                       <div className="flex items-center gap-2">
//                         <span
//                           className={`px-3 py-1 text-xs rounded-full font-medium ${getStatusColor(
//                             order.status
//                           )}`}
//                         >
//                           {order.status}
//                         </span>
//                         <FiChevronRight className="text-gray-400" />
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Order Details */}
//             <div className="lg:col-span-2 bg-white rounded-xl shadow-md h-[80vh] overflow-y-auto">
//               {selectedOrder ? (
//                 <div className="p-6">
//                   <div className="mb-6">
//                     <h2 className="text-2xl font-bold text-gray-800 mb-4">Order Details</h2>
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
//                       <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
//                         <h3 className="font-semibold text-gray-700 mb-2">Order Information</h3>
//                         <p className="text-sm">ID: #{String(selectedOrder.id).substring(0, 8)}...</p>
//                         <p className="text-sm">
//                           Date: {new Date(selectedOrder.orderDate).toLocaleString("en-IN")}
//                         </p>
//                       </div>
//                       <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
//                         <h3 className="font-semibold text-gray-700 mb-2">Payment Summary</h3>
//                         <p className="text-sm">
//                           Total: ₹{selectedOrder.totalAmount.toLocaleString("en-IN")}
//                         </p>
//                         <p className="text-sm">
//                           Status: <span className={`${getStatusColor(selectedOrder.status).replace("bg-", "text-").replace("-100", "-800")} font-medium`}>
//                             {selectedOrder.status}
//                           </span>
//                         </p>
//                       </div>
//                     </div>

//                     <h3 className="text-xl font-bold text-gray-800 mb-4">Order Items</h3>
//                     <div className="space-y-4">
//                       {selectedOrder.items.map((item) => (
//                         <div key={item.id} className="flex gap-4 items-center p-3 border border-gray-200 rounded-lg">
//                           <img
//                             src={`${BASE_URL}/stock/name/${encodeURIComponent(item.itemName)}/image`}
//                             alt={item.itemName}
//                             onError={(e) => (e.target.src = "https://placehold.co/80x80/e0e7ff/4338ca?text=No+Image")}
//                             className="w-16 h-16 rounded-md object-cover border"
//                           />
//                           <div className="flex-1">
//                             <p className="font-medium text-gray-800">{item.itemName}</p>
//                             <p className="text-sm text-gray-600">
//                               Qty: {item.quantity} × ₹{item.price.toLocaleString("en-IN")}
//                             </p>
//                           </div>
//                           <p className="font-medium">
//                             ₹{(item.price * item.quantity).toLocaleString("en-IN")}
//                           </p>
//                         </div>
//                       ))}
//                     </div>
//                   </div>

//                   <div>
//                     <h3 className="text-xl font-bold text-gray-800 mb-4">Delivery Timeline</h3>
//                     {timelineLoading ? (
//                       <div className="flex justify-center items-center py-6">
//                         <FiRefreshCw className="animate-spin text-gray-500 mr-2" />
//                         <span>Loading timeline...</span>
//                       </div>
//                     ) : timelineError ? (
//                       <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-red-600">
//                         {timelineError}
//                       </div>
//                     ) : selectedOrder.status === "CANCELLED" ? (
//                       <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-red-600 text-center">
//                         <FiXCircle className="mx-auto mb-2" size={24} />
//                         This order has been cancelled.
//                       </div>
//                     ) : (
//                       <div className="relative pl-8 space-y-6">
//                         <div className="absolute left-4 top-0 bottom-0 w-1 bg-gray-300 rounded-full"></div>
//                         {statusSequence.map((step, idx) => {
//                           const event = deliveryTimeline.find(
//                             (e) => e.status.toUpperCase() === step.status.toUpperCase()
//                           );
//                           const isCompleted = !!event;
//                           const isCurrent = selectedOrder.status.toUpperCase() === step.status.toUpperCase();
//                           const Icon = step.icon;

//                           return (
//                             <div key={step.status} className="relative flex items-start">
//                               <div className={`absolute -left-8 top-0 w-6 h-6 rounded-full flex items-center justify-center ${
//                                 isCompleted
//                                   ? "bg-green-500 text-white"
//                                   : isCurrent
//                                     ? "bg-blue-500 text-white"
//                                     : "bg-gray-300 text-gray-700"
//                               }`}>
//                                 <Icon size={14} />
//                               </div>
//                               <div className="ml-4 bg-gray-50 p-3 rounded-lg border border-gray-200 flex-1">
//                                 <p className="font-medium text-gray-800">{step.label}</p>
//                                 <p className="text-xs text-gray-500 mt-1">
//                                   {event
//                                     ? new Date(event.timestamp).toLocaleString("en-IN")
//                                     : isCurrent
//                                       ? "In progress"
//                                       : "Pending"
//                                   }
//                                 </p>
//                                 {event?.description && (
//                                   <p className="text-sm text-gray-600 mt-1">{event.description}</p>
//                                 )}
//                               </div>
//                             </div>
//                           );
//                         })}
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               ) : (
//                 <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
//                   <FiPackage size={48} className="mb-4" />
//                   <p className="text-lg text-center">
//                     Select an order from the list to view details
//                   </p>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default MyOrders;

import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  FiPackage,
  FiCalendar,
  FiDollarSign,
  FiTruck,
  FiChevronRight,
  FiCheckCircle,
  FiXCircle,
  FiRefreshCw,
  FiHome,
  FiShoppingBag,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const BASE_URL = `${process.env.REACT_APP_API_URL}/api`;

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [deliveryTimeline, setDeliveryTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timelineError, setTimelineError] = useState(null);

  const navigate = useNavigate();

  const statusSequence = [
    {
      status: "ORDER PLACED",
      label: "Order Placed",
      icon: FiCalendar,
      color: "bg-purple-500",
    },
    {
      status: "PROCESSING",
      label: "Processing",
      icon: FiRefreshCw,
      color: "bg-blue-500",
    },
    {
      status: "SHIPPED",
      label: "Shipped",
      icon: FiTruck,
      color: "bg-yellow-500",
    },
    {
      status: "DELIVERED",
      label: "Delivered",
      icon: FiCheckCircle,
      color: "bg-green-500",
    },
  ];

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You are not logged in. Please log in to view your orders.");
        return;
      }

      const response = await axios.get(`${BASE_URL}/orders/my-orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load orders.");
      toast.error("Failed to load orders.");
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderTimeline = async (orderId) => {
    setTimelineLoading(true);
    setTimelineError(null);
    setDeliveryTimeline([]);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${BASE_URL}/orders/${orderId}/timeline`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const sortedTimeline = response.data.sort(
        (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
      );
      setDeliveryTimeline(sortedTimeline);
    } catch (err) {
      setTimelineError(
        err.response?.data?.message || "Failed to load delivery timeline."
      );
      toast.error("Failed to load delivery timeline.");
    } finally {
      setTimelineLoading(false);
    }
  };

  const handleOrderSelect = (order) => {
    setSelectedOrder(order);
    fetchOrderTimeline(order.id);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "DELIVERED":
        return "bg-green-100 text-green-800 border-green-300";
      case "SHIPPED":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "PROCESSING":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "PENDING":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const goToHome = () => {
    navigate("/stockItems");
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
        <FiShoppingBag className="text-blue-500 text-5xl mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Loading Your Orders
        </h1>
        <p className="text-gray-600">
          Please wait while we fetch your purchase history
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 bg-gray-300 rounded-xl shadow-lg border border-red-200 text-center">
        <FiXCircle className="text-red-500 text-5xl mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-800 mb-3">
          Error Loading Orders
        </h3>
        <p className="text-gray-600 mb-6">{error}</p>
        {error.includes("not logged in") && (
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Login
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-300 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <button
            onClick={goToHome}
            className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800"
          >
            <FiHome /> Back to Shop
          </button>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 text-center">
            Your Order History
          </h1>

          {orders.length > 0 && (
            <div className="px-3 py-1 bg-white rounded-full border border-gray-200">
              <span className="font-medium text-gray-700">
                {orders.length} {orders.length === 1 ? "Order" : "Orders"}
              </span>
            </div>
          )}
        </div>

        {orders.length === 0 ? (
          <div className="bg-white p-8 rounded-xl shadow-md max-w-md mx-auto text-center border border-gray-200">
            <FiPackage size={60} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-3">
              No Orders Yet
            </h3>
            <p className="text-gray-600 mb-6">
              Your order history is empty. Start shopping to see your orders
              here!
            </p>
            <button
              onClick={() => navigate("/stockItems")}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Orders List */}
            <div className="lg:col-span-1 bg-white rounded-xl shadow-md h-[80vh] overflow-y-auto">
              <div className="sticky top-0 bg-white p-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-800">Your Orders</h2>
              </div>
              <div className="p-4 space-y-4">
                {orders.map((order, index) => (
                  <div
                    key={order.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedOrder?.id === order.id
                        ? "bg-blue-50 border-blue-400"
                        : "bg-white hover:bg-gray-50 border-gray-200"
                    }`}
                    onClick={() => handleOrderSelect(order)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-bold text-gray-800">
                          Order #{index + 1}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                          <FiCalendar size={14} />
                          {new Date(order.orderDate).toLocaleDateString(
                            "en-IN"
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                          <FiDollarSign size={14} />₹
                          {order.totalAmount.toLocaleString("en-IN")}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1 text-xs rounded-full font-medium ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                        <FiChevronRight className="text-gray-400" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Details - Split into two columns */}
            <div className="lg:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Order Info and Items */}
              <div className="bg-white rounded-xl shadow-md h-[80vh] overflow-y-auto">
                {selectedOrder ? (
                  <div className="p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                      Order Information
                    </h2>

                    <div className="mb-6 space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <h3 className="font-semibold text-gray-700 mb-2">
                          Order Details
                        </h3>
                        <p className="text-sm">
                          ID: #{String(selectedOrder.id).substring(0, 8)}...
                        </p>
                        <p className="text-sm">
                          Date:{" "}
                          {new Date(selectedOrder.orderDate).toLocaleString(
                            "en-IN"
                          )}
                        </p>
                        <p className="text-sm mt-2">
                          Status:{" "}
                          <span
                            className={`${getStatusColor(selectedOrder.status)
                              .replace("bg-", "text-")
                              .replace("-100", "-800")} font-medium`}
                          >
                            {selectedOrder.status}
                          </span>
                        </p>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <h3 className="font-semibold text-gray-700 mb-2">
                          Payment Summary
                        </h3>
                        <p className="text-sm">
                          Subtotal: ₹
                          {(selectedOrder.totalAmount * 0.9).toLocaleString(
                            "en-IN"
                          )}
                        </p>
                        <p className="text-sm">
                          Tax (10%): ₹
                          {(selectedOrder.totalAmount * 0.1).toLocaleString(
                            "en-IN"
                          )}
                        </p>
                        <p className="text-sm font-bold mt-2">
                          Total: ₹
                          {selectedOrder.totalAmount.toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-gray-800 mb-4">
                      Order Items
                    </h3>
                    <div className="space-y-4">
                      {selectedOrder.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex gap-4 items-center p-3 border border-gray-200 rounded-lg"
                        >
                          <img
                            src={`${BASE_URL}/stock/name/${encodeURIComponent(
                              item.itemName
                            )}/image`}
                            alt={item.itemName}
                            onError={(e) =>
                              (e.target.src =
                                "https://placehold.co/80x80/e0e7ff/4338ca?text=No+Image")
                            }
                            className="w-16 h-16 rounded-md object-cover border"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">
                              {item.itemName}
                            </p>
                            <p className="text-sm text-gray-600">
                              Qty: {item.quantity} × ₹
                              {item.price.toLocaleString("en-IN")}
                            </p>
                          </div>
                          <p className="font-medium">
                            ₹
                            {(item.price * item.quantity).toLocaleString(
                              "en-IN"
                            )}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
                    <FiPackage size={48} className="mb-4" />
                    <p className="text-lg text-center">
                      Select an order from the list to view details
                    </p>
                  </div>
                )}
              </div>

              {/* Right Column - Delivery Timeline */}
              <div className="bg-white rounded-xl shadow-md h-[80vh] overflow-y-auto">
                {selectedOrder ? (
                  <div className="p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                      Delivery Timeline
                    </h2>

                    {timelineLoading ? (
                      <div className="flex justify-center items-center py-6">
                        <FiRefreshCw className="animate-spin text-gray-500 mr-2" />
                        <span>Loading timeline...</span>
                      </div>
                    ) : timelineError ? (
                      <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-red-600">
                        {timelineError}
                      </div>
                    ) : selectedOrder.status === "CANCELLED" ? (
                      <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-red-600 text-center">
                        <FiXCircle className="mx-auto mb-2" size={24} />
                        This order has been cancelled.
                      </div>
                    ) : (
                      <div className="relative pl-8 space-y-6">
                        <div className="absolute left-4 top-0 bottom-0 w-2 h-[88%] bg-blue-600 rounded-full"></div>
                        {statusSequence.map((step, idx) => {
                          const event = deliveryTimeline.find(
                            (e) =>
                              e.status.toUpperCase() ===
                              step.status.toUpperCase()
                          );
                          const isCompleted = !!event;
                          const isCurrent =
                            selectedOrder.status.toUpperCase() ===
                            step.status.toUpperCase();
                          const Icon = step.icon;

                          return (
                            <div
                              key={step.status}
                              className="relative flex items-start"
                            >
                              <div
                                className={`absolute -left-8 top-0 w-10 h-10 rounded-full flex items-center justify-center ${
                                  isCompleted
                                    ? "bg-green-500 text-white"
                                    : isCurrent
                                    ? "bg-blue-500 text-white"
                                    : "bg-gray-300 text-gray-700"
                                }`}
                              >
                                <Icon size={14} />
                              </div>
                              <div className="ml-4 bg-gray-50 p-3 rounded-lg border border-gray-200 flex-1">
                                <p className="font-medium text-gray-800">
                                  {step.label}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {event
                                    ? new Date(event.timestamp).toLocaleString(
                                        "en-IN"
                                      )
                                    : isCurrent
                                    ? "In progress"
                                    : "Pending"}
                                </p>
                                {event?.description && (
                                  <p className="text-sm text-gray-600 mt-1">
                                    {event.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
                    <FiTruck size={48} className="mb-4" />
                    <p className="text-lg text-center">
                      Delivery timeline will appear here
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
