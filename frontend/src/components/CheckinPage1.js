import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "../style/checkin.css";

const API = "http://localhost:8000";

const airportMap = { HAN:1, SGN:2, DLI:3, PQC:4, DAD:5, CXR:6, HPH:7, VII:8, VCL:9, HUI:10, THD:11, VCA:12, UIH:13 };
const airportIdToIata = Object.fromEntries(
  Object.entries(airportMap).map(([iata, id]) => [id, iata])
);

const parseTime = (time) => {
  if (!time) return { date: "", hour: "" };
  if (typeof time === "string") {
    if (time.includes("T")) {
      const [d, t] = time.split("T");
      return { date: d, hour: t?.slice(0, 5) || "" };
    }
    const [d, t] = time.split(" ");
    return { date: d || "", hour: t?.slice(0, 5) || "" };
  }
  return { date: "", hour: "" };
};

// Hàm lấy thông tin flight chi tiết từ API
const fetchFlightDetails = async (flightId, token) => {
  try {
    const response = await fetch(`${API}/flight/${flightId}`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (response.ok) {
      const flightData = await response.json();
      return {
        airport_from: airportIdToIata[flightData.dep_airport] || flightData.airport_from || "N/A",
        airport_to: airportIdToIata[flightData.arr_airport] || flightData.airport_to || "N/A",
        f_time_from: flightData.dep_datetime || flightData.f_time_from || "N/A",
        f_code: flightData.flight_number || flightData.f_code || "N/A",
        flight_number: flightData.flight_number || flightData.f_code || "N/A",
        dep_airport: flightData.dep_airport,
        arr_airport: flightData.arr_airport,
        dep_datetime: flightData.dep_datetime,
        gate: flightData.gate || null,
        terminal: flightData.terminal || null,
        duration_minutes: flightData.duration_minutes,
        status: flightData.status
      };
    } else {
      console.warn(`Flight ${flightId} fetch failed (${response.status}): using basic fallback`);
      return null;
    }
  } catch (e) {
    console.error(`Error enriching flight ${flightId}:`, e);
    return null;
  }
};

const CheckinPage = () => {
  const navigate = useNavigate();

  const [bookingDetails, setBookingDetails] = useState(null);
  const [checkinInfo, setCheckinInfo] = useState([]);
  const [selectedLeg, setSelectedLeg] = useState("outbound");
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [selectedPassengerInfo, setSelectedPassengerInfo] = useState(null);
  const [boardingPasses, setBoardingPasses] = useState([]); // Đổi thành array để lưu nhiều boarding pass
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [checkinError, setCheckinError] = useState("");

  const token = JSON.parse(localStorage.getItem("auth") || "{}")?.access_token;
  const reservationCode = localStorage.getItem("current_booking_code");

  // Enrich flights với thông tin chi tiết
  const [enrichedFlights, setEnrichedFlights] = useState([]);

  // Lấy danh sách flights từ enrichedFlights
  const flights = useMemo(() => {
    return enrichedFlights.length > 0 ? enrichedFlights : [];
  }, [enrichedFlights]);

  // Xác định nếu là oneway
  const isOneway = useMemo(() => {
    return flights.length === 1;
  }, [flights]);

  // Lấy tất cả passengers chưa check-in cho flight được chọn
  const getUncheckedPassengersForSelectedFlight = useCallback(() => {
    if (!selectedFlight || !checkinInfo.length) return [];
    
    const flightNumber = selectedFlight.flight_number || selectedFlight.f_code;
    return checkinInfo.filter(p => 
      p.flight_number === flightNumber && p.checkin_status !== "checked_in"
    );
  }, [checkinInfo, selectedFlight]);

  // Lấy tất cả passengers ĐÃ check-in cho flight được chọn
  const getCheckedPassengersForSelectedFlight = useCallback(() => {
    if (!selectedFlight || !checkinInfo.length) return [];
    
    const flightNumber = selectedFlight.flight_number || selectedFlight.f_code;
    return checkinInfo.filter(p => 
      p.flight_number === flightNumber && p.checkin_status === "checked_in"
    );
  }, [checkinInfo, selectedFlight]);

  // Hàm chọn leg (chặng bay)
  const selectLeg = useCallback(
    (leg) => {
      setSelectedLeg(leg);
      
      if (flights.length === 0) return;
      
      if (isOneway && flights.length > 0) {
        setSelectedFlight(flights[0]);
        return;
      }
      
      if (leg === "outbound") {
        setSelectedFlight(flights[0]);
      } else if (leg === "inbound" && flights.length > 1) {
        setSelectedFlight(flights[1]);
      }
    },
    [flights, isOneway]
  );

  // Kiểm tra nếu đã check-in flight được chọn (có ít nhất 1 người đã check-in)
  const showBoardingPass = useMemo(() => {
    if (!selectedFlight || !checkinInfo.length) return false;
    
    const flightNumber = selectedFlight.flight_number || selectedFlight.f_code;
    const checkedPassengers = checkinInfo.filter(p => 
      p.flight_number === flightNumber && p.checkin_status === "checked_in"
    );
    return checkedPassengers.length > 0;
  }, [checkinInfo, selectedFlight]);

  // Xác nhận check-in cho TẤT CẢ hành khách chưa check-in
  const confirmCheckin = async () => {
    try {
      setCheckinError("");
      
      if (!selectedFlight) {
        setCheckinError("Vui lòng chọn chặng bay để check-in");
        return;
      }

      const uncheckedPassengers = getUncheckedPassengersForSelectedFlight();
      
      if (uncheckedPassengers.length === 0) {
        setCheckinError("Tất cả hành khách đã được check-in cho chặng bay này");
        return;
      }

      setIsCheckingIn(true);

      // Check-in cho từng hành khách chưa check-in
      const checkinPromises = uncheckedPassengers.map(async (passenger) => {
        const res = await fetch(
          `${API}/checkin/${passenger.reservation_detail_id}/confirm`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(`Check-in thất bại cho ${passenger.passenger_name}: ${errorData.detail || "Lỗi không xác định"}`);
        }

        return res.json();
      });

      // Chờ tất cả check-in hoàn thành
      const results = await Promise.all(checkinPromises);
      
      // Lưu boarding passes
      const newBoardingPasses = results.map(result => result.ticket || result);
      setBoardingPasses(prev => [...prev, ...newBoardingPasses]);

      // Refresh checkin info
      const refreshRes = await fetch(
        `${API}/checkin/online?reservation_code=${reservationCode}`,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          } 
        }
      );
      
      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        setCheckinInfo(refreshData.passengers || []);
      }

      alert(`Đã check-in thành công cho ${uncheckedPassengers.length} hành khách`);

    } catch (e) {
      console.error("Check-in error:", e);
      setCheckinError(e.message || "Có lỗi xảy ra khi check-in");
    } finally {
      setIsCheckingIn(false);
    }
  };

  // Load boarding passes nếu đã check-in
  const loadBoardingPasses = async () => {
    try {
      const checkedPassengers = getCheckedPassengersForSelectedFlight();
      
      // Load boarding pass cho từng hành khách đã check-in
      const boardingPassPromises = checkedPassengers.map(async (passenger) => {
        const res = await fetch(
          `${API}/checkin/${passenger.reservation_detail_id}/ticket`,
          { 
            headers: { 
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json"
            } 
          }
        );
        
        if (res.ok) {
          const data = await res.json();
          return data.ticket || data;
        }
        return null;
      });

      const boardingPasses = await Promise.all(boardingPassPromises);
      setBoardingPasses(boardingPasses.filter(Boolean)); // Lọc bỏ null

    } catch (e) {
      console.warn("Không thể load boarding passes:", e);
    }
  };

  // Hàm chính để load dữ liệu
  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      
      if (!reservationCode) {
        throw new Error("Không tìm thấy mã đặt chỗ. Vui lòng quay lại trang đặt chỗ.");
      }

      if (!token) {
        throw new Error("Chưa đăng nhập hoặc token hết hạn. Vui lòng đăng nhập lại.");
      }

      // Bước 1: Lấy base booking từ history để có reservation_id
      const historyResponse = await fetch(`${API}/booking/history`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!historyResponse.ok) {
        const errData = await historyResponse.json().catch(() => ({}));
        throw new Error(errData.detail || "Không thể tải lịch sử booking");
      }
      const historyData = await historyResponse.json();
      const baseBooking = historyData.find(b => b.reservation_code === reservationCode);
      if (!baseBooking) {
        throw new Error("Mã đặt chỗ không tồn tại");
      }

      // Bước 2: Lấy chi tiết booking
      const detailResponse = await fetch(`${API}/booking/${baseBooking.reservation_id}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!detailResponse.ok) {
        const errData = await detailResponse.json().catch(() => ({}));
        throw new Error(errData.detail || "Không thể tải chi tiết booking");
      }
      const beBookingDetails = await detailResponse.json();
      setBookingDetails(beBookingDetails);

      // Bước 3: Enrich flights với chi tiết flight
      if (beBookingDetails.flights && beBookingDetails.flights.length > 0) {
        const enriched = await Promise.all(
          beBookingDetails.flights.map(async (flight) => {
            const details = await fetchFlightDetails(flight.flight_id, token);
            return { ...flight, ...details };
          })
        );
        setEnrichedFlights(enriched);
        
        // Auto-select flight đầu tiên
        if (enriched.length > 0) {
          setSelectedFlight(enriched[0]);
        }
      }

      // Bước 4: Lấy checkin info
      const checkinResponse = await fetch(
        `${API}/checkin/online?reservation_code=${reservationCode}`,
        { headers: { "Authorization": `Bearer ${token}` } }
      );
      if (checkinResponse.ok) {
        const checkinData = await checkinResponse.json();
        setCheckinInfo(checkinData.passengers || []);
      } else {
        console.warn("Không thể tải checkin info");
      }

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

  // Load dữ liệu khi component mount
  useEffect(() => {
    loadData();
  }, [reservationCode, navigate]);

  // Khi checkinInfo hoặc selectedFlight thay đổi, load boarding passes
  useEffect(() => {
    if (checkinInfo.length > 0 && selectedFlight) {
      loadBoardingPasses();
    }
  }, [checkinInfo, selectedFlight]);

  // Lấy thông tin flight để hiển thị
  const getFlightDisplayInfo = (flight) => {
    if (!flight) return { 
      flightNumber: "N/A", 
      from: "N/A", 
      to: "N/A", 
      date: "", 
      time: "", 
      gate: "CHƯA XÁC ĐỊNH", 
      terminal: "CHƯA XÁC ĐỊNH" 
    };
    
    const flightNumber = flight.flight_number || flight.f_code || "N/A";
    const from = flight.airport_from || airportIdToIata[flight.dep_airport] || "N/A";
    const to = flight.airport_to || airportIdToIata[flight.arr_airport] || "N/A";
    const { date, hour } = parseTime(flight.f_time_from || flight.departure_time || flight.dep_datetime);
    const gate = flight.gate || "CHƯA XÁC ĐỊNH";
    const terminal = flight.terminal || "CHƯA XÁC ĐỊNH";
    
    return { 
      flightNumber, 
      from, 
      to, 
      date, 
      time: hour, 
      gate, 
      terminal,
      duration: flight.duration_minutes 
    };
  };

  const flightInfo = getFlightDisplayInfo(selectedFlight);
  const uncheckedPassengers = getUncheckedPassengersForSelectedFlight();
  const checkedPassengers = getCheckedPassengersForSelectedFlight();

  // Kiểm tra điều kiện check-in (có hành khách chưa check-in)
  const canCheckin = uncheckedPassengers.length > 0 && selectedFlight;

  if (loading) {
    return (
      <div className="checkin-wrapper">
        <div className="checkin-container">
          <p className="loading">Đang tải thông tin check-in...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="checkin-wrapper">
        <div className="checkin-container error-container">
          <p className="error-message">{error}</p>
          <button 
            className="btn-back"
            onClick={() => navigate("/myflights")}
          >
            Quay lại danh sách chuyến bay
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkin-wrapper">
      <div className="checkin-container">
        <h2>Check-in Trực Tuyến</h2>
        <p className="booking-code">Mã đặt chỗ: <strong>{reservationCode}</strong></p>
        
        {/* Hiển thị thông báo lỗi check-in */}
        {checkinError && (
          <div className="error-message alert">
            {checkinError}
          </div>
        )}

        {/* Hiển thị options để chọn chặng bay nếu có nhiều hơn 1 flight */}
        {!isOneway && flights.length > 1 && (
          <div className="checkin-options">
            <h3>Chọn chặng bay để check-in:</h3>
            <div className="leg-buttons">
              <button 
                className={`leg-btn ${selectedLeg === "outbound" ? "active" : ""}`}
                onClick={() => selectLeg("outbound")}
                disabled={uncheckedPassengers.length === 0}
              >
                Chặng đi
                <br />
                <small>
                  {getFlightDisplayInfo(flights[0]).from} → {getFlightDisplayInfo(flights[0]).to}
                </small>
                {uncheckedPassengers.length === 0 && <span className="already-checked">✓ Đã check-in</span>}
              </button>
              <button 
                className={`leg-btn ${selectedLeg === "inbound" ? "active" : ""}`}
                onClick={() => selectLeg("inbound")}
                disabled={uncheckedPassengers.length === 0}
              >
                Chặng về
                <br />
                <small>
                  {getFlightDisplayInfo(flights[1]).from} → {getFlightDisplayInfo(flights[1]).to}
                </small>
                {uncheckedPassengers.length === 0 && <span className="already-checked">✓ Đã check-in</span>}
              </button>
            </div>
          </div>
        )}

        {/* Hiển thị thông tin flight được chọn */}
        {selectedFlight && (
          <div className="selected-flight-info">
            <h3>Thông tin chặng bay:</h3>
            <p><strong>Mã chuyến:</strong> {flightInfo.flightNumber}</p>
            <p><strong>Hành trình:</strong> {flightInfo.from} → {flightInfo.to}</p>
            <p><strong>Ngày bay:</strong> {flightInfo.date || "N/A"}</p>
            <p><strong>Giờ bay:</strong> {flightInfo.time || "N/A"}</p>
            <p><strong>Nhà ga:</strong> {flightInfo.terminal}</p>
            <p><strong>Cổng:</strong> {flightInfo.gate}</p>
            
            {/* Hiển thị thông tin hành khách */}
            <div className="passengers-section">
              <h4>Hành khách:</h4>
              <div className="passengers-list">
                {checkinInfo
                  .filter(p => p.flight_number === (selectedFlight.flight_number || selectedFlight.f_code))
                  .map((passenger, index) => (
                    <div key={index} className="passenger-item">
                      <span className="passenger-name">{passenger.passenger_name.toUpperCase()}</span>
                      <span className={`checkin-status-badge ${passenger.checkin_status}`}>
                        {passenger.checkin_status === "checked_in" ? "✓ Đã check-in" : "Chưa check-in"}
                      </span>
                      {passenger.seat_number && (
                        <span className="seat-number">Ghế: {passenger.seat_number}</span>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Nút xác nhận check-in */}
        {canCheckin && (
          <div className="confirm-section">
            <button 
              className="btn-confirm"
              onClick={confirmCheckin}
              disabled={isCheckingIn}
            >
              {isCheckingIn ? "Đang xử lý..." : `Check-in ${uncheckedPassengers.length} hành khách cho chặng ${selectedLeg === "outbound" ? "đi" : "về"}`}
            </button>
            <p className="note">
              Lưu ý: Check-in online chỉ mở từ 48 giờ đến 1 giờ trước giờ bay. 
              Sau khi check-in, bạn sẽ nhận được Boarding Pass và không thể hủy check-in.
            </p>
          </div>
        )}

        {/* Hiển thị Boarding Pass cho từng hành khách */}
        {showBoardingPass && boardingPasses.length > 0 && (
          <div className="boarding-passes-section">
            <h3>Boarding Passes ({boardingPasses.length})</h3>
            <div className="boarding-passes-container">
              {boardingPasses.map((boardingPass, index) => (
                <div key={index} className="boarding-pass">
                  <div className="boarding-pass-header">
                    <h2>BOARDING PASS</h2>
                    <div className="airline-logo">
                      <span>LOTUS AIR</span>
                    </div>
                  </div>
                  
                  <div className="passenger-info">
                    <div className="info-row">
                      <span className="label">HÀNH KHÁCH: </span>
                      <span className="value">{boardingPass.passenger_name?.toUpperCase() || "HÀNH KHÁCH"}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">CHUYẾN BAY: </span>
                      <span className="value">{flightInfo.flightNumber}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">NGÀY: </span>
                      <span className="value">{flightInfo.date}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">GHẾ: </span>
                      <span className="value seat">{boardingPass.seat_number || "CHƯA CÓ"}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">NHÀ GA: </span>
                      <span className="value terminal">{flightInfo.terminal}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">CỔNG: </span>
                      <span className="value gate">{flightInfo.gate}</span>
                    </div>
                  </div>
                  
                  <div className="qr-section">
                    {boardingPass.qr_code_url && (
                      <img
                        src={`data:image/png;base64,${boardingPass.qr_code_url}`}
                        alt="QR Code"
                        className="qr-code"
                      />
                    )}
                    <p className="boarding-time">
                      Thời gian lên máy bay: 40 phút trước giờ khởi hành
                    </p>
                  </div>
                  
                  <div className="boarding-pass-footer">
                    <p>Vui lòng có mặt tại cổng trước ít nhất 30 phút</p>
                    <button 
                      className="btn-print"
                      onClick={() => {
                        // Tạo một window mới để in boarding pass này
                        const printWindow = window.open('', '_blank');
                        printWindow.document.write(`
                          <html>
                            <head>
                              <title>Boarding Pass - ${boardingPass.passenger_name || "Passenger"}</title>
                              <style>
                                body { font-family: 'Courier New', monospace; padding: 20px; }
                                .boarding-pass { border: 2px solid #000; padding: 20px; max-width: 400px; margin: 0 auto; }
                                h2 { text-align: center; margin-bottom: 20px; }
                                .info-row { margin: 10px 0; }
                                .label { font-weight: bold; margin-right: 10px; }
                                .qr-code { display: block; margin: 20px auto; max-width: 150px; }
                              </style>
                            </head>
                            <body>
                              <div class="boarding-pass">
                                <h2>BOARDING PASS</h2>
                                <div class="info-row">
                                  <span class="label">HÀNH KHÁCH:</span>
                                  <span>${boardingPass.passenger_name?.toUpperCase() || "HÀNH KHÁCH"}</span>
                                </div>
                                <div class="info-row">
                                  <span class="label">CHUYẾN BAY:</span>
                                  <span>${flightInfo.flightNumber}</span>
                                </div>
                                <div class="info-row">
                                  <span class="label">NGÀY:</span>
                                  <span>${flightInfo.date}</span>
                                </div>
                                <div class="info-row">
                                  <span class="label">GHẾ:</span>
                                  <span>${boardingPass.seat_number || "CHƯA CÓ"}</span>
                                </div>
                                <div class="info-row">
                                  <span class="label">NHÀ GA:</span>
                                  <span>${flightInfo.terminal}</span>
                                </div>
                                <div class="info-row">
                                  <span class="label">CỔNG:</span>
                                  <span>${flightInfo.gate}</span>
                                </div>
                                ${boardingPass.qr_code_url ? 
                                  `<img src="data:image/png;base64,${boardingPass.qr_code_url}" alt="QR Code" class="qr-code" />` : 
                                  ''
                                }
                              </div>
                            </body>
                          </html>
                        `);
                        printWindow.document.close();
                        printWindow.print();
                      }}
                    >
                      In Boarding Pass
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Nút quay lại */}
        <div className="action-buttons">
          <button 
            className="btn-back"
            onClick={() => navigate("/myflights")}
          >
            Quay lại danh sách chuyến bay
          </button>
          {bookingDetails && (
            <button 
              className="btn-manage"
              onClick={() => navigate("/managebooking")}
            >
              Quản lý đặt chỗ
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckinPage;