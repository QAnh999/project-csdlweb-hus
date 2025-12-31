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

// Sample promotion data based on SQL structure
const initialPromotionsData = [
  {
    id: 1,
    code: "CHAOHE25",
    name: "Khuyến mãi chào hè 25%",
    description: "Giảm 25% cho các chuyến bay nội địa",
    discountType: "percentage",
    discountValue: 25.0,
    minOrderAmount: 0,
    maxDiscountAmount: 300000.0,
    usageLimit: 1000,
    startDate: "2025-06-01",
    endDate: "2025-09-01",
    isActive: true,
  },
  {
    id: 2,
    code: "THANG10FIX",
    name: "Giảm cố định 50.000đ",
    description: "Giảm 50.000 đồng cho mọi đơn đặt vé trong tháng 10",
    discountType: "fixed_amount",
    discountValue: 50000.0,
    minOrderAmount: 0,
    maxDiscountAmount: null,
    usageLimit: 2000,
    startDate: "2025-10-01",
    endDate: "2025-10-31",
    isActive: false,
  },
  {
    id: 3,
    code: "VIPMEMBER",
    name: "Thành viên VIP giảm 15%",
    description: "Ưu đãi cho khách hàng thân thiết",
    discountType: "percentage",
    discountValue: 15.0,
    minOrderAmount: 1000000.0,
    maxDiscountAmount: null,
    usageLimit: 100,
    startDate: "2025-07-01",
    endDate: "2025-12-31",
    isActive: true,
  },
  {
    id: 4,
    code: "TET2025",
    name: "Khuyến mãi Tết 2025",
    description: "Giảm 20% vé khứ hồi",
    discountType: "percentage",
    discountValue: 20.0,
    minOrderAmount: 500000.0,
    maxDiscountAmount: null,
    usageLimit: 500,
    startDate: "2025-12-01",
    endDate: "2025-12-31",
    isActive: false,
  },
  {
    id: 5,
    code: "STUDENT50",
    name: "Giảm giá sinh viên",
    description: "Giảm 50.000đ cho sinh viên có thẻ",
    discountType: "fixed_amount",
    discountValue: 50000.0,
    minOrderAmount: 0,
    maxDiscountAmount: null,
    usageLimit: 1000,
    startDate: "2025-09-01",
    endDate: "2025-11-30",
    isActive: true,
  },
  {
    id: 6,
    code: "FLASHSALE",
    name: "Flash Sale 30%",
    description: "Giảm 30% trong 24h",
    discountType: "percentage",
    discountValue: 30.0,
    minOrderAmount: 200000.0,
    maxDiscountAmount: 500000.0,
    usageLimit: 200,
    startDate: "2025-01-15",
    endDate: "2025-01-16",
    isActive: false,
  },
  {
    id: 7,
    code: "NEWYEAR",
    name: "Năm mới 2025",
    description: "Mừng năm mới giảm 100.000đ",
    discountType: "fixed_amount",
    discountValue: 100000.0,
    minOrderAmount: 500000.0,
    maxDiscountAmount: null,
    usageLimit: 500,
    startDate: "2025-01-01",
    endDate: "2025-01-31",
    isActive: false,
  },
  {
    id: 8,
    code: "SUMMER2025",
    name: "Hè rực rỡ",
    description: "Giảm 10% cho tất cả chuyến bay mùa hè",
    discountType: "percentage",
    discountValue: 10.0,
    minOrderAmount: 0,
    maxDiscountAmount: 200000.0,
    usageLimit: 3000,
    startDate: "2025-05-01",
    endDate: "2025-08-31",
    isActive: false,
  },
];

