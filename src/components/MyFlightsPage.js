// import React, { useEffect, useState } from "react";
// import "../style/myflights.css";


// const MyFlightsPage = () => {
//   const [myBookings, setMyBookings] = useState([]);
//   const [currentPage, setCurrentPage] = useState(1);
//   const ITEMS_PER_PAGE = 2;

//   useEffect(() => {
//     const auth = JSON.parse(localStorage.getItem("auth"));
//     if (!auth?.email) return;

//     const userEmail = auth.email.toLowerCase();
//     const bookings = [];

//     Object.keys(localStorage).forEach((key) => {
//       if (!key.startsWith("booking_")) return;

//       const booking = JSON.parse(localStorage.getItem(key));
//       if (!booking?.passenger?.Email) return;

//       if (booking.passenger.Email.toLowerCase() === userEmail) {
//         bookings.push(booking);
//       }
//     });

//     bookings.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
//     setMyBookings(bookings);
//   }, []);

//   useEffect(() => {
//     setCurrentPage(1); 
//   }, [myBookings]);

//   const totalPages = Math.ceil(myBookings.length / ITEMS_PER_PAGE);

//   const renderPageItems = () => {
//     const start = (currentPage - 1) * ITEMS_PER_PAGE;
//     const end = start + ITEMS_PER_PAGE;
//     const pageItems = myBookings.slice(start, end);

//     return pageItems.map((b) => (
//       <div key={b.bookingCode} className="my-flight-card">
//         {b.type === "roundtrip" && b.outbound && b.inbound ? (
//           <>
//             <p>
//               <strong>Hành khách:</strong> <span>{b.passenger.Ho_va_ten}</span>
//             </p>
//             <p>
//               <strong>Mã đặt chỗ:</strong> <span>{b.bookingCode}</span>
//             </p>
//             <p>
//               <strong>Chuyến đi:</strong>{" "}
//               <span>
//                 {b.outbound.airport_from} → {b.outbound.airport_to}
//               </span>
//             </p>
//             <p>
//               <strong>Ghế đi:</strong> <span>{b.seatOutbound || "Chưa chọn"}</span>
//             </p>
//             <p>
//               <strong>Chuyến về:</strong>{" "}
//               <span>
//                 {b.inbound.airport_from} → {b.inbound.airport_to}
//               </span>
//             </p>
//             <p>
//               <strong>Ghế về:</strong> <span>{b.seatInbound || "Chưa chọn"}</span>
//             </p>
//             <p>
//               <strong>Tổng tiền:</strong>{" "}
//               <span>{b.totalAmount?.toLocaleString() || 0} VND</span>
//             </p>
//             <p>
//               <strong>Thời gian đặt:</strong>{" "}
//               <span>{new Date(b.createdAt).toLocaleString("vi-VN")}</span>
//             </p>
//           </>
//         ) : b.flight ? (
//           <>
//             <p>
//               <strong>Hành khách:</strong> <span>{b.passenger.Ho} {b.passenger.Ten_dem_va_ten}</span>
//             </p>
//             <p>
//               <strong>Mã đặt chỗ:</strong> <span>{b.bookingCode}</span>
//             </p>
//             <p>
//               <strong>Chuyến bay:</strong>{" "}
//               <span>
//                 {b.flight.airport_from} → {b.flight.airport_to}
//               </span>
//             </p>
//             <p>
//               <strong>Ghế:</strong> <span>{b.seat || "Chưa chọn"}</span>
//             </p>
//             <p>
//               <strong>Tổng tiền:</strong>{" "}
//               <span>{b.totalAmount?.toLocaleString() || 0} VND</span>
//             </p>
//             <p>
//               <strong>Thời gian đặt:</strong>{" "}
//               <span>{new Date(b.createdAt).toLocaleString("vi-VN")}</span>
//             </p>
//           </>
//         ) : null}
//       </div >
//     ));
//   };

//   const renderPagination = () => {
//     if (totalPages <= 1) return null;
//     const buttons = [];
//     for (let i = 1; i <= totalPages; i++) {
//       buttons.push(
//         <button
//           key={i}
//           className={i === currentPage ? "active" : ""}
//           onClick={() => setCurrentPage(i)}
//         >
//           {i}
//         </button>

//       );
//     }
//     return <div className="pagination">{buttons}</div>;
//   };

