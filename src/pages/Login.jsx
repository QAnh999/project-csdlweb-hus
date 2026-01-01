import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Clear login state on page load
  useEffect(() => {
    localStorage.removeItem("isLoggedIn");
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    const VALID_EMAIL = "admin@lotustravel.com";
    const VALID_PASSWORD = "password";

    if (!email.trim() || !password.trim()) {
      alert("Vui lòng nhập Email và Mật khẩu.");
      return;
    }

    if (email === VALID_EMAIL && password === VALID_PASSWORD) {
      alert("Đăng nhập thành công");
      localStorage.setItem("isLoggedIn", "true");
      navigate("/dashboard");
    } else {
      alert("Sai email hoặc mật khẩu. Vui lòng thử lại.");
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
          />

          <button
            type="submit"
            style={{
              backgroundColor: "#4a90e2",
              color: "white",
              border: "none",
              width: "100%",
              padding: "18px 20px",
              borderRadius: "14px",
              fontSize: "16px",
              cursor: "pointer",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            }}
          >
            Đăng Nhập
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
