import React, { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import {
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  Tag,
} from "lucide-react";
import "../styles/main.css";
import "../styles/managers.css";
import "../styles/promotion.css";
import axios from "axios";

const API_BASE_URL = "http://localhost:8000";
const Promotion = () => {
  const [promotionsData, setPromotionsData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredData, setFilteredData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const itemsPerPage = 6;

  const fetchPromotionsData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/promotions`);
      const data = response.data;
      setPromotionsData(
        data.map((item) => ({
          id: item.id,
          code: item.code,
          name: item.name,
          description: item.description,
          startDate: item.start_date,
          endDate: item.end_date,
          status: item.status,
          isActive: item.status === "active",
        }))
      );
    } catch (error) {
      console.error("Error fetching promotions data:", error);
    }
  };
  useEffect(() => {
    fetchPromotionsData();
  }, []);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    discountType: "percentage",
    discountValue: "",
    minOrderAmount: "",
    maxDiscountAmount: "",
    usageLimit: "",
    startDate: "",
    endDate: "",
    isActive: true,
  });

  // Filter data
  useEffect(() => {
    let data = [...promotionsData];
    setFilteredData(data);
    setCurrentPage(1);
  }, [promotionsData]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const pageData = filteredData.slice(startIndex, endIndex);

  const handleAdd = () => {
    setEditingId(null);
    setFormData({
      code: "",
      name: "",
      description: "",
      discountType: "percentage",
      discountValue: "",
      minOrderAmount: "",
      maxDiscountAmount: "",
      usageLimit: "",
      startDate: "",
      endDate: "",
      isActive: true,
    });
    setShowModal(true);
  };

  const handleEdit = async (promotion) => {
    try {
      setIsLoading(true);
      // Fetch chi tiết đầy đủ của promotion từ API
      const response = await axios.get(
        `${API_BASE_URL}/promotions/${promotion.id}`
      );
      const data = response.data;

      setEditingId(promotion.id);
      setFormData({
        code: data.code || "",
        name: data.name || "",
        description: data.description || "",
        discountType: data.discount_type || "percentage",
        discountValue: data.discount_value
          ? data.discount_value.toString()
          : "",
        minOrderAmount: data.min_order_amount
          ? data.min_order_amount.toString()
          : "0",
        maxDiscountAmount: data.max_discount_amount
          ? data.max_discount_amount.toString()
          : "",
        usageLimit: data.usage_limit ? data.usage_limit.toString() : "0",
        startDate: data.start_date || "",
        endDate: data.end_date || "",
        isActive: data.is_active ?? true,
      });
      setShowModal(true);
    } catch (error) {
      console.error("Error fetching promotion details:", error);
      alert("Không thể tải thông tin khuyến mãi!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa khuyến mãi này?")) {
      try {
        await axios.delete(`${API_BASE_URL}/promotions/${id}`);
        await fetchPromotionsData();
        alert("Xóa khuyến mãi thành công!");
      } catch (error) {
        console.error("Error deleting promotion:", error);
        alert("Không thể xóa khuyến mãi!");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const promotionData = {
      code: formData.code,
      name: formData.name,
      description: formData.description || null,
      discount_type: formData.discountType,
      discount_value: parseFloat(formData.discountValue),
      min_order_amount: parseFloat(formData.minOrderAmount) || 0,
      max_discount_amount: formData.maxDiscountAmount
        ? parseFloat(formData.maxDiscountAmount)
        : null,
      usage_limit: parseInt(formData.usageLimit) || null,
      start_date: formData.startDate + "T00:00:00",
      end_date: formData.endDate + "T23:59:59",
      is_active: formData.isActive,
    };

    try {
      if (editingId) {
        // Update promotion
        await axios.put(
          `${API_BASE_URL}/promotions/${editingId}`,
          promotionData
        );
        alert("Cập nhật khuyến mãi thành công!");
      } else {
        // Create new promotion
        await axios.post(`${API_BASE_URL}/promotions`, promotionData);
        alert("Thêm khuyến mãi thành công!");
      }
      await fetchPromotionsData();
      setShowModal(false);
      setEditingId(null);
    } catch (error) {
      console.error("Error saving promotion:", error);
      if (error.response?.data?.detail) {
        alert(`Lỗi: ${error.response.data.detail}`);
      } else {
        alert("Không thể lưu khuyến mãi!");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  const getStatusBadge = (status) => {
    return status === "active" ? (
      <span className="promo-status status-active">Active</span>
    ) : (
      <span className="promo-status status-inactive">Inactive</span>
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
    <DashboardLayout title="Promotion">
      <div className="managers-content">
        <div className="chart-card">
          {/* Controls */}
          <div className="promo-controls">
            <div className="promo-tab">
              <span className="promo-tab-active">
                Khuyến mãi({filteredData.length})
              </span>
            </div>
            <button className="add-btn" onClick={handleAdd}>
              <Plus size={16} /> Thêm khuyến mãi
            </button>
          </div>

          {/* Table */}
          <div className="table-section-managers">
            <div className="table-container-managers">
              <table className="promo-table">
                <thead>
                  <tr>
                    <th style={{ width: "18%" }}>Tên</th>
                    <th style={{ width: "22%" }}>Mô tả</th>
                    <th style={{ width: "12%" }}>Ngày bắt đầu</th>
                    <th style={{ width: "12%" }}>Ngày kết thúc</th>
                    <th style={{ width: "12%" }}>Trạng thái</th>
                    <th style={{ width: "14%" }}>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {pageData.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="no-data">
                        <Tag size={32} />
                        <p>Không tìm thấy khuyến mãi</p>
                      </td>
                    </tr>
                  ) : (
                    pageData.map((item) => (
                      <tr key={item.id}>
                        <td className="promo-name">{item.name}</td>
                        <td className="promo-desc">{item.description}</td>
                        <td>{formatDate(item.startDate)}</td>
                        <td>{formatDate(item.endDate)}</td>
                        <td>{getStatusBadge(item.status)}</td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="action-btn edit"
                              title="Chỉnh sửa"
                              onClick={() => handleEdit(item)}
                              disabled={isLoading}
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              className="action-btn delete"
                              title="Xóa"
                              onClick={() => handleDelete(item.id)}
                              disabled={isLoading}
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

      {/* Add/Edit Promotion Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div
            className="modal-container promo-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>
                {editingId ? "Chỉnh sửa khuyến mãi" : "Thêm khuyến mãi mới"}
              </h2>
              <button
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                <X size={24} />
              </button>
            </div>
            <form className="promo-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Mã khuyến mãi *</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        code: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder="VD: CHAOHE25"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Tên khuyến mãi *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Nhập tên khuyến mãi"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Mô tả</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Nhập mô tả khuyến mãi"
                  rows={2}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Loại giảm giá *</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) =>
                      setFormData({ ...formData, discountType: e.target.value })
                    }
                    required
                  >
                    <option value="percentage">Phần trăm (%)</option>
                    <option value="fixed_amount">Số tiền cố định (VND)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Giá trị giảm *</label>
                  <input
                    type="number"
                    value={formData.discountValue}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discountValue: e.target.value,
                      })
                    }
                    placeholder={
                      formData.discountType === "percentage"
                        ? "VD: 25"
                        : "VD: 50000"
                    }
                    min="0"
                    step={
                      formData.discountType === "percentage" ? "0.01" : "1000"
                    }
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Ngày bắt đầu *</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Ngày kết thúc *</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Áp dụng với giá vé từ (VND)</label>
                  <input
                    type="number"
                    value={formData.minOrderAmount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        minOrderAmount: e.target.value,
                      })
                    }
                    placeholder="0"
                    min="0"
                    step="1000"
                  />
                </div>
                <div className="form-group">
                  <label>Giảm tối đa (VND)</label>
                  <input
                    type="number"
                    value={formData.maxDiscountAmount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxDiscountAmount: e.target.value,
                      })
                    }
                    placeholder="Không giới hạn"
                    min="0"
                    step="1000"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Số lượt sử dụng tối đa</label>
                  <input
                    type="number"
                    value={formData.usageLimit}
                    onChange={(e) =>
                      setFormData({ ...formData, usageLimit: e.target.value })
                    }
                    placeholder="0 = Không giới hạn"
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label>Trạng thái</label>
                  <select
                    value={formData.isActive}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        isActive: e.target.value === "true",
                      })
                    }
                  >
                    <option value="true">Đang hoạt động</option>
                    <option value="false">Tạm ngưng</option>
                  </select>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowModal(false)}
                  disabled={isLoading}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={isLoading}
                >
                  {isLoading
                    ? "Đang xử lý..."
                    : editingId
                    ? "Cập nhật"
                    : "Thêm mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Promotion;