//   return (
//     <>
//       <header className="site-header">
//         <a href="/" className="logo">
//           <img
//             src="/assets/Lotus_Logo-removebg-preview.png"
//             alt="Lotus Travel"
//           />
//           <span>Lotus Travel</span>
//         </a>
//       </header>


//       <main className="page-content">
//         <section className="my-flights">
//           <h2>Danh sách chuyến bay đã thanh toán</h2>
//           {myBookings.length === 0 ? (
//             <p style={{ textAlign: "center", marginTop: "20px" }}>
//               Bạn chưa đặt chuyến bay nào.
//             </p>
//           ) : (
//             <>
//               {renderPageItems()}
//               {renderPagination()}
//             </>
//           )}
//         </section>
//       </main>
//     </>
//   );
// };

// export default MyFlightsPage;





import React, { useEffect, useState } from "react";
import "../style/myflights.css";

const ITEMS_PER_PAGE = 2;

const MyFlightsPage = () => {
  const [myBookings, setMyBookings] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const auth = JSON.parse(localStorage.getItem("auth"));
    if (!auth?.email) return;

    const userEmail = auth.email.toLowerCase();
    const bookings = [];

    Object.keys(localStorage).forEach((key) => {
      if (!key.startsWith("booking_")) return;
      const booking = JSON.parse(localStorage.getItem(key));
      if (!booking?.passenger?.Email) return;
      if (booking.passenger.Email.toLowerCase() === userEmail) bookings.push(booking);
    });

    bookings.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    setMyBookings(bookings);
  }, []);

  const totalPages = Math.ceil(myBookings.length / ITEMS_PER_PAGE);

  const handlePageClick = (page) => setCurrentPage(page);

  const paginatedBookings = myBookings.slice(
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

        {myBookings.length === 0 ? (
          <p style={{ textAlign: "center", marginTop: "20px" }}>
            Bạn chưa đặt chuyến bay nào.
          </p>
        ) : (
          <>
            <div id="my-flights-list">
              {paginatedBookings.map((b) => (
                <div key={b.bookingCode} className="my-flight-card">
                  <p>
                    <strong>Hành khách:</strong>&nbsp;&nbsp; 
                    <span>
                      {b.passenger.Ho_va_ten || `${b.passenger.Ho} ${b.passenger.Ten_dem_va_ten}`}
                    </span>
                  </p>
                  <p>
                    <strong>Mã đặt chỗ:</strong>&nbsp;&nbsp; 
                    <span>{b.bookingCode}</span>
                  </p>
                  {b.type === "roundtrip" && b.outbound && b.inbound ? (
                    <>
                      <p>
                        <strong>Chuyến đi:</strong>&nbsp;&nbsp; 
                        <span>
                          {b.outbound.airport_from} → {b.outbound.airport_to}
                        </span>
                      </p>
                      <p>
                        <strong>Ghế đi:</strong>&nbsp;&nbsp; 
                        <span>{b.seatOutbound || "Chưa chọn"}</span>
                      </p>
                      <p>
                        <strong>Chuyến về:</strong>&nbsp;&nbsp; 
                        <span>
                          {b.inbound.airport_from} → {b.inbound.airport_to}
                        </span>
                      </p>
                      <p>
                        <strong>Ghế về:</strong>&nbsp;&nbsp; 
                        <span>{b.seatInbound || "Chưa chọn"}</span>
                      </p>
                    </>
                  ) : b.flight ? (
                    <>
                      <p>
                        <strong>Chuyến bay:</strong>&nbsp;&nbsp; 
                        <span>
                          {b.flight.airport_from} → {b.flight.airport_to}
                        </span>
                      </p>
                      <p>
                        <strong>Ghế:</strong>&nbsp;&nbsp; 
                        <span>{b.seat || "Chưa chọn"}</span>
                      </p>
                    </>
                  ) : null}
                  <p>
                    <strong>Tổng tiền:</strong>&nbsp;&nbsp; 
                    <span>{b.totalAmount?.toLocaleString() || 0} VND</span>
                  </p>
                  <p>
                    <strong>Thời gian đặt:</strong>&nbsp;&nbsp; 
                    <span>{new Date(b.createdAt).toLocaleString("vi-VN")}</span>
                  </p>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    className={currentPage === i + 1 ? "active" : ""}
                    onClick={() => handlePageClick(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
};

export default MyFlightsPage;
