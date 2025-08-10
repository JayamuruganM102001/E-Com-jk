import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaUsers,
  FaShoppingCart,
  FaMoneyBillWave,
  FaBoxOpen,
  FaChartLine,
  FaChartPie,
  FaBullseye
} from "react-icons/fa";
import OrderTable from "./OrderTable";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";

const COLORS = [
  "#6366F1",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#3B82F6",
  "#D946EF",
];

const SalesOverview = () => {
  const [overview, setOverview] = useState({
    totalInvoices: 0,
    totalRevenue: 0,
    totalUsers: 0,
    totalItemsSold: 0,
  });

  const [categorySalesData, setCategorySalesData] = useState([]);
  const [showTable, setShowTable] = useState(false);
  const [salesTrendData, setSalesTrendData] = useState([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);

  const monthlyTarget = 1000000; // ₹10 lakh
  const salesProgress = (monthlyRevenue / monthlyTarget) * 100;

  useEffect(() => {
    const fetchMonthlyRevenue = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/revenue/current-month`
        );
        setMonthlyRevenue(response.data);
      } catch (error) {
        console.error("Error fetching monthly revenue:", error);
      }
    };

    const fetchSalesTrend = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/revenue/weekly`
        );
        const apiData = response.data.map((item) => ({
          day: item.dayName,
          revenue: item.totalRevenue,
        }));
        setSalesTrendData(apiData);
      } catch (error) {
        console.error("Error fetching sales trend data:", error);
      }
    };

    const fetchData = async () => {
      try {
        const [overviewRes, categorySalesRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/api/orders/overview`),
          axios.get(`${process.env.REACT_APP_API_URL}/api/orders/category-sales`),
        ]);
        setOverview(overviewRes.data);

        const categoryData = categorySalesRes.data.map((item) => ({
          name: item.category,
          value: item.totalSales,
        }));
        setCategorySalesData(categoryData);
      } catch (err) {
        console.error(
          "Failed to fetch sales overview or category sales data",
          err
        );
      }
    };

    fetchMonthlyRevenue();
    fetchSalesTrend();
    fetchData();
  }, []);

  const handleOrdersClick = () => setShowTable(true);

  const cards = [
    {
      title: "Total Orders",
      value: overview.totalInvoices,
      icon: <FaShoppingCart className="text-4xl text-white-500" />,
      onClick: handleOrdersClick,
      bgColor: "bg-gradient-to-br from-blue-400 to-blue-600",
    },
    {
      title: "Total Revenue",
      value: `₹ ${overview.totalRevenue.toLocaleString("en-IN")}`, // Format to Indian Rupees
      icon: <FaMoneyBillWave className="text-4xl text-white-500" />,
      bgColor: "bg-gradient-to-br from-green-400 to-green-600",
    },
    {
      title: "Total Users",
      value: overview.totalUsers,
      icon: <FaUsers className="text-4xl text-white-500" />,
      bgColor: "bg-gradient-to-br from-purple-400 to-purple-600",
    },
    {
      title: "Items Sold",
      value: overview.totalItemsSold,
      icon: <FaBoxOpen className="text-4xl text-white-500" />,
      bgColor: "bg-gradient-to-br from-yellow-400 to-yellow-600",
    },
  ];

  if (showTable) {
    return <OrderTable onBack={() => setShowTable(false)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Sales Dashboard</h1>
            <p className="text-gray-600">Track your business performance</p>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {cards.map((card, idx) => (
            <div
              key={idx}
              onClick={card.onClick}
              className={`rounded-xl p-5 ${card.bgColor} text-white shadow-md hover:shadow-lg transition-shadow cursor-pointer`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{card.title}</p>
                  <h3 className="text-xl font-semibold mt-1">{card.value}</h3>
                </div>
                <div className="text-white opacity-80">
                  {card.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Trend Card */}
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200">
            <div className="flex items-center mb-4">
              <FaChartLine className="text-blue-500 mr-2" />
              <h3 className="text-lg font-semibold text-gray-700">Weekly Revenue Trend</h3>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={salesTrendData}
                  margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="day" 
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    formatter={(value) => [`₹${value.toLocaleString("en-IN")}`, "Revenue"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#6366F1"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Sales Card */}
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200">
            <div className="flex items-center mb-4">
              <FaChartPie className="text-purple-500 mr-2" />
              <h3 className="text-lg font-semibold text-gray-700">Sales by Category</h3>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categorySalesData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => {
                      const percentage = (percent * 100).toFixed(1);
                      if (percentage < 5) return "";
                      return `${name.substring(0, 8)} ${percentage}%`;
                    }}
                    outerRadius={80}
                    innerRadius={40}
                    dataKey="value"
                  >
                    {categorySalesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`₹${value.toLocaleString("en-IN")}`, "Sales"]}
                  />
                  <Legend 
                    layout="horizontal"
                    verticalAlign="bottom"
                    wrapperStyle={{ paddingTop: '20px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Sales Target Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center mb-4">
            <FaBullseye className="text-green-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-700">Monthly Sales Target</h3>
          </div>
          
          <div className="mb-2 flex justify-between text-sm text-gray-600">
            <span>Progress: {salesProgress.toFixed(1)}%</span>
            <span>₹{monthlyRevenue.toLocaleString("en-IN")} / ₹{monthlyTarget.toLocaleString("en-IN")}</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-green-400 to-green-600 h-full rounded-full"
              style={{ width: `${Math.min(salesProgress, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesOverview;