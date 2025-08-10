// import React from 'react';

// const OrdersTable = ({ orders }) => {
//   return (
//     <div className="overflow-x-auto mt-4">
//       <table className="min-w-full bg-white border rounded-xl shadow">
//         <thead className="bg-gray-100">
//           <tr>
//             <th className="py-2 px-4 border-b text-left">#</th>
//             <th className="py-2 px-4 border-b text-left">Order ID</th>
//             <th className="py-2 px-4 border-b text-left">Customer</th>
//             <th className="py-2 px-4 border-b text-left">Total Amount</th>
//             <th className="py-2 px-4 border-b text-left">Date</th>
//             <th className="py-2 px-4 border-b text-left">Status</th>
//           </tr>
//         </thead>
//         <tbody>
//           {orders.length > 0 ? (
//             orders.map((order, index) => (
//               <tr key={order.id} className="hover:bg-gray-50">
//                 <td className="py-2 px-4 border-b">{index + 1}</td>
//                 <td className="py-2 px-4 border-b">{order.id}</td>
//                 <td className="py-2 px-4 border-b">{order.username}</td>
//                 <td className="py-2 px-4 border-b">₹{order.totalAmount.toFixed(2)}</td>
//                 <td className="py-2 px-4 border-b">{order.date}</td>
//                 <td className="py-2 px-4 border-b">
//                   <span className={`px-2 py-1 rounded-full text-sm font-medium ${order.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
//                     {order.status}
//                   </span>
//                 </td>
//               </tr>
//             ))
//           ) : (
//             <tr>
//               <td colSpan="6" className="text-center py-4 text-gray-500">
//                 No orders found.
//               </td>
//             </tr>
//           )}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default OrdersTable;

import React, { useEffect, useState } from 'react';
import axios from 'axios';

