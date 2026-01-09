import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../style/managebooking.css";

const API = process.env.REACT_APP_API_URL;

const airportMap = {
  HAN: 1,
  SGN: 2,
  DLI: 3,
  PQC: 4,
  DAD: 5,
  CXR: 6,
  HPH: 7,
  VII: 8,
  VCL: 9,
  HUI: 10,
  THD: 11,
  VCA: 12,
  UIH: 13,
};
const airportIdToIata = Object.fromEntries(
  Object.entries(airportMap).map(([iata, id]) => [id, iata])
);

const ManageBookingPage = () => {
  const navigate = useNavigate();
  const [bookingDetails, setBookingDetails] = useState(null);
  const [enrichedFlights, setEnrichedFlights] = useState([]);
  const [checkinPerFlight, setCheckinPerFlight] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookingCode, setBookingCode] = useState("");

  // Lấy auth token
  const getAuthToken = () => {
    const auth = JSON.parse(localStorage.getItem("auth") || "{}");
    return auth?.token || auth?.access_token || "";
  };

  // Enrich flight details
  const fetchFlightDetails = async (flightId, token) => {
    try {
      const response = await fetch(`${API}/flight/${flightId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const flightData = await response.json();
        console.log(`Enriched flight ${flightId}:`, flightData);
        return {
          airport_from:
            airportIdToIata[flightData.dep_airport] ||
            flightData.airport_from ||
            "N/A",
          airport_to:
            airportIdToIata[flightData.arr_airport] ||
            flightData.airport_to ||
            "N/A",
          f_time_from:
            flightData.dep_datetime || flightData.f_time_from || "N/A",
          f_code: flightData.flight_number || flightData.f_code || "N/A",
          flight_id: flightData.id || flightId, // Đảm bảo có flight_id
          flight_number: flightData.flight_number || "N/A",
          dep_datetime: flightData.dep_datetime,
          gate: flightData.gate || null,
          terminal: flightData.terminal || null,
        };
      } else {
        console.warn(
          `Flight ${flightId} fetch failed (${response.status}): using basic fallback`
        );
        return {
          flight_id: flightId, // Vẫn giữ flight_id
          flight_number: "N/A",
          airport_from: "N/A",
          airport_to: "N/A",
          f_time_from: "N/A",
          f_code: "N/A",
        };
      }
    } catch (e) {
      console.error(`Error enriching flight ${flightId}:`, e);
      return {
        flight_id: flightId, // Vẫn giữ flight_id
        flight_number: "N/A",
        airport_from: "N/A",
        airport_to: "N/A",
        f_time_from: "N/A",
        f_code: "N/A",
      };
    }
  };

  // Hàm fetch checkin info cho từng flight
  const fetchCheckinInfoForFlight = async (
    reservationCode,
    flightId,
    token
  ) => {
    try {
      const res = await fetch(
        `${API}/checkin/online?reservation_code=${reservationCode}&flight_id=${flightId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.ok) {
        const checkinData = await res.json();
        return checkinData.passengers || [];
      } else if (res.status === 404) {
        console.warn(`No checkin info found for flight ${flightId}`);
        return [];
      } else {
        console.warn(
          `Failed to load checkin info for flight ${flightId}:`,
          res.status
        );
        return [];
      }
    } catch (e) {
      console.error(`Error fetching checkin info for flight ${flightId}:`, e);
      return [];
    }
  };

  useEffect(() => {
    const fetchBookingData = async () => {
      try {
        setLoading(true);
        setError("");
        const code = localStorage.getItem("current_booking_code");
        if (!code) {
          throw new Error("Vui lòng tìm kiếm booking trước");
        }
        setBookingCode(code);
        const token = getAuthToken();
        if (!token) {
          throw new Error(
            "Chưa đăng nhập hoặc token hết hạn. Vui lòng đăng nhập lại."
          );
        }

        // Bước 1: Lấy base booking từ history để có reservation_id
        const historyResponse = await fetch(`${API}/booking/history`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!historyResponse.ok) {
          const errData = await historyResponse.json().catch(() => ({}));
          throw new Error(errData.detail || "Không thể tải lịch sử booking");
        }
        const historyData = await historyResponse.json();
        const baseBooking = historyData.find(
          (b) => b.reservation_code === code
        );
        if (!baseBooking) {
          throw new Error("Mã đặt chỗ không tồn tại");
        }

        // Bước 2: Lấy chi tiết booking
        const detailResponse = await fetch(
          `${API}/booking/${baseBooking.reservation_id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!detailResponse.ok) {
          const errData = await detailResponse.json().catch(() => ({}));
          throw new Error(errData.detail || "Không thể tải chi tiết booking");
        }
        const beBookingDetails = await detailResponse.json();
        console.log("Raw booking flights:", beBookingDetails.flights);
        setBookingDetails(beBookingDetails);

        // Bước 3: Enrich flights với chi tiết flight
        const enriched = await Promise.all(
          beBookingDetails.flights.map(async (flight) => {
            const details = await fetchFlightDetails(flight.flight_id, token);
            return { ...flight, ...details };
          })
        );
        console.log("Enriched flights:", enriched);
        setEnrichedFlights(enriched);

        // Bước 4: Lấy checkin info cho từng flight (sử dụng flight_id)
        const perFlight = {};

        // Fetch checkin info cho từng flight song song
        const checkinPromises = enriched.map(async (flight) => {
          const flightNumber = flight.flight_number || flight.f_code;
          const flightId = flight.flight_id;

          if (!flightId) {
            console.warn(`Flight ${flightNumber} không có flight_id`);
            return;
          }

          const passengers = await fetchCheckinInfoForFlight(
            code,
            flightId,
            token
          );

          if (!perFlight[flightNumber]) {
            perFlight[flightNumber] = {
              checkedIn: 0,
              total: 0,
              flightId: flightId,
              flightNumber: flightNumber,
            };
          }

          perFlight[flightNumber].total += passengers.length;
          const checkedInCount = passengers.filter(
            (p) => p.checkin_status === "checked_in"
          ).length;
          perFlight[flightNumber].checkedIn += checkedInCount;
        });

        await Promise.all(checkinPromises);

        console.log("Checkin per flight:", perFlight);
        setCheckinPerFlight(perFlight);
      } catch (err) {
        console.error("Fetch booking data error:", err);
        setError(err.message);
        if (err.message.includes("Chưa đăng nhập")) {
          alert(err.message + "\nVui lòng đăng nhập lại.");
          localStorage.removeItem("auth");
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBookingData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="managebooking-wrapper">
        <header className="site-header">
          <a href="/" className="logo">
            <img
              src="/assets/Lotus_Logo-removebg-preview.png"
              alt="Lotus Travel"
            />
            <span>Lotus Travel</span>
          </a>
        </header>
        <section className="managebooking-container">
          <p>Đang tải thông tin booking...</p>
        </section>
      </div>
    );
  }

  if (error || !bookingDetails || enrichedFlights.length === 0) {
    return (
      <div className="managebooking-wrapper">
        <header className="site-header">
          <a href="/" className="logo">
            <img
              src="/assets/Lotus_Logo-removebg-preview.png"
              alt="Lotus Travel"
            />
            <span>Lotus Travel</span>
          </a>
        </header>
        <section className="managebooking-container">
          <p>Lỗi: {error || "Thông tin chuyến bay không tồn tại."}</p>
          <button onClick={() => navigate("/")}>Quay về trang chủ</button>
        </section>
      </div>
    );
  }

  // Hàm parse time an toàn
  const parseTime = (time) => {
    if (!time) return { date: "", hour: "" };
    let date = "",
      hour = "";
    if (typeof time === "string") {
      if (time.includes(" ")) {
        [date, hour] = time.split(" ");
      } else if (time.includes("T")) {
        [date] = time.split("T");
        hour = time.split("T")[1]?.substring(0, 5) || "";
      }
    } else if (time instanceof Date) {
      date = time.toISOString().split("T")[0];
      hour = time.toTimeString().substring(0, 5);
    }
    return { date, hour };
  };

  // Lấy checkin status per flight (sử dụng flight_number hoặc flight_id)
  const getCheckinStatus = (flight) => {
    const flightNumber = flight.flight_number || flight.f_code;
    const info = checkinPerFlight[flightNumber];

    if (!info || info.total === 0) {
      return "Chưa check-in";
    }

    if (info.checkedIn === info.total) {
      return "✓ Đã check-in toàn bộ";
    } else if (info.checkedIn > 0) {
      return `Đã check-in ${info.checkedIn}/${info.total} hành khách`;
    } else {
      return "Chưa check-in";
    }
  };

  // Kiểm tra nếu có thể check-in (chỉ cho flight chưa check-in toàn bộ)
  const canCheckinForFlight = (flight) => {
    const flightNumber = flight.flight_number || flight.f_code;
    const info = checkinPerFlight[flightNumber];

    if (!info) return true; // Nếu không có info, cho phép check-in

    return info.checkedIn < info.total;
  };

  // Render services (render chung một lần cho toàn bộ booking)
  const renderServices = () => {
    const services = bookingDetails.services || [];
    if (services.length === 0) {
      return (
        <p>
          <strong>Dịch vụ:</strong> Không có dịch vụ bổ sung
        </p>
      );
    }
    return (
      <div className="flight-detail services-section">
        <h3>Dịch vụ bổ sung</h3>
        <ul>
          {services.map((service, idx) => (
            <li key={idx}>
              {service.service_name} x
              {service.quantity || service.quanitity || 1} (
              {service.base_price?.toLocaleString() || 0} VND)
            </li>
          ))}
        </ul>
      </div>
    );
  };

  // Render chi tiết chuyến bay với nút check-in cho từng flight
  const renderFlightDetails = () => {
    // Sort flights: outbound first (assume direction or use index)
    const sortedFlights = [...enrichedFlights].sort(
      (a, b) =>
        (a.direction === "outbound" ? -1 : 1) ||
        (b.direction === "outbound" ? 1 : 0)
    );
    console.log("Sorted flights for render:", sortedFlights);

    const flightBlocks = sortedFlights.map((flight, idx) => {
      // Fallback nếu enrich fail
      const baseFlight =
        bookingDetails.flights.find((f) => f.flight_id === flight.flight_id) ||
        {};
      const { date, hour } = parseTime(
        flight.f_time_from || baseFlight.f_time_from
      );
      const seatNumbers = flight.seats
        ? flight.seats.map((s) => s.seat_number).join(", ")
        : baseFlight.seats
        ? baseFlight.seats.map((s) => s.seat_number).join(", ")
        : "Chưa chọn";
      const checkinStatus = getCheckinStatus(flight);
      const directionTitle = idx === 0 ? "Chặng đi" : "Chặng về";
      const fCode = flight.f_code || baseFlight.f_code || "N/A";
      const airportFrom =
        flight.airport_from ||
        airportIdToIata[baseFlight.dep_airport] ||
        baseFlight.airport_from ||
        "N/A";
      const airportTo =
        flight.airport_to ||
        airportIdToIata[baseFlight.arr_airport] ||
        baseFlight.airport_to ||
        "N/A";
      const canCheckin = canCheckinForFlight(flight);

      return (
        <div key={idx} className="flight-detail">
          <h3>{directionTitle}</h3>
          <p>
            <strong>Mã chuyến bay:</strong> {fCode}
          </p>
          <p>
            <strong>Hành trình:</strong> {airportFrom} → {airportTo}
          </p>
          <p>
            <strong>Ngày:</strong> {date}
          </p>
          <p>
            <strong>Giờ:</strong> {hour}
          </p>
          <p>
            <strong>Ghế:</strong> {seatNumbers}
          </p>
          <p>
            <strong>Trạng thái check-in:</strong>{" "}
            <span
              className={`checkin-status ${
                checkinStatus.includes("Đã check-in toàn bộ")
                  ? "checked-in"
                  : "not-checked"
              }`}
            >
              {checkinStatus}
            </span>
          </p>

          {canCheckin && bookingDetails.status === "confirmed" && (
            <button
              className="flight-checkin-btn"
              onClick={() => {
                localStorage.setItem("current_booking_code", bookingCode);
                // Lưu flight_id để CheckinPage có thể sử dụng
                localStorage.setItem("current_flight_id", flight.flight_id);
                navigate("/checkin");
              }}
            >
              Check-in chặng này
            </button>
          )}
        </div>
      );
    });

    return (
      <>
        {flightBlocks}
        {renderServices()}
      </>
    );
  };

  // Lấy loại vé
  const getBookingType = () => {
    return enrichedFlights.length === 1 ? "Một chiều" : "Khứ hồi";
  };

  // Lấy trạng thái
  const getStatus = () => {
    switch (bookingDetails.status) {
      case "confirmed":
        return "Đã xác nhận";
      case "pending":
        return "Chờ thanh toán";
      case "cancelled":
        return "Đã hủy";
      default:
        return "Không xác định";
    }
  };

  return (
    <div className="managebooking-wrapper">
      <header className="site-header">
        <a href="/" className="logo">
          <img
            src="/assets/Lotus_Logo-removebg-preview.png"
            alt="Lotus Travel"
          />
          <span>Lotus Travel</span>
        </a>
      </header>
      <section className="managebooking-container">
        <h2>Chuyến bay của bạn</h2>
        <div className="booking-info">
          {/* Thông tin đặt chỗ */}
          <div className="flight-detail">
            <h3>Thông tin đặt chỗ</h3>
            <p>
              <strong>Số lượng hành khách:</strong>{" "}
              {bookingDetails.total_passengers}
            </p>
            <p>
              <strong>Danh sách hành khách:</strong>
            </p>
            <ul>
              {bookingDetails.passengers.map((p) => (
                <li key={p.passenger_id}>
                  {p.last_name} {p.first_name} ({p.passenger_type})
                </li>
              ))}
            </ul>
            <p>
              <strong>Mã đặt chỗ:</strong> {bookingCode}
            </p>
            <p>
              <strong>Loại vé:</strong> {getBookingType()}
            </p>
            <p>
              <strong>Trạng thái:</strong> {getStatus()}
            </p>
            <p>
              <strong>Ngày đặt:</strong>{" "}
              {new Date(bookingDetails.created_at).toLocaleDateString("vi-VN")}
            </p>
            {bookingDetails.total_amount && (
              <p>
                <strong>Tổng tiền:</strong>{" "}
                {bookingDetails.total_amount.toLocaleString()} VND (thuế:{" "}
                {bookingDetails.tax_amount?.toLocaleString() || 0} VND)
              </p>
            )}
          </div>
          {/* Chi tiết chuyến bay */}
          {renderFlightDetails()}
          {/* Nút hành động */}
          <div className="booking-actions">
            <button
              className="action-btn checkin-btn"
              onClick={() => {
                localStorage.setItem("current_booking_code", bookingCode);
                // Lưu flight_id đầu tiên để CheckinPage có thể sử dụng
                if (enrichedFlights.length > 0) {
                  localStorage.setItem(
                    "current_flight_id",
                    enrichedFlights[0].flight_id
                  );
                }
                navigate("/checkin");
              }}
              disabled={bookingDetails.status !== "confirmed"}
            >
              Làm thủ tục check-in
            </button>
            <button
              className="action-btn back-btn"
              onClick={() => navigate("/")}
            >
              Quay về trang chủ
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ManageBookingPage;
