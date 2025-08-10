import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { setupAuthMonitor } from "./authMonitor";
import {
  FiShoppingCart,
  FiSearch,
  FiLogOut,
  FiUser,
  FiChevronDown,
  FiBox,
  FiTag,
  FiCheckCircle,
  FiAlertCircle,
  FiXCircle,
  FiArrowRight,
  FiArrowLeft,
  FiStar,
  FiClock,
  FiTruck,
} from "react-icons/fi";
import { BASE_URL } from "../api/UserService";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const categoryImages = {
  "Home Appliances": "/Home-Appliances.jpg",
  Groceries: "/Groceries.jpg",
  Furniture: "/Furniture.jpg",
  Fashion: "/Fashion.jpg",
  Electronics: "/Electronics.jpg",
  Books: "/Books.jpg",
  Beauty: "/Beauty.jpg",
  Automotive: "/Automotive.jpg",
  Toys: "/Toys.jpg",
  Stationery: "/Stationery.jpg",
  default: "/default-category.jpg",
};

const HomePage = () => {
  const [stockItems, setStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [loggedInUsername, setLoggedInUsername] = useState("");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [actionRequiringLogin, setActionRequiringLogin] = useState(null);
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const [categoryStartIndices, setCategoryStartIndices] = useState({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryItems, setCategoryItems] = useState([]);

  const navigate = useNavigate();
  const userDropdownRef = useRef(null);

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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const bannerImages = [
    "/img1.jpg",
    "/img2.jpg",
    "/img3.jpg",
    "/img4.jpg",
    "/img5.jpg",
    "/img6.jpg",
    "/img7.jpg",
    "/img8.jpg",
    "/img9.jpg",
    "/img10.jpg",
  ];

  const fetchItems = async (category = null) => {
    try {
      setLoading(true);
      let url = `${BASE_URL}/stock`;
      if (category) {
        url += `?category=${encodeURIComponent(category)}`;
      }
      const response = await axios.get(url);

      if (category) {
        const filteredItems = response.data.filter(
          (item) => item.category === category
        );
        setCategoryItems(filteredItems);
      } else {
        setStockItems(response.data);
        const indices = {};
        const uniqueCategories = [
          ...new Set(response.data.map((item) => item.category)),
        ];
        uniqueCategories.forEach((cat) => {
          indices[cat] = 0;
        });
        setCategoryStartIndices(indices);
      }
    } catch (err) {
      setError(err.message);
      toast.error("Failed to load stock items. Please try again.", {
        position: "bottom-center",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveBannerIndex((prev) => (prev + 1) % bannerImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [bannerImages.length]);

  const handleLogout = async () => {
    try {
      await axios.post(
        `${BASE_URL}/auth/logout`,
        {},
        { withCredentials: true }
      );
      setIsLoggedIn(false);
      setLoggedInUsername("");
      toast.info("You have been logged out.", { position: "bottom-center" });
      navigate("/login");
    } catch (err) {
      toast.error("Logout failed. Please try again.", {
        position: "bottom-center",
      });
    }
  };

  const handleMyOrders = () => {
    if (!isLoggedIn) {
      promptLogin("view your orders");
      return;
    }
    setIsUserDropdownOpen(false);
    navigate("/my-orders");
  };

  const promptLogin = (action) => {
    setActionRequiringLogin(action);
    setShowLoginModal(true);
  };

  const handleLogin = () => {
    setShowLoginModal(false);
    navigate("/login");
  };

  const handleContinueWithoutLogin = () => {
    setShowLoginModal(false);
  };

  const handleAddToCart = (item) => {
    if (!isLoggedIn) {
      promptLogin("add items to cart");
      return;
    }
    toast.success(`'${item.name}' added to cart!`, {
      position: "bottom-center",
    });
  };

  const handleQuickView = (item) => {
    if (!isLoggedIn) {
      promptLogin("view product details");
      return;
    }
    toast.info(`Quick view for '${item.name}'`, { position: "bottom-center" });
  };

  const handleCategoryNavigation = (category, direction) => {
    setCategoryStartIndices((prevIndices) => {
      const items = selectedCategory
        ? categoryItems
        : productsByCategory[category] || [];
      const currentIndex = prevIndices[category] || 0;
      const newIndex =
        direction === "left"
          ? Math.max(0, currentIndex - 1)
          : currentIndex + 5 < items.length
          ? currentIndex + 1
          : currentIndex;

      return { ...prevIndices, [category]: newIndex };
    });
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    fetchItems(category);
  };

  const handleClearCategory = () => {
    setSelectedCategory(null);
    setCategoryItems([]);
  };

  const getVisibleProducts = (category) => {
    const items =
      selectedCategory === category
        ? categoryItems
        : productsByCategory[category] || [];
    const startIndex = categoryStartIndices[category] || 0;
    return items.slice(startIndex, startIndex + 5);
  };

  const categories = useMemo(() => {
    return [...new Set(stockItems.map((item) => item.category))].sort();
  }, [stockItems]);

  const productsByCategory = useMemo(() => {
    const result = {};
    categories.forEach((category) => {
      result[category] = stockItems.filter(
        (item) => item.category === category
      );
    });
    return result;
  }, [stockItems, categories]);

  const featuredProducts = useMemo(() => {
    const allItems = [...stockItems];
    const shuffled = allItems.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 4);
  }, [stockItems]);

  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const itemsToSearch = selectedCategory ? categoryItems : stockItems;
    return itemsToSearch.filter(
      (item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [stockItems, categoryItems, searchTerm, selectedCategory]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-100 via-gray-100 to-white">
        <div className="flex flex-col items-center animate-pulse">
          <FiBox className="text-blue-600 text-5xl sm:text-6xl mb-4 animate-bounce" />
          <div className="h-6 w-40 sm:w-48 bg-blue-200 rounded-lg mb-2"></div>
          <div className="h-4 w-28 sm:w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6 bg-gradient-to-r from-gray-200 to-blue-200 text-blue-900 rounded-2xl mx-auto max-w-md sm:max-w-xl text-center shadow-2xl mt-10 sm:mt-20 border border-blue-300 animate-slide-in-left">
        <FiAlertCircle size={40} className="mx-auto mb-4 text-blue-700" />
        <p className="font-extrabold text-xl sm:text-2xl mb-3">Something Went Wrong!</p>
        <p className="text-base sm:text-lg mb-6">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition duration-300 ease-in-out transform hover:scale-105 shadow-lg"
        >
          Refresh Page
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-gradient-to-r from-gray-700 via-blue-600 to-blue-800 shadow-2xl sticky top-0 z-50 py-3 sm:py-4 animate-slide-in-down">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div
              className="flex items-center cursor-pointer group"
              onClick={handleClearCategory}
            >
              <div className="bg-gradient-to-br from-blue-400 to-white text-gray-700 p-2 sm:p-3 rounded-xl mr-2 sm:mr-3 shadow-lg transform group-hover:scale-110 transition duration-300">
                <FiBox size={24} />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight group-hover:text-blue-200 transition duration-300">
                StockHub
              </h1>
            </div>

            <div className="hidden md:block relative flex-grow max-w-md mx-4 sm:mx-8">
              <input
                type="text"
                placeholder="Search for products, categories..."
                className="w-full pl-10 pr-4 py-2 sm:py-3 rounded-full text-gray-800 bg-white border border-gray-300 focus:ring-4 focus:ring-blue-300 focus:border-blue-500 outline-none transition-all duration-300 shadow-lg animate-slide-in-right"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-600 text-lg sm:text-xl" />
            </div>

            <div className="flex items-center space-x-3 sm:space-x-6">
              <button
                onClick={() => {
                  if (!isLoggedIn) {
                    promptLogin("view your cart");
                    return;
                  }
                  navigate("/cart");
                }}
                className="p-2 text-white hover:text-blue-200 transition duration-200 transform hover:scale-110"
                title="View Cart"
              >
                <FiShoppingCart size={20} sm={24} />
              </button>

              {isLoggedIn ? (
                <div className="relative" ref={userDropdownRef}>
                  <button
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    className="p-2 text-white hover:text-blue-200 transition flex items-center gap-1 group"
                    title="User Account"
                  >
                    <FiUser size={20} sm={24} className="group-hover:text-blue-200" />
                    <FiChevronDown
                      size={16} sm={18}
                      className={`ml-1 transition-transform duration-200 ${
                        isUserDropdownOpen ? "transform rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isUserDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 sm:w-56 bg-white rounded-xl shadow-2xl py-2 z-20 border border-gray-200 animate-fade-in-down">
                      <div className="px-3 sm:px-4 py-2 text-sm text-gray-700 border-b border-gray-200">
                        Hello,{" "}
                        <span className="font-semibold text-blue-600">
                          {loggedInUsername}
                        </span>
                      </div>
                      <button
                        onClick={handleMyOrders}
                        className="w-full text-left px-3 sm:px-4 py-2 sm:py-3 text-gray-800 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2 sm:gap-3 transition duration-200"
                      >
                        <FiBox size={16} sm={18} className="text-blue-600" /> My Orders
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-3 sm:px-4 py-2 sm:py-3 text-gray-800 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2 sm:gap-3 transition duration-200 border-t border-gray-200 mt-1 pt-2 sm:pt-3"
                      >
                        <FiLogOut size={16} sm={18} className="text-blue-600" /> Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => navigate("/login")}
                  className="bg-gradient-to-r from-blue-400 to-white text-gray-700 px-3 sm:px-5 py-1 sm:py-2 rounded-full font-semibold flex items-center gap-1 sm:gap-2 hover:from-blue-500 hover:to-gray-100 transition duration-300 transform hover:scale-105 shadow-lg text-sm sm:text-base"
                >
                  <FiUser size={16} sm={20} /> Login / Register
                </button>
              )}
            </div>
          </div>

          <div className="mt-3 md:hidden">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-8 pr-3 py-2 rounded-lg text-gray-800 bg-white border-none focus:ring-2 focus:ring-blue-400 outline-none transition animate-slide-in-right"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FiSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-blue-600" />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {!selectedCategory && (
          <section className="relative bg-gradient-to-r from-gray-700 via-blue-600 to-blue-800 text-white py-12 sm:py-16 animate-slide-in-left">
            <div className="container mx-auto px-4 flex flex-col md:flex-row items-center">
              <div className="w-full md:w-1/2 mb-8 md:mb-0">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 leading-tight animate-fade-in-down text-white">
                  Discover Vibrant Deals
                </h1>
                <p className="text-lg sm:text-xl mb-6 sm:mb-8 text-blue-200 max-w-md animate-fade-in-down delay-100">
                  Explore the latest trends in electronics, fashion, and more
                  with unbeatable offers.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <button
                    onClick={() => navigate("/products")}
                    className="bg-gradient-to-r from-gray-700 to-blue-800 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-bold hover:from-blue-800 hover:to-gray-700 transition duration-300 shadow-lg animate-pulse-slow"
                  >
                    Shop Now
                  </button>
                  <button
                    onClick={() => navigate("/categories")}
                    className="border-2 border-blue-200 px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-bold hover:bg-blue-200 hover:text-gray-800 transition duration-300 shadow-lg animate-pulse-slow"
                  >
                    Browse Categories
                  </button>
                </div>
              </div>

              <div className="w-full md:w-1/2 flex justify-center relative min-h-0">
                <div className="relative w-full max-w-sm sm:max-w-md h-48 sm:h-56 md:h-64 rounded-xl shadow-2xl overflow-hidden animate-slide-in-right">
                  {bannerImages.map((img, index) => (
                    <div
                      key={index}
                      className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                        index === activeBannerIndex
                          ? "opacity-100"
                          : "opacity-0"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Promotional banner ${index + 1}`}
                        className="w-full h-full object-cover rounded-xl shadow-[inset_0_0_30px_rgba(0,0,0,0.3)]"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        <div className="container mx-auto px-4 py-8 sm:py-10">
          {searchTerm ? (
            <section className="bg-gradient-to-br from-blue-100 to-indigo-100 p-4 sm:p-6 rounded-2xl shadow-2xl animate-slide-in-left">
              <h2 className="text-2xl sm:text-3xl font-extrabold mb-4 sm:mb-6 text-indigo-800">
                Search Results for "{searchTerm}"
              </h2>
              {filteredItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                  {filteredItems.map((item) => (
                    <ProductCard
                      key={item.id}
                      item={item}
                      handleAddToCart={handleAddToCart}
                      handleQuickView={handleQuickView}
                    />
                  ))}
                </div>
              ) : (
                <div className="p-4 sm:p-6 text-center text-indigo-600 animate-fade-in-down">
                  <FiAlertCircle size={36} sm={48} className="mx-auto mb-4" />
                  <p className="text-base sm:text-lg font-medium">
                    No products found matching your search.
                  </p>
                </div>
              )}
            </section>
          ) : selectedCategory ? (
            <section className="py-8 sm:py-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl shadow-2xl animate-slide-in-left">
              <div className="container mx-auto px-4">
                <div className="flex items-center mb-6 sm:mb-8">
                  <button
                    onClick={handleClearCategory}
                    className="mr-3 sm:mr-4 text-indigo-600 hover:text-indigo-800"
                  >
                    <FiArrowLeft size={20} sm={24} />
                  </button>
                  <div className="w-12 sm:w-16 h-12 sm:h-16 rounded-full overflow-hidden mr-3 sm:mr-4 border-4 border-white shadow-lg animate-pulse-slow">
                    <img
                      src={
                        categoryImages[selectedCategory] ||
                        categoryImages.default
                      }
                      alt={selectedCategory}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = categoryImages.default;
                      }}
                    />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold capitalize animate-fade-in-down text-indigo-800">
                    {selectedCategory}
                  </h2>
                </div>

                {categoryItems.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                    {categoryItems.map((item) => (
                      <ProductCard
                        key={item.id}
                        item={item}
                        handleAddToCart={handleAddToCart}
                        handleQuickView={handleQuickView}
                    />
                  ))}
                </div>
              ) : (
                <div className="p-4 sm:p-6 text-center text-indigo-600 animate-fade-in-down">
                  <FiAlertCircle size={36} sm={48} className="mx-auto mb-4" />
                  <p className="text-base sm:text-lg font-medium">
                    No products found in this category.
                  </p>
                </div>
              )}
            </div>
          </section>
        ) : (
          <>
            <section className="py-8 sm:py-12 bg-gradient-to-br from-green-200 to-teal-300 rounded-2xl shadow-2xl mb-6 sm:mb-8 animate-slide-in-right">
              <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                  <div className="bg-white p-4 sm:p-6 rounded-xl border border-green-300 flex flex-col items-center text-center animate-fade-in-down">
                    <div className="bg-green-100 p-3 sm:p-4 rounded-full mb-3 sm:mb-4">
                      <FiTruck className="text-green-600 text-xl sm:text-2xl" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold mb-2 text-green-800">
                      Fast Delivery
                    </h3>
                    <p className="text-sm sm:text-base text-gray-700">
                      Get your orders delivered within 2-3 business days
                    </p>
                  </div>
                  <div className="bg-white p-4 sm:p-6 rounded-xl border border-green-300 flex flex-col items-center text-center animate-fade-in-down delay-100">
                    <div className="bg-green-100 p-3 sm:p-4 rounded-full mb-3 sm:mb-4">
                      <FiCheckCircle className="text-green-600 text-xl sm:text-2xl" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold mb-2 text-green-800">
                      Quality Guarantee
                    </h3>
                    <p className="text-sm sm:text-base text-gray-700">
                      All products are carefully inspected before shipping
                    </p>
                  </div>
                  <div className="bg-white p-4 sm:p-6 rounded-xl border border-green-300 flex flex-col items-center text-center animate-fade-in-down delay-200">
                    <div className="bg-green-100 p-3 sm:p-4 rounded-full mb-3 sm:mb-4">
                      <FiClock className="text-green-600 text-xl sm:text-2xl" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold mb-2 text-green-800">
                      24/7 Support
                    </h3>
                    <p className="text-sm sm:text-base text-gray-700">
                      Our team is always ready to help you
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="py-8 sm:py-12 bg-gradient-to-br from-purple-200 via-pink-200 to-indigo-200 rounded-2xl shadow-2xl mb-6 sm:mb-8 animate-slide-in-left">
              <div className="container mx-auto px-4">
                <h2 className="text-2xl sm:text-3xl font-extrabold mb-6 sm:mb-8 text-center text-indigo-800 animate-fade-in-down">
                  Shop by Category
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
                  {categories.slice(0, 8).map((category) => (
                    <div
                      key={category}
                      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition duration-300 cursor-pointer animate-pulse-slow border border-indigo-100"
                      onClick={() => handleCategorySelect(category)}
                    >
                      <div className="h-28 sm:h-36 bg-gray-100 flex items-center justify-center overflow-hidden">
                        <img
                          src={
                            categoryImages[category] || categoryImages.default
                          }
                          alt={category}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = categoryImages.default;
                          }}
                        />
                      </div>
                      <div className="p-3 sm:p-4 text-center">
                        <h3 className="font-bold text-base sm:text-lg capitalize text-indigo-700">
                          {category}
                        </h3>
                        <p className="text-indigo-500 text-xs sm:text-sm mt-1 font-medium">
                          Shop now
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="py-8 sm:py-12 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white rounded-2xl shadow-2xl mb-6 sm:mb-8 animate-slide-in-right">
              <div className="container mx-auto px-4 text-center">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-4 animate-fade-in-down">
                  Summer Sale - Up to 50% Off
                </h2>
                <p className="text-base sm:text-xl mb-6 sm:mb-8 max-w-xl sm:max-w-2xl mx-auto animate-fade-in-down delay-100">
                  Grab exclusive deals on selected items before they're gone!
                </p>
                <button
                  onClick={() => navigate("/products")}
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-bold hover:from-yellow-500 hover:to-orange-600 transition duration-300 animate-pulse-slow shadow-lg"
                >
                  Shop the Sale
                </button>
              </div>
            </section>

            <section className="py-10 sm:py-16 bg-gradient-to-br from-teal-400 via-cyan-400 to-blue-500 text-white rounded-2xl shadow-2xl mb-6 sm:mb-8 animate-slide-in-left">
              <div className="container mx-auto px-4 text-center">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-4 animate-fade-in-down">
                  Featured Products
                </h2>
                <p className="text-base sm:text-lg mb-6 sm:mb-8 text-white text-opacity-90 max-w-xl sm:max-w-2xl mx-auto animate-fade-in-down delay-100">
                  Discover our top picks and best sellers, curated just for
                  you!
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                  {featuredProducts.map((item) => (
                    <div
                      key={item.id}
                      className="relative bg-white rounded-xl shadow-xl overflow-hidden group animate-slide-in-up border border-blue-100"
                    >
                      <div className="h-40 sm:h-48 bg-gray-100 flex items-center justify-center p-3 sm:p-4">
                        <img
                          src={`${BASE_URL}/stock/${item.id}/image`}
                          alt={item.name}
                          className="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.target.src =
                              "https://via.placeholder.com/400x300?text=No+Image";
                          }}
                        />
                      </div>
                      <div className="p-3 sm:p-4 text-gray-800">
                        <h3 className="font-bold text-base sm:text-lg mb-1 truncate text-indigo-700">
                          {item.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-indigo-500 capitalize">
                          {item.category}
                        </p>
                        <div className="flex justify-between items-center mt-2 sm:mt-3">
                          <span className="text-lg sm:text-xl font-extrabold text-teal-600">
                            ₹{item.price.toFixed(2)}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToCart(item);
                            }}
                            disabled={item.quantity === 0}
                            className={`px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-semibold transition-colors duration-300 ${
                              item.quantity === 0
                                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                : "bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-600 hover:to-cyan-600 shadow-md"
                            }`}
                          >
                            {item.quantity === 0
                              ? "Out of Stock"
                              : "Add to Cart"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {categories.map((category) => {
              const visibleProducts = getVisibleProducts(category);
              const totalProducts = productsByCategory[category]?.length || 0;

              return (
                <section
                  key={category}
                  className="py-8 sm:py-12 bg-gradient-to-r from-pink-200 via-purple-200 to-indigo-200 rounded-3xl shadow-2xl mb-10 sm:mb-16 animate-slide-in-right"
                >
                  <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 items-center mb-6 sm:mb-8 gap-3 sm:gap-6">
                      <div className="flex items-center space-x-3 sm:space-x-4">
                        <div className="w-10 sm:w-14 h-10 sm:h-14 rounded-xl overflow-hidden border-4 border-white shadow-lg bg-white animate-pulse-slow">
                          <img
                            src={
                              categoryImages[category] ||
                              categoryImages.default
                            }
                            alt={category}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = categoryImages.default;
                            }}
                          />
                        </div>
                        <h3 className="text-2xl sm:text-3xl font-extrabold text-indigo-800 capitalize tracking-wide animate-fade-in-down">
                          {category}
                        </h3>
                      </div>
                      <div className="text-right">
                        <button
                          onClick={() => handleCategorySelect(category)}
                          className="inline-flex items-center px-3 sm:px-4 py-1 sm:py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-full shadow-lg transition animate-pulse-slow text-sm sm:text-base"
                        >
                          View All <FiArrowRight className="ml-1 sm:ml-2" />
                        </button>
                      </div>
                    </div>

                    <div className="relative">
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                        {visibleProducts.map((item) => (
                          <ProductCard
                            key={item.id}
                            item={item}
                            handleAddToCart={handleAddToCart}
                            handleQuickView={handleQuickView}
                          />
                        ))}
                      </div>

                      {totalProducts > 5 && (
                        <>
                          <button
                            onClick={() =>
                              handleCategoryNavigation(category, "left")
                            }
                            className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-3 sm:-translate-x-4 bg-gradient-to-r from-indigo-600 to-purple-600 p-2 sm:p-3 rounded-full shadow-lg hover:from-indigo-700 hover:to-purple-700 text-white transition disabled:opacity-50 disabled:cursor-not-allowed animate-slide-in-left"
                            aria-label={`Scroll left in ${category}`}
                            disabled={
                              (categoryStartIndices[category] || 0) === 0
                            }
                          >
                            <FiArrowLeft size={16} sm={20} />
                          </button>
                          <button
                            onClick={() =>
                              handleCategoryNavigation(category, "right")
                            }
                            className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-3 sm:translate-x-4 bg-gradient-to-r from-indigo-600 to-purple-600 p-2 sm:p-3 rounded-full shadow-lg hover:from-indigo-700 hover:to-purple-700 text-white transition disabled:opacity-50 disabled:cursor-not-allowed animate-slide-in-right"
                            aria-label={`Scroll right in ${category}`}
                            disabled={
                              (categoryStartIndices[category] || 0) >=
                              totalProducts - 5
                            }
                          >
                            <FiArrowRight size={16} sm={20} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </section>
              );
            })}
          </>
        )}
      </div>

      {!selectedCategory && (
        <section className="py-10 sm:py-16 bg-gradient-to-br from-yellow-200 via-orange-200 to-red-200 border-t border-gray-200 animate-slide-in-up">
          <div className="container mx-auto px-4 text-center max-w-md sm:max-w-3xl">
            <h2 className="text-2xl sm:text-3xl font-extrabold mb-4 text-indigo-800 animate-fade-in-down">
              Stay Updated
            </h2>
            <p className="text-sm sm:text-base text-gray-700 mb-6 sm:mb-8 animate-fade-in-down delay-100">
              Subscribe to our newsletter for the latest products and
              exclusive offers.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-grow px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 animate-slide-in-left"
              />
              <button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition animate-pulse-slow shadow-lg">
                Subscribe
              </button>
            </div>
          </div>
        </section>
      )}
    </main>

    <footer className="bg-gradient-to-r from-gray-700 via-blue-600 to-blue-800 text-white py-6 sm:py-8 mt-auto shadow-inner animate-slide-in-up">
      <div className="container mx-auto px-4 text-center">
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 sm:mb-6 border-b border-blue-300 pb-4 sm:pb-6">
          <div className="flex items-center mb-3 sm:mb-4 md:mb-0">
            <FiBox className="text-blue-200 text-3xl sm:text-4xl mr-2 sm:mr-3" />
            <span className="text-2xl sm:text-3xl font-extrabold text-white">
              StockHub
            </span>
          </div>
          <nav className="flex flex-wrap justify-center space-x-4 sm:space-x-6">
            <a
              href="#"
              className="hover:text-blue-200 transition duration-200 text-sm sm:text-base"
            >
              About Us
            </a>
            <a
              href="#"
              className="hover:text-blue-200 transition duration-200 text-sm sm:text-base"
            >
              Contact
            </a>
            <a
              href="#"
              className="hover:text-blue-200 transition duration-200 text-sm sm:text-base"
            >
              Privacy Policy
            </a>
          </nav>
        </div>
        <p className="text-xs sm:text-sm text-blue-200">
          © {new Date().getFullYear()} StockHub. All rights reserved.
        </p>
        <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-blue-300">
          Your ultimate solution for seamless inventory management and online
          shopping.
        </p>
      </div>
    </footer>

    {showLoginModal && (
      <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center p-4 animate-fade-in-down">
        <div className="bg-gradient-to-br from-blue-100 to-gray-100 rounded-2xl max-w-md w-full p-4 sm:p-6 shadow-3xl transform scale-95 animate-scale-in border border-blue-200">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h3 className="text-xl sm:text-2xl font-extrabold text-blue-800">
              Login Required
            </h3>
            <button
              onClick={() => setShowLoginModal(false)}
              className="text-blue-600 hover:text-blue-800 transition duration-200 transform hover:rotate-90 focus:outline-none"
              aria-label="Close modal"
            >
              <FiXCircle size={24} sm={28} />
            </button>
          </div>

          <p className="mb-6 sm:mb-8 text-base sm:text-lg text-gray-700 leading-relaxed">
            To{" "}
            <span className="font-semibold italic text-blue-600">
              {actionRequiringLogin}
            </span>
            , please sign in to your account. It's quick and easy!
          </p>

          <div className="flex flex-col space-y-3 sm:space-y-4">
            <button
              onClick={handleLogin}
              className="bg-gradient-to-r from-blue-600 to-gray-600 text-white py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:from-blue-700 hover:to-gray-700 transition duration-300 transform hover:scale-105 shadow-lg animate-pulse-slow"
            >
              Login Now
            </button>
            <button
              onClick={handleContinueWithoutLogin}
              className="border border-blue-300 text-blue-800 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:bg-blue-50 transition duration-300 hover:shadow-md animate-pulse-slow"
            >
              Continue Browsing
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
);
};

const ProductCard = ({ item, handleAddToCart, handleQuickView }) => {
  return (
    <div className="bg-white rounded-lg shadow-md border border-indigo-100 overflow-hidden hover:shadow-xl transition duration-300 transform hover:-translate-y-2 animate-slide-in-up">
      <div
        className="relative h-36 sm:h-44 bg-gray-100 cursor-pointer group"
        onClick={() => handleQuickView(item)}
      >
        <img
          src={`${BASE_URL}/stock/${item.id}/image`}
          alt={item.name}
          className="w-full h-full object-contain p-3 sm:p-4 group-hover:scale-110 transition duration-300"
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/400x300?text=No+Image";
          }}
        />
        <div className="absolute top-2 right-2">
          {item.quantity === 0 ? (
            <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full flex items-center animate-pulse-slow">
              <FiXCircle size={12} className="mr-1" /> Sold Out
            </span>
          ) : item.quantity <= 10 ? (
            <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full flex items-center animate-pulse-slow">
              <FiAlertCircle size={12} className="mr-1" /> Low Stock
            </span>
          ) : (
            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center animate-pulse-slow">
              <FiCheckCircle size={12} className="mr-1" /> In Stock
            </span>
          )}
        </div>
      </div>

      <div className="p-3 sm:p-4">
        <h3 className="font-semibold text-base sm:text-lg text-gray-800 mb-1 line-clamp-2">
          {item.name}
        </h3>
        <p className="text-indigo-500 text-xs sm:text-sm capitalize mb-2">
          {item.category}
        </p>

        <div className="flex justify-between items-center mt-2 sm:mt-3">
          <span className="text-base sm:text-lg font-bold text-indigo-600">
            ₹{item.price.toFixed(2)}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart(item);
            }}
            disabled={item.quantity === 0}
            className={`px-3 sm:px-4 py-1 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition ${
              item.quantity === 0
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-md animate-pulse-slow"
            }`}
          >
            {item.quantity === 0 ? "Out of Stock" : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
