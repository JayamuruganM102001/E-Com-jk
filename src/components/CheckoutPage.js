import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiTrash2 } from "react-icons/fi";
import axios from "axios";
import { BASE_URL } from "../api/UserService";

const CheckoutPage = () => {
  const [cart, setCart] = useState([]);
  const [inventory, setInventory] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }

    const fetchInventoryAndProductImages = async () => {
      try {
        const inventoryResponse = await axios.get(`${BASE_URL}/stock`);
        const inventoryMap = {};
        inventoryResponse.data.forEach((item) => {
          inventoryMap[item.id] = item.quantity;
        });
        setInventory(inventoryMap);

        const cartItems = JSON.parse(localStorage.getItem("cart") || "[]");
        const detailedCartPromises = cartItems.map(async (cartItem) => {
          try {
            const productResponse = await axios.get(
              `${BASE_URL}/stock/${cartItem.id}`
            );
            return { ...productResponse.data, quantity: cartItem.quantity };
          } catch (error) {
            console.error(
              `Error fetching details for item ${cartItem.id}:`,
              error
            );
            return {
              ...cartItem,
              name: "Unknown Item",
              price: 0,
              image: "https://via.placeholder.com/80",
            };
          }
        });

        const detailedCart = await Promise.all(detailedCartPromises);
        setCart(detailedCart);
      } catch (error) {
        console.error("Error fetching data for checkout page:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInventoryAndProductImages();
  }, []);

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;

    const availableStock = inventory[id] || 0;
    if (newQuantity > availableStock) {
      alert(`Only ${availableStock} items available in stock`);
      return;
    }

    const updatedCart = cart.map((item) =>
      item.id === id ? { ...item, quantity: newQuantity } : item
    );
    setCart(updatedCart);
    localStorage.setItem(
      "cart",
      JSON.stringify(updatedCart.map(({ id, quantity }) => ({ id, quantity })))
    );
  };

  const removeFromCart = (id) => {
    const updatedCart = cart.filter((item) => item.id !== id);
    setCart(updatedCart);
    localStorage.setItem(
      "cart",
      JSON.stringify(updatedCart.map(({ id, quantity }) => ({ id, quantity })))
    );
  };

  const removeAllItems = () => {
    setCart([]);
    localStorage.removeItem("cart");
  };

  const totalAmount = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const totalDiscount = totalAmount * 0.0;
  const finalAmount = totalAmount - totalDiscount;

  const handleProceedToCheckout = () => {
    const outOfStockItems = cart.filter((item) => {
      const stock = inventory[item.id] || 0;
      return item.quantity > stock;
    });

    if (outOfStockItems.length > 0) {
      alert(
        "Some items are out of stock or exceed available quantity. Please adjust your cart."
      );
      return;
    }

    navigate("/place-order", { state: { cart } });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-lg text-gray-700">
          Loading your cart and product details...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-300 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-6 sm:mb-8 text-center">
          Your Shopping Cart
        </h1>

        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8">
          {/* Cart Items Section */}
          <div className="lg:w-3/4">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gray-800 flex justify-between items-center mb-2 border-b px-4 sm:px-6 py-3 rounded-t">
                <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-200">
                  My Cart ({cart.length} items)
                </h2>
                {cart.length > 0 && (
                  <button
                    onClick={removeAllItems}
                    className="text-red-500 sm:text-red-600 hover:text-red-700 transition-colors duration-200 text-sm sm:text-base font-medium flex items-center"
                  >
                    <FiTrash2 className="mr-1" /> Clear Cart
                  </button>
                )}
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-12 sm:py-16">
                  <p className="text-lg sm:text-xl text-gray-600 mb-4 sm:mb-6">
                    Your cart is currently empty. Start shopping now!
                  </p>
                  <button
                    onClick={() => navigate("/stockItems")}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 sm:py-3 sm:px-8 rounded-lg shadow-md transition-colors duration-300 transform hover:scale-105"
                  >
                    Explore Products
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-300 px-2 sm:px-4 md:px-6 lg:px-10">
                  {cart.map((item) => {
                    const availableStock = inventory[item.id] || 0;
                    const outOfStock =
                      item.quantity > availableStock || availableStock === 0;
                    const displayImageSrc = item.id
                      ? `${BASE_URL}/stock/${item.id}/image`
                      : "https://via.placeholder.com/120";

                    return (
                      <div key={item.id} className="py-4 sm:py-6 flex flex-col sm:flex-row items-start sm:items-center">
                        <div className="flex-shrink-0 w-20 h-20 sm:w-28 sm:h-28 bg-gray-50 flex items-center justify-center rounded-lg overflow-hidden border border-gray-200 self-center sm:self-auto">
                          <img
                            src={displayImageSrc}
                            alt={item.name}
                            className="object-contain max-w-full max-h-full p-1"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "https://via.placeholder.com/120";
                            }}
                          />
                        </div>
                        <div className="mt-3 sm:mt-0 sm:ml-4 md:ml-5 flex-grow w-full">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3
                                className={`text-base sm:text-lg font-semibold ${
                                  outOfStock ? "text-red-500" : "text-gray-900"
                                }`}
                              >
                                {item.name}
                                {outOfStock && availableStock > 0 && (
                                  <span className="ml-2 text-red-500 text-xs sm:text-sm font-normal block">
                                    (Quantity Exceeds Stock)
                                  </span>
                                )}
                                {availableStock === 0 && (
                                  <span className="ml-2 text-red-500 text-xs sm:text-sm font-normal block">
                                    (Out of Stock)
                                  </span>
                                )}
                              </h3>
                              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                                {item.category}
                              </p>
                            </div>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-red-500 hover:text-red-700 transition-colors duration-200 flex items-center text-xs sm:text-sm ml-2 sm:ml-4"
                            >
                              <FiTrash2 className="mr-1" /> Remove
                            </button>
                          </div>
                          <div className="mt-2 sm:mt-3 flex flex-col sm:flex-row sm:items-center justify-between">
                            <div className="mb-2 sm:mb-0">
                              <span className="text-lg sm:text-xl font-bold text-gray-900">
                                ₹{item.price ? item.price.toFixed(2) : "0.00"}
                              </span>
                              <span className="ml-2 sm:ml-3 line-through text-sm sm:text-base text-gray-400">
                                ₹
                                {item.price
                                  ? (item.price * 1.1).toFixed(0)
                                  : "0"}
                              </span>
                              <span className="ml-2 sm:ml-3 text-green-600 text-sm sm:text-base font-medium">
                                10% off
                              </span>
                            </div>
                            <div className="flex items-center border border-gray-300 rounded-md self-end sm:self-auto">
                              <button
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity - 1)
                                }
                                disabled={item.quantity <= 1}
                                className="p-1 sm:p-2 text-gray-700 hover:bg-gray-100 rounded-l-md disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                -
                              </button>
                              <span className="px-2 sm:px-4 py-1 sm:py-2 text-base sm:text-lg font-medium text-gray-800">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity + 1)
                                }
                                disabled={item.quantity >= availableStock}
                                className="p-1 sm:p-2 text-gray-700 hover:bg-gray-100 rounded-r-md disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                +
                              </button>
                            </div>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2 text-right">
                            {availableStock} items in stock
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Summary Section */}
          {cart.length > 0 && (
            <div className="lg:w-1/4 mt-4 sm:mt-0">
              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:sticky lg:top-4">
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 sm:mb-6">
                  Order Summary
                </h3>
                <div className="space-y-3 sm:space-y-4 text-sm sm:text-base text-gray-700">
                  <div className="flex justify-between items-center">
                    <span>Subtotal ({cart.length} items)</span>
                    <span className="font-medium">
                      ₹{totalAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Discount</span>
                    <span className="text-green-600 font-medium">
                      -₹{totalDiscount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Delivery Charges</span>
                    <span className="text-green-600 font-medium">FREE</span>
                  </div>
                  <hr className="border-gray-300 my-2 sm:my-4" />
                  <div className="flex justify-between items-center font-bold text-lg text-gray-900">
                    <span>Total Amount</span>
                    <span>₹{finalAmount.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={handleProceedToCheckout}
                  className="mt-6 sm:mt-8 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 sm:py-3 rounded-lg shadow-md transition-colors duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={cart.some(
                    (item) =>
                      (inventory[item.id] || 0) === 0 ||
                      item.quantity > (inventory[item.id] || 0)
                  )}
                >
                  Proceed to Checkout
                </button>

                <button
                  onClick={() => navigate("/stockItems")}
                  className="block mx-auto mt-3 sm:mt-4 text-blue-600 hover:text-blue-800 hover:underline text-xs sm:text-sm font-medium transition-colors duration-200"
                >
                  ← Continue Shopping
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;