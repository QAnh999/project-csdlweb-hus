import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../style/login.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const LoginPage = () => {
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState(""); // Email hoặc phone
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Kiểm tra nếu đã đăng nhập
    const auth = JSON.parse(localStorage.getItem("auth") || "{}");
    if (auth?.access_token && auth?.user) {
      // Điều hướng theo role đã lưu
      const role = auth.role || auth.user?.role || "user";
      if (role === "admin" || role === "super_admin") {
        window.location.href = "http://localhost:5173";
      } else {
        navigate("/");
      }
    }
  }, [navigate]);

  const validateForm = () => {
    if (!identifier.trim()) {
      setError("Vui lòng nhập email hoặc số điện thoại");
      return false;
    }

    if (!password) {
      setError("Vui lòng nhập mật khẩu");
      return false;
    }

    // Kiểm tra định dạng email hoặc phone
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10,11}$/;

    if (
      !emailRegex.test(identifier) &&
      !phoneRegex.test(identifier.replace(/\s/g, ""))
    ) {
      setError("Email hoặc số điện thoại không hợp lệ");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Gọi API đăng nhập từ BE
      const response = await fetch("http://localhost:8000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: identifier.trim(), // BE nhận "email", không phải "identifier"
          password: password,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        // Xử lý các lỗi từ BE
        if (response.status === 401) {
          throw new Error("Sai thông tin đăng nhập");
        } else if (response.status === 400) {
          throw new Error(responseData.detail || "Dữ liệu không hợp lệ");
        } else if (response.status === 403) {
          throw new Error(
            "Tài khoản của bạn đã bị khóa hoặc chưa được kích hoạt"
          );
        } else {
          throw new Error(responseData.detail || "Đăng nhập thất bại");
        }
      }

      // Phân tích response từ BE
      // BE trả: { access_token, refresh_token?, token_type, role, user_id, email, name }
      const {
        access_token,
        refresh_token,
        token_type,
        role,
        user_id,
        email,
        name,
      } = responseData;

      if (!access_token || !role) {
        throw new Error("Dữ liệu phản hồi không hợp lệ");
      }

      // Tạo user object từ response data
      const user = {
        id: user_id,
        email: email,
        first_name: name?.split(" ")[0] || "",
        last_name: name?.split(" ").slice(1).join(" ") || "",
        status: "active",
      };

      // Lưu thông tin đăng nhập vào localStorage
      const authData = {
        access_token: access_token,
        refresh_token: refresh_token || "",
        token_type: token_type || "bearer",
        user: user,
        loggedIn: true,
        loginAt: Date.now(),
        role: role, // "user", "admin", hoặc "super_admin"
      };

      localStorage.setItem("auth", JSON.stringify(authData));

      // Thêm Authorization header mặc định cho các request sau
      // Có thể sử dụng interceptor trong thực tế
      localStorage.setItem("auth_token", access_token);

      // Hiển thị thông báo thành công
      alert("Đăng nhập thành công!");

      // Điều hướng theo role
      // admin/super_admin -> /admin (frontendadmin ở port khác)
      // user -> / (trang chủ customer)
      if (authData.role === "admin" || authData.role === "super_admin") {
        // Chuyển hướng sang frontendadmin (Vite app ở port khác, ví dụ 3001)
        // Nếu cùng domain, có thể dùng window.location.href
        window.location.href = "http://localhost:3001"; // Hoặc port của frontendadmin
      } else {
        // User thường -> trang chủ
        navigate("/");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Đăng nhập thất bại. Vui lòng thử lại.");

      // Fallback cho testing (chỉ dùng trong development)
      if (process.env.NODE_ENV === "development") {
        handleFallbackLogin();
      }
    } finally {
      setLoading(false);
    }
  };

  // Fallback login cho development/testing - CHỈ DÙNG KHI BE CHƯA SẴN SÀNG
  const handleFallbackLogin = () => {
    // Kiểm tra đã có fallback account trong localStorage chưa
    const fallbackUsers = [
      {
        email: "customer@example.com",
        password: "123456",
        user: {
          id: 1,
          email: "customer@example.com",
          first_name: "Nguyễn",
          last_name: "Văn A",
          address: "123 Đường ABC, Quận 1, TP.HCM",
          phone: "0912345678",
          date_of_birth: "1990-01-01",
          gender: "male",
          status: "active",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_login: new Date().toISOString(),
        },
      },
      {
        email: "test@gmail.com",
        password: "password123",
        user: {
          id: 2,
          email: "test@gmail.com",
          first_name: "Trần",
          last_name: "Thị B",
          address: "456 Đường XYZ, Quận 3, TP.HCM",
          phone: "0987654321",
          date_of_birth: "1995-05-15",
          gender: "female",
          status: "active",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_login: new Date().toISOString(),
        },
      },
    ];

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(identifier)) {
      setError("Email không hợp lệ");
      return;
    }

    const user = fallbackUsers.find(
      (u) => u.email === identifier && u.password === password
    );

    if (!user) {
      setError("Sai tài khoản hoặc mật khẩu");
      return;
    }

    const authData = {
      access_token: "mock_token_" + Date.now(),
      refresh_token: "mock_refresh_" + Date.now(),
      token_type: "bearer",
      user: user.user,
      loggedIn: true,
      loginAt: Date.now(),
      role: "customer",
    };

    localStorage.setItem("auth", JSON.stringify(authData));
    localStorage.setItem("auth_token", authData.access_token);

    alert("Đăng nhập thành công (chế độ demo)");
    navigate("/");
  };

  const handleRegister = () => {
    navigate("/register");
  };

  const handleForgotPassword = () => {
    // Hiện tại chưa có endpoint forgot password
    alert(
      "Tính năng đặt lại mật khẩu đang được phát triển. Vui lòng liên hệ hỗ trợ."
    );
  };

  // Helper để hiển thị lỗi
  const renderError = () => {
    if (!error) return null;

    return (
      <div className="error-message">
        <span className="error-icon">⚠️</span>
        <span>{error}</span>
      </div>
    );
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
          <p className="subtitle">
            Đăng nhập để đặt vé và quản lý chuyến bay của bạn
          </p>

          {renderError()}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="identifier">Email hoặc số điện thoại</label>
              <input
                id="identifier"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Nhập email hoặc số điện thoại"
                required
                disabled={loading}
                className={error ? "error-input" : ""}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Mật khẩu</label>
              <div className="password-wrapper">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu"
                  required
                  disabled={loading}
                  className={error ? "error-input" : ""}
                />
                <button
                  type="button"
                  className="eye-icon"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="form-options">
              <button
                type="button"
                className="forgot-password"
                onClick={handleForgotPassword}
                disabled={loading}
              >
                Quên mật khẩu?
              </button>
            </div>

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Đang đăng nhập...
                </>
              ) : (
                "Đăng nhập"
              )}
            </button>

            <div className="register-section">
              <p>Chưa có tài khoản?</p>
              <button
                type="button"
                className="register-button"
                onClick={handleRegister}
                disabled={loading}
              >
                Đăng ký ngay
              </button>
            </div>
          </form>

          {/* Demo credentials cho testing - chỉ hiển thị trong development */}
          {process.env.NODE_ENV === "development" && (
            <div className="demo-credentials">
              <h4>Tài khoản demo:</h4>
              <div className="demo-account">
                <p>
                  <strong>Email:</strong> customer@example.com
                </p>
                <p>
                  <strong>Mật khẩu:</strong> 123456
                </p>
              </div>
              <div className="demo-account">
                <p>
                  <strong>Email:</strong> test@gmail.com
                </p>
                <p>
                  <strong>Mật khẩu:</strong> password123
                </p>
              </div>
              <p className="demo-note">* Chỉ sử dụng khi BE chưa sẵn sàng</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
