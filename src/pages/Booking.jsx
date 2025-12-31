import React, { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import {
  Search,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Plane,
} from "lucide-react";
import "../styles/main.css";
import "../styles/managers.css";

// Sample booking data
const initialBookingsData = [
  {
    id: "BK001",
    fullname: "Nguyễn Văn An",
    email: "nguyenvanan@gmail.com",
    bookingDate: "2025-01-15",
    status: "completed",
    phone: "0912345678",
    flightCode: "VN123",
    departure: "Hà Nội (HAN)",
    arrival: "TP.HCM (SGN)",
    passengers: 2,
    totalPrice: 2500000,
  },
  {
    id: "BK002",
    fullname: "Trần Thị Bình",
    email: "tranthib@gmail.com",
    bookingDate: "2025-01-14",
    status: "pending",
    phone: "0987654321",
    flightCode: "VJ456",
    departure: "TP.HCM (SGN)",
    arrival: "Đà Nẵng (DAD)",
    passengers: 1,
    totalPrice: 1200000,
  },
  {
    id: "BK003",
    fullname: "Lê Minh Cường",
    email: "leminhcuong@gmail.com",
    bookingDate: "2025-01-13",
    status: "completed",
    phone: "0909123456",
    flightCode: "QH789",
    departure: "Đà Nẵng (DAD)",
    arrival: "Hà Nội (HAN)",
    passengers: 3,
    totalPrice: 3600000,
  },
  {
    id: "BK004",
    fullname: "Phạm Thị Dung",
    email: "phamthidung@gmail.com",
    bookingDate: "2025-01-12",
    status: "cancelled",
    phone: "0918765432",
    flightCode: "VN234",
    departure: "Hà Nội (HAN)",
    arrival: "Phú Quốc (PQC)",
    passengers: 2,
    totalPrice: 4200000,
  },
  {
    id: "BK005",
    fullname: "Hoàng Văn Em",
    email: "hoangvanem@gmail.com",
    bookingDate: "2025-01-11",
    status: "pending",
    phone: "0923456789",
    flightCode: "VJ567",
    departure: "TP.HCM (SGN)",
    arrival: "Nha Trang (CXR)",
    passengers: 4,
    totalPrice: 4800000,
  },
  {
    id: "BK006",
    fullname: "Ngô Thị Phương",
    email: "ngothiphuong@gmail.com",
    bookingDate: "2025-01-10",
    status: "completed",
    phone: "0934567890",
    flightCode: "QH012",
    departure: "Hà Nội (HAN)",
    arrival: "Đà Lạt (DLI)",
    passengers: 2,
    totalPrice: 2800000,
  },
  {
    id: "BK007",
    fullname: "Vũ Văn Giang",
    email: "vuvangiang@gmail.com",
    bookingDate: "2025-01-09",
    status: "completed",
    phone: "0945678901",
    flightCode: "VN345",
    departure: "TP.HCM (SGN)",
    arrival: "Hải Phòng (HPH)",
    passengers: 1,
    totalPrice: 1500000,
  },
  {
    id: "BK008",
    fullname: "Đỗ Thị Hương",
    email: "dothihuong@gmail.com",
    bookingDate: "2025-01-08",
    status: "pending",
    phone: "0956789012",
    flightCode: "VJ678",
    departure: "Đà Nẵng (DAD)",
    arrival: "TP.HCM (SGN)",
    passengers: 2,
    totalPrice: 2200000,
  },
  {
    id: "BK009",
    fullname: "Bùi Văn Khoa",
    email: "buivankhoa@gmail.com",
    bookingDate: "2025-01-07",
    status: "completed",
    phone: "0967890123",
    flightCode: "QH234",
    departure: "Hà Nội (HAN)",
    arrival: "Quy Nhơn (UIH)",
    passengers: 3,
    totalPrice: 3300000,
  },
  {
    id: "BK010",
    fullname: "Trịnh Thị Lan",
    email: "trinhthilan@gmail.com",
    bookingDate: "2025-01-06",
    status: "cancelled",
    phone: "0978901234",
    flightCode: "VN456",
    departure: "TP.HCM (SGN)",
    arrival: "Cần Thơ (VCA)",
    passengers: 1,
    totalPrice: 900000,
  },
  {
    id: "BK011",
    fullname: "Đinh Văn Minh",
    email: "dinhvanminh@gmail.com",
    bookingDate: "2025-01-05",
    status: "completed",
    phone: "0989012345",
    flightCode: "VJ789",
    departure: "Hà Nội (HAN)",
    arrival: "Buôn Ma Thuột (BMV)",
    passengers: 2,
    totalPrice: 2600000,
  },
  {
    id: "BK012",
    fullname: "Lý Thị Ngọc",
    email: "lythingoc@gmail.com",
    bookingDate: "2025-01-04",
    status: "pending",
    phone: "0990123456",
    flightCode: "QH345",
    departure: "Đà Nẵng (DAD)",
    arrival: "Hà Nội (HAN)",
    passengers: 4,
    totalPrice: 4400000,
  },
];

const Booking = () => {
  const [bookingsData, setBookingsData] = useState(initialBookingsData);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [sortOrder, setSortOrder] = useState("newest");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const itemsPerPage = 8;

  // Filter and sort data
  useEffect(() => {
    let data = [...bookingsData];

    // Search filter
    if (searchQuery) {
      data = data.filter((item) => {
        const matchesId = item.id
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
        const matchesName = item.fullname
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
        const matchesEmail = item.email
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
        return matchesId || matchesName || matchesEmail;
      });
    }

    // Sort
    if (sortOrder === "newest") {
      data.sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));
    } else if (sortOrder === "oldest") {
      data.sort((a, b) => new Date(a.bookingDate) - new Date(b.bookingDate));
    }

    setFilteredData(data);
    setCurrentPage(1);
  }, [searchQuery, sortOrder, bookingsData]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const pageData = filteredData.slice(startIndex, endIndex);

  const handleDelete = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa đơn đặt chỗ này?")) {
      setBookingsData(bookingsData.filter((b) => b.id !== id));
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { label: "Completed", className: "status-completed" },
      pending: { label: "Pending", className: "status-pending" },
      cancelled: { label: "Cancelled", className: "status-cancelled" },
    };
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`booking-status ${config.className}`}>
        {config.label}
      </span>
    );
  };

  // Pagination handlers
  const goToPage = (page) => {
    setCurrentPage(page);
  };

  const renderPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(
          <button
            key={i}
            className={`page-number ${i === currentPage ? "active" : ""}`}
            onClick={() => goToPage(i)}
          >
            {i}
          </button>
        );
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 3; i++) {
          pages.push(
            <button
              key={i}
              className={`page-number ${i === currentPage ? "active" : ""}`}
              onClick={() => goToPage(i)}
            >
              {i}
            </button>
          );
        }
        pages.push(
          <span key="ellipsis1" className="page-ellipsis">
            ...
          </span>
        );
        pages.push(
          <button
            key={totalPages}
            className="page-number"
            onClick={() => goToPage(totalPages)}
          >
            {totalPages}
          </button>
        );
      } else if (currentPage >= totalPages - 2) {
        pages.push(
          <button key={1} className="page-number" onClick={() => goToPage(1)}>
            1
          </button>
        );
        pages.push(
          <span key="ellipsis1" className="page-ellipsis">
            ...
          </span>
        );
        for (let i = totalPages - 2; i <= totalPages; i++) {
          pages.push(
            <button
              key={i}
              className={`page-number ${i === currentPage ? "active" : ""}`}
              onClick={() => goToPage(i)}
            >
              {i}
            </button>
          );
        }
      } else {
        pages.push(
          <button key={1} className="page-number" onClick={() => goToPage(1)}>
            1
          </button>
        );
        pages.push(
          <span key="ellipsis1" className="page-ellipsis">
            ...
          </span>
        );
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(
            <button
              key={i}
              className={`page-number ${i === currentPage ? "active" : ""}`}
              onClick={() => goToPage(i)}
            >
              {i}
            </button>
          );
        }
        pages.push(
          <span key="ellipsis2" className="page-ellipsis">
            ...
          </span>
        );
        pages.push(
          <button
            key={totalPages}
            className="page-number"
            onClick={() => goToPage(totalPages)}
          >
            {totalPages}
          </button>
        );
      }
    }
    return pages;
  };

  return (
    <DashboardLayout title="Booking">
      <div className="managers-content">
        <div className="chart-card">
          {/* Controls */}
          <div className="booking-controls">
            <div className="booking-tab">
              <span className="booking-tab-active">
                Tất cả đơn đặt chỗ ({filteredData.length})
              </span>
            </div>
            <div className="booking-actions">
              <div className="search-container">
                <Search className="search-icon" size={16} />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Tìm kiếm theo ID, Tên"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="sort-dropdown-container">
                <button
                  className="sort-dropdown-btn"
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                >
                  {sortOrder === "newest" ? "Sớm nhất" : "Muộn nhất"}
                  <ChevronDown size={16} />
                </button>
                {showSortDropdown && (
                  <div className="sort-dropdown-menu">
                    <button
                      className={sortOrder === "newest" ? "active" : ""}
                      onClick={() => {
                        setSortOrder("newest");
                        setShowSortDropdown(false);
                      }}
                    >
                      Sớm nhất
                    </button>
                    <button
                      className={sortOrder === "oldest" ? "active" : ""}
                      onClick={() => {
                        setSortOrder("oldest");
                        setShowSortDropdown(false);
                      }}
                    >
                      Muộn nhất
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="table-section-managers">
            <div className="table-container-managers">
              <table className="booking-table">
                <thead>
                  <tr>
                    <th style={{ width: "10%" }}>Mã đặt chỗ</th>
                    <th style={{ width: "20%" }}>Họ và tên</th>
                    <th style={{ width: "22%" }}>Email</th>
                    <th style={{ width: "14%" }}>Ngày đặt</th>
                    <th style={{ width: "14%" }}>Trạng thái</th>
                    <th style={{ width: "12%" }}>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {pageData.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="no-data">
                        <Plane size={32} />
                        <p>Không tìm thấy đơn đặt chỗ</p>
                      </td>
                    </tr>
                  ) : (
                    pageData.map((item) => (
                      <tr key={item.id}>
                        <td className="booking-id">{item.id}</td>
                        <td>{item.fullname}</td>
                        <td>{item.email}</td>
                        <td>{formatDate(item.bookingDate)}</td>
                        <td>{getStatusBadge(item.status)}</td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="action-btn edit"
                              title="Chỉnh sửa"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              className="action-btn delete"
                              title="Xóa"
                              onClick={() => handleDelete(item.id)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination-container">
              <div className="pagination-controls">
                <button
                  className="pagination-btn"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft size={18} />
                </button>
                <div className="page-numbers">{renderPageNumbers()}</div>
                <button
                  className="pagination-btn"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .booking-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          gap: 1rem;
        }
        
        .booking-tab {
          border-bottom: 2px solid transparent;
        }
        
        .booking-tab-active {
          color: var(--text-dark);
          font-weight: 600;
          font-size: 0.95rem;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid var(--primary-color);
          display: inline-block;
        }
        
        .booking-actions {
          display: flex;
          gap: 1rem;
          align-items: center;
        }
        
        .sort-dropdown-container {
          position: relative;
        }
        
        .sort-dropdown-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          border: 1px solid var(--extra-light);
          border-radius: 8px;
          background: var(--white);
          color: var(--text-dark);
          font-size: 0.875rem;
          cursor: pointer;
          transition: var(--transition);
          font-family: "DM Sans", sans-serif;
        }
        
        .sort-dropdown-btn:hover {
          border-color: var(--primary-color);
        }
        
        .sort-dropdown-menu {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 0.5rem;
          background: var(--white);
          border: 1px solid var(--extra-light);
          border-radius: 8px;
          box-shadow: var(--box-shadow);
          z-index: 100;
          min-width: 150px;
          overflow: hidden;
        }
        
        .sort-dropdown-menu button {
          display: block;
          width: 100%;
          padding: 0.75rem 1rem;
          border: none;
          background: none;
          text-align: left;
          font-size: 0.875rem;
          color: var(--text-dark);
          cursor: pointer;
          transition: var(--transition);
          font-family: "DM Sans", sans-serif;
        }
        
        .sort-dropdown-menu button:hover {
          background: var(--extra-light);
        }
        
        .sort-dropdown-menu button.active {
          background: rgba(135, 179, 234, 0.1);
          color: var(--primary-color);
          font-weight: 500;
        }
        
        .booking-id {
          font-weight: 600;
          color: var(--text-dark) !important;
        }
        
        .booking-status {
          padding: 0.375rem 0.875rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 500;
          display: inline-block;
        }
        
        .status-completed {
          background: #dcfce7;
          color: #166534;
        }
        
        .status-pending {
          background: #fef3c7;
          color: #92400e;
        }
        
        .status-cancelled {
          background: #fee2e2;
          color: #991b1b;
        }
        
        body.dark-mode .sort-dropdown-menu {
          background: var(--white);
          border-color: #374151;
        }
      `}</style>
    </DashboardLayout>
  );
};

export default Booking;
