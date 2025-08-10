import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../api/UserService";
import "../index.css";
import "./Login.css";

function LoginRegister() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "USER"
  });
  const [error, setError] = useState("");
  const [showForgotPopup, setShowForgotPopup] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (token && role === "ADMIN") navigate("/sample");
    else if (token && role === "USER") navigate("/user-dashboard");
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await axios.post(`${BASE_URL}/auth/login`, {
        username: formData.username,
        password: formData.password
      });
      const { token, role, username } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      localStorage.setItem("username", username);
      navigate(role === "ADMIN" ? "/sample" : "/user-dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await axios.post(`${BASE_URL}/users`, formData);
      alert("Registration successful. You can now login.");
      setIsLogin(true);
      setFormData({ username: "", password: "", role: "USER" });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="login-container">
      <div className="background-image"></div>
      <div className="spotlight"></div>

      <div className="login-card-wrapper">
        <div className="login-card">
          {/* Enhanced Login/Register toggle */}
          <div className="auth-toggle-container mb-8">
            <div className="auth-toggle-buttons">
              <button
                className={`auth-toggle-btn ${isLogin ? "active" : ""}`}
                onClick={() => setIsLogin(true)}
              >
                Login
              </button>
              <button
                className={`auth-toggle-btn ${!isLogin ? "active" : ""}`}
                onClick={() => setIsLogin(false)}
              >
                Register
              </button>
            </div>
          </div>

          <h2 className="text-white text-3xl font-bold mb-8 text-center">
            {isLogin ? "Login" : "Register"}
          </h2>

          {error && <p className="text-red-400 mb-4 text-center">{error}</p>}

          <form onSubmit={isLogin ? handleLogin : handleRegister}>
            <div className="mb-6 relative">
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Username"
                required
              />
              <span className="input-icon">
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
            </div>

            <div className="mb-6 relative">
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Password"
                required
              />
              <span className="input-icon">
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2h2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
            </div>

            {/* {!isLogin && (
              <div className="mb-6">
                <input
                  type="text"
                  value={formData.role}
                  readOnly
                  className="input-field bg-gray-100 text-black cursor-not-allowed"
                />
              </div>
            )} */}

            <button type="submit" className="login-button">
              {isLogin ? "Login" : "Register"}
            </button>

            {isLogin && (
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => setShowForgotPopup(true)}
                  className="hover:underline text-red-500"
                >
                  Forgot password?
                </button>
              </div>
            )}
          </form>
        </div>
      </div>

      {showForgotPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-700">
              Forgot Password
            </h3>
            <p className="text-sm text-gray-600 mt-2">
              Please contact the Admin to reset your password.
            </p>
            <button
              onClick={() => setShowForgotPopup(false)}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default LoginRegister;