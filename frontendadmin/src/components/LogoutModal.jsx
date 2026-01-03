import React from "react";

const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="logout-modal-backdrop" onClick={onClose}>
      <div className="logout-modal" onClick={(e) => e.stopPropagation()}>
        <h2>Xác nhận đăng xuất</h2>
        <p>Bạn có chắc chắn muốn đăng xuất không?</p>
        <div className="logout-modal-buttons">
          <button className="logout-cancel" onClick={onClose}>
            Hủy
          </button>
          <button className="logout-confirm" onClick={onConfirm}>
            Có
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;
