import React, { useState, useEffect } from "react";
import { Moon, Sun, User } from "lucide-react";

const Header = ({ title, isDarkMode, onToggleTheme }) => {
  const [userName, setUserName] = useState("Admin");
  const [userEmail, setUserEmail] = useState("admin@lotustravel.com");

  useEffect(() => {
    // Lấy thông tin user từ localStorage
    const storedName = localStorage.getItem("userName");
    const storedEmail = localStorage.getItem("userEmail");

    if (storedName) setUserName(storedName);
    if (storedEmail) setUserEmail(storedEmail);
  }, []);

  return (
    <header className="main-header">
      <div className="header-left">
        <h1>{title}</h1>
      </div>
      <div className="header-right">
        <button
          className="theme-btn"
          onClick={onToggleTheme}
          title="Chuyển chế độ sáng/tối"
        >
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <div className="admin-profile">
          <div className="admin-avatar">
            <User size={18} />
          </div>
          <div className="admin-info">
            <h4>{userName}</h4>
            <p>{userEmail}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