const OrderTable = ({ onBack }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingStatus, setEditingStatus] = useState(null);
    const [newStatus, setNewStatus] = useState('');
    const [sortConfig, setSortConfig] = useState({
        key: 'orderDate',
        direction: 'desc'
    });

    // Status options and their styling
    const statusOptions = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    
    const statusStyles = {
        PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        PROCESSING: 'bg-blue-100 text-blue-800 border-blue-200',
        SHIPPED: 'bg-purple-100 text-purple-800 border-purple-200',
        DELIVERED: 'bg-green-100 text-green-800 border-green-200',
        CANCELLED: 'bg-red-100 text-red-800 border-red-200'
    };

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/orders/all`);
                setOrders(res.data);
            } catch (err) {
                console.error('Failed to fetch orders', err);
                setError('Failed to load order data. Please try again later.');
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const handleStatusUpdate = async (orderId) => {
        try {
            await axios.put(`${process.env.REACT_APP_API_URL}/api/orders/${orderId}/status`, null, {
                params: {
                    newStatus: newStatus
                }
            });
            
            setOrders(orders.map(order => 
                order.id === orderId ? { ...order, status: newStatus } : order
            ));
            
            setEditingStatus(null);
        } catch (err) {
            console.error('Failed to update status', err);
            alert('Failed to update order status');
        }
    };

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedOrders = React.useMemo(() => {
        let sortableOrders = [...orders];
        if (sortConfig !== null) {
            sortableOrders.sort((a, b) => {
                // Handle different data types for sorting
                if (sortConfig.key === 'totalAmount') {
                    // Numeric comparison
                    if (a[sortConfig.key] < b[sortConfig.key]) {
                        return sortConfig.direction === 'asc' ? -1 : 1;
                    }
                    if (a[sortConfig.key] > b[sortConfig.key]) {
                        return sortConfig.direction === 'asc' ? 1 : -1;
                    }
                } else if (sortConfig.key === 'orderDate') {
                    // Date comparison
                    const dateA = new Date(a[sortConfig.key]);
                    const dateB = new Date(b[sortConfig.key]);
                    return sortConfig.direction === 'asc' 
                        ? dateA - dateB 
                        : dateB - dateA;
                } else if (sortConfig.key === 'id') {
                    // Numeric comparison for IDs
                    if (parseInt(a[sortConfig.key]) < parseInt(b[sortConfig.key])) {
                        return sortConfig.direction === 'asc' ? -1 : 1;
                    }
                    if (parseInt(a[sortConfig.key]) > parseInt(b[sortConfig.key])) {
                        return sortConfig.direction === 'asc' ? 1 : -1;
                    }
                } else {
                    // String comparison
                    if (a[sortConfig.key].toLowerCase() < b[sortConfig.key].toLowerCase()) {
                        return sortConfig.direction === 'asc' ? -1 : 1;
                    }
                    if (a[sortConfig.key].toLowerCase() > b[sortConfig.key].toLowerCase()) {
                        return sortConfig.direction === 'asc' ? 1 : -1;
                    }
                }
                return 0;
            });
        }
        return sortableOrders;
    }, [orders, sortConfig]);

    const getSortIndicator = (key) => {
        if (sortConfig.key !== key) return null;
        return sortConfig.direction === 'asc' ? '↑' : '↓';
    };

    const formatDate = (dateString) => {
        const options = { 
            year: 'numeric', 
            month: 'short', 
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleString('en-IN', options);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="bg-red-50 border-l-4 border-red-500 p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="px-4 py-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <button
                    onClick={onBack}
                    className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    Back to Overview
                </button>
                <h1 className="text-2xl font-bold text-gray-800">Order Management</h1>
                <div className="w-24"></div> {/* Spacer for alignment */}
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th 
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() => requestSort('id')}
                                >
                                    <div className="flex items-center">
                                        Order ID
                                        <span className="ml-1">{getSortIndicator('id')}</span>
                                    </div>
                                </th>
                                <th 
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() => requestSort('username')}
                                >
                                    <div className="flex items-center">
                                        Customer
                                        <span className="ml-1">{getSortIndicator('username')}</span>
                                    </div>
                                </th>
                                <th 
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() => requestSort('totalAmount')}
                                >
                                    <div className="flex items-center">
                                        Amount
                                        <span className="ml-1">{getSortIndicator('totalAmount')}</span>
                                    </div>
                                </th>
                                <th 
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() => requestSort('orderDate')}
                                >
                                    <div className="flex items-center">
                                        Date
                                        <span className="ml-1">{getSortIndicator('orderDate')}</span>
                                    </div>
                                </th>
                                <th 
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() => requestSort('status')}
                                >
                                    <div className="flex items-center">
                                        Status
                                        <span className="ml-1">{getSortIndicator('status')}</span>
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {sortedOrders.map(order => (
                                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                                                <span className="text-indigo-600 text-xs font-medium">
                                                    {order.username.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            {order.username}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                                        ₹{order.totalAmount.toLocaleString('en-IN')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {formatDate(order.orderDate)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {editingStatus === order.id ? (
                                            <div className="flex items-center space-x-2">
                                                <select
                                                    value={newStatus}
                                                    onChange={(e) => setNewStatus(e.target.value)}
                                                    className="border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                                >
                                                    {statusOptions.map(option => (
                                                        <option key={option} value={option}>{option}</option>
                                                    ))}
                                                </select>
                                                <button
                                                    onClick={() => handleStatusUpdate(order.id)}
                                                    className="px-2 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700"
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    onClick={() => setEditingStatus(null)}
                                                    className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[order.status] || 'bg-gray-100 text-gray-800'}`}>
                                                    {order.status}
                                                </span>
                                                <button
                                                    onClick={() => {
                                                        setEditingStatus(order.id);
                                                        setNewStatus(order.status);
                                                    }}
                                                    className="ml-2 text-gray-400 hover:text-gray-600"
                                                >
                                                    {/* <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg> */}
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {orders.length === 0 && !loading && (
                <div className="text-center py-12">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
                    <p className="mt-1 text-sm text-gray-500">There are currently no orders in the system.</p>
                </div>
            )}
        </div>
    );
};

export default OrderTable;