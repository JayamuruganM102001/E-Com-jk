import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { FiEdit, FiTrash2, FiPlus, FiSearch, FiFilter, FiTag, FiBox, FiDollarSign, FiCalendar, FiFileText } from 'react-icons/fi';
import { BASE_URL } from '../api/UserService';
import { toast } from 'react-toastify';

const StockInventory = () => {
    const [stockItems, setStockItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
    const [currentPage, setCurrentPage] = useState(1);
    const [showItemModal, setShowItemModal] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const itemsPerPage = 10;

    // State for delete confirmation modal
    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
    const [itemToDeleteId, setItemToDeleteId] = useState(null);
    const [itemToDeleteName, setItemToDeleteName] = useState('');

    const [itemForm, setItemForm] = useState({
        name: '',
        category: '',
        quantity: '',
        price: '',
        dateAdded: '',
        description: '',
        image: null,
    });

    const [categoryName, setCategoryName] = useState('');

    // Fetch data on component mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [stockRes, catRes] = await Promise.all([
                    axios.get(`${BASE_URL}/stock`),
                    axios.get(`${BASE_URL}/categories`),
                ]);
                setStockItems(stockRes.data);
                setCategories(catRes.data);
            } catch (err) {
                setError(err.message);
                toast.error("Failed to fetch data.", { position: "bottom-center" });
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Function to open the delete confirmation modal
    const confirmDelete = (item) => {
        setItemToDeleteId(item.id);
        setItemToDeleteName(item.name);
        setShowDeleteConfirmModal(true);
    };

    // Function to close the delete confirmation modal
    const cancelDelete = () => {
        setShowDeleteConfirmModal(false);
        setItemToDeleteId(null);
        setItemToDeleteName('');
    };

    // Handle item deletion (after confirmation)
    const executeDelete = async () => {
        if (!itemToDeleteId) return;

        try {
            await axios.delete(`${BASE_URL}/stock/${itemToDeleteId}`);
            setStockItems(stockItems.filter(item => item.id !== itemToDeleteId));
            toast.success("Item deleted successfully!", { position: "bottom-center" });
            cancelDelete(); // Close the modal on success
        } catch (err) {
            setError(err.message);
            toast.error("Failed to delete item.", { position: "bottom-center" });
        }
    };

    // Handle table sorting
    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // Memoized sorting and filtering logic for performance
    const processedItems = useMemo(() => {
        let sortableItems = [...stockItems];

        // Filter by search term
        const searchedItems = sortableItems.filter(item =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
        );

        // Filter by category
        const categorizedItems = filterCategory === 'all'
            ? searchedItems
            : searchedItems.filter(item => item.category === filterCategory);

        // Sort items
        if (sortConfig.key) {
            categorizedItems.sort((a, b) => {
                const aValue = typeof a[sortConfig.key] === 'string' ? a[sortConfig.key].toLowerCase() : a[sortConfig.key];
                const bValue = typeof b[sortConfig.key] === 'string' ? b[sortConfig.key].toLowerCase() : b[sortConfig.key];

                if (aValue < bValue) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return categorizedItems;
    }, [stockItems, searchTerm, filterCategory, sortConfig]);

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = processedItems.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(processedItems.length / itemsPerPage);

    // Open/Close Item Modal
    const openItemModal = (item = null) => {
        if (item) {
            setEditingItem(item);
            setItemForm({
                name: item.name,
                category: item.category,
                quantity: item.quantity,
                price: item.price,
                dateAdded: item.dateAdded || '',
                description: item.description || '',
                image: null,
            });
        } else {
            setEditingItem(null);
            setItemForm({
                name: '',
                category: '',
                quantity: '',
                price: '',
                dateAdded: new Date().toISOString().slice(0, 10),
                description: '',
                image: null,
            });
        }
        setShowItemModal(true);
    };

    // Handle item form submission (Add/Edit)
    const handleItemSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append("name", itemForm.name);
            formData.append("category", itemForm.category);
            formData.append("quantity", itemForm.quantity);
            formData.append("price", itemForm.price);
            formData.append("description", itemForm.description);
            formData.append("dateAdded", itemForm.dateAdded);

            if (itemForm.image) {
                formData.append("image", itemForm.image);
            }

            if (editingItem) {
                await axios.put(`${BASE_URL}/stock/${editingItem.id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                toast.success("Item updated successfully!", { position: "bottom-center" });
            } else {
                await axios.post(`${BASE_URL}/stock`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                toast.success("Item added successfully!", { position: "bottom-center" });
            }

            const response = await axios.get(`${BASE_URL}/stock`);
            setStockItems(response.data);
            setShowItemModal(false);
            setEditingItem(null);
            setCurrentPage(1);
        } catch (err) {
            setError(err.message);
            toast.error("Failed to save item. " + (err.response?.data?.message || err.message), { position: "bottom-center" });
        }
    };

    // Handle category form submission
    const handleCategorySubmit = async (e) => {
        e.preventDefault();
        if (!categoryName.trim()) {
            toast.error("Category name cannot be empty.", { position: "bottom-center" });
            return;
        }
        try {
            await axios.post(`${BASE_URL}/categories`, { name: categoryName });
            const catRes = await axios.get(`${BASE_URL}/categories`);
            setCategories(catRes.data);
            setShowCategoryModal(false);
            setCategoryName('');
            toast.success("Category added successfully!", { position: "bottom-center" });
        } catch (err) {
            const message = err.response?.data?.message || 'Failed to add category. Please try again.';
            toast.error(message, { position: 'bottom-center' });
        }
    };

    // Handle pagination clicks
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // Loading and Error States
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[500px] bg-white rounded-lg shadow-xl p-8">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-4"></div>
                <p className="text-xl font-semibold text-gray-700">Loading inventory data...</p>
                <p className="text-sm text-gray-500 mt-2">Fetching the latest stock information.</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 bg-red-50 border border-red-200 text-red-700 rounded-lg shadow-md text-center">
                <p className="font-bold text-xl mb-3">Error Loading Data:</p>
                <p className="text-lg">{error}</p>
                <p className="mt-4 text-base">Please try refreshing the dashboard or contact support if the issue persists.</p>
            </div>
        );
    }

        return (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen ">
            {/* Main Container */}
            <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
                {/* Header Section */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 md:p-8 text-white">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold mb-2">Inventory Dashboard</h1>
                            <p className="text-blue-100">Manage your stock items efficiently</p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
                            <button
                                onClick={() => setShowCategoryModal(true)}
                                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all duration-300"
                            >
                                <FiPlus /> Add Category
                            </button>
                            <button
                                onClick={() => openItemModal()}
                                className="bg-white text-blue-700 hover:bg-blue-50 px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all duration-300 font-medium"
                            >
                                <FiPlus /> Add Item
                            </button>
                        </div>
                    </div>
                </div>

                {/* Control Panel */}
                <div className="p-6 border-b border-gray-200 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Search */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FiSearch className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl bg-white shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Search items..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>

                        {/* Category Filter */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FiFilter className="text-gray-400" />
                            </div>
                            <select
                                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl bg-white shadow-sm focus:ring-blue-500 focus:border-blue-500 appearance-none"
                                value={filterCategory}
                                onChange={(e) => {
                                    setFilterCategory(e.target.value);
                                    setCurrentPage(1);
                                }}
                            >
                                <option value="all">All Categories</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Sort */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FiTag className="text-gray-400" />
                            </div>
                            <select
                                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl bg-white shadow-sm focus:ring-blue-500 focus:border-blue-500 appearance-none"
                                value={sortConfig.key}
                                onChange={(e) => handleSort(e.target.value)}
                            >
                                <option value="name">Sort by Name</option>
                                <option value="category">Sort by Category</option>
                                <option value="quantity">Sort by Quantity</option>
                                <option value="price">Sort by Price</option>
                                <option value="dateAdded">Sort by Date Added</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table Section */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Product
                                </th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Details
                                </th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Stock
                                </th>
                                <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {currentItems.length > 0 ? (
                                currentItems.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50 transition-colors duration-150">
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-12 w-12 rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center">
                                                    {item.image ? (
                                                        <img
                                                            className="h-full w-full object-cover"
                                                            src={`${BASE_URL}/stock/${item.id}/image`}
                                                            alt={item.name}
                                                            onError={(e) => {
                                                                e.target.src = 'https://via.placeholder.com/48?text=No+Image';
                                                                e.target.alt = 'Image not available';
                                                            }}
                                                        />
                                                    ) : (
                                                        <FiBox className="text-gray-400 text-xl" />
                                                    )}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-semibold text-gray-900">{item.name}</div>
                                                    <div className="text-xs text-gray-500">{item.category}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="text-sm text-gray-900">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <FiDollarSign className="text-gray-500" />
                                                    <span className="font-medium">
                                                        ₹{item.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <FiCalendar className="text-gray-500" />
                                                    <span className="text-xs text-gray-500">{item.dateAdded}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="flex flex-col gap-1">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium inline-flex items-center justify-center w-24
                                                    ${item.quantity <= 10 && item.quantity > 0 ? 'bg-orange-100 text-orange-800' : 
                                                      item.quantity === 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                                    {item.quantity === 0 ? 'Out of Stock' : `${item.quantity} in stock`}
                                                </span>
                                                {item.description && (
                                                    <div className="text-xs text-gray-500 line-clamp-1 max-w-xs">
                                                        <FiFileText className="inline mr-1" /> {item.description}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-3">
                                                <button
                                                    onClick={() => openItemModal(item)}
                                                    className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                                                    title="Edit Item"
                                                >
                                                    <FiEdit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => confirmDelete(item)}
                                                    className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors"
                                                    title="Delete Item"
                                                >
                                                    <FiTrash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center text-gray-500">
                                            <FiBox size={48} className="mb-4 text-gray-300" />
                                            <h3 className="text-lg font-medium mb-1">No items found</h3>
                                            <p className="text-sm">Try adjusting your search or filters</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                            Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                            <span className="font-medium">{Math.min(indexOfLastItem, processedItems.length)}</span> of{' '}
                            <span className="font-medium">{processedItems.length}</span> items
                        </div>
                        <div className="flex space-x-1">
                            <button
                                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1 rounded-lg border border-gray-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNum;
                                if (totalPages <= 5) {
                                    pageNum = i + 1;
                                } else if (currentPage <= 3) {
                                    pageNum = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i;
                                } else {
                                    pageNum = currentPage - 2 + i;
                                }
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => handlePageChange(pageNum)}
                                        className={`px-3 py-1 rounded-lg text-sm font-medium ${currentPage === pageNum ? 'bg-blue-600 text-white' : 'border border-gray-300'}`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                            {totalPages > 5 && currentPage < totalPages - 2 && (
                                <span className="px-3 py-1 text-sm">...</span>
                            )}
                            {totalPages > 5 && currentPage < totalPages - 2 && (
                                <button
                                    onClick={() => handlePageChange(totalPages)}
                                    className="px-3 py-1 rounded-lg border border-gray-300 text-sm font-medium"
                                >
                                    {totalPages}
                                </button>
                            )}
                            <button
                                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 rounded-lg border border-gray-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals (keep exactly the same as before) */}
            {showItemModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-2xl font-bold text-gray-800">
                                {editingItem ? 'Edit Product' : 'Add New Product'}
                            </h2>
                        </div>
                        <form onSubmit={handleItemSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="itemName" className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                                <input type="text" id="itemName" placeholder="e.g., Gaming Laptop" className="w-full border border-gray-300 rounded-lg p-3 text-gray-800 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                                    value={itemForm.name} onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })} required />
                            </div>
                            <div>
                                <label htmlFor="itemCategory" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <select id="itemCategory" className="w-full border border-gray-300 rounded-lg p-3 bg-white text-gray-800 appearance-none focus:ring-blue-500 focus:border-blue-500 transition duration-200 cursor-pointer"
                                    value={itemForm.category} onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })} required>
                                    <option value="">Select Category</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="itemQuantity" className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                                <input type="number" id="itemQuantity" placeholder="e.g., 50" min="0" className="w-full border border-gray-300 rounded-lg p-3 text-gray-800 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                                    value={itemForm.quantity} onChange={(e) => setItemForm({ ...itemForm, quantity: e.target.value })} required />
                            </div>
                            <div>
                                <label htmlFor="itemPrice" className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                                <input type="number" id="itemPrice" step="0.01" placeholder="e.g., 12500.00" min="0" className="w-full border border-gray-300 rounded-lg p-3 text-gray-800 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                                    value={itemForm.price} onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })} required />
                            </div>
                            <div className="md:col-span-2">
                                <label htmlFor="itemDateAdded" className="block text-sm font-medium text-gray-700 mb-1">Date Added</label>
                                <input type="date" id="itemDateAdded" className="w-full border border-gray-300 rounded-lg p-3 text-gray-800 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                                    value={itemForm.dateAdded} onChange={(e) => setItemForm({ ...itemForm, dateAdded: e.target.value })} required />
                            </div>
                            <div className="md:col-span-2">
                                <label htmlFor="itemDescription" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea id="itemDescription" placeholder="Detailed description of the item..." className="w-full border border-gray-300 rounded-lg p-3 text-gray-800 focus:ring-blue-500 focus:border-blue-500 transition duration-200 min-h-[120px]"
                                    value={itemForm.description} onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })} />
                            </div>
                            <div className="md:col-span-2">
                                <label htmlFor="itemImage" className="block text-sm font-medium text-gray-700 mb-1">Item Image (Optional)</label>
                                <input type="file" id="itemImage" accept="image/*"
                                    onChange={(e) => setItemForm({ ...itemForm, image: e.target.files[0] })}
                                    className="w-full text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition duration-200 cursor-pointer"
                                />
                                {editingItem?.imageUrl && !itemForm.image && (
                                    <p className="text-xs text-gray-500 mt-2">Current image exists. Upload a new one to replace it.</p>
                                )}
                            </div>
                            <div className="md:col-span-2 flex justify-end gap-3 pt-6 border-t border-gray-100">
                                <button type="button" onClick={() => setShowItemModal(false)} className="bg-gray-300 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-400 transition duration-200 font-medium shadow-sm">Cancel</button>
                                <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-200 font-medium shadow-md">
                                    {editingItem ? 'Update Item' : 'Add Item'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Category Modal */}
            {showCategoryModal && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100 opacity-100 animate-slide-in-up">
                        <h2 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-4">Add New Category</h2>
                        <form onSubmit={handleCategorySubmit} className="space-y-6">
                            <div>
                                <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                                <input type="text" id="categoryName" placeholder="e.g., Electronics, Apparel" className="w-full border border-gray-300 rounded-lg p-3 text-gray-800 focus:ring-green-500 focus:border-green-500 transition duration-200"
                                    value={categoryName} onChange={(e) => setCategoryName(e.target.value)} required />
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <button type="button" onClick={() => setShowCategoryModal(false)} className="bg-gray-300 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-400 transition duration-200 font-medium shadow-sm">Cancel</button>
                                <button type="submit" className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition duration-200 font-medium shadow-md">Create Category</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirmModal && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100 opacity-100 animate-slide-in-up">
                        <h2 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-4 text-center">Confirm Deletion</h2>
                        <p className="text-gray-700 text-lg mb-6 text-center">
                            Are you sure you want to delete "<span className="font-semibold text-red-600">{itemToDeleteName}</span>"?
                            This action cannot be undone.
                        </p>
                        <div className="flex justify-center gap-4 pt-4 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={cancelDelete}
                                className="bg-gray-300 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-400 transition duration-200 font-medium shadow-sm"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={executeDelete}
                                className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition duration-200 font-medium shadow-md"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StockInventory;