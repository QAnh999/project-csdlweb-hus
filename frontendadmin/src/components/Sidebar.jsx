import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  PieChart,
  CalendarCheck,
  Plane,
  Bell,
  MessageCircle,
  Gift,
  Users,
  LogOut,
  Menu,
} from "lucide-react";

const menuItems = [
  { icon: PieChart, label: "Bảng điều khiển", path: "/dashboard" },
  { icon: CalendarCheck, label: "Quản lý đặt chỗ", path: "/booking" },
  { icon: Plane, label: "Theo dõi chuyến bay", path: "/flight" },
  { icon: Bell, label: "Dịch vụ", path: "/service" },
  { icon: MessageCircle, label: "Phản hồi", path: "/feedback" },
  { icon: Gift, label: "Khuyến mãi", path: "/promotion" },
  { icon: Users, label: "Quản lý", path: "/manager" },
];

const Sidebar = ({ isCollapsed, onToggle, onLogout }) => {
  const location = useLocation();

  return (
    <aside className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header">
        {!isCollapsed && <h2 className="logo">Lotus Travel</h2>}
        <button className="menu-toggle" onClick={onToggle}>
          <Menu size={20} />
        </button>
      </div>

      <nav className="sidebar-nav">
        <ul>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path} className={isActive ? "active" : ""}>
                <Link to={item.path}>
                  <Icon size={20} />
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              </li>
            );
          })}
          <li>
            <a
              href="#logout"
              onClick={(e) => {
                e.preventDefault();
                onLogout();
              }}
            >
              <LogOut size={20} />
              {!isCollapsed && <span>Đăng xuất</span>}
            </a>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
