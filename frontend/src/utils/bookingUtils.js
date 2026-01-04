// ============================================
// FILE: src/utils/bookingUtils.js
// Các hàm helper để xử lý booking draft
// ============================================

/**
 * Lấy booking draft từ localStorage một cách an toàn
 * @returns {Object|null} Draft object hoặc null nếu không hợp lệ
 */
export const getBookingDraft = () => {
  try {
    const draftStr = localStorage.getItem("bookingDraft");
    if (!draftStr) return null;
    
    const draft = JSON.parse(draftStr);
    
    // Validate structure
    if (!draft.type) return null;
    
    if (draft.type === "oneway" && !draft.flight) return null;
    if (draft.type === "roundtrip" && (!draft.outbound || !draft.inbound)) return null;
    
    return draft;
  } catch (error) {
    console.error("Error parsing bookingDraft:", error);
    return null;
  }
};

/**
 * Lấy booking draft kể cả khi chưa hoàn chỉnh (dùng cho roundtrip đang chọn chặng)
 * @returns {Object|null}
 */
export const getBookingDraftPartial = () => {
  try {
    const draftStr = localStorage.getItem("bookingDraft");
    if (!draftStr) return null;
    
    const draft = JSON.parse(draftStr);
    
    // Validate structure nhưng cho phép roundtrip chưa có inbound
    if (!draft.type) return null;
    
    if (draft.type === "oneway" && !draft.flight) return null;
    if (draft.type === "roundtrip" && !draft.outbound) return null;
    
    return draft;
  } catch (error) {
    console.error("Error parsing bookingDraft:", error);
    return null;
  }
};

/**
 * Tạo booking draft ban đầu với cấu trúc chuẩn
 * @param {string} type - "oneway" hoặc "roundtrip"
 * @param {Object} flightData - Dữ liệu chuyến bay
 * @returns {Object|null}
 */
export const createInitialDraft = (type, flightData) => {
  if (type === "oneway") {
    return {
      type: "oneway",
      flight: flightData,
      seat: null,
      passenger: null,
      services: null,
      checkedIn: false
    };
  }

  if (type === "roundtrip") {
    return {
      type: "roundtrip",
      outbound: flightData.outbound || null,
      inbound: flightData.inbound || null,
      seatOutbound: null,
      seatInbound: null,
      passenger: null,
      services: null,
      checkedInOutbound: false,
      checkedInInbound: false
    };
  }

  return null;
};

/**
 * Lưu booking draft vào localStorage
 * @param {Object} draft - Draft object cần lưu
 */
export const saveBookingDraft = (draft) => {
  try {
    localStorage.setItem("bookingDraft", JSON.stringify(draft));
    return true;
  } catch (error) {
    console.error("Error saving bookingDraft:", error);
    return false;
  }
};

/**
 * Xóa booking draft khỏi localStorage
 */
export const clearBookingDraft = () => {
  try {
    localStorage.removeItem("bookingDraft");
    return true;
  } catch (error) {
    console.error("Error clearing bookingDraft:", error);
    return false;
  }
};

/**
 * Cập nhật một phần của booking draft
 * @param {Object} updates - Các field cần cập nhật
 * @returns {Object|null} Draft đã cập nhật hoặc null nếu lỗi
 */
export const updateBookingDraft = (updates) => {
  try {
    const draft = getBookingDraftPartial();
    if (!draft) return null;
    
    const updatedDraft = { ...draft, ...updates };
    saveBookingDraft(updatedDraft);
    return updatedDraft;
  } catch (error) {
    console.error("Error updating bookingDraft:", error);
    return null;
  }
};

/**
 * Kiểm tra xem draft có hợp lệ để tiếp tục không
 * @param {string} stage - Giai đoạn hiện tại: "booking", "passenger", "seat", "payment"
 * @returns {Object} { valid: boolean, message: string }
 */
export const validateDraftForStage = (stage) => {
  const draft = getBookingDraftPartial();
  
  if (!draft) {
    return { valid: false, message: "Không tìm thấy thông tin đặt chỗ" };
  }

  // Validate theo từng stage
  switch (stage) {
    case "passenger":
      if (draft.type === "oneway" && !draft.flight) {
        return { valid: false, message: "Thiếu thông tin chuyến bay" };
      }
      if (draft.type === "roundtrip" && !draft.outbound) {
        return { valid: false, message: "Thiếu thông tin chặng đi" };
      }
      // Cho phép chưa có inbound nếu đang chọn
      return { valid: true, message: "" };

    case "seat":
      if (!draft.passenger) {
        return { valid: false, message: "Thiếu thông tin hành khách" };
      }
      if (draft.type === "oneway" && !draft.flight) {
        return { valid: false, message: "Thiếu thông tin chuyến bay" };
      }
      if (draft.type === "roundtrip" && (!draft.outbound || !draft.inbound)) {
        return { valid: false, message: "Thiếu thông tin chuyến bay khứ hồi" };
      }
      return { valid: true, message: "" };

    case "payment":
      if (!draft.passenger) {
        return { valid: false, message: "Thiếu thông tin hành khách" };
      }
      if (draft.type === "oneway" && (!draft.flight || !draft.seat)) {
        return { valid: false, message: "Thiếu thông tin chuyến bay hoặc ghế ngồi" };
      }
      if (draft.type === "roundtrip" && (!draft.outbound || !draft.inbound || !draft.seatOutbound || !draft.seatInbound)) {
        return { valid: false, message: "Thiếu thông tin chuyến bay hoặc ghế ngồi khứ hồi" };
      }
      return { valid: true, message: "" };

    default:
      return { valid: true, message: "" };
  }
};

/**
 * Lấy tên hiển thị của chuyến bay
 * @param {Object} flight - Thông tin chuyến bay
 * @returns {string}
 */
export const getFlightDisplayName = (flight) => {
  if (!flight) return "N/A";
  return `${flight.airport_from || "?"} → ${flight.airport_to || "?"} | ${flight.f_code || "?"}`;
};

/**
 * Format giá tiền VND
 * @param {number} price 
 * @returns {string}
 */
export const formatPrice = (price) => {
  return Number(price || 0).toLocaleString("vi-VN");
};

/**
 * Tạo key duy nhất cho chuyến bay (dùng cho seat, booking, checkin)
 * @param {Object} flight
 * @returns {string}
 */
export const getFlightKey = (flight) => {
  if (!flight) return "";
  return [
    flight.f_code,
    flight.f_time_from,
    flight.airport_from,
    flight.airport_to
  ].join("_");
};

/**
 * So sánh 2 chuyến bay có phải cùng 1 chuyến không
 */
export const isSameFlight = (a, b) => {
  return getFlightKey(a) === getFlightKey(b);
};
