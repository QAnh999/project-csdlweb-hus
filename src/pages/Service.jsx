import React, { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  UtensilsCrossed,
  Armchair,
  Luggage,
  Shield,
} from "lucide-react";
import "../styles/main.css";
import "../styles/managers.css";
import "../styles/service.css";
import axios from "axios";

const API_BASE_URL = "http://localhost:8000/admin";

const categoryConfig = {
  meal: {
    label: "Meal",
    icon: UtensilsCrossed,
    color: "#10b981",
    bgColor: "#dcfce7",
  },
  seat: { label: "Seat", icon: Armchair, color: "#f59e0b", bgColor: "#fef3c7" },
  luggage: {
    label: "Luggage",
    icon: Luggage,
    color: "#8b5cf6",
    bgColor: "#ede9fe",
  },
  insurance: {
    label: "Insurance",
    icon: Shield,
    color: "#3b82f6",
    bgColor: "#dbeafe",
  },
  entertainment: {
    label: "Entertainment",
    icon: UtensilsCrossed,
    color: "#ef4444",
    bgColor: "#fee2e2",
  },
  priority: {
    label: "Priority",
    icon: Armchair,
    color: "#14b8a6",
    bgColor: "#ccfbf1",
  },
  transfer: {
    label: "Transfer",
    icon: Luggage,
    color: "#f63bf6ff",
    bgColor: "#f5c5f2ff",
  },
  comfort: {
    label: "Comfort",
    icon: Shield,
    color: "#f97316",
    bgColor: "#ffedd5",
  },
};

const Service = () => {
  const [servicesData, setServicesData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const itemsPerPage = 8;

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "meal",
    price: "",
  });

  const fetchServices = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/services/`);
      const data = response.data;
      setServicesData(
        data.map((item) => ({
          id: item.id,
          name: item.name,
          description: item.description || "",
          category: item.category,
          base_price: item.base_price,
        }))
      );
    } catch (error) {
      console.error("Error fetching services:", error);
      // Không hiện alert khi load lần đầu
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchServices()]);
      setIsLoading(false);
    };
    loadData();
  }, []);

  // Filter data
  useEffect(() => {
    let data = [...servicesData];

    if (searchQuery) {
      data = data.filter((item) => {
        const matchesName = item.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
        const matchesDesc = item.description
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
        return matchesName || matchesDesc;
      });
    }

    setFilteredData(data);
    setCurrentPage(1);
  }, [searchQuery, servicesData]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const pageData = filteredData.slice(startIndex, endIndex);

  const handleAdd = () => {
    setEditingId(null);
    setFormData({ name: "", description: "", category: "meal", price: "" });
    setShowModal(true);
  };

  const handleEdit = (service) => {
    setEditingId(service.id);
    setFormData({
      name: service.name,
      description: service.description,
      category: service.category,
      price: service.base_price.toString(),
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa dịch vụ này?")) {
      try {
        const response = await axios.delete(`${API_BASE_URL}/services/${id}`);
        if (response.data.message) {
          await fetchServices();
          alert("Xóa dịch vụ thành công!");
        }
      } catch (error) {
        alert(error.response?.data?.detail || "Đã xảy ra lỗi khi xóa dịch vụ.");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      try {
        await axios.put(`${API_BASE_URL}/services/${editingId}`, {
          name: formData.name,
          description: formData.description,
          category: formData.category,
          base_price: parseFloat(formData.price),
        });
        await fetchServices();
        alert("Cập nhật dịch vụ thành công!");
      } catch (error) {
        alert(
          error.response?.data?.detail || "Đã xảy ra lỗi khi cập nhật dịch vụ."
        );
        return;
      }
    } else {
      try {
        await axios.post(`${API_BASE_URL}/services/`, {
          name: formData.name,
          description: formData.description,
          category: formData.category,
          base_price: parseFloat(formData.price),
        });
        await fetchServices();
        alert("Thêm dịch vụ thành công!");
      } catch (error) {
        alert(
          error.response?.data?.detail || "Đã xảy ra lỗi khi thêm dịch vụ."
        );
        return;
      }
    }
    setShowModal(false);
    setEditingId(null);
    setFormData({ name: "", description: "", category: "meal", price: "" });
  };

  const formatPrice = (base_price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(base_price);
  };

  const getCategoryBadge = (category) => {
    const config = categoryConfig[category];
    if (!config) return null;
    return (
      <span
        className="category-badge"
        style={{
          backgroundColor: config.bgColor,
          color: config.color,
          border: `1px solid ${config.color}20`,
        }}
      >
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
    <DashboardLayout title="Service">
      <div className="managers-content">
        <div className="chart-card">
          {/* Controls */}
          <div className="service-controls">
            <div className="service-tab">
              <span className="service-tab-active">
                Dịch vụ({filteredData.length})
              </span>
            </div>
            <button className="add-btn" onClick={handleAdd}>
              <Plus size={16} /> Thêm dịch vụ
            </button>
          </div>

          {/* Table */}
          <div className="table-section-managers">
            <div className="table-container-managers">
              <table className="service-table">
                <thead>
                  <tr>
                    <th style={{ width: "20%" }}>Tên dịch vụ</th>
                    <th style={{ width: "35%" }}>Mô tả</th>
                    <th style={{ width: "15%" }}>Phân loại</th>
                    <th style={{ width: "15%" }}>Giá</th>
                    <th style={{ width: "15%" }}>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {pageData.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="no-data">
                        <UtensilsCrossed size={32} />
                        <p>Không tìm thấy dịch vụ</p>
                      </td>
                    </tr>
                  ) : (
                    pageData.map((item) => (
                      <tr key={item.id}>
                        <td className="service-name">{item.name}</td>
                        <td>{item.description}</td>
                        <td>{getCategoryBadge(item.category)}</td>
                        <td className="service-price">
                          {formatPrice(item.base_price)}
                        </td>
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

      {/* Add/Edit Service Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div
            className="modal-container service-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>{editingId ? "Chỉnh sửa dịch vụ" : "Thêm dịch vụ mới"}</h2>
              <button
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                <X size={24} />
              </button>
            </div>
            <form className="service-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Tên dịch vụ *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Nhập tên dịch vụ"
                  required
                />
              </div>
              <div className="form-group">
                <label>Mô tả</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Nhập mô tả dịch vụ"
                  rows={3}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Phân loại *</label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    required
                  >
                    <option value="meal">Meal - Bữa ăn</option>
                    <option value="seat">Seat - Chỗ ngồi</option>
                    <option value="luggage">Luggage - Hành lý</option>
                    <option value="insurance">Insurance - Bảo hiểm</option>
                    <option value="entertainment">
                      Entertainment - Giải trí
                    </option>
                    <option value="priority">Priority - Ưu tiên</option>
                    <option value="transfer">Transfer - Vận chuyển</option>
                    <option value="comfort">Comfort - Tiện nghi</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Giá (VND) *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    placeholder="0"
                    min="0"
                    required
                  />
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
    </DashboardLayout>
  );
};

export default Service;
