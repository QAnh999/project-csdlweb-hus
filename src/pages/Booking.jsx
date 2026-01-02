import React, { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import {
  Search,
  Info,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Plane,
  X,
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
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
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

  const handleViewDetail = (booking) => {
    setSelectedBooking(booking);
    setShowDetailModal(true);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
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
                              className="action-btn view"
                              title="Xem chi tiết"
                              onClick={() => handleViewDetail(item)}
                            >
                              <Info size={16} />
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

      {/* Booking Detail Modal */}
      {showDetailModal && selectedBooking && (
        <div
          className="modal-backdrop"
          onClick={() => setShowDetailModal(false)}
        >
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Chi tiết đơn đặt chỗ</h2>
              <button
                className="modal-close"
                onClick={() => setShowDetailModal(false)}
              >
                <X size={24} />
              </button>
            </div>
            <div className="booking-detail-content">
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Mã đặt chỗ</label>
                  <span className="detail-value highlight">
                    {selectedBooking.id}
                  </span>
                </div>
                <div className="detail-item">
                  <label>Mã chuyến bay</label>
                  <span className="detail-value highlight">
                    {selectedBooking.flightCode}
                  </span>
                </div>
                <div className="detail-item">
                  <label>Tổng hành khách</label>
                  <span className="detail-value">
                    {selectedBooking.passengers} người
                  </span>
                </div>
                <div className="detail-item">
                  <label>Tổng tiền</label>
                  <span className="detail-value price">
                    {formatPrice(selectedBooking.totalPrice)}
                  </span>
                </div>
              </div>
              <div className="detail-divider"></div>
              <div className="detail-section">
                <h3>Thông tin khách hàng</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Họ và tên</label>
                    <span className="detail-value">
                      {selectedBooking.fullname}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Email</label>
                    <span className="detail-value">
                      {selectedBooking.email}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Số điện thoại</label>
                    <span className="detail-value">
                      {selectedBooking.phone}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Ngày đặt</label>
                    <span className="detail-value">
                      {formatDate(selectedBooking.bookingDate)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="detail-divider"></div>
              <div className="detail-section">
                <h3>Thông tin chuyến bay</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Điểm đi</label>
                    <span className="detail-value">
                      {selectedBooking.departure}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Điểm đến</label>
                    <span className="detail-value">
                      {selectedBooking.arrival}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Trạng thái</label>
                    {getStatusBadge(selectedBooking.status)}
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn-cancel"
                onClick={() => setShowDetailModal(false)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

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
        
        /* Modal Styles */
        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          animation: fadeIn 0.2s ease;
        }
        
        .modal-container {
          background: var(--white);
          border-radius: var(--border-radius);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
          max-width: 550px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          animation: slideUp 0.3s ease;
        }
        
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid var(--extra-light);
        }
        
        .modal-header h2 {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-dark);
          margin: 0;
        }
        
        .modal-close {
          background: none;
          border: none;
          color: var(--text-light);
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 6px;
          transition: var(--transition);
        }
        
        .modal-close:hover {
          background: var(--extra-light);
          color: var(--text-dark);
        }
        
        .booking-detail-content {
          padding: 1.5rem;
        }
        
        .detail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
        }
        
        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        
        .detail-item label {
          font-size: 0.75rem;
          color: var(--text-light);
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .detail-value {
          font-size: 0.95rem;
          color: var(--text-dark);
          font-weight: 500;
        }
        
        .detail-value.highlight {
          color: var(--primary-color);
          font-weight: 600;
          font-size: 1.1rem;
        }
        
        .detail-value.price {
          color: #10b981;
          font-weight: 600;
          font-size: 1.1rem;
        }
        
        .detail-divider {
          height: 1px;
          background: var(--extra-light);
          margin: 1.5rem 0;
        }
        
        .detail-section h3 {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-dark);
          margin-bottom: 1rem;
        }
        
        .modal-footer {
          padding: 1rem 1.5rem;
          border-top: 1px solid var(--extra-light);
          display: flex;
          justify-content: flex-end;
        }
        
        .btn-cancel {
          padding: 0.75rem 1.5rem;
          border: 1px solid var(--extra-light);
          background: var(--white);
          color: var(--text-dark);
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: var(--transition);
          font-family: "DM Sans", sans-serif;
        }
        
        .btn-cancel:hover {
          background: var(--extra-light);
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        body.dark-mode .sort-dropdown-menu {
          background: var(--white);
          border-color: #374151;
        }
        
        body.dark-mode .modal-container {
          background: var(--white);
        }
        
        @media (max-width: 500px) {
          .detail-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </DashboardLayout>
  );
};

export default Booking;
