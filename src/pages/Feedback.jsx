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

// Sample feedback data
const initialFeedbackData = [
  {
    id: 1,
    username: "vana",
    bookingId: 35,
    date: "2025-01-14",
    rating: 5,
    comment:
      "Khách sạn rất tuyệt vời, phòng ốc sạch sẽ, nhân viên thân thiện và nhiệt tình. Tôi sẽ quay lại khi có dịp. 👍💕💕",
    avatar: null,
  },
  {
    id: 2,
    username: "nguyend",
    bookingId: 40,
    date: "2025-01-14",
    rating: 5,
    comment: "Đây là comment seeding à 😍😍",
    avatar: null,
  },
  {
    id: 3,
    username: "nguyenc",
    bookingId: 77,
    date: "2025-01-14",
    rating: 5,
    comment:
      "Khách sạn có dịch vụ tốt, phòng sạch sẽ, và vị trí thuận tiện. Tôi rất thích và sẽ quay lại.",
    avatar: null,
  },
  {
    id: 4,
    username: "phamc",
    bookingId: 68,
    date: "2025-01-14",
    rating: 4,
    comment:
      "Chúng tôi đã có một kỳ nghỉ tuyệt vời tại đây. Dịch vụ phòng rất tốt, đội ngũ nhân viên thân thiện và chuyên nghiệp.",
    avatar: null,
  },
  {
    id: 5,
    username: "tranb",
    bookingId: 52,
    date: "2025-01-13",
    rating: 5,
    comment: "Chuyến bay rất thoải mái, đúng giờ và dịch vụ tốt. Rất hài lòng!",
    avatar: null,
  },
  {
    id: 6,
    username: "leh",
    bookingId: 61,
    date: "2025-01-13",
    rating: 3,
    comment: "Chuyến bay bị delay 30 phút nhưng dịch vụ trên máy bay khá tốt.",
    avatar: null,
  },
  {
    id: 7,
    username: "hoangm",
    bookingId: 44,
    date: "2025-01-12",
    rating: 5,
    comment:
      "Tuyệt vời! Nhân viên rất nhiệt tình, giá cả hợp lý. Sẽ đặt vé lần sau.",
    avatar: null,
  },
  {
    id: 8,
    username: "ngok",
    bookingId: 89,
    date: "2025-01-12",
    rating: 4,
    comment: "Dịch vụ tốt, booking nhanh chóng. Có điều app hơi chậm một chút.",
    avatar: null,
  },
  {
    id: 9,
    username: "vut",
    bookingId: 33,
    date: "2025-01-11",
    rating: 5,
    comment: "Đội ngũ hỗ trợ khách hàng rất chuyên nghiệp. 10 điểm!",
    avatar: null,
  },
  {
    id: 10,
    username: "dol",
    bookingId: 56,
    date: "2025-01-11",
    rating: 4,
    comment:
      "Giá vé máy bay cạnh tranh, đặt vé dễ dàng. Sẽ giới thiệu cho bạn bè.",
    avatar: null,
  },
];

const Feedback = () => {
  const [feedbackData, setFeedbackData] = useState(initialFeedbackData);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredData, setFilteredData] = useState([]);
  const [sortOrder, setSortOrder] = useState("newest");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const itemsPerPage = 5;

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

  const handleDelete = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa phản hồi này?")) {
      setFeedbackData(feedbackData.filter((f) => f.id !== id));
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

      <style>{`
        .feedback-content {
          padding: 2rem;
          max-width: 1000px;
          margin: 0 auto;
        }
        
        .feedback-header {
          margin-bottom: 1.5rem;
        }
        
        .feedback-header h2 {
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--text-dark);
          margin: 0;
        }
        
        .feedback-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          gap: 1rem;
        }
        
        .feedback-tab-active {
          color: var(--primary-color);
          font-weight: 600;
          font-size: 0.95rem;
          text-decoration: underline;
          text-underline-offset: 4px;
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
          min-width: 180px;
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
        
        .feedback-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .feedback-card {
          display: grid;
          grid-template-columns: 200px 120px 1fr 50px;
          gap: 1.5rem;
          align-items: center;
          padding: 1.25rem 1.5rem;
          background: var(--white);
          border: 1px solid var(--extra-light);
          border-radius: var(--border-radius);
          transition: var(--transition);
        }
        
        .feedback-card:hover {
          box-shadow: var(--box-shadow);
          border-color: rgba(135, 179, 234, 0.3);
        }
        
        .feedback-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .feedback-avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          flex-shrink: 0;
        }
        
        .feedback-avatar img {
          width: 70%;
          height: 70%;
          object-fit: cover;
        }
        
        .feedback-user-info {
          flex: 1;
          min-width: 0;
        }
        
        .feedback-username {
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--text-dark);
          margin: 0 0 0.25rem 0;
        }
        
        .feedback-booking-id {
          font-size: 0.8rem;
          color: var(--text-light);
          margin: 0 0 0.125rem 0;
        }
        
        .feedback-date {
          font-size: 0.8rem;
          color: var(--text-light);
          margin: 0;
        }
        
        .feedback-center {
          display: flex;
          justify-content: center;
        }
        
        .stars-container {
          display: flex;
          gap: 2px;
        }
        
        .star-filled,
        .star-empty {
          transition: var(--transition);
        }
        
        .feedback-right {
          flex: 1;
          min-width: 0;
        }
        
        .feedback-comment {
          font-size: 0.875rem;
          color: var(--text-dark);
          line-height: 1.6;
          margin: 0;
        }
        
        .feedback-actions {
          display: flex;
          justify-content: center;
        }
        
        .feedback-delete-btn {
          background: none;
          border: none;
          padding: 0.5rem;
          border-radius: 6px;
          cursor: pointer;
          color: var(--text-light);
          transition: var(--transition);
        }
        
        .feedback-delete-btn:hover {
          background: #fee2e2;
          color: #ef4444;
        }
        
        .no-feedback {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
          color: var(--text-light);
          background: var(--white);
          border-radius: var(--border-radius);
        }
        
        .no-feedback svg {
          margin-bottom: 1rem;
          opacity: 0.5;
        }
        
        body.dark-mode .feedback-card {
          background: var(--white);
          border-color: #374151;
        }
        
        body.dark-mode .sort-dropdown-menu {
          background: var(--white);
          border-color: #374151;
        }
        
        body.dark-mode .no-feedback {
          background: var(--white);
        }
        
        @media (max-width: 900px) {
          .feedback-card {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
          
          .feedback-left {
            justify-content: flex-start;
          }
          
          .feedback-center {
            justify-content: flex-start;
          }
          
          .feedback-actions {
            justify-content: flex-end;
            position: absolute;
            top: 1rem;
            right: 1rem;
          }
          
          .feedback-card {
            position: relative;
          }
        }
        
        @media (max-width: 600px) {
          .feedback-content {
            padding: 1rem;
          }
          
          .feedback-controls {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </DashboardLayout>
  );
};

export default Feedback;
