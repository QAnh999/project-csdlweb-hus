import React, { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  History,
  X,
  Filter,
  ChevronLeft,
  ChevronRight,
  Users,
  Loader2,
  Info,
} from "lucide-react";
import "../styles/main.css";
import "../styles/managers.css";
import axios from "axios";

const API_BASE_URL = "http://localhost:8000/admin";

// Helper function to get authorization headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("accessToken");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

const Manager = () => {
  const [customersData, setCustomersData] = useState([]);
  const [adminsData, setAdminsData] = useState([]);
  const [superAdminsData, setSuperAdminsData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Get current user role from localStorage
  const currentUserRole = localStorage.getItem("userRole");
  const isSuperAdmin = currentUserRole === "super_admin";

  const [currentTab, setCurrentTab] = useState("customer");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const itemsPerPage = 10;

  // Modal states
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showUserInfoModal, setShowUserInfoModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewingCustomerId, setViewingCustomerId] = useState(null);
  const [bookingSearchQuery, setBookingSearchQuery] = useState("");
  const [bookingHistoryData, setBookingHistoryData] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  // Form states
  const [customerForm, setCustomerForm] = useState({
    fullname: "",
    email: "",
    phone: "",
    gender: "",
    address: "",
  });

  const [adminForm, setAdminForm] = useState({
    admin_name: "",
    email: "",
    password: "",
    full_name: "",
    role: "Admin",
  });

  // Fetch data from API
  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/managers/users`, {
        headers: getAuthHeaders(),
      });
      const data = response.data;
      setCustomersData(
        data.map((u) => ({
          id: u.id,
          fullname: u.full_name,
          email: u.email,
          joined: u.joined_date,
          bookings: [],
        }))
      );
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchAdmins = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/managers/admins`);
      if (!response.ok) throw new Error("Failed to fetch admins");
      const data = await response.json();
      setAdminsData(
        data.map((a) => ({
          id: a.admin_id,
          fullname: a.full_name,
          username: a.admin_name,
          email: a.email,
          role: a.role,
          status: a.status,
          type: "admin",
        }))
      );
    } catch (error) {
      console.error("Error fetching admins:", error);
    }
  };

  const fetchSuperAdmins = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/managers/admins/super`,
        {
          headers: getAuthHeaders(),
        }
      );
      const data = response.data;
      setSuperAdminsData(
        data.map((s) => ({
          id: s.admin_id,
          fullname: s.full_name,
          username: s.admin_name,
          email: s.email,
          role: "Siêu quản trị viên",
          status: s.status,
          type: "super_admin",
        }))
      );
    } catch (error) {
      console.error("Error fetching super admins:", error);
    }
  };

  // Load all data on mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchUsers(), fetchAdmins(), fetchSuperAdmins()]);
      setIsLoading(false);
    };
    loadData();
  }, []);

  // Filter data based on tab and search
  useEffect(() => {
    let data = [];
    if (currentTab === "customer") {
      data = customersData;
    } else if (currentTab === "admin") {
      data = adminsData;
    } else if (currentTab === "super-admin") {
      data = superAdminsData;
    }

    if (searchQuery) {
      data = data.filter((item) => {
        const matchesId = item.id
          .toString()
          .includes(searchQuery.toLowerCase());
        const matchesName = (item.fullname || item.username || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
        const matchesEmail = item.email
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
        return matchesId || matchesName || matchesEmail;
      });
    }

    setFilteredData(data);
    setCurrentPage(1);
  }, [currentTab, searchQuery, customersData, adminsData, superAdminsData]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const pageData = filteredData.slice(startIndex, endIndex);

  const handleTabChange = (tab) => {
    setCurrentTab(tab);
    setSearchQuery("");
  };

  // Customer handlers
  const handleViewUserInfo = async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/managers/users/${id}`, {
        headers: getAuthHeaders(),
      });

      const u = response.data;

      setSelectedUser({
        id: u.id,
        fullname: u.full_name,
        email: u.email,
        phone: u.phone,
        address: u.address,
        birthday: u.date_of_birth,
        gender: u.gender,
        joined: u.joined_date,
      });

      setShowUserInfoModal(true);
    } catch (err) {
      console.error("Không lấy được thông tin user", err);
    }
  };

  const handleDeleteCustomer = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa khách hàng này?")) {
      try {
        const response = await fetch(`${API_BASE_URL}/managers/users/${id}`, {
          method: "DELETE",
          headers: getAuthHeaders(),
        });

        if (response.status === 204) {
          // Refresh user list
          await fetchUsers();
          alert("Xóa khách hàng thành công!");
          return;
        }

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || "Failed to delete user");
        }
      } catch (error) {
        console.error("Error deleting user:", error);
        alert(error.message || "Có lỗi xảy ra khi xóa khách hàng!");
      }
    }
  };

  const handleCustomerSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      setCustomersData(
        customersData.map((c) =>
          c.id === editingId ? { ...c, ...customerForm } : c
        )
      );
      alert("Cập nhật khách hàng thành công!");
    }
    setShowCustomerModal(false);
    setEditingId(null);
    setCustomerForm({
      fullname: "",
      email: "",
      phone: "",
      gender: "",
      address: "",
    });
  };

  // Booking history handlers
  const handleViewBookingHistory = async (customerId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/managers/users/${customerId}/bookings`,
        {
          headers: getAuthHeaders(),
        }
      );
      const data = response.data;

      // data là object có cấu trúc: { user_info, bookings, stats, payment_info }
      // bookings là array chứa các booking
      const bookings = data.bookings || [];

      setBookingHistoryData(
        bookings.map((b) => ({
          bookingId: b.booking_id,
          reservationCode: b.reservation_code,
          flightId: b.main_flight?.flight_id,
          flightNumber: b.main_flight?.flight_number,
          departure: b.main_flight?.departure,
          arrival: b.main_flight?.arrival,
          departureCity: b.main_flight?.departure_city,
          arrivalCity: b.main_flight?.arrival_city,
          bookingDate: b.created_at,
          totalAmount: b.total_amount,
          paidAmount: b.paid_amount,
          status: b.status,
          totalPassengers: b.total_passengers,
          hasReturnFlight: b.has_return_flight,
        }))
      );
      setViewingCustomerId(customerId);
      setBookingSearchQuery("");
      setShowBookingModal(true);
    } catch (err) {
      console.error("Không lấy được lịch sử đặt chuyến bay", err);
      alert("Không thể tải lịch sử đặt chuyến bay!");
    }
  };

  const getBookingHistory = () => {
    let bookings = bookingHistoryData;

    if (bookingSearchQuery) {
      bookings = bookings.filter(
        (b) =>
          b.bookingId?.toString().includes(bookingSearchQuery) ||
          b.flightId?.toString().includes(bookingSearchQuery) ||
          b.reservationCode
            ?.toLowerCase()
            .includes(bookingSearchQuery.toLowerCase()) ||
          b.flightNumber
            ?.toLowerCase()
            .includes(bookingSearchQuery.toLowerCase())
      );
    }
    return bookings;
  };

  // Admin handlers
  const handleAddAdmin = () => {
    if (!isSuperAdmin) {
      alert("Chỉ Siêu quản trị viên mới có quyền tạo quản trị viên mới!");
      return;
    }
    if (currentTab === "customer") {
      alert("Vui lòng chọn tab Quản trị viên để thêm mới");
      return;
    }
    setEditingId(null);
    setAdminForm({
      admin_name: "",
      email: "",
      password: "",
      full_name: "",
      role: "Admin",
    });
    setShowAdminModal(true);
  };

  const handleDeleteAdmin = async (id) => {
    if (!isSuperAdmin) {
      alert("Chỉ Siêu quản trị viên mới có quyền xóa quản trị viên!");
      return;
    }

    if (window.confirm("Bạn có chắc chắn muốn xóa quản trị viên này?")) {
      try {
        const response = await fetch(`${API_BASE_URL}/managers/admins/${id}`, {
          method: "DELETE",
          headers: getAuthHeaders(),
        });

        if (response.status === 204) {
          // Refresh admin list
          await fetchAdmins();
          alert("Xóa quản trị viên thành công!");
          return;
        }

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || "Failed to delete admin");
        }
      } catch (error) {
        console.error("Error deleting admin:", error);
        alert(error.message || "Có lỗi xảy ra khi xóa quản trị viên!");
      }
    }
  };

  const handleAdminSubmit = async (e) => {
    e.preventDefault();

    if (editingId) {
      setAdminsData(
        adminsData.map((a) =>
          a.id === editingId
            ? {
                ...a,
                fullname: adminForm.full_name,
                email: adminForm.email,
                role: adminForm.role,
              }
            : a
        )
      );
      alert("Cập nhật quản trị viên thành công!");
    } else {
      // Add new admin via API
      try {
        const response = await fetch(`${API_BASE_URL}/managers/admins`, {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            admin_name: adminForm.admin_name,
            password: adminForm.password,
            full_name: adminForm.full_name,
            email: adminForm.email,
            role: "Admin",
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || "Failed to create admin");
        }

        const data = await response.json();
        if (data.admin_id) {
          // Refresh admin list
          if (adminForm.role === "Super Admin") {
            await fetchSuperAdmins();
          } else {
            await fetchAdmins();
          }
          alert("Tạo quản trị viên mới thành công!");
        }
      } catch (error) {
        console.error("Error creating admin:", error);
        alert(error.message || "Có lỗi xảy ra khi tạo quản trị viên!");
        return;
      }
    }

    setShowAdminModal(false);
    setEditingId(null);
    setAdminForm({
      admin_name: "",
      email: "",
      password: "",
      full_name: "",
      role: "Admin",
    });
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
    <DashboardLayout title="Managers">
      <div className="managers-content">
        {/* Tabs */}
        <div className="tabs-container">
          <button
            className={`tab-btn ${currentTab === "customer" ? "active" : ""}`}
            onClick={() => handleTabChange("customer")}
          >
            Khách hàng
          </button>
          <button
            className={`tab-btn ${currentTab === "admin" ? "active" : ""}`}
            onClick={() => handleTabChange("admin")}
          >
            Quản trị viên
          </button>
          <button
            className={`tab-btn ${
              currentTab === "super-admin" ? "active" : ""
            }`}
            onClick={() => handleTabChange("super-admin")}
          >
            Siêu quản trị viên
          </button>
        </div>

        {/* Controls Section */}
        <div className="controls-section">
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
          {isSuperAdmin && currentTab !== "customer" && (
            <button className="add-btn" onClick={handleAddAdmin}>
              <Plus size={16} /> Tạo quản trị viên mới
            </button>
          )}
        </div>

        {/* Table Section */}
        <div className="table-section-managers">
          <div className="table-container-managers">
            {isLoading ? (
              <div
                className="loading-container"
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  padding: "60px",
                }}
              >
                <Loader2 className="animate-spin" size={32} />
                <span style={{ marginLeft: "10px" }}>Đang tải dữ liệu...</span>
              </div>
            ) : (
              <table className="managers-table">
                <thead>
                  {currentTab === "customer" ? (
                    <tr>
                      <th>Mã khách hàng</th>
                      <th>Họ và tên</th>
                      <th>Email</th>
                      <th>Ngày tham gia</th>
                      <th>Hành động</th>
                    </tr>
                  ) : (
                    <tr>
                      <th>ID quản trị viên</th>
                      <th>Tên</th>
                      <th>Vai trò</th>
                      <th>E-mail</th>
                      <th>Hành động</th>
                    </tr>
                  )}
                </thead>
                <tbody>
                  {pageData.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="no-data">
                        <Users size={32} />
                        <p>Không tìm thấy dữ liệu</p>
                      </td>
                    </tr>
                  ) : currentTab === "customer" ? (
                    pageData.map((item) => (
                      <tr key={item.id}>
                        <td>{item.id}</td>
                        <td>{item.fullname}</td>
                        <td>{item.email}</td>
                        <td>
                          <span className="joined-date">{item.joined}</span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="action-btn view"
                              onClick={() => handleViewUserInfo(item.id)}
                              title="Xem thông tin"
                            >
                              <Info size={16} />
                            </button>
                            <button
                              className="action-btn delete"
                              onClick={() => handleDeleteCustomer(item.id)}
                              title="Xóa"
                            >
                              <Trash2 size={16} />
                            </button>
                            <button
                              className="action-btn history"
                              onClick={() => handleViewBookingHistory(item.id)}
                              title="Xem lịch sử đặt chuyến bay"
                            >
                              <History size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    pageData.map((item) => (
                      <tr key={item.id}>
                        <td>{item.id}</td>
                        <td>{item.fullname || item.username}</td>
                        <td>{item.role}</td>
                        <td>{item.email}</td>
                        <td>
                          <div className="action-buttons">
                            {isSuperAdmin && (
                              <>
                                <button
                                  className="action-btn delete"
                                  onClick={() => handleDeleteAdmin(item.id)}
                                  title="Xóa"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </>
                            )}
                            {!isSuperAdmin && (
                              <span style={{ color: "#999", fontSize: "12px" }}>
                                Không có quyền
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
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

      {/* Edit Customer Modal */}
      {showCustomerModal && (
        <div
          className="modal-backdrop"
          onClick={() => setShowCustomerModal(false)}
        >
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Chỉnh sửa khách hàng</h2>
              <button
                className="modal-close"
                onClick={() => setShowCustomerModal(false)}
              >
                <X size={24} />
              </button>
            </div>
            <form className="manager-form" onSubmit={handleCustomerSubmit}>
              <div className="form-section">
                <h3>Thông tin cá nhân</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Họ và tên đầy đủ *</label>
                    <input
                      type="text"
                      value={customerForm.fullname}
                      onChange={(e) =>
                        setCustomerForm({
                          ...customerForm,
                          fullname: e.target.value,
                        })
                      }
                      placeholder="Nguyễn Văn A"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>E-mail *</label>
                    <input
                      type="email"
                      value={customerForm.email}
                      onChange={(e) =>
                        setCustomerForm({
                          ...customerForm,
                          email: e.target.value,
                        })
                      }
                      placeholder="example@email.com"
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Số điện thoại</label>
                    <input
                      type="tel"
                      value={customerForm.phone}
                      onChange={(e) =>
                        setCustomerForm({
                          ...customerForm,
                          phone: e.target.value,
                        })
                      }
                      placeholder="0123456789"
                    />
                  </div>
                  <div className="form-group">
                    <label>Giới tính</label>
                    <select
                      value={customerForm.gender}
                      onChange={(e) =>
                        setCustomerForm({
                          ...customerForm,
                          gender: e.target.value,
                        })
                      }
                    >
                      <option value="">Chọn giới tính</option>
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                      <option value="Khác">Khác</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Địa chỉ</label>
                  <input
                    type="text"
                    value={customerForm.address}
                    onChange={(e) =>
                      setCustomerForm({
                        ...customerForm,
                        address: e.target.value,
                      })
                    }
                    placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                  />
                </div>
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowCustomerModal(false)}
                >
                  Hủy
                </button>
                <button type="submit" className="btn-submit">
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Booking History Modal */}
      {showBookingModal && (
        <div
          className="modal-backdrop"
          onClick={() => setShowBookingModal(false)}
        >
          <div
            className="modal-container large-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Lịch sử đặt chuyến bay</h2>
              <button
                className="modal-close"
                onClick={() => setShowBookingModal(false)}
              >
                <X size={24} />
              </button>
            </div>
            <div className="booking-history-content">
              <div className="booking-table-container">
                <table className="booking-history-table">
                  <thead>
                    <tr>
                      <th>Mã đặt chỗ</th>
                      <th>Chuyến bay</th>
                      <th>Hành trình</th>
                      <th>Thời gian đặt</th>
                      <th>Tổng tiền</th>
                      <th>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getBookingHistory().length === 0 ? (
                      <tr>
                        <td colSpan="6" className="no-data">
                          <p>Không có lịch sử đặt chuyến bay</p>
                        </td>
                      </tr>
                    ) : (
                      getBookingHistory().map((booking) => (
                        <tr key={booking.bookingId}>
                          <td style={{ wordBreak: "break-all", fontSize: "0.75rem" }}>
                            <strong>{booking.reservationCode}</strong>
                          </td>
                          <td>
                            <strong>{booking.flightNumber}</strong>
                            <br />
                            <small style={{ color: "#666", fontSize: "0.7rem" }}>
                              {booking.totalPassengers} khách
                            </small>
                          </td>
                          <td style={{ fontSize: "0.75rem" }}>
                            {booking.departureCity} → {booking.arrivalCity}
                            {booking.hasReturnFlight && (
                              <span style={{ color: "#0066cc", display: "block", fontSize: "0.7rem" }}>
                                (Khứ hồi)
                              </span>
                            )}
                          </td>
                          <td style={{ fontSize: "0.75rem" }}>
                            {booking.bookingDate
                              ? new Date(booking.bookingDate).toLocaleString(
                                  "vi-VN",
                                  { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" }
                                )
                              : "-"}
                          </td>
                          <td>
                            <strong style={{ fontSize: "0.85rem" }}>
                              {(booking.totalAmount / 1000000).toFixed(2)}M
                            </strong>
                            <br />
                            <small style={{ color: "#28a745", fontSize: "0.7rem" }}>
                              Trả: {(booking.paidAmount / 1000000).toFixed(2)}M
                            </small>
                          </td>
                          <td>
                            <span
                              className={`status-badge ${
                                booking.status === "confirmed"
                                  ? "active"
                                  : booking.status === "pending"
                                  ? "pending"
                                  : booking.status === "cancelled"
                                  ? "inactive"
                                  : ""
                              }`}
                            >
                              {booking.status === "confirmed"
                                ? "Xác nhận"
                                : booking.status === "pending"
                                ? "Chờ"
                                : booking.status === "cancelled"
                                ? "Hủy"
                                : booking.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Info Modal */}
      {showUserInfoModal && selectedUser && (
        <div
          className="modal-backdrop"
          onClick={() => setShowUserInfoModal(false)}
        >
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Thông tin người dùng</h2>
              <button
                className="modal-close"
                onClick={() => setShowUserInfoModal(false)}
              >
                <X size={24} />
              </button>
            </div>
            <div className="user-info-content">
              <div className="user-avatar">
                <Users size={48} />
              </div>
              <div className="info-grid">
                <div className="info-item">
                  <label>Họ và tên</label>
                  <span className="info-value">
                    {selectedUser.fullname || "Chưa cập nhật"}
                  </span>
                </div>
                <div className="info-item">
                  <label>Email</label>
                  <span className="info-value">{selectedUser.email}</span>
                </div>
                <div className="info-item">
                  <label>Số điện thoại</label>
                  <span className="info-value">
                    {selectedUser.phone || "Chưa cập nhật"}
                  </span>
                </div>
                <div className="info-item">
                  <label>Địa chỉ</label>
                  <span className="info-value">
                    {selectedUser.address || "Chưa cập nhật"}
                  </span>
                </div>
                <div className="info-item">
                  <label>Ngày sinh</label>
                  <span className="info-value">
                    {selectedUser.birthday || "Chưa cập nhật"}
                  </span>
                </div>
                <div className="info-item">
                  <label>Giới tính</label>
                  <span className="info-value">
                    {selectedUser.gender || "Chưa cập nhật"}
                  </span>
                </div>
                <div className="info-item">
                  <label>Ngày tham gia</label>
                  <span className="info-value">
                    {selectedUser.joined || "Chưa cập nhật"}
                  </span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn-cancel"
                onClick={() => setShowUserInfoModal(false)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Admin Modal */}
      {showAdminModal && (
        <div
          className="modal-backdrop"
          onClick={() => setShowAdminModal(false)}
        >
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {editingId
                  ? "Chỉnh sửa quản trị viên"
                  : "Tạo quản trị viên mới"}
              </h2>
              <button
                className="modal-close"
                onClick={() => setShowAdminModal(false)}
              >
                <X size={24} />
              </button>
            </div>
            <form className="manager-form" onSubmit={handleAdminSubmit}>
              <div className="form-section">
                <h3>Thông tin đăng nhập</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Tên đăng nhập *</label>
                    <input
                      type="text"
                      value={adminForm.admin_name}
                      onChange={(e) =>
                        setAdminForm({
                          ...adminForm,
                          admin_name: e.target.value,
                        })
                      }
                      placeholder="minhanh"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>E-mail *</label>
                    <input
                      type="email"
                      value={adminForm.email}
                      onChange={(e) =>
                        setAdminForm({ ...adminForm, email: e.target.value })
                      }
                      placeholder="minhanh@example.com"
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Mật khẩu {editingId ? "" : "*"}</label>
                    <input
                      type="password"
                      value={adminForm.password}
                      onChange={(e) =>
                        setAdminForm({ ...adminForm, password: e.target.value })
                      }
                      placeholder="••••••••"
                      required={!editingId}
                    />
                  </div>
                  <div className="form-group">
                    <label>Vai trò *</label>
                    <select
                      value={adminForm.role}
                      onChange={(e) =>
                        setAdminForm({ ...adminForm, role: e.target.value })
                      }
                      required
                    >
                      <option value="Admin">Quản trị viên</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Thông tin cá nhân</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Họ và tên đầy đủ *</label>
                    <input
                      type="text"
                      value={adminForm.full_name}
                      onChange={(e) =>
                        setAdminForm({
                          ...adminForm,
                          full_name: e.target.value,
                        })
                      }
                      placeholder="Trần Minh Anh"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowAdminModal(false)}
                >
                  Hủy
                </button>
                <button type="submit" className="btn-submit">
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Manager;
