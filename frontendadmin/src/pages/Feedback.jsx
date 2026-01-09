import React, { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import {
  Search,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Star,
  MessageSquare,
} from "lucide-react";
import "../styles/main.css";
import "../styles/managers.css";
import "../styles/feedback.css";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const Feedback = () => {
  const [feedbackData, setFeedbackData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredData, setFilteredData] = useState([]);
  const [sortOrder, setSortOrder] = useState("newest");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const itemsPerPage = 5;

  const fetchFeedbackData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/feedbacks`);
      const data = response.data;
      setFeedbackData(
        data.map((item) => ({
          id: item.id,
          username: item.user_name,
          date: item.comment_date,
          rating: item.rating_overall,
          comment: item.comment_text,
        }))
      );
    } catch (error) {
      console.error("Error fetching feedback data:", error);
    }
  };

  useEffect(() => {
    fetchFeedbackData();
  }, []);
  // Filter and sort data
  useEffect(() => {
    let data = [...feedbackData];

    // Sort
    if (sortOrder === "newest") {
      data.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (sortOrder === "oldest") {
      data.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (sortOrder === "highest") {
      data.sort((a, b) => b.rating - a.rating);
    } else if (sortOrder === "lowest") {
      data.sort((a, b) => a.rating - b.rating);
    }

    setFilteredData(data);
  }, [sortOrder, feedbackData]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const pageData = filteredData.slice(startIndex, endIndex);

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa phản hồi này?")) {
      try {
        const response = await axios.delete(
          `${API_BASE_URL}/admin/feedbacks/${id}`
        );
        if (response.data.message === "Feedback deleted successfully") {
          await fetchFeedbackData();
          alert("Xóa phản hồi thành công!");
        }
      } catch (error) {
        console.error("Error deleting feedback:", error);
      }
    }
  };

  const formatDate = (dateString) => {
    return dateString;
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          size={16}
          className={i <= rating ? "star-filled" : "star-empty"}
          fill={i <= rating ? "#f59e0b" : "none"}
          stroke={i <= rating ? "#f59e0b" : "#d1d5db"}
        />
      );
    }
    return <div className="stars-container">{stars}</div>;
  };

  const getAvatarColor = (username) => {
    const colors = [
      "#ef4444",
      "#f59e0b",
      "#10b981",
      "#3b82f6",
      "#8b5cf6",
      "#ec4899",
    ];
    const index = username.charCodeAt(0) % colors.length;
    return colors[index];
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
    <DashboardLayout title="Feedback">
      <div className="feedback-content">
        {/* Controls */}
        <div className="feedback-controls">
          <div className="feedback-tab">
            <span className="feedback-tab-active">
              Tất cả đánh giá ({filteredData.length})
            </span>
          </div>
          <div className="sort-dropdown-container">
            <button
              className="sort-dropdown-btn"
              onClick={() => setShowSortDropdown(!showSortDropdown)}
            >
              {sortOrder === "newest"
                ? "Sớm nhất"
                : sortOrder === "oldest"
                ? "Muộn nhất"
                : sortOrder === "highest"
                ? "Đánh giá cao nhất"
                : "Đánh giá thấp nhất"}
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
                <button
                  className={sortOrder === "highest" ? "active" : ""}
                  onClick={() => {
                    setSortOrder("highest");
                    setShowSortDropdown(false);
                  }}
                >
                  Đánh giá cao nhất
                </button>
                <button
                  className={sortOrder === "lowest" ? "active" : ""}
                  onClick={() => {
                    setSortOrder("lowest");
                    setShowSortDropdown(false);
                  }}
                >
                  Đánh giá thấp nhất
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Feedback List */}
        <div className="feedback-list">
          {pageData.length === 0 ? (
            <div className="no-feedback">
              <MessageSquare size={48} />
              <p>Không có phản hồi nào</p>
            </div>
          ) : (
            pageData.map((item) => (
              <div key={item.id} className="feedback-card">
                <div className="feedback-left">
                  <div
                    className="feedback-avatar"
                    style={{ backgroundColor: getAvatarColor(item.username) }}
                  >
                    <img src="/assets/react.svg" alt={item.username} />
                  </div>
                  <div className="feedback-user-info">
                    <h4 className="feedback-username">{item.username}</h4>
                    <p className="feedback-date">{formatDate(item.date)}</p>
                  </div>
                </div>
                <div className="feedback-center">
                  {renderStars(item.rating)}
                </div>
                <div className="feedback-right">
                  <p className="feedback-comment">{item.comment}</p>
                </div>
                <div className="feedback-actions">
                  <button
                    className="feedback-delete-btn"
                    title="Xóa"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
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
    </DashboardLayout>
  );
};

export default Feedback;
