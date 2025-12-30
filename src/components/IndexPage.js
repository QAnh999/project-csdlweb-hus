import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../style/indexPage.css";
import "remixicon/fonts/remixicon.css";

const IndexPage = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("booking");
  const [tripType, setTripType] = useState("oneway");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");

  // const [adultCount, setAdultCount] = useState(1);
  // const [childCount, setChildCount] = useState(0);
  // const [infantCount, setInfantCount] = useState(0);

  const [passengerCount, setPassengerCount] = useState(1);

  const [auth, setAuth] = useState(() => {
    const stored = localStorage.getItem("auth");
    return stored ? JSON.parse(stored) : { loggedIn: false };
  });

  useEffect(() => {
    const stored = localStorage.getItem("auth");
    if (stored) {
      setAuth(JSON.parse(stored));
    }
  }, []);


  // const [passengerPopup, setPassengerPopup] = useState(false);
  // const totalPassengers = adultCount + childCount + infantCount;

  const [checkinCode, setCheckinCode] = useState("");
  const [checkinLastname, setCheckinLastname] = useState("");
  const [checkinResult, setCheckinResult] = useState("");

  const [bookingCode, setBookingCode] = useState("");
  const [bookingLastname, setBookingLastname] = useState("");

  const airports = [
    { code: "SGN", name: "TP HCM" },
    { code: "HAN", name: "Hà Nội" },
    { code: "DLI", name: "Đà Lạt" },
    { code: "PQC", name: "Phú Quốc" },
    { code: "CXR", name: "Nha Trang" },
    { code: "DAD", name: "Đà Nẵng" },
    { code: "UIH", name: "Quy Nhơn" },
    { code: "THD", name: "Thanh Hóa" },
    { code: "HPH", name: "Hải Phòng" },
    { code: "VII", name: "Vinh" },
    { code: "HUI", name: "Huế" },
    { code: "VCI", name: "Côn Đảo" },
    { code: "VCA", name: "Cà Mau" }
  ];

  // const changeCount = (type, delta) => {
  //   if (type === "adult") {
  //     const newAdult = Math.max(1, adultCount + delta);
  //     setAdultCount(newAdult);

  //     if (infantCount > newAdult) {
  //       setInfantCount(newAdult);
  //     }
  //   }

  //   if (type === "child") {
  //     setChildCount(Math.max(0, childCount + delta));
  //   }

  //   if (type === "infant") {
  //     const newInfant = infantCount + delta;
  //     if (newInfant < 0 || newInfant > adultCount) return;
  //     setInfantCount(newInfant);
  //   }
  // };


  const handleBookingSubmit = (e) => {
    e.preventDefault();
    if (!from || !to || !departureDate) {
      alert("Vui lòng chọn đầy đủ thông tin chuyến bay!");
      return;
    }
    if (tripType === "roundtrip" && !returnDate) {
      alert("Vui lòng chọn ngày về!");
      return;
    }
    if (from === to) {
      alert("Điểm đi và điểm đến không được trùng nhau!");
      return;
    }
    if (tripType === "roundtrip" && returnDate < departureDate) {
      alert("Ngày về phải sau ngày đi!");
      return;
    }

    let url = `/booking?from=${from}&to=${to}&date=${departureDate}&tripType=${tripType}&passengers=${passengerCount}`;

    if (tripType === "roundtrip" && returnDate) {
      url += `&returnDate=${returnDate}`;
    }
    navigate(url);
  };


