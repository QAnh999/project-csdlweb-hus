import React from "react";
import { Moon, Sun, User } from "lucide-react";

const Header = ({ title, isDarkMode, onToggleTheme }) => {
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
            <h4>Admin</h4>
            <p>admin@lotustravel.com</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
