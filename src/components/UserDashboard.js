import React from "react";
// import { useNavigate } from 'react-router-dom';
import StockItems from "./StockItem";
import HomePage from "./home";

function UserDashboard() {
  return (
    <div className="min-h-screen bg-gray-100">
      <StockItems />
      {/* <HomePage /> */}
    </div>
  );
}

export default UserDashboard;
