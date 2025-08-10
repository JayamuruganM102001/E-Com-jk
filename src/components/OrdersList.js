import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  FiPackage,
  FiCalendar,
  FiDollarSign,
  FiTruck,
  FiCheckCircle,
  FiXCircle,
  FiRefreshCw,
  FiChevronDown,
  FiChevronUp,
  FiSearch,
  FiFilter,
  FiX,
} from "react-icons/fi";

const OrdersList = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showFloatingCard, setShowFloatingCard] = useState(false);
  const floatingCardRef = useRef(null);

  // State for confirmation modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [orderToUpdate, setOrderToUpdate] = useState(null);
  const [newStatusForUpdate, setNewStatusForUpdate] = useState("");

  // Define the sequential order of statuses
  const statusSequence = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"];
  const allStatuses = ["ALL", ...statusSequence, "CANCELLED"];

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/orders/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setOrders(response.data);
      setFilteredOrders(response.data);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Failed to fetch orders. Please try again.");
      toast.error("Failed to fetch orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Close floating card when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (floatingCardRef.current && !floatingCardRef.current.contains(event.target)) {
        // Check if the click is not on a table row
        const isRowClick = event.target.closest('tr');
        if (!isRowClick) {
          setShowFloatingCard(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter orders based on active filter and search query
  useEffect(() => {
    let result = [...orders];

    // Apply status filter
    if (activeFilter !== "ALL") {
      result = result.filter((order) => order.status === activeFilter);
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (order) =>
          order.id.toString().includes(query) ||
          order.username.toLowerCase().includes(query) ||
          order.address.toLowerCase().includes(query) ||
          order.paymentMethod.toLowerCase().includes(query)
      );
    }

    setFilteredOrders(result);
  }, [activeFilter, searchQuery, orders]);

  // Get count of orders for each status
  const getStatusCount = (status) => {
    if (status === "ALL") return orders.length;
    return orders.filter((order) => order.status === status).length;
  };

  // Function to open the confirmation modal
  const confirmStatusChange = (order, newStatus) => {
    setOrderToUpdate(order);
    setNewStatusForUpdate(newStatus);
    setShowConfirmModal(true);
  };

  // Function to close the confirmation modal
  const cancelStatusChange = () => {
    setShowConfirmModal(false);
    setOrderToUpdate(null);
    setNewStatusForUpdate("");
  };

  // Function to actually perform the status change after confirmation
  const executeStatusChange = async () => {
    if (!orderToUpdate || !newStatusForUpdate) return;

    try {
      setUpdatingOrderId(orderToUpdate.id);
      const token = localStorage.getItem("token");
      const description = `Order status updated to ${newStatusForUpdate}`;
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/orders/${orderToUpdate.id}/status`,
        null,
        {
          params: { newStatus: newStatusForUpdate, description },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success(
        `Order #${orderToUpdate.id} updated to ${newStatusForUpdate}`
      );
      fetchOrders();
      cancelStatusChange();
      setShowFloatingCard(false);
    } catch (err) {
      console.error("Error updating order status:", err);
      toast.error("Failed to update order status.");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleRowClick = (order) => {
    setSelectedOrder(order);
    setShowFloatingCard(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "DELIVERED":
        return "bg-green-100 text-green-800";
      case "SHIPPED":
        return "bg-yellow-100 text-yellow-800";
      case "PROCESSING":
        return "bg-blue-100 text-blue-800";
      case "PENDING":
        return "bg-orange-100 text-orange-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "DELIVERED":
        return <FiCheckCircle className="text-green-500 mt-1" />;
      case "SHIPPED":
        return <FiTruck className="text-yellow-500 mt-1" />;
      case "PROCESSING":
        return <FiRefreshCw className="text-blue-500 mt-1" />;
      case "PENDING":
        return <FiPackage className="text-orange-500 mt-1" />;
      case "CANCELLED":
        return <FiXCircle className="text-red-500 mt-1" />;
      default:
        return <FiPackage className="text-gray-500 mt-1" />;
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Render loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading orders...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center py-10">
          <div className="bg-red-100 text-red-700 p-4 rounded-lg max-w-md mx-auto">
            <p className="font-semibold">{error}</p>
            <button
              onClick={fetchOrders}
              className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-8 py-10 bg-gray-50 min-h-screen font-sans relative">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-extrabold mb-6 text-gray-800 tracking-tight">
          All Customer Orders
        </h2>

        {/* Search and Filter Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* Search Input */}
            <div className="flex-grow">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search orders by ID, user, address, or payment..."
                  className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <FiSearch />
                </div>
              </div>
            </div>
          </div>

          {/* Status Filter Buttons with Counts */}
          <div className="flex flex-wrap gap-2 mb-4">
            {allStatuses.map((status) => (
              <button
                key={status}
                onClick={() => setActiveFilter(status)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center ${
                  activeFilter === status
                    ? status === "ALL"
                      ? "bg-gray-800 text-white"
                      : status === "CANCELLED"
                      ? "bg-red-100 text-red-800 border border-red-200"
                      : status === "DELIVERED"
                      ? "bg-green-100 text-green-800 border border-green-200"
                      : "bg-blue-100 text-blue-800 border border-blue-200"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                {status.charAt(0) + status.slice(1).toLowerCase()}
                <span className="ml-1.5 bg-white/30 px-1.5 py-0.5 rounded-full text-xs">
                  {getStatusCount(status)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Orders Table */}
        {filteredOrders.length === 0 ? (
          <div className="bg-gray-300 rounded-xl shadow-sm p-8 text-center">
            <div className="text-gray-400 mb-4">
              <FiPackage size={60} className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-3">
              No orders found
            </h3>
            <p className="text-gray-500 mb-4">
              {activeFilter !== "ALL"
                ? `There are no orders with status "${activeFilter.toLowerCase()}"`
                : "No orders match your search criteria"}
            </p>
            {activeFilter !== "ALL" && (
              <button
                onClick={() => setActiveFilter("ALL")}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                View all orders
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.map((order) => {
                    const currentStatusIndex = statusSequence.indexOf(order.status);
                    const nextStatus =
                      currentStatusIndex < statusSequence.length - 1
                        ? statusSequence[currentStatusIndex + 1]
                        : null;

                    const isDelivered = order.status === "DELIVERED";
                    const isCancelled = order.status === "CANCELLED";
                    const canUpdateStatus = !isDelivered && !isCancelled;
                    const canCancel = !isDelivered && !isCancelled;

                    return (
                      <tr 
                        key={order.id} 
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleRowClick(order)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{order.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.username}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(order.orderDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)} <span className="ml-1">{order.status}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ₹{order.totalAmount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {canUpdateStatus ? (
                            <div className="flex space-x-2">
                              {nextStatus && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    confirmStatusChange(order, nextStatus);
                                  }}
                                  disabled={updatingOrderId === order.id}
                                  className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded hover:bg-blue-200 disabled:opacity-50"
                                >
                                  {updatingOrderId === order.id ? "Updating..." : nextStatus}
                                </button>
                              )}
                              {canCancel && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    confirmStatusChange(order, "CANCELLED");
                                  }}
                                  disabled={updatingOrderId === order.id}
                                  className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded hover:bg-red-200 disabled:opacity-50"
                                >
                                  Cancel
                                </button>
                              )}
                            </div>
                          ) : (
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                              {getStatusIcon(order.status)} <span className="ml-1">{order.status}</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Floating Card */}
      {showFloatingCard && selectedOrder && (
        <div 
          ref={floatingCardRef}
          className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 p-4"
        >
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-bold text-gray-900">
                  Order #{selectedOrder.id}
                </h3>
                <button
                  onClick={() => setShowFloatingCard(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FiX size={24} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-lg font-medium text-gray-900 mb-3">Order Summary</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(selectedOrder.status)}`}>
                        {getStatusIcon(selectedOrder.status)} <span className="ml-1">{selectedOrder.status}</span>
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="text-gray-900">{formatDate(selectedOrder.orderDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Method:</span>
                      <span className="text-gray-900 capitalize">{selectedOrder.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="text-gray-900">₹{(selectedOrder.totalAmount * 0.9).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax (10%):</span>
                      <span className="text-gray-900">₹{(selectedOrder.totalAmount * 0.1).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t border-gray-200 pt-2">
                      <span className="text-gray-900 font-medium">Total:</span>
                      <span className="text-gray-900 font-bold">₹{selectedOrder.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-lg font-medium text-gray-900 mb-3">Customer Details</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="text-gray-900">{selectedOrder.username}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping Address:</span>
                      <span className="text-gray-900 text-right">{selectedOrder.address}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-lg font-medium text-gray-900 mb-3">Order Items</h4>
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Item
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedOrder.items.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {item.itemName}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            ₹{item.price.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {item.quantity}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Status Update Section - Only show if order isn't delivered or cancelled */}
              {(selectedOrder.status !== "DELIVERED" && selectedOrder.status !== "CANCELLED") && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-lg font-medium text-gray-900 mb-3">Update Order Status</h4>
                  <div className="flex flex-wrap gap-3">
                    {statusSequence.map((status, index) => {
                      const isCurrent = selectedOrder.status === status;
                      const isCompleted = statusSequence.indexOf(selectedOrder.status) > index;
                      const isNext = statusSequence.indexOf(selectedOrder.status) === index - 1;

                      return (
                        <button
                          key={status}
                          onClick={() => confirmStatusChange(selectedOrder, status)}
                          disabled={isCurrent || !isNext}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            isCurrent
                              ? "bg-blue-600 text-white"
                              : isCompleted
                              ? "bg-green-100 text-green-800"
                              : isNext
                              ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
                              : "bg-gray-100 text-gray-400 cursor-not-allowed"
                          }`}
                        >
                          {status}
                          {isCurrent && " (Current)"}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => confirmStatusChange(selectedOrder, "CANCELLED")}
                      className="px-4 py-2 rounded-lg text-sm font-medium bg-red-100 text-red-800 hover:bg-red-200 transition-all"
                    >
                      Cancel Order
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && orderToUpdate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Confirm Status Change
              </h3>
              <p className="text-gray-600 mb-6">
                Change status of Order #{orderToUpdate.id} from{" "}
                <span className="font-semibold">{orderToUpdate.status}</span> to{" "}
                <span
                  className={`font-semibold ${
                    newStatusForUpdate === "CANCELLED"
                      ? "text-red-600"
                      : "text-blue-600"
                  }`}
                >
                  {newStatusForUpdate}
                </span>
                ?
              </p>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={cancelStatusChange}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={executeStatusChange}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 transition ${
                    newStatusForUpdate === "CANCELLED"
                      ? "bg-red-600 hover:bg-red-700 focus:ring-red-500"
                      : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
                  }`}
                  disabled={updatingOrderId === orderToUpdate.id}
                >
                  {updatingOrderId === orderToUpdate.id ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Updating...
                    </span>
                  ) : (
                    "Confirm"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersList;