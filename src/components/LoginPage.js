// src/components/LoginPage.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../style/login.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const LoginPage = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const users = [
    { email: "admin@gmail.com", password: "123456", role: "admin" },
    { email: "laceyflender.vn@gmail.com", password: "thisislacey2025", role: "customer" },
  ];

  useEffect(() => {
    const auth = JSON.parse(localStorage.getItem("auth"));
    if (auth?.loggedIn) {
      navigate(auth.role === "admin" ? "/admin" : "/");
    }
  }, [navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Vui lòng nhập đầy đủ email và mật khẩu");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Email không hợp lệ");
      return;
    }

    const user = users.find(
      (u) => u.email === email && u.password === password
    );
    if (!user) {
      alert("Sai tài khoản hoặc mật khẩu");
      return;
    }

    localStorage.setItem(
      "auth",
      JSON.stringify({
        email: user.email,
        role: user.role,
        loggedIn: true,
        loginAt: Date.now(),
      })
    );

    navigate(user.role === "admin" ? "/admin" : "/");
  };

  return (
    <div className="login-page">
      <header className="site-header">
        <a href="/" className="logo">
          <img
            src="/assets/Lotus_Logo-removebg-preview.png"
            alt="Lotus Travel"
          />
          <span>Lotus Travel</span>
        </a>
      </header>

      <div className="page-content">
        <div className="login-box">
          <h2>Đăng nhập</h2>
          <form onSubmit={handleSubmit}>
            <div>
              <label>Email</label>
              
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <br />

            <div className="password-field">
              <label>Mật khẩu</label>

              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <span
                  className="eye-icon"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
            </div>


            <br />

            <button type="submit">Đăng nhập</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