const handleCheckin = () => {
  if (!checkinCode || !checkinLastname) {
    alert("Vui lòng nhập đầy đủ thông tin");
    return;
  }

  const code = checkinCode.trim().toUpperCase();
  const lastname = checkinLastname.trim().toUpperCase();

  // ✅ KEY LÀ passengerCode (707WRK), KHÔNG PHẢI booking_707WRK
  const bookingStr = localStorage.getItem(code);
  if (!bookingStr) {
    alert("Mã đặt chỗ không tồn tại");
    return;
  }

  const booking = JSON.parse(bookingStr);

  if (
    !booking.passenger ||
    !booking.passenger.info ||
    booking.passenger.info.Ho.trim().toUpperCase() !== lastname
  ) {
    alert("Họ không khớp với mã đặt chỗ");
    return;
  }

  if (
    (booking.type === "oneway" && booking.checkedIn) ||
    (booking.type === "roundtrip" &&
      booking.checkedInOutbound &&
      booking.checkedInInbound)
  ) {
    alert("Bạn đã làm thủ tục cho chuyến bay này!");
    return;
  }

  localStorage.setItem("current_booking_code", code);
  navigate("/checkin");
};



  const handleSearchBooking = () => {
  if (!bookingCode || !bookingLastname) {
    alert("Vui lòng nhập đầy đủ thông tin!");
    return;
  }

  const code = bookingCode.trim().toUpperCase();
  const lastname = bookingLastname.trim().toUpperCase();

  // ✅ KEY LÀ passengerCode
  const bookingStr = localStorage.getItem(code);
  if (!bookingStr) {
    alert("Mã đặt chỗ không tồn tại");
    return;
  }

  const booking = JSON.parse(bookingStr);

  // ✅ ĐÚNG CẤU TRÚC passenger.info.Ho
  if (
    !booking.passenger ||
    !booking.passenger.info ||
    booking.passenger.info.Ho.trim().toUpperCase() !== lastname
  ) {
    alert("Họ không khớp với mã đặt chỗ");
    return;
  }

  localStorage.setItem("current_booking_code", code);
  navigate("/managebooking");
};


  const handleAuthClick = () => {
    if (auth.loggedIn) {
      localStorage.removeItem("auth");
      setAuth({ loggedIn: false });
      navigate("/login");
    } else {
      navigate("/login");
    }
  };

  useEffect(() => {
    const storedAuth = JSON.parse(localStorage.getItem("auth"));
    setAuth(storedAuth);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("auth");
    setAuth(null);
    navigate("/login");
  };

  const requireLogin = () => {
    if (!auth?.loggedIn) {
      alert("Vui lòng đăng nhập để tiếp tục");
      navigate("/login");
      return false;
    }
    return true;
  };

  return (
    <div id="top" className="content">
      <div className="hero_section">
        <nav>
          <div className="nav_header">
            <div className="nav_logo">
              <a href="/" className="logo">
                <img src="/assets/Lotus_Logo-removebg-preview.png" alt="Lotus Travel Logo" />
                <div className="logo-text">
                  <span className="brand">Lotus Travel</span>
                  <span className="slogan">From Low Cost To High Trust</span>
                </div>
              </a>
            </div>
          </div>
          <div className="nav_btns">
            {auth?.loggedIn && (
              <button
                className="btn my-flight-btn"
                onClick={() => {
                  if (requireLogin()) navigate("/myflights");
                }}
              >
                Chuyến bay của tôi
              </button>
            )}

            {auth?.loggedIn ? (
              <button className="btn" onClick={handleLogout}>
                Đăng xuất
              </button>
            ) : (
              <button
                className="btn"
                onClick={() => navigate("/login")}
              >
                Đăng nhập
              </button>
            )}
          </div>
        </nav>

        <section id="booking" className="booking-section">
          <div className="booking-tabs">
            <button className={`tab ${activeTab === "booking" ? "active" : ""}`} onClick={() => setActiveTab("booking")}>
              ✈️ Đặt vé
            </button>
            <button className={`tab ${activeTab === "checkin" ? "active" : ""}`} onClick={() => setActiveTab("checkin")}>
              🎫 Làm thủ tục
            </button>
            <button className={`tab ${activeTab === "management" ? "active" : ""}`} onClick={() => setActiveTab("management")}>
              📍 Quản lý đặt chỗ
            </button>
          </div>

          {activeTab === "booking" && (
            <div className="booking-container active">
              <form className="tab-content active" onSubmit={handleBookingSubmit}>
                <div className="booking-type">
                  <label>
                    <input type="radio" name="trip" value="oneway" checked={tripType === "oneway"} onChange={() => setTripType("oneway")} />
                    Một chiều
                  </label>
                  <label>
                    <input type="radio" name="trip" value="roundtrip" checked={tripType === "roundtrip"} onChange={() => setTripType("roundtrip")} />
                    Khứ hồi
                  </label>
                </div>

                <div className="content-row">
                  <div className="booking-group">
                    <label>Từ</label>
                    <input list="airports-from" value={from} onChange={(e) => setFrom(e.target.value)} placeholder="TP HCM" />
                    <datalist id="airports-from">
                      {airports.map(a => <option key={a.code} value={a.code}>{a.name}</option>)}
                    </datalist>
                  </div>

                  <div className="booking-group">
                    <label>Đến</label>
                    <input list="airports-to" value={to} onChange={(e) => setTo(e.target.value)} placeholder="Hà Nội" />
                    <datalist id="airports-to">
                      {airports.map(a => <option key={a.code} value={a.code}>{a.name}</option>)}
                    </datalist>
                  </div>

                  <div className="booking-group">
                    <label>Ngày đi</label>
                    <input type="date" value={departureDate} onChange={(e) => setDepartureDate(e.target.value)} />
                  </div>

                  {tripType === "roundtrip" && (
                    <div className="booking-group">
                      <label>Ngày về</label>
                      <input type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} />
                    </div>
                  )}

                  <div className="booking-group passenger-group">
                    <label>Hành khách</label>
                    <input
                      type="number"
                      min={1}
                      value={passengerCount}
                      onChange={(e) =>
                        setPassengerCount(Math.min(9, Math.max(1, Number(e.target.value))))
                      }
                    />
                  </div>


                <div className="booking-group">
                  <button type="submit" className="btn">Tìm chuyến bay</button>
                </div>
            </div>
              </form>
      </div>
          )}

      <div
        className={`checkin-contain ${activeTab === "checkin" ? "active" : ""}`}
        style={{ display: activeTab === "checkin" ? "block" : "none" }}
      >

        <div className="checkin-row">
          <div className="checkin-group">
            <label>Mã đặt chỗ</label>
            <input
              type="text"
              value={checkinCode}
              onChange={(e) => setCheckinCode(e.target.value.toUpperCase())}
              placeholder="123ABC"
            />
          </div>
          <div className="checkin-group">
            <label>Họ</label>
            <input
              type="text"
              value={checkinLastname}
              onChange={(e) => setCheckinLastname(e.target.value.toUpperCase())}
              placeholder="NGUYEN"
            />
          </div>
        </div>
        <button type="button" className="btn" onClick={handleCheckin}>
          Làm thủ tục
        </button>
        <div dangerouslySetInnerHTML={{ __html: checkinResult }} />
      </div>

      <div
        className={`management-container ${activeTab === "management" ? "active" : ""}`}
        style={{ display: activeTab === "management" ? "block" : "none" }}
      >
        <div className="management-row">
          <div className="management-group">
            <label>Mã đặt chỗ</label>
            <input
              type="text"
              value={bookingCode}
              onChange={(e) => setBookingCode(e.target.value.toUpperCase())}
              placeholder="123ABC"
            />
          </div>
          <div className="management-group">
            <label>Họ</label>
            <input
              type="text"
              value={bookingLastname}
              onChange={(e) => setBookingLastname(e.target.value.toUpperCase())}
              placeholder="NGUYEN"
            />
          </div>
        </div>
        <button type="button" className="btn" onClick={handleSearchBooking}>
          Tìm kiếm
        </button>
      </div>

    </section>
      </div >
  <div className="second-cotent">
    <section className="section_container destination_container" id="about">
      <h2 className="section_header">Điểm đến phổ biến</h2>
      <p className="section_description">
        Các địa điểm được nhiều hành khách lựa chọn để trải nghiệm
      </p>
      <div className="destination_grid">
        <div className="destination_card">
          <img src="assets/lang-ho-chu-tich.jpg" alt="destination" />
          <div className="destination_card_details">
            <div>
              <h4>Lăng Chủ tịch Hồ Chí Minh</h4>
              <p>Hà Nội</p>
              <span className="rating">⭐ 1000</span>
            </div>
          </div>
        </div>
        <div className="destination_card">
          <img src="assets/dinh-doc-lap.jpg" alt="destination" />
          <div className="destination_card_details">
            <div>
              <h4>Dinh Độc Lập</h4>
              <p>Thành phố Hồ Chí Minh</p>
              <span className="rating">⭐ 1000</span>
            </div>
          </div>
        </div>
        <div className="destination_card">
          <img src="assets/bao-tang-lich-su-quan-su.jpg" alt="destination" />
          <div className="destination_card_details">
            <div>
              <h4>Bảo tàng Lịch sử Quân sự Việt Nam</h4>
              <p>Hà Nội</p>
              <span className="rating">⭐ 1000</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section className="section_container showcase_container" id="package">
      <div className="showcase_image">
        <img src="assets/co-to-quoc.jpg" alt="showcase" />
      </div>
      <div className="showcase_content">
        <h4>Lotus Travel</h4>
        <p>
          Ra đời với sứ mệnh kết nối trái tim Việt trên mọi vùng trời tổ quốc, Lotus
          Travel không chỉ mang đến những chuyến đi, mà còn lan tỏa những giá trị nhân
          văn, tinh thần tận tâm và cảm hứng sống tích cực trên từng chặng đường.
        </p>
        <p>
          Du lịch không chỉ là khám phá thế giới, mà còn là hành trình khám phá vẻ đẹp đất
          nước Việt Nam - nơi hội tụ những tinh hoa văn hóa, con người nghĩa tình và thiên
          nhiên hùng vĩ. Mỗi bước chân là một niềm tự hào, mỗi vùng đất là một câu chuyện,
          mỗi hành trình là một cơ hội để tình yêu nước lại ngân vang trong tim.
        </p>
        <p>
          <i>
            "Vì đất nước mình còn lạ, cần chi đâu nước ngoài <br />
            Đặt chân lên tất cả mọi miền là ước mơ ta ước hoài."
          </i>
        </p>
        <div className="showcase_btn">
          <a href="#top" className="btn">
            Đặt vé ngay thôi
            <span><i className="ri-arrow-right-line"></i></span>
          </a>
        </div>
      </div>
    </section>

    <section className="feedback section_container" id="feedback">
      <h2 className="section_header">Phản hồi từ khách hàng</h2>
      <p className="section_description">
        Xin được gửi lời cảm ơn chân thành và sâu sắc đến quý hành khách đã lựa chọn Lotus Travel như
        người bạn đồng hành trong mỗi chuyến đi
      </p>

      <div className="feedback_grid">
        {[
          {
            rating: 5,
            text: "Dịch vụ tốt, phản hồi yêu cầu của khách hàng nhanh.",
            name: "Trần Long Thiên Kim",
            flight: "VN7151",
            route: "Hà Nội - Đà Nẵng",
            avatar: "assets/avt2.jpg",
          },
          {
            rating: 5,
            text: "Giao diện đẹp, dễ sử dụng, nhiều lịch bay.",
            name: "Võ Khánh Tường",
            flight: "VJ771",
            route: "Hà Nội - Nha Trang",
            avatar: "assets/avatar2.jpg",
          },
          {
            rating: 5,
            text: "Mong Lotus Travel ngày càng phát triển để phát huy tiềm năng du lịch Việt tốt hơn nữa.",
            name: "Phạm Yến Nhi",
            flight: "VN1382",
            route: "TP HCM - Đà Lạt",
            avatar: "assets/avatar3.jpg",
          },
          {
            rating: 5,
            text: "Khá thích Lotus Travel, đặt vé dễ, cập nhật trạng thái chuyến bay nhanh.",
            name: "Phạm Minh Khanh",
            flight: "QH204",
            route: "TP HCM - Hà Nội",
            avatar: "assets/avatar4.jpg",
          },
          {
            rating: 5,
            text: "Recommend mua vé ở đây nhé. Mỗi lần đi du lịch mình đều đặt vé ở đây, siêu hài lòng với dịch vụ chăm sóc khách hàng của Lotus.",
            name: "Lý Tố Như",
            flight: "VN283",
            route: "Hà Nội - TP HCM",
            avatar: "assets/avatar5.jpg",
          },
          {
            rating: 5,
            text: "5 sao",
            name: "Trần Long Phương Nghi",
            flight: "QH1622",
            route: "Phú Quốc - Hà Nội",
            avatar: "assets/avt3.jpg",
          },
        ].map((feedback, i) => (
          <div className="feedback_card" key={i}>
            <div className="feedback_rating">
              {Array.from({ length: feedback.rating }).map((_, j) => (
                <i key={j} className="ri-star-fill"></i>
              ))}
            </div>
            <p>{feedback.text}</p>
            <div className="feedback_user">
              <img src={feedback.avatar} alt="client" />
              <div>
                <h4>{feedback.name}</h4>
                <small>Hành khách chuyến bay {feedback.flight} <br /> ({feedback.route})</small>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>

    <footer id="contact">
      <div className="section_container footer_container">
        <div className="footer_col">
          <div className="footer_logo">
            <img src="assets/Lotus_Logo-removebg-preview.png" alt="Lotus Travel Logo" />
            <p><strong>Lotus Travel</strong></p>
          </div>
        </div>

        <div className="footer_col">
          <h4>Liên hệ</h4>
          <ul className="footer_links">
            <li><span><i className="ri-phone-fill"></i> +84 90909090</span></li>
            <li><span><i className="ri-record-mail-line"></i> hotro@lotustravel</span></li>
            <li><span><i className="ri-map-pin-2-fill"></i> Hà Nội, Việt Nam</span></li>
          </ul>
        </div>

        <div className="sponsor">
          <div className="logo_sponsors">
            <img src="assets/logo-world-travel-awards.png" alt="logo1" />
            <img src="assets/logo-skyrax.png" alt="logo2" />
            <img src="assets/logo-hus.png" alt="logo3" />
          </div>
        </div>
      </div>
      <div className="footer_bar">
        © 2025 Lotus Team, a project for MAT3385, HUS - VNU
      </div>
    </footer>
  </div>
    </div >
  );
};

export default IndexPage;
