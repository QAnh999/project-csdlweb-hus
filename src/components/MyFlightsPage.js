import React, { useEffect, useState } from "react";
import "../style/myflights.css";

const airportMap = { HAN:1, SGN:2, DLI:3, PQC:4, DAD:5, CXR:6, HPH:7, VII:8, VCL:9, HUI:10, THD:11, VCA:12, UIH:13 };
const airportIdToIata = Object.fromEntries(Object.entries(airportMap).map(([iata,id])=>[id,iata]));

const ITEMS_PER_PAGE = 2;

const MyFlightsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // Lấy auth token
  const getAuthToken = () => {
    const auth = JSON.parse(localStorage.getItem("auth") || "{}");
    return auth?.access_token || "";
  };

  // Enrich flight details (shared with ManageBooking)
  const fetchFlightDetails = async (flightId, token) => {
    try {
      const response = await fetch(`http://localhost:8000/flight/${flightId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        const flightData = await response.json();
        return {
          airport_from: airportIdToIata[flightData.dep_airport] || flightData.airport_from || "N/A",
          airport_to: airportIdToIata[flightData.arr_airport] || flightData.airport_to || "N/A",
          f_time_from: flightData.dep_datetime || flightData.f_time_from || "N/A",
          f_code: flightData.flight_number || flightData.f_code || "N/A",
        };
      }
      return null;
    } catch (e) {
      console.warn(`Failed to enrich flight ${flightId}:`, e);
      return null;
    }
  };

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        
        const token = getAuthToken();
        if (!token) {
          console.warn("Chưa đăng nhập");
          setLoading(false);
          return;
        }

        // Gọi API lấy booking history từ BE (base info only)
        const response = await fetch("http://localhost:8000/booking/history", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error("Không thể tải danh sách booking");
        }

        const baseBookings = await response.json();
        
        // Lấy chi tiết cho từng booking từ BE và enrich flights
        const detailedBookings = await Promise.all(
          baseBookings.map(async (baseBooking) => {
            try {
              const detailResponse = await fetch(
                `http://localhost:8000/booking/${baseBooking.reservation_id}`,
                {
                  headers: {
                    "Authorization": `Bearer ${token}`
                  }
                }
              );
              
              if (detailResponse.ok) {
                const details = await detailResponse.json();
                
                // Enrich flights với chi tiết flight (tương tự ManageBooking)
                const enrichedFlights = await Promise.all(
                  details.flights.map(async (flight) => {
                    const flightDetails = await fetchFlightDetails(flight.flight_id, token);
                    return { ...flight, ...flightDetails };
                  })
                );
                
                return {
                  ...baseBooking,
                  details: { ...details, flights: enrichedFlights }
                };
              }
              // Nếu detail fail, return base only
              return baseBooking;
            } catch (error) {
              console.warn(`Failed to fetch details for ${baseBooking.reservation_id}:`, error);
              return baseBooking;
            }
          })
        );

        setBookings(detailedBookings);
      } catch (err) {
        console.error("Fetch bookings error:", err);
        // Fallback to localStorage if API fails entirely
        loadFromLocalStorage();
      } finally {
        setLoading(false);
      }
    };

    const loadFromLocalStorage = () => {
      const auth = JSON.parse(localStorage.getItem("auth") || "{}");
      if (!auth?.email) {
        setBookings([]);
        return;
      }

      const userEmail = auth.email.toLowerCase();
      const cards = [];

      Object.keys(localStorage).forEach((key) => {
        if (!/^[A-Z0-9]{6}$/.test(key)) return;

        try {
          const booking = JSON.parse(localStorage.getItem(key));
          if (!booking?.passenger?.info) return;

          if (booking.passenger.info.Email?.toLowerCase() !== userEmail) return;

          cards.push({
            reservation_id: null, // Not from LS, but for consistency
            reservation_code: key,
            status: "confirmed",
            created_at: booking.createdAt,
            expires_at: null,
            bookingCode: key,
            passenger: booking.passenger,
            type: booking.type,
            flight: booking.flight,
            outbound: booking.outbound,
            inbound: booking.inbound,
            totalAmount: booking.totalAmount,
          });
        } catch (e) {
          console.warn(`Invalid localStorage entry: ${key}`, e);
        }
      });

      // Sort by created_at descending
      cards.sort((a, b) => new Date(b.created_at || b.createdAt || 0) - new Date(a.created_at || a.createdAt || 0));
      setBookings(cards);
    };

    fetchBookings();
  }, []);

  const totalPages = Math.ceil(bookings.length / ITEMS_PER_PAGE);
  const paginatedBookings = bookings.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Helper: Safe date formatting
  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? "N/A" : date.toLocaleString('vi-VN');
  };

  // Format booking for display, aligned with BE structure
  const formatBookingForDisplay = (booking) => {
    // Full details available (from BE detail endpoint)
    if (booking.details) {
      const { details } = booking;
      const firstPassenger = details.passengers?.[0];
      
      return {
        bookingCode: details.reservation_code || booking.reservation_code,
        passengerName: firstPassenger 
          ? `${firstPassenger.last_name || ''} ${firstPassenger.first_name || ''}`.trim().toUpperCase() || "Không có thông tin"
          : "Không có thông tin",
        flights: details.flights || [],
        totalAmount: details.total_amount,
        createdAt: details.created_at || booking.created_at,
        status: details.status || booking.status,
        expiresAt: details.expires_at || booking.expires_at
      };
    }
    
    // LocalStorage fallback (legacy structure)
    else if (booking.bookingCode) {
      return {
        bookingCode: booking.bookingCode,
        passengerName: booking.passenger?.info 
          ? `${booking.passenger.info.Ho || ''} ${booking.passenger.info.Ten_dem_va_ten || ''}`.trim().toUpperCase() 
          : "Không có thông tin",
        flights: [
          ...(booking.flight ? [{ flight: booking.flight, direction: "oneway" }] : []),
          ...(booking.outbound ? [{ flight: booking.outbound, direction: "outbound" }] : []),
          ...(booking.inbound ? [{ flight: booking.inbound, direction: "inbound" }] : [])
        ],
        totalAmount: booking.totalAmount,
        createdAt: booking.createdAt || booking.created_at,
        status: booking.status || "confirmed",
        expiresAt: booking.expires_at
      };
    }
    
    // Base BE response only (no details, minimal display)
    else {
      return {
        bookingCode: booking.reservation_code || "N/A",
        passengerName: "Chi tiết không khả dụng (liên hệ hỗ trợ)",
        flights: [],
        totalAmount: "N/A",
        createdAt: booking.created_at,
        status: booking.status || "unknown",
        expiresAt: booking.expires_at
      };
    }
  };

  // Status display mapping (aligned with BE statuses)
  const getStatusDisplay = (status) => {
    switch (status) {
      case "confirmed": return "Đã xác nhận";
      case "pending": return "Chờ thanh toán";
      case "cancelled": return "Đã hủy";
      case "expired": return "Đã hết hạn"; // If using expires_at
      default: return status || "Không xác định";
    }
  };

  if (loading) {
    return (
      <div className="flights-wrapper">
        <header className="site-header">
          <a href="/" className="logo">
            <img src="/assets/Lotus_Logo-removebg-preview.png" alt="Lotus Travel Logo" />
            <span>Lotus Travel</span>
          </a>
        </header>
        <section className="my-flights">
          <h2>Đang tải danh sách chuyến bay...</h2>
        </section>
      </div>
    );
  }

  return (
    <div className="flights-wrapper">
      <header className="site-header">
        <a href="/" className="logo">
          <img src="/assets/Lotus_Logo-removebg-preview.png" alt="Lotus Travel Logo" />
          <span>Lotus Travel</span>
        </a>
      </header>

      <section className="my-flights">
        <h2>Danh sách chuyến bay đã đặt</h2>

        {bookings.length === 0 ? (
          <p className="empty-message">
            Bạn chưa có chuyến bay nào. <a href="/search">Tìm kiếm chuyến bay ngay!</a>
          </p>
        ) : (
          <>
            <div id="my-flights-list">
              {paginatedBookings.map((booking, idx) => {
                const formatted = formatBookingForDisplay(booking);
                
                return (
                  <div key={booking.reservation_id || booking.bookingCode || idx} className="my-flight-card">
                    <div className="booking-header">
                      <span className={`status-badge ${formatted.status.toLowerCase()}`}>
                        {getStatusDisplay(formatted.status)}
                      </span>
                      <span className="booking-code">{formatted.bookingCode}</span>
                    </div>

                    <p>
                      <strong>Hành khách chính:</strong>
                      <span>{formatted.passengerName}</span>
                    </p>

                    {formatted.flights.length > 0 ? (
                      formatted.flights.map((flightItem, flightIdx) => {
                        const flightData = flightItem; // Enriched flight object
                        const direction = flightItem.direction;
                        
                        return (
                          <div key={flightIdx} className="flight-section">
                            <p>
                              <strong>
                                {direction === "outbound" ? "Chặng đi:" : 
                                 direction === "inbound" ? "Chặng về:" : "Chuyến bay:"}
                              </strong>
                              <span>
                                {flightData.airport_from || "N/A"} →{" "}
                                {flightData.airport_to || "N/A"}
                              </span>
                            </p>
                            <p>
                              <strong>Mã chuyến:</strong>
                              <span>{flightData.f_code || "N/A"}</span>
                            </p>
                            <p>
                              <strong>Khởi hành:</strong>
                              <span>{formatDate(flightData.f_time_from)}</span>
                            </p>
                          </div>
                        );
                      })
                    ) : (
                      <p className="no-flights">Chi tiết chuyến bay không khả dụng</p>
                    )}

                    <p>
                      <strong>Tổng tiền:</strong>
                      <span>
                        {typeof formatted.totalAmount === 'number'
                          ? formatted.totalAmount.toLocaleString("vi-VN")
                          : formatted.totalAmount} VND
                      </span>
                    </p>

                    <p>
                      <strong>Thời gian đặt:</strong>
                      <span>{formatDate(formatted.createdAt)}</span>
                    </p>

                    {formatted.expiresAt && (
                      <p>
                        <strong>Hết hạn:</strong>
                        <span>{formatDate(formatted.expiresAt)}</span>
                      </p>
                    )}

                    <div className="booking-actions">
                      <button 
                        className="action-btn view-details"
                        onClick={() => {
                          localStorage.setItem("current_booking_code", formatted.bookingCode);
                          window.location.href = `/managebooking`;
                        }}
                        disabled={!booking.reservation_id && !booking.bookingCode}
                      >
                        Xem chi tiết
                      </button>
                      
                      {formatted.status === "confirmed" && (
                        <button 
                          className="action-btn check-in"
                          onClick={() => {
                            localStorage.setItem("current_booking_code", formatted.bookingCode);
                            window.location.href = `/checkin`;
                          }}
                        >
                          Check-in
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  aria-label="Trang trước"
                >
                  &laquo;
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    className={currentPage === i + 1 ? "active" : ""}
                    onClick={() => setCurrentPage(i + 1)}
                    aria-label={`Trang ${i + 1}`}
                  >
                    {i + 1}
                  </button>
                ))}
                
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  aria-label="Trang sau"
                >
                  &raquo;
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
};

export default MyFlightsPage;