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
import "../styles/booking.css";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const Booking = () => {
  const [bookingsData, setBookingsData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [sortOrder, setSortOrder] = useState("newest");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const itemsPerPage = 8;

  const fetchBookings = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/booking/`);
      setBookingsData(
        response.data.map((item) => ({
          id: item.reservation_code,
          bookingId: item.id, // Backend returns 'id' as booking_id
          fullname: item.user_name,
          email: item.email,
          bookingDate: item.booking_time,
          status: item.status,
        }))
      );
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

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

  const handleViewDetail = async (bookingId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/admin/booking/${bookingId}`
      );
      const data = response.data;
      setSelectedBooking({
        // Booking
        id: data.booking_id,
        reservationCode: data.reservation_code,

        // User
        fullname: data.user_info?.name || "N/A",
        email: data.user_info?.email || "N/A",
        phone: data.user_info?.phone || "N/A",

        // Flight
        flightCode: data.flight_info?.main_flight?.flight_number || "N/A",
        departure: data.flight_info?.main_flight?.departure || "N/A",
        arrival: data.flight_info?.main_flight?.arrival || "N/A",
        returnFlight: data.flight_info?.return_flight || null,

        // Booking detail
        passengers: data.booking_details?.total_passengers || 0,
        totalPrice: data.booking_details?.total_amount || 0,
        paidAmount: data.booking_details?.paid_amount || 0,
        discount: data.booking_details?.discount_amount || 0,
        status: data.booking_details?.status || "pending",
        bookingDate: data.booking_details?.created_at || null,

        // Payment - handle null payment_info
        paymentMethod: data.payment_info?.payment_method || "Chưa thanh toán",
        transactionId: data.payment_info?.transaction_id || "N/A",
        paymentStatus: data.payment_info?.status || "pending",

        // Passengers list
        passengersList: data.passengers || [],
      });
      setShowDetailModal(true);
    } catch (error) {
      console.error("Error fetching booking details:", error);
      alert("Không thể tải chi tiết đơn đặt chỗ. Vui lòng thử lại!");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  const formatDateTime = (dateString) => {
    if (!dateString || dateString === "N/A") return "N/A";
    const date = new Date(dateString);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${hours}:${minutes} ${day}/${month}/${year}`;
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
                              onClick={() => handleViewDetail(item.bookingId)}
                            >
                              <Info size={16} />
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
                    <label>Thời gian đi</label>
                    <span className="detail-value">
                      {formatDateTime(selectedBooking.departure)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Thời gian đến</label>
                    <span className="detail-value">
                      {formatDateTime(selectedBooking.arrival)}
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
    </DashboardLayout>
  );
};

export default Booking;
