import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../style/passengerinfo.css";
import { useSearchParams } from "react-router-dom";
// import { getBookingDraftPartial, updateBookingDraft } from '../utils/bookingUtils';

const PassengerInfoPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const passengerIndex = Number(searchParams.get("index")) || 0;


  useEffect(() => {
    const draftStr = localStorage.getItem("bookingDraft");
    if (!draftStr) {
      alert("Không tìm thấy thông tin chuyến bay.");
      navigate("/booking");
      return;
    }

    const draft = JSON.parse(draftStr);

    // xác định type
    if (!draft.type) {
      if (draft.outbound || draft.inbound) draft.type = "roundtrip";
      else if (draft.flight) draft.type = "oneway";
      else {
        alert("Dữ liệu đặt chỗ không hợp lệ.");
        navigate("/booking");
        return;
      }
    }

    const passengerCount = Number(draft.passengerCount) || 1;

    // init passengers array
    if (!Array.isArray(draft.passengers)) {
      draft.passengers = Array.from({ length: passengerCount }, () => ({
        info: null,
        services: null,
        seatOneway: null,
        seatOutbound: null,
        seatInbound: null,
      }));
    }

    // nếu passenger này đã nhập rồi → load lại lên form
    const currentPassenger = draft.passengers[passengerIndex];
    if (currentPassenger?.info) {
      setPassenger(currentPassenger.info);
      setBaggage(currentPassenger.services?.baggage || { type: "Không", price: 0 });
      setMeal(currentPassenger.services?.meal || { type: "Không", price: 0 });

      setBaggageChecked(
        currentPassenger.services?.baggage?.type &&
        currentPassenger.services.baggage.type !== "Không"
      );

      setMealChecked(
        currentPassenger.services?.meal?.type &&
        currentPassenger.services.meal.type !== "Không"
      );

    } else {
      // reset form cho hành khách mới
      setPassenger({
        Danh_xung: "Mr",
        Ho: "",
        Ten_dem_va_ten: "",
        Ngay_sinh: "",
        Email: "",
        Ma_quoc_gia: "",
        So_dien_thoai: "",
      });
      setBaggage({ type: "Không", price: 0 });
      setMeal({ type: "Không", price: 0 });
      setBaggageChecked(false);
      setMealChecked(false);
    }

    localStorage.setItem("bookingDraft", JSON.stringify(draft));
  }, [navigate, passengerIndex]);


  const [passenger, setPassenger] = useState({
    Danh_xung: "Mr",
    Ho: "",
    Ten_dem_va_ten: "",
    Ngay_sinh: "",
    Email: "",
    Ma_quoc_gia: "",
    So_dien_thoai: "",
  });

  const [baggageChecked, setBaggageChecked] = useState(false);
  const [mealChecked, setMealChecked] = useState(false);
  const [baggage, setBaggage] = useState({ type: "Không", price: 0 });
  const [meal, setMeal] = useState({ type: "Không", price: 0 });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPassenger((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate form
    if (!passenger.Ho || !passenger.Ten_dem_va_ten || !passenger.Email) {
      alert("Vui lòng điền đầy đủ thông tin hành khách.");
      return;
    }

    // Lấy draft và validate
    const draftStr = localStorage.getItem("bookingDraft");
    if (!draftStr) {
      alert("Không tìm thấy thông tin chuyến bay.");
      navigate("/booking");
      return;
    }

    const bookingDraft = JSON.parse(draftStr);

    // Validate type
    if (!bookingDraft.type || !["oneway", "roundtrip"].includes(bookingDraft.type)) {
      alert("Loại chuyến bay không hợp lệ.");
      navigate("/booking");
      return;
    }

    // Validate flight data
    if (bookingDraft.type === "oneway" && !bookingDraft.flight) {
      alert("Thiếu thông tin chuyến bay.");
      navigate("/booking");
      return;
    }

    if (bookingDraft.type === "roundtrip") {
      if (!bookingDraft.outbound) {
        alert("Thiếu thông tin chặng đi.");
        navigate("/booking");
        return;
      }
      if (!bookingDraft.inbound) {
        alert("Thiếu thông tin chặng về.");
        navigate("/booking");
        return;
      }
    }

    bookingDraft.passengers[passengerIndex] = {
      info: passenger,
      services: {
        baggage,
        meal
      },
      seatOneway: bookingDraft.passengers[passengerIndex]?.seatOneway || null,
      seatOutbound: bookingDraft.passengers[passengerIndex]?.seatOutbound || null,
      seatInbound: bookingDraft.passengers[passengerIndex]?.seatInbound || null
    };


    localStorage.setItem("bookingDraft", JSON.stringify(bookingDraft));

    if (passengerIndex + 1 < bookingDraft.passengers.length) {
      navigate(`/passengerinfo?index=${passengerIndex + 1}`);
      return;
    }

    if (bookingDraft.type === "roundtrip") {
      navigate("/seatselection?leg=outbound&index=0");
    } else {
      navigate("/seatselection?leg=oneway&index=0");
    }

  };

  return (
    <>
      <header className="site-header">
        <a href="/" className="logo">
          <img
            src="/assets/Lotus_Logo-removebg-preview.png"
            alt="Lotus Travel"
          />
          <span>Lotus Travel</span>
        </a>
      </header>


      {/* <div className="page-content"> */}
      <h1>Nhập thông tin hành khách</h1>
      <section className="passenger-information">
        <form className="passenger-info-form" onSubmit={handleSubmit}>
          <div className="passenger-info">
            <h2>Thông tin cơ bản</h2>
            <div className="note">
              <p>* là các trường bắt buộc. Vui lòng điền thông tin cá nhân như trong hộ chiếu.</p>

            </div>
          </div>

          <label htmlFor="title">Danh xưng *</label>
          <select
            id="title"
            name="Danh_xung"
            value={passenger.Danh_xung}
            onChange={handleChange}
            required
          >
            <option value="Mr">Ông</option>
            <option value="Mrs">Bà</option>
            <option value="Ms">Cô</option>
            <option value="Child">Trẻ em</option>
          </select>

          <label htmlFor="firstname">Tên đệm và tên*</label>
          <input
            type="text"
            id="firstname"
            name="Ten_dem_va_ten"
            value={passenger.Ten_dem_va_ten}
            onChange={handleChange}
            style={{ textTransform: "uppercase" }}
            required
          />

          <label htmlFor="lastname">Họ *</label>
          <input
            type="text"
            id="lastname"
            name="Ho"
            value={passenger.Ho}
            onChange={handleChange}
            style={{ textTransform: "uppercase" }}
            required
          />

          <label htmlFor="dob">Ngày sinh *</label>
          <input
            type="date"
            id="dob"
            name="Ngay_sinh"
            value={passenger.Ngay_sinh}
            onChange={handleChange}
            required
          />

          <label htmlFor="email">Email *</label>
          <input
            type="email"
            id="email"
            name="Email"
            value={passenger.Email}
            onChange={handleChange}
            required
          />

          <label htmlFor="countrycode">Mã quốc gia *</label>
          <input
            type="text"
            id="countrycode"
            name="Ma_quoc_gia"
            value={passenger.Ma_quoc_gia}
            onChange={handleChange}
            pattern="^\+\d{1,4}$"
            required
          />

          <label htmlFor="phonenumber">Số điện thoại *</label>
          <input
            type="tel"
            id="phonenumber"
            name="So_dien_thoai"
            value={passenger.So_dien_thoai}
            onChange={handleChange}
            pattern="^[0-9+]{8,15}$"
            required
          />


          <div className="passenger-info" style={{ marginTop: "1rem" }}>
            <h2>Các dịch vụ bổ sung</h2>
          </div>

          <div className="service-items">
            <div className="baggage-label">
              <span>Thêm hành lý ký gửi</span>
              <input
                type="checkbox"
                checked={baggageChecked}
                onChange={(e) => setBaggageChecked(e.target.checked)}
              />
            </div>
            {baggageChecked && (
              <div className="service-details">
                <select
                  name="baggage-weight"
                  onChange={(e) =>
                    setBaggage({
                      type: e.target.value || "Không",
                      price: Number(e.target.selectedOptions[0].dataset.price || 0),
                    })
                  }
                >
                  <option value="">-- Chọn gói hành lý --</option>
                  <option value="20kg" data-price="260000">
                    20kg - 260.000 VND
                  </option>
                  <option value="30kg" data-price="390000">
                    30kg - 390.000 VND
                  </option>
                  <option value="40kg" data-price="520000">
                    40kg - 520.000 VND
                  </option>
                </select>
              </div>
            )}
          </div>

          <div className="service-item">
            <div className="meal-label">
              <span>Thêm suất ăn trên máy bay</span>
              <input
                type="checkbox"
                checked={mealChecked}
                onChange={(e) => setMealChecked(e.target.checked)}
              />
            </div>
            {mealChecked && (
              <div className="service-details">
                <select
                  name="meal-type"
                  onChange={(e) =>
                    setMeal({
                      type: e.target.value || "Không",
                      price: Number(e.target.selectedOptions[0].dataset.price || 0),
                    })
                  }
                >
                  <option value="">-- Chọn suất ăn --</option>
                  <option value="Tiêu chuẩn" data-price="120000">
                    Suất ăn tiêu chuẩn - 120.000 VND
                  </option>
                  <option value="Chay" data-price="130000">
                    Suất ăn chay - 130.000 VND
                  </option>
                  <option value="Thường" data-price="100000">
                    Suất ăn cho trẻ sơ sinh và trẻ em - 100.000 VND
                  </option>
                  <option value="Đặc biệt" data-price="150000">
                    Suất ăn đặc biệt - 150.000 VND
                  </option>
                </select>
              </div>
            )}
          </div>

          <button type="submit" id="nextButton">
            Tiếp tục
          </button>
        </form>
      </section>
      {/* </div> */}
    </>
  );
};

export default PassengerInfoPage;