const Promotion = () => {
  const [promotionsData, setPromotionsData] = useState(initialPromotionsData);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredData, setFilteredData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const itemsPerPage = 6;

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

  const handleEdit = (promotion) => {
    setEditingId(promotion.id);
    setFormData({
      code: promotion.code,
      name: promotion.name,
      description: promotion.description,
      discountType: promotion.discountType,
      discountValue: promotion.discountValue.toString(),
      minOrderAmount: promotion.minOrderAmount.toString(),
      maxDiscountAmount: promotion.maxDiscountAmount
        ? promotion.maxDiscountAmount.toString()
        : "",
      usageLimit: promotion.usageLimit.toString(),
      startDate: promotion.startDate,
      endDate: promotion.endDate,
      isActive: promotion.isActive,
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa khuyến mãi này?")) {
      setPromotionsData(promotionsData.filter((p) => p.id !== id));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const promotionData = {
      ...formData,
      discountValue: parseFloat(formData.discountValue),
      minOrderAmount: parseFloat(formData.minOrderAmount) || 0,
      maxDiscountAmount: formData.maxDiscountAmount
        ? parseFloat(formData.maxDiscountAmount)
        : null,
      usageLimit: parseInt(formData.usageLimit) || 0,
    };

    if (editingId) {
      setPromotionsData(
        promotionsData.map((p) =>
          p.id === editingId ? { ...p, ...promotionData } : p
        )
      );
    } else {
      const newId =
        promotionsData.length > 0
          ? Math.max(...promotionsData.map((p) => p.id)) + 1
          : 1;
      setPromotionsData([...promotionsData, { id: newId, ...promotionData }]);
    }
    setShowModal(false);
    setEditingId(null);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  const getStatusBadge = (isActive) => {
    return isActive ? (
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
                        <td>{getStatusBadge(item.isActive)}</td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="action-btn edit"
                              title="Chỉnh sửa"
                              onClick={() => handleEdit(item)}
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
                >
                  Hủy
                </button>
                <button type="submit" className="btn-submit">
                  {editingId ? "Cập nhật" : "Thêm mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .promo-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          gap: 1rem;
        }
        
        .promo-tab {
          border-bottom: 2px solid transparent;
        }
        
        .promo-tab-active {
          color: var(--text-dark);
          font-weight: 600;
          font-size: 0.95rem;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid var(--primary-color);
          display: inline-block;
        }
        
        .promo-name {
          font-weight: 600;
          color: var(--text-dark) !important;
          text-align: left !important;
        }
        
        .promo-desc {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          text-align: left !important;
        }
        
        .promo-status {
          padding: 0.375rem 0.875rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 500;
          display: inline-block;
        }
        
        .status-active {
          background: #dcfce7;
          color: #166534;
        }
        
        .status-inactive {
          background: #e5e7eb;
          color: #6b7280;
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
          max-width: 600px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          animation: slideUp 0.3s ease;
        }
        
        .promo-modal {
          max-width: 650px;
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
        
        .promo-form {
          padding: 1.5rem;
        }
        
        .form-group {
          margin-bottom: 1rem;
        }
        
        .form-group label {
          display: block;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-dark);
          margin-bottom: 0.5rem;
        }
        
        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 1px solid var(--extra-light);
          border-radius: 8px;
          font-size: 0.875rem;
          color: var(--text-dark);
          background: var(--white);
          transition: var(--transition);
          font-family: "DM Sans", sans-serif;
        }
        
        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgba(135, 179, 234, 0.1);
        }
        
        .form-group textarea {
          resize: vertical;
          min-height: 60px;
        }
        
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        
        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--extra-light);
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
        
        .btn-submit {
          padding: 0.75rem 1.5rem;
          border: none;
          background: var(--primary-color);
          color: var(--white);
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: var(--transition);
          font-family: "DM Sans", sans-serif;
        }
        
        .btn-submit:hover {
          background: #5b9ad6;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(135, 179, 234, 0.3);
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        body.dark-mode .modal-container {
          background: var(--white);
        }
        
        body.dark-mode .form-group input,
        body.dark-mode .form-group select,
        body.dark-mode .form-group textarea {
          background: var(--white);
          border-color: #374151;
          color: var(--text-dark);
        }
        
        @media (max-width: 600px) {
          .form-row {
            grid-template-columns: 1fr;
          }
          
          .promo-modal {
            max-width: 95%;
          }
        }
      `}</style>
    </DashboardLayout>
  );
};

export default Promotion;
