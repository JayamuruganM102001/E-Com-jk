import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from '../api/UserService';
import { toast } from 'react-toastify';
import { FiUser, FiHome, FiCreditCard, FiCheckCircle } from 'react-icons/fi'; // Changed FiArrowRight to FiCheckCircle for the button

const PlaceOrder = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [cart, setCart] = useState(() => {
    const fromState = location.state?.cart;
    const fromLocal = localStorage.getItem('cart');
    // Prioritize cart from navigation state, then localStorage
    return fromState || (fromLocal ? JSON.parse(fromLocal) : []);
  });

  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
  const [error, setError] = useState('');

  // Persist cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Handle placing the order
  const handlePlaceOrder = async () => {
    // Basic validation
    if (!username.trim() || !address.trim() || !paymentMethod) {
      setError('Please fill all required fields before placing your order.');
      return;
    }
    setError(''); // Clear any previous errors

    try {
      const orderRequest = {
        username,
        address,
        paymentMethod,
        cartItems: cart, // The cart state is already structured as needed by your backend
      };

      const response = await axios.post(`${BASE_URL}/orders`, orderRequest);

      if (response.status === 200) {
        // Clear cart from state and localStorage on successful order
        setCart([]);
        localStorage.removeItem('cart');
        // Store invoice data to display on the next page
        localStorage.setItem('latestInvoice', JSON.stringify(response.data));

        // Show success toast notification
        toast.success("Order placed successfully!", {
          position: "bottom-center",
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });

        // Navigate to the invoice page
        navigate('/invoice');
      }
    } catch (err) {
      console.error('Order placement error:', err);
      // More specific error handling could be added here based on `err.response`
      setError('Failed to place order. Please check your details and try again.');
    }
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalDiscount = totalAmount * 0.01; // Example 1% discount
  const finalAmount = totalAmount - totalDiscount;


  return (
    <div className="min-h-screen bg-gray-300 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Page Title and Description */}
        {/* <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 leading-tight">Secure Checkout</h1>
          <p className="mt-3 text-lg text-gray-600">Almost there! Just a few more steps to complete your purchase.</p>
        </div> */}
        <div className="text-center mb-5">
          <h1 className="text-4xl font-extrabold text-gray-900">Complete Your Order</h1>
          <p className="mt-2 text-gray-600">Fill in your details and review your cart before placing the order.</p>
        </div>

        {/* Main Content Area */}
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Left Section: Order Summary & Item Details */}
            <div className="p-8 lg:p-10 border-b lg:border-r lg:border-b-0 border-gray-200 bg-gray-200">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="bg-indigo-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm font-semibold">1</span>
                Your Order Summary
              </h2>

              {cart.length > 0 ? (
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar"> {/* Added custom-scrollbar for better aesthetics */}
                  {cart.map((item, index) => (
                    <div key={index} className="flex items-center justify-between py-3 border-b border-gray-00 last:border-b-0">
                      <div className="flex items-center">
                        <img
                           src={item.id ? `${BASE_URL}/stock/${item.id}/image` : 'https://via.placeholder.com/60'}
                           alt={item.name}
                           className="w-16 h-16 object-cover rounded-md border border-gray-200 mr-4"
                           onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/60'; }}
                        />
                        <div>
                          <p className="font-semibold text-gray-900 text-base">{item.name}</p>
                          <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="font-bold text-gray-900 text-lg">₹{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                    <p className="text-gray-500 text-lg">Your cart is empty. Please add items to proceed!</p>
                    <button
                        onClick={() => navigate('/stockItems')}
                        className="mt-6 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                        Start Shopping
                    </button>
                </div>
              )}

                {/* Subtotal, Discount, Total */}
              {cart.length > 0 && (
                <div className="mt-8 ">
                  {/* <div className="flex justify-between items-center text-gray-700 py-2">
                    <span className="text-lg">Subtotal ({cart.length} items)</span>
                    <span className="font-semibold text-lg">₹{totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-700 py-2">
                    <span className="text-lg">Discount (1%)</span>
                    <span className="text-green-600 font-semibold text-lg">-₹{totalDiscount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-700 py-2">
                    <span className="text-lg">Delivery Charges</span>
                    <span className="text-green-600 font-semibold text-lg">FREE</span>
                  </div> */}
                  <div className="flex justify-between items-center mt-4 pt-4 border-t-2 border-dashed border-gray-400">
                    <span className="text-xl font-extrabold text-gray-900">Total Amount</span>
                    <span className="text-2xl font-extrabold text-indigo-600">₹{totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Right Section: Customer Details & Payment */}
            <div className="p-8 lg:p-10">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="bg-indigo-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm font-semibold">2</span>
                Shipping & Payment
              </h2>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg flex items-center">
                  <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}

              <div className="space-y-6">
                {/* Username Input */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FiUser className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500 text-gray-900 text-base shadow-sm transition-all duration-200 ease-in-out"
                    placeholder="Your Full Name"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    aria-label="Username"
                  />
                </div>

                {/* Address Textarea */}
                <div className="relative">
                  <div className="absolute top-4 left-0 pl-4 flex items-center pointer-events-none">
                    <FiHome className="h-5 w-5 text-gray-400" />
                  </div>
                  <textarea
                    className="block w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500 text-gray-900 text-base shadow-sm resize-y"
                    rows="4"
                    placeholder="Full Shipping Address (Street, City, State, Pincode)"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    aria-label="Shipping Address"
                  />
                </div>

                {/* Payment Method Select */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FiCreditCard className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    className="block w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white text-gray-900 text-base shadow-sm transition-all duration-200 ease-in-out"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    aria-label="Payment Method"
                  >
                    <option value="Cash on Delivery">Cash on Delivery</option>
                    <option value="UPI">UPI (Google Pay, PhonePe, Paytm)</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Debit Card">Debit Card</option>
                  </select>
                  {/* <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-700">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 6.757 7.586 5.343 9z"/></svg>
                  </div> */}
                </div>
              </div>

              {/* Place Order Button */}
              <button
                onClick={handlePlaceOrder}
                className="mt-8 w-full flex items-center justify-center px-6 py-4 border border-transparent rounded-xl shadow-lg text-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-3 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={cart.length === 0} // Disable if cart is empty
              >
                Place Order Now
                <FiCheckCircle className="ml-3 h-6 w-6" />
              </button>

              {/* Back to Cart Button */}
              <div className="mt-6 text-center">
                <button
                  onClick={() => navigate(-1)}
                  className="text-blue-600 hover:text-blue-800 font-medium text-base hover:underline transition-colors"
                >
                  ← Back to cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Custom Scrollbar Styling (optional, can be moved to global CSS) */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e0; /* gray-300 */
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a0aec0; /* gray-400 */
        }
      `}</style>
    </div>
  );
};

export default PlaceOrder;