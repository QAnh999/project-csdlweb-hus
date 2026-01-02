import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:8000";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Clear login state on page load
  useEffect(() => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("accessToken");
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      alert("Vui lòng nhập Email và Mật khẩu.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Đăng nhập thất bại");
      }

      // Kiểm tra role phải là admin hoặc superadmin
      if (data.role !== "admin" && data.role !== "superadmin") {
        alert("Bạn không có quyền truy cập trang quản trị.");
        setIsLoading(false);
        return;
      }

      alert("Đăng nhập thành công");
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userId", data.user_id);
      localStorage.setItem("userRole", data.role);
      localStorage.setItem("userName", data.name);
      localStorage.setItem("userEmail", data.email);
      localStorage.setItem("accessToken", data.access_token);
      navigate("/dashboard");
    } catch (error) {
      alert(error.message || "Sai email hoặc mật khẩu. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#87b3ea",
        backgroundImage: "url('/assets/anh_nen.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        fontFamily: "'Be Vietnam Pro', sans-serif",
      }}
    >
      <div
        style={{
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(12px)",
          width: "420px",
          maxWidth: "90%",
          padding: "50px 40px",
          borderRadius: "24px",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
          textAlign: "center",
          border: "1px solid rgba(255, 255, 255, 0.3)",
        }}
      >
        <h1
          style={{
            fontSize: "34px",
            fontWeight: 700,
            color: "#1a1a1a",
            marginBottom: "35px",
          }}
        >
          Admin Login
        </h1>
        <form onSubmit={handleSubmit}>
          <label
            style={{
              display: "block",
              textAlign: "left",
              fontSize: "17px",
              fontWeight: 600,
              color: "#333",
              marginBottom: "2px",
            }}
          >
            Email:
          </label>
          <input
            type="text"
            placeholder="Nhập email của bạn"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: "100%",
              padding: "18px 20px",
              marginBottom: "20px",
              border: "1.5px solid #ddd",
              borderRadius: "14px",
              fontSize: "16px",
              backgroundColor: "#f8faff",
              boxSizing: "border-box",
            }}
            required
            disabled={isLoading}
          />

          <label
            style={{
              display: "block",
              textAlign: "left",
              fontSize: "17px",
              fontWeight: 600,
              color: "#333",
              marginBottom: "2px",
            }}
          >
            Mật khẩu:
          </label>
          <input
            type="password"
            placeholder="Nhập mật khẩu của bạn"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "18px 20px",
              marginBottom: "20px",
              border: "1.5px solid #ddd",
              borderRadius: "14px",
              fontSize: "16px",
              backgroundColor: "#f8faff",
              boxSizing: "border-box",
            }}
            required
            disabled={isLoading}
          />

          <button
            type="submit"
            disabled={isLoading}
            style={{
              backgroundColor: isLoading ? "#a0c4e8" : "#4a90e2",
              color: "white",
              border: "none",
              width: "100%",
              padding: "18px 20px",
              borderRadius: "14px",
              fontSize: "16px",
              cursor: isLoading ? "not-allowed" : "pointer",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            }}
          >
            {isLoading ? "Đang đăng nhập..." : "Đăng Nhập"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
