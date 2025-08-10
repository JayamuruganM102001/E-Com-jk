import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { setupAuthMonitor } from "./authMonitor";
import {
  FiShoppingCart,
  FiPlus,
  FiMinus,
  FiTrash2,
  FiSearch,
  FiLogOut,
  FiUser,
  FiChevronDown,
  FiChevronUp,
  FiBox,
  FiTag,
  FiCheckCircle,
  FiAlertCircle,
  FiXCircle,
  FiHome,
  FiList,
  FiDollarSign,
  FiFilter,
  FiArrowUp,
  FiArrowDown,
  FiHeart,
  FiStar,
  FiShare2,
  FiClock,
} from "react-icons/fi";
import { BASE_URL } from "../api/UserService";
import { toast } from "react-toastify";

const StockItems = () => {
  const [stockItems, setStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });
  const [wishlist, setWishlist] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("name-asc");
  const [selectedItem, setSelectedItem] = useState(null);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [isCategoryHovered, setIsCategoryHovered] = useState(false);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [ratingFilter, setRatingFilter] = useState(0);
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'

  const navigate = useNavigate();
  const userDropdownRef = useRef(null);
  const [loggedInUsername, setLoggedInUsername] = useState("");

  // --- Effects ---
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    document.body.style.overflow = selectedItem ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [selectedItem]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target)
      ) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const username = localStorage.getItem("username");
    const role = localStorage.getItem("role");

    if (role !== "USER") {
      navigate("/login");
      return;
    }

    if (username) {
      setLoggedInUsername(username);
    }

    const cleanupAuthMonitor = setupAuthMonitor();
    return cleanupAuthMonitor;
  }, [navigate]);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/stock`);
        // Add random ratings for demo purposes
        const itemsWithRatings = response.data.map((item) => ({
          ...item,
          rating: (Math.random() * 5).toFixed(1),
          reviewCount: Math.floor(Math.random() * 100),
        }));
        setStockItems(itemsWithRatings);
      } catch (err) {
        setError(err.message);
        toast.error("Failed to load stock items. Please try again.", {
          position: "bottom-center",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  // --- Handlers ---
  const toggleWishlist = (itemId) => {
    setWishlist((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const closeModal = () => {
    setSelectedItem(null);
  };

  const updateQuantityInCart = (id, newQuantity) => {
    setCart((prevCart) => {
      const updatedCart = prevCart.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      );
      return updatedCart.filter((item) => item.quantity > 0);
    });
  };

  const addToCart = (item) => {
    const existingItem = cart.find((cartItem) => cartItem.id === item.id);

    if (existingItem) {
      if (existingItem.quantity + 1 > item.quantity) {
        toast.error("You cannot add more than available stock.", {
          position: "bottom-center",
          autoClose: 1000,
        });
        return;
      }
      updateQuantityInCart(item.id, existingItem.quantity + 1);
      toast.success(`${item.name} quantity updated in cart.`, {
        position: "bottom-center",
        autoClose: 1000,
      });
    } else {
      if (item.quantity === 0) {
        toast.error("This item is out of stock.", {
          position: "bottom-center",
          autoClose: 1000,
        });
        return;
      }
      const newCartItem = {
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
        category: item.category,
        availableQuantity: item.quantity,
        imageUrl: item.imageUrl,
      };
      setCart([...cart, newCartItem]);
      toast.success(`${item.name} added to cart successfully!`, {
        position: "bottom-center",
        autoClose: 1000,
      });
    }
  };

  const removeFromCart = (itemId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== itemId));
    toast.info("Item removed from cart.", {
      position: "bottom-center",
      autoClose: 1000,
    });
  };

  const handleLogout = () => {
    localStorage.clear();
    toast.info("You have been logged out.", { position: "bottom-center" });
    navigate("/login");
  };

  const handleMyOrders = () => {
    setIsUserDropdownOpen(false);
    navigate("/my-orders");
  };

  // --- Memoized Values ---
  const totalCartItems = cart.reduce((total, item) => total + item.quantity, 0);

  const categories = useMemo(() => {
    const uniqueCategories = new Set(stockItems.map((item) => item.category));
    return ["All", ...Array.from(uniqueCategories).sort()];
  }, [stockItems]);

  const filteredAndSortedItems = useMemo(() => {
    let items = stockItems.filter(
      (item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.description &&
          item.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (selectedCategory !== "All") {
      items = items.filter((item) => item.category === selectedCategory);
    }

    // Apply price range filter
    const min = parseFloat(minPrice);
    const max = parseFloat(maxPrice);

    if (!isNaN(min) && min >= 0) {
      items = items.filter((item) => item.price >= min);
    }
    if (!isNaN(max) && max >= 0) {
      items = items.filter((item) => item.price <= max);
    }

    // Apply rating filter
    if (ratingFilter > 0) {
      items = items.filter((item) => parseFloat(item.rating) >= ratingFilter);
    }

    items.sort((a, b) => {
      if (sortBy === "name-asc") return a.name.localeCompare(b.name);
      if (sortBy === "name-desc") return b.name.localeCompare(a.name);
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "rating-desc")
        return parseFloat(b.rating) - parseFloat(a.rating);
      return 0;
    });

    return items;
  }, [
    stockItems,
    searchTerm,
    selectedCategory,
    sortBy,
    minPrice,
    maxPrice,
    ratingFilter,
  ]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-blue-700 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gradient-to-br from-red-50 to-red-100 text-red-700 rounded-lg mx-auto max-w-xl text-center shadow-md mt-10">
        <p className="font-bold text-xl mb-2">Error Loading Items</p>
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-md hover:from-blue-700 hover:to-blue-900 transition"
        >
          Refresh Page
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header - Unchanged as requested */}
      <header className="bg-gradient-to-r from-gray-700 via-blue-600 to-blue-800 shadow-2xl sticky top-0 z-50 py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div
              className="flex items-center cursor-pointer group"
              onClick={() => navigate("/stockItems")}
            >
              <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white p-3 rounded-xl mr-3 shadow-lg transform group-hover:rotate-6 transition duration-300">
                <FiBox size={28} />
              </div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight group-hover:text-blue-200 transition duration-300">
                StockHub
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search Bar - Hidden on mobile */}
              <div className="hidden md:block relative w-64">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg text-gray-700 bg-gray-100 border-none focus:ring-2 focus:ring-blue-500 outline-none transition"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              </div>

              {/* Cart Button */}
              <button
                onClick={() => navigate("/checkout", { state: { cart } })}
                className="relative p-2 text-white hover:text-blue-200 transition"
              >
                <FiShoppingCart size={22} />
                {totalCartItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {totalCartItems}
                  </span>
                )}
              </button>

              {/* User Menu */}
              <div className="relative" ref={userDropdownRef}>
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="p-2 text-white hover:text-blue-200 transition flex items-center gap-1 group"
                  title="User Account"
                >
                  <FiUser size={24} className="group-hover:text-blue-200" />
                  <span className="hidden lg:inline font-medium text-white group-hover:text-blue-200 transition">
                    {loggedInUsername}
                  </span>
                  <FiChevronDown
                    size={18}
                    className={`ml-1 transition-transform duration-200 ${
                      isUserDropdownOpen ? "transform rotate-180" : ""
                    }`}
                  />
                </button>

                {isUserDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 border border-gray-200">
                    <button
                      onClick={handleMyOrders}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <FiBox size={16} /> My Orders
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <FiLogOut size={16} /> Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Search - Visible only on mobile */}
          <div className="mt-3 md:hidden">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 rounded-lg text-gray-700 bg-gray-100 border-none focus:ring-2 focus:ring-blue-500 outline-none transition"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 w-full">
          {/* Sidebar Filters - Desktop */}
          <div className="hidden lg:block col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 sticky top-24">
              <h3 className="font-bold text-xl mb-6 flex items-center gap-2 text-gray-800">
                <FiFilter className="text-blue-600" /> Filters
              </h3>

              {/* Categories Dropdown */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Categories
                </label>
                <div className="relative">
                  <button
                    className="w-full text-left px-4 py-3 rounded-xl text-sm flex items-center justify-between bg-gray-50 border border-gray-200 hover:border-blue-400 transition"
                    onClick={() => setIsCategoryHovered(!isCategoryHovered)}
                  >
                    <span className="text-gray-700">{selectedCategory}</span>
                    {isCategoryHovered ? <FiChevronUp /> : <FiChevronDown />}
                  </button>

                  {isCategoryHovered && (
                    <div className="absolute z-10 mt-1 w-full bg-white rounded-xl shadow-lg py-2 border border-gray-200 max-h-60 overflow-y-auto">
                      {categories.map((category) => (
                        <button
                          key={category}
                          onClick={() => {
                            setSelectedCategory(category);
                            setIsCategoryHovered(false);
                          }}
                          className={`w-full text-left px-4 py-3 text-sm flex items-center gap-3 transition
                            ${
                              selectedCategory === category
                                ? "bg-blue-50 text-blue-700 font-medium"
                                : "text-gray-600 hover:bg-gray-50"
                            }`}
                        >
                          <FiTag className="text-blue-500" size={14} />
                          {category}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Price Range (₹)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-400 bg-gray-50"
                  />
                  <span className="text-gray-400">to</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-400 bg-gray-50"
                  />
                </div>
              </div>

              {/* Rating Filter */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Minimum Rating
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() =>
                        setRatingFilter(ratingFilter === star ? 0 : star)
                      }
                      className={`p-2 rounded-lg ${
                        ratingFilter >= star
                          ? "text-yellow-500 bg-yellow-50"
                          : "text-gray-300 bg-gray-50"
                      } hover:bg-yellow-50 transition`}
                    >
                      <FiStar size={18} className="fill-current" />
                    </button>
                  ))}
                  {ratingFilter > 0 && (
                    <button
                      onClick={() => setRatingFilter(0)}
                      className="ml-2 text-xs text-gray-500 hover:text-gray-700"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Sort Options */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Sort By
                </label>
                <div className="space-y-2">
                  <button
                    onClick={() => setSortBy("name-asc")}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm flex items-center gap-3 transition
                      ${
                        sortBy === "name-asc"
                          ? "bg-blue-50 text-blue-700 font-medium border border-blue-100"
                          : "text-gray-600 hover:bg-gray-50 border border-transparent"
                      }`}
                  >
                    <FiArrowUp size={16} className="text-blue-500" />
                    Name (A-Z)
                  </button>
                  <button
                    onClick={() => setSortBy("name-desc")}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm flex items-center gap-3 transition
                      ${
                        sortBy === "name-desc"
                          ? "bg-blue-50 text-blue-700 font-medium border border-blue-100"
                          : "text-gray-600 hover:bg-gray-50 border border-transparent"
                      }`}
                  >
                    <FiArrowDown size={16} className="text-blue-500" />
                    Name (Z-A)
                  </button>
                  <button
                    onClick={() => setSortBy("price-asc")}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm flex items-center gap-3 transition
                      ${
                        sortBy === "price-asc"
                          ? "bg-blue-50 text-blue-700 font-medium border border-blue-100"
                          : "text-gray-600 hover:bg-gray-50 border border-transparent"
                      }`}
                  >
                    <FiDollarSign size={16} className="text-blue-500" />
                    Price (Low to High)
                  </button>
                  <button
                    onClick={() => setSortBy("price-desc")}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm flex items-center gap-3 transition
                      ${
                        sortBy === "price-desc"
                          ? "bg-blue-50 text-blue-700 font-medium border border-blue-100"
                          : "text-gray-600 hover:bg-gray-50 border border-transparent"
                      }`}
                  >
                    <FiDollarSign size={16} className="text-blue-500" />
                    Price (High to Low)
                  </button>
                  <button
                    onClick={() => setSortBy("rating-desc")}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm flex items-center gap-3 transition
                      ${
                        sortBy === "rating-desc"
                          ? "bg-blue-50 text-blue-700 font-medium border border-blue-100"
                          : "text-gray-600 hover:bg-gray-50 border border-transparent"
                      }`}
                  >
                    <FiStar
                      size={16}
                      className="text-yellow-500 fill-current"
                    />
                    Top Rated
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Product Content Area */}
          <div className="flex-grow col-span-1 lg:col-span-1">
            {/* View Toggle and Results Count */}
            <div className="flex justify-between items-center mb-6">
              <div className="text-sm text-gray-600">
                Showing{" "}
                <span className="font-semibold">
                  {filteredAndSortedItems.length}
                </span>{" "}
                products
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg ${
                    viewMode === "grid"
                      ? "bg-blue-100 text-blue-600"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg ${
                    viewMode === "list"
                      ? "bg-blue-100 text-blue-600"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Mobile Filter Toggle */}
            <div className="lg:hidden mb-6">
              <button
                onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
                className="w-full flex items-center justify-between px-5 py-3 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-blue-400 transition"
              >
                <span className="font-medium text-gray-700">Filters</span>
                {isMobileFiltersOpen ? <FiChevronUp /> : <FiChevronDown />}
              </button>

              {/* Mobile Filters Content */}
              {isMobileFiltersOpen && (
                <div className="bg-white p-5 mt-3 rounded-xl shadow-sm border border-gray-200">
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categories
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:ring-2 focus:ring-blue-300 focus:border-blue-400"
                    >
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price Range (₹)
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        placeholder="Min"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:ring-2 focus:ring-blue-300 focus:border-blue-400"
                      />
                      <span className="text-gray-400">to</span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:ring-2 focus:ring-blue-300 focus:border-blue-400"
                      />
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Rating
                    </label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() =>
                            setRatingFilter(ratingFilter === star ? 0 : star)
                          }
                          className={`p-2 rounded-lg ${
                            ratingFilter >= star
                              ? "text-yellow-500 bg-yellow-50"
                              : "text-gray-300 bg-gray-50"
                          } hover:bg-yellow-50 transition`}
                        >
                          <FiStar size={18} className="fill-current" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sort By
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:ring-2 focus:ring-blue-300 focus:border-blue-400"
                    >
                      <option value="name-asc">Name (A-Z)</option>
                      <option value="name-desc">Name (Z-A)</option>
                      <option value="price-asc">Price (Low to High)</option>
                      <option value="price-desc">Price (High to Low)</option>
                      <option value="rating-desc">Top Rated</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Product Display */}
            {filteredAndSortedItems.length === 0 ? (
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center">
                <FiSearch size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-medium text-gray-700 mb-2">
                  No items found
                </h3>
                <p className="text-gray-500 mb-4">
                  Try adjusting your search or filters
                </p>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("All");
                    setSortBy("name-asc");
                    setMinPrice("");
                    setMaxPrice("");
                    setRatingFilter(0);
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg hover:from-blue-700 hover:to-blue-900 transition"
                >
                  Reset Filters
                </button>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredAndSortedItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="relative">
                      <div
                        className="h-48 w-full bg-gray-100 cursor-pointer"
                        onClick={() => setSelectedItem(item)}
                      >
                        <img
                          src={`${BASE_URL}/stock/${item.id}/image`}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src =
                              "https://via.placeholder.com/300x200?text=No+Image";
                          }}
                        />
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWishlist(item.id);
                        }}
                        className={`absolute top-3 left-3 p-2 rounded-full ${
                          wishlist.includes(item.id)
                            ? "text-red-500 bg-white"
                            : "text-gray-400 bg-white"
                        } shadow-md hover:text-red-500 transition`}
                      >
                        <FiHeart
                          className={
                            wishlist.includes(item.id) ? "fill-current" : ""
                          }
                        />
                      </button>
                      <div className="absolute top-3 right-3 flex flex-col gap-2">
                        {item.quantity === 0 ? (
                          <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center">
                            <FiXCircle size={12} className="mr-1" /> Out of
                            Stock
                          </span>
                        ) : item.quantity <= 10 ? (
                          <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center">
                            <FiAlertCircle size={12} className="mr-1" /> Low
                            Stock
                          </span>
                        ) : (
                          <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center">
                            <FiCheckCircle size={12} className="mr-1" /> In
                            Stock
                          </span>
                        )}
                        {item.discount && (
                          <span className="bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
                            {item.discount}% OFF
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3
                          className="font-semibold text-gray-800 line-clamp-1 cursor-pointer hover:text-blue-600 transition"
                          onClick={() => setSelectedItem(item)}
                        >
                          {item.name}
                        </h3>
                        <span className="text-xs text-gray-500 flex items-center bg-gray-100 px-2 py-1 rounded">
                          <FiTag className="mr-1" size={12} />
                          {item.category}
                        </span>
                      </div>

                      <div className="flex items-center mb-2">
                        <div className="flex items-center mr-2">
                          <FiStar
                            className="text-yellow-500 fill-current"
                            size={14}
                          />
                          <span className="text-sm font-medium text-gray-800 ml-1">
                            {item.rating}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          ({item.reviewCount} reviews)
                        </span>
                      </div>

                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-blue-600 font-bold text-lg">
                            ₹{item.price.toFixed(2)}
                          </p>
                          {item.originalPrice && (
                            <p className="text-xs text-gray-400 line-through">
                              ₹{item.originalPrice.toFixed(2)}
                            </p>
                          )}
                        </div>
                        {item.quantity > 0 && (
                          <span className="text-xs text-gray-500 flex items-center">
                            <FiClock className="mr-1" size={12} />
                            {item.quantity} available
                          </span>
                        )}
                      </div>

                      {cart.some((c) => c.id === item.id) ? (
                        <div className="flex items-center justify-between bg-gray-100 rounded-full px-3 py-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const existing = cart.find(
                                (c) => c.id === item.id
                              );
                              if (existing.quantity > 1) {
                                updateQuantityInCart(
                                  item.id,
                                  existing.quantity - 1
                                );
                              } else {
                                removeFromCart(item.id);
                              }
                            }}
                            className="p-1 text-gray-600 hover:text-blue-600"
                          >
                            <FiMinus size={18} />
                          </button>
                          <span className="font-medium">
                            {cart.find((c) => c.id === item.id).quantity}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const existing = cart.find(
                                (c) => c.id === item.id
                              );
                              if (existing.quantity < item.quantity) {
                                updateQuantityInCart(
                                  item.id,
                                  existing.quantity + 1
                                );
                              } else {
                                toast.error("Max quantity reached");
                              }
                            }}
                            className="p-1 text-gray-600 hover:text-blue-600"
                          >
                            <FiPlus size={18} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFromCart(item.id);
                            }}
                            className="p-1 text-gray-600 hover:text-red-600 ml-1"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(item);
                          }}
                          disabled={item.quantity === 0}
                          className={`w-full py-2 rounded-full text-sm font-medium transition flex items-center justify-center gap-2
                            ${
                              item.quantity === 0
                                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                : "bg-gradient-to-r from-blue-600 to-blue-800 text-white hover:from-blue-700 hover:to-blue-900"
                            }`}
                        >
                          <FiShoppingCart size={16} />
                          Add to Cart
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAndSortedItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-1/4 relative">
                        <div
                          className="h-48 w-full bg-gray-100 cursor-pointer"
                          onClick={() => setSelectedItem(item)}
                        >
                          <img
                            src={`${BASE_URL}/stock/${item.id}/image`}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src =
                                "https://via.placeholder.com/300x200?text=No+Image";
                            }}
                          />
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWishlist(item.id);
                          }}
                          className={`absolute top-3 left-3 p-2 rounded-full ${
                            wishlist.includes(item.id)
                              ? "text-red-500 bg-white"
                              : "text-gray-400 bg-white"
                          } shadow-md hover:text-red-500 transition`}
                        >
                          <FiHeart
                            className={
                              wishlist.includes(item.id) ? "fill-current" : ""
                            }
                          />
                        </button>
                      </div>

                      <div className="md:w-3/4 p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3
                              className="font-semibold text-lg text-gray-800 cursor-pointer hover:text-blue-600 transition"
                              onClick={() => setSelectedItem(item)}
                            >
                              {item.name}
                            </h3>
                            <span className="text-xs text-gray-500 flex items-center mt-1">
                              <FiTag className="mr-1" size={12} />
                              {item.category}
                            </span>
                          </div>
                          <div className="flex flex-col items-end">
                            <p className="text-blue-600 font-bold text-xl">
                              ₹{item.price.toFixed(2)}
                            </p>
                            {item.originalPrice && (
                              <p className="text-xs text-gray-400 line-through">
                                ₹{item.originalPrice.toFixed(2)}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center mb-3">
                          <div className="flex items-center mr-2">
                            <FiStar
                              className="text-yellow-500 fill-current"
                              size={16}
                            />
                            <span className="text-sm font-medium text-gray-800 ml-1">
                              {item.rating}
                            </span>
                            <span className="text-xs text-gray-500 ml-1">
                              ({item.reviewCount} reviews)
                            </span>
                          </div>
                          {item.quantity > 0 && (
                            <span className="text-xs text-gray-500 flex items-center ml-3">
                              <FiClock className="mr-1" size={12} />
                              {item.quantity} available
                            </span>
                          )}
                        </div>

                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {item.description || "No description available."}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {item.quantity === 0 ? (
                              <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded">
                                Out of Stock
                              </span>
                            ) : item.quantity <= 10 ? (
                              <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded">
                                Low Stock
                              </span>
                            ) : (
                              <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                                In Stock
                              </span>
                            )}
                            {item.discount && (
                              <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded">
                                {item.discount}% OFF
                              </span>
                            )}
                          </div>

                          {cart.some((c) => c.id === item.id) ? (
                            <div className="flex items-center bg-gray-100 rounded-full px-3 py-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const existing = cart.find(
                                    (c) => c.id === item.id
                                  );
                                  if (existing.quantity > 1) {
                                    updateQuantityInCart(
                                      item.id,
                                      existing.quantity - 1
                                    );
                                  } else {
                                    removeFromCart(item.id);
                                  }
                                }}
                                className="p-1 text-gray-600 hover:text-blue-600"
                              >
                                <FiMinus size={18} />
                              </button>
                              <span className="font-medium mx-2">
                                {cart.find((c) => c.id === item.id).quantity}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const existing = cart.find(
                                    (c) => c.id === item.id
                                  );
                                  if (existing.quantity < item.quantity) {
                                    updateQuantityInCart(
                                      item.id,
                                      existing.quantity + 1
                                    );
                                  } else {
                                    toast.error("Max quantity reached");
                                  }
                                }}
                                className="p-1 text-gray-600 hover:text-blue-600"
                              >
                                <FiPlus size={18} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeFromCart(item.id);
                                }}
                                className="p-1 text-gray-600 hover:text-red-600 ml-1"
                              >
                                <FiTrash2 size={16} />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                addToCart(item);
                              }}
                              disabled={item.quantity === 0}
                              className={`px-4 py-2 rounded-full text-sm font-medium transition flex items-center justify-center gap-2
                                ${
                                  item.quantity === 0
                                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                    : "bg-gradient-to-r from-blue-600 to-blue-800 text-white hover:from-blue-700 hover:to-blue-900"
                                }`}
                            >
                              <FiShoppingCart size={16} />
                              Add to Cart
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Product Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="relative">
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-md text-gray-600 hover:text-gray-900"
              >
                <FiXCircle size={24} />
              </button>

              <div className="grid md:grid-cols-2">
                <div className="bg-gray-100 p-6 flex items-center justify-center">
                  <img
                    src={`${BASE_URL}/stock/${selectedItem.id}/image`}
                    alt={selectedItem.name}
                    className="max-h-96 object-contain"
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/400x300?text=No+Image";
                    }}
                  />
                </div>

                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {selectedItem.name}
                      </h2>
                      <div className="flex items-center text-gray-600 mb-4">
                        <FiTag className="mr-1" />
                        <span>{selectedItem.category}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleWishlist(selectedItem.id)}
                      className={`p-2 rounded-full ${
                        wishlist.includes(selectedItem.id)
                          ? "text-red-500"
                          : "text-gray-400"
                      } hover:text-red-500 transition`}
                    >
                      <FiHeart
                        size={24}
                        className={
                          wishlist.includes(selectedItem.id)
                            ? "fill-current"
                            : ""
                        }
                      />
                    </button>
                  </div>

                  <div className="flex items-center mb-4">
                    <div className="flex items-center mr-3">
                      <FiStar
                        className="text-yellow-500 fill-current"
                        size={18}
                      />
                      <span className="font-medium text-gray-800 ml-1">
                        {selectedItem.rating}
                      </span>
                      <span className="text-sm text-gray-500 ml-1">
                        ({selectedItem.reviewCount} reviews)
                      </span>
                    </div>
                    <button className="text-blue-600 text-sm font-medium flex items-center">
                      <FiShare2 size={16} className="mr-1" /> Share
                    </button>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-baseline gap-3">
                      <span className="text-3xl font-bold text-blue-600">
                        ₹{selectedItem.price.toFixed(2)}
                      </span>
                      {selectedItem.originalPrice && (
                        <span className="text-lg text-gray-400 line-through">
                          ₹{selectedItem.originalPrice.toFixed(2)}
                        </span>
                      )}
                      {selectedItem.discount && (
                        <span className="bg-purple-100 text-purple-800 text-sm font-medium px-2 py-1 rounded">
                          {selectedItem.discount}% OFF
                        </span>
                      )}
                    </div>
                    <div className="mt-3">
                      {selectedItem.quantity === 0 ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                          <FiXCircle className="mr-1" /> Out of Stock
                        </span>
                      ) : selectedItem.quantity <= 10 ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                          <FiAlertCircle className="mr-1" /> Only{" "}
                          {selectedItem.quantity} left
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          <FiCheckCircle className="mr-1" /> In Stock
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-800 mb-2">
                      Description
                    </h3>
                    <p className="text-gray-700">
                      {selectedItem.description || "No description available."}
                    </p>
                  </div>

                  <div className="flex flex-col space-y-3">
                    {cart.some((item) => item.id === selectedItem.id) ? (
                      <>
                        <button
                          onClick={() => {
                            closeModal();
                            navigate("/checkout", { state: { cart } });
                          }}
                          className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-lg font-medium flex items-center justify-center hover:from-orange-600 hover:to-orange-700 transition"
                        >
                          <FiShoppingCart className="mr-2" /> Go to Cart (
                          {cart.find((i) => i.id === selectedItem.id).quantity})
                        </button>
                        <button
                          onClick={closeModal}
                          className="border border-gray-300 py-3 rounded-lg font-medium hover:bg-gray-50 transition"
                        >
                          Continue Shopping
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            addToCart(selectedItem);
                            closeModal();
                          }}
                          disabled={selectedItem.quantity === 0}
                          className={`py-3 rounded-lg font-medium flex items-center justify-center transition
                            ${
                              selectedItem.quantity === 0
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : "bg-gradient-to-r from-blue-600 to-blue-800 text-white hover:from-blue-700 hover:to-blue-900"
                            }`}
                        >
                          <FiPlus className="mr-2" /> Add to Cart
                        </button>
                        <button
                          onClick={() => {
                            if (
                              !cart.some((item) => item.id === selectedItem.id)
                            ) {
                              addToCart(selectedItem);
                            }
                            closeModal();
                            navigate("/checkout", { state: { cart } });
                          }}
                          disabled={selectedItem.quantity === 0}
                          className={`py-3 rounded-lg font-medium flex items-center justify-center transition
                            ${
                              selectedItem.quantity === 0
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : "bg-gradient-to-r from-green-600 to-green-800 text-white hover:from-green-700 hover:to-green-900"
                            }`}
                        >
                          <FiShoppingCart className="mr-2" /> Buy Now
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer - Unchanged as requested */}
      <footer className="bg-gradient-to-r from-gray-700 via-blue-600 to-blue-800 text-white py-8 mt-auto shadow-inner animate-slide-in-up">
        <div className="container mx-auto px-4 text-center">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 border-b border-blue-300 pb-6">
            <div className="flex items-center mb-4 md:mb-0">
              <FiBox className="text-blue-200 text-4xl mr-3" />
              <span className="text-3xl font-extrabold text-white">
                StockHub
              </span>
            </div>
            <nav className="flex space-x-6">
              <a
                href="#"
                className="hover:text-blue-200 transition duration-200"
              >
                About Us
              </a>
              <a
                href="#"
                className="hover:text-blue-200 transition duration-200"
              >
                Contact
              </a>
              <a
                href="#"
                className="hover:text-blue-200 transition duration-200"
              >
                Privacy Policy
              </a>
            </nav>
          </div>
          <p className="text-sm text-blue-200">
            © {new Date().getFullYear()} StockHub. All rights reserved.
          </p>
          <p className="mt-2 text-sm text-blue-300">
            Your ultimate solution for seamless inventory management and online
            shopping.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default StockItems;
