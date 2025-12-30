import React, { useEffect, useState } from "react";
import "../style/myflights.css";

const ITEMS_PER_PAGE = 2; // 1 trang tối đa 2 flight card

const MyFlightsPage = () => {
  const [flightCards, setFlightCards] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const auth = JSON.parse(localStorage.getItem("auth"));
    if (!auth?.email) return;

    const userEmail = auth.email.toLowerCase();
    const cards = [];

    Object.keys(localStorage).forEach((key) => {
      // ✅ chỉ lấy passengerCode (VD: 707WRK)
      if (!/^[A-Z0-9]{6}$/.test(key)) return;

      let booking;
      try {
        booking = JSON.parse(localStorage.getItem(key));
      } catch {
        return;
      }

      if (!booking?.passenger?.info) return;

      if (
        booking.passenger.info.Email?.toLowerCase() !== userEmail
      )
        return;

      cards.push({
        bookingCode: key, // ✅ key chính là mã đặt chỗ
        passenger: booking.passenger,
        type: booking.type,
        flight: booking.flight,
        outbound: booking.outbound,
        inbound: booking.inbound,
        totalAmount: booking.totalAmount,
        createdAt: booking.createdAt,
      });
    });

    cards.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    setFlightCards(cards);
  }, []);


  const totalPages = Math.ceil(flightCards.length / ITEMS_PER_PAGE);

  const paginatedCards = flightCards.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );


  return (
    <div className="flights-wrapper">
      <header className="site-header">
        <a href="/" className="logo">
          <img src="/assets/Lotus_Logo-removebg-preview.png" alt="Lotus Travel" />
          <span>Lotus Travel</span>
        </a>
      </header>

      <section className="my-flights">
        <h2>Danh sách chuyến bay đã thanh toán</h2>

        <div id="my-flights-list">
          {paginatedCards.length === 0 ? (
            <p className="empty-message">
              Bạn chưa có chuyến bay nào.
            </p>
          ) : (
            paginatedCards.map((card, idx) => (
              <div key={idx} className="my-flight-card">
                <p>
                  <strong>Hành khách:</strong>
                  <span>
                    {card.passenger.info
                      ? `${card.passenger.info.Ho} ${card.passenger.info.Ten_dem_va_ten}`.toUpperCase()
                      : "Chưa có thông tin"}
                  </span>
                </p>

                <p>
                  <strong>Mã đặt chỗ:</strong>
                  <span className="booking-code">{card.bookingCode}</span>
                </p>

                {card.type === "oneway" && card.flight && (
                  <>
                    <p>
                      <strong>Chuyến bay:</strong>
                      <span>
                        {card.flight.airport_from} →{" "}
                        {card.flight.airport_to}
                      </span>
                    </p>
                    <p>
                      <strong>Ghế:</strong>
                      <span>{card.passenger.seatOneway || "Chưa chọn"}</span>
                    </p>
                  </>
                )}

                {card.type === "roundtrip" && (
                  <>
                    <p>
                      <strong>Chuyến đi:</strong>
                      <span>
                        {card.outbound.airport_from} →{" "}
                        {card.outbound.airport_to}
                      </span>
                    </p>
                    <p>
                      <strong>Ghế đi:</strong>
                      <span>
                        {card.passenger.seatOutbound || "Chưa chọn"}
                      </span>
                    </p>

                    <p>
                      <strong>Chuyến về:</strong>
                      <span>
                        {card.inbound.airport_from} →{" "}
                        {card.inbound.airport_to}
                      </span>
                    </p>
                    <p>
                      <strong>Ghế về:</strong>
                      <span>
                        {card.passenger.seatInbound || "Chưa chọn"}
                      </span>
                    </p>
                  </>
                )}

                <p>
                  <strong>Tổng tiền:</strong>
                  <span>
                    {card.totalAmount?.toLocaleString("vi-VN")} VND
                  </span>
                </p>

                <p>
                  <strong>Thời gian đặt:</strong>
                  <span>
                    {new Date(card.createdAt).toLocaleString("vi-VN")}
                  </span>
                </p>
              </div>
            ))
          )}
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                className={currentPage === i + 1 ? "active" : ""}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default MyFlightsPage;
