import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import html2pdf from 'html2pdf.js';
import { FiHome, FiPrinter, FiDownload, FiFileText } from 'react-icons/fi';

const Invoice = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const invoiceRef = useRef();

  useEffect(() => {
    const fromState = state?.invoice;
    const fromStorage = localStorage.getItem('latestInvoice');

    if (fromState) {
      setInvoice(fromState);
      localStorage.setItem('latestInvoice', JSON.stringify(fromState));
    } else if (fromStorage) {
      setInvoice(JSON.parse(fromStorage));
    } else {
      navigate('/');
    }
  }, [state, navigate]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const element = invoiceRef.current;
    const opt = {
      margin: 10,
      filename: `invoice-${invoice?.id || 'order'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  };

  if (!invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 max-w-md">
          <div className="animate-pulse">
            <FiFileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          </div>
          <p className="text-gray-600">Loading your invoice...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-300 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Invoice Header */}
          <div className="bg-gradient-to-r from-gray-600 to-gray-800 p-6 text-white">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold">Order Invoice</h1>
                <p className="text-blue-100 mt-1">Thank you for your purchase!</p>
              </div>
              <div className="text-right">
                <p className="font-medium">#{invoice.id}</p>
                <p className="text-sm text-blue-100">
                  {invoice.orderDate ? new Date(invoice.orderDate).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Invoice Content */}
          <div ref={invoiceRef} className="p-6">
            {/* Customer Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-2">Customer Details</h2>
                <div className="space-y-1 text-gray-600">
                  <p><span className="font-medium">Name:</span> {invoice.username || 'Guest'}</p>
                  <p><span className="font-medium">Address:</span> {invoice.address || 'Not provided'}</p>
                  <p><span className="font-medium">Payment:</span> {invoice.paymentMethod || 'N/A'}</p>
                </div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">Order Summary</h2>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₹{invoice.totalAmount?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping:</span>
                    <span className="text-green-600">FREE</span>
                  </div>
                  <div className="border-t border-gray-200 my-2"></div>
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>₹{invoice.totalAmount?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Order Items</h2>
              <div className="border border-gray-400 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-400">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">Item</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">Qty</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">Total</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Array.isArray(invoice.items) && invoice.items.length > 0 ? (
                      invoice.items.map((item, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900">{item.itemName || item.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                            {item.category || 'Uncategorized'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                            ₹{item.price?.toFixed(2) || '0.00'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                            {item.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap font-medium">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                          No items in this invoice
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer Note */}
            <div className="mt-8 text-center text-sm text-gray-500">
              <p>Thank you for shopping with us. Please contact support for any questions.</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => navigate('/stockItems')}
              className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <FiHome className="mr-2" />
              Back to Home
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <FiPrinter className="mr-2" />
              Print Invoice
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700"
            >
              <FiDownload className="mr-2" />
              Download PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invoice;