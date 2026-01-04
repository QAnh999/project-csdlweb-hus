import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "../style/passengerinfo.css";

const PassengerInfoPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const passengerIndex = Number(searchParams.get("index")) || 0;

  const [loading, setLoading] = useState(false);
  const [reservationId, setReservationId] = useState(null);

  const [passenger, setPassenger] = useState({
    first_name: "",
    last_name: "",
    date_of_birth: "",
    gender: "MALE",
    passenger_type: "adult",
    email: "",
    phone_number: "",

    document_type: "CCCD",
    document_number: ""
  });

  /* =======================
      Helpers
  ======================= */
  const getAuthToken = () =>
    JSON.parse(localStorage.getItem("auth") || "{}")?.access_token || "";

  /* =======================
      Init
  ======================= */
  useEffect(() => {
    const draftStr = localStorage.getItem("bookingDraft");
    if (!draftStr) {
      alert("Không tìm thấy booking draft");
      navigate("/booking");
      return;
    }

    const draft = JSON.parse(draftStr);
    setReservationId(draft.reservation_id);

    // Load passenger cũ (nếu quay lại sửa)
    if (draft.passengers?.[passengerIndex]?.info) {
      setPassenger({
        document_type: "CCCD",
        document_number: "",
        ...draft.passengers[passengerIndex].info,
      });
    }

  }, [navigate, passengerIndex]);

  /* =======================
      Handlers
  ======================= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPassenger((prev) => ({ ...prev, [name]: value }));
  };

  const buildPassengerPayload = () => {
    const base = {
      first_name: passenger.first_name,
      last_name: passenger.last_name,
      date_of_birth: passenger.date_of_birth,
      gender: passenger.gender,
      passenger_type: passenger.passenger_type,
      email: passenger.email,
      phone_number: passenger.phone_number,

      passport_number: null,
      identify_number: null,
    };

    if (passenger.document_type === "CCCD") {
      base.identify_number = passenger.document_number;
    }

    if (passenger.document_type === "PASSPORT") {
      base.passport_number = passenger.document_number;
    }

    return base;
  };


  const savePassengerToBE = async () => {
    const token = getAuthToken();
    const draft = JSON.parse(localStorage.getItem("bookingDraft"));

    try {
      setLoading(true);

      const passengerPayload = buildPassengerPayload();

      const res = await fetch(
        `http://localhost:8000/booking/${reservationId}/passengers`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          
          body: JSON.stringify({
            passengers: [passengerPayload],
            passenger_count: {
              adult: draft.passengerCount,
              child: 0,
              infant: 0,
            },
          }),
        }
      );

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Không thể lưu hành khách");
      }

      const [savedPassenger] = await res.json();
      console.log("🧍 Passenger trả về từ BE:", savedPassenger);
      console.log("🆔 passenger_id từ BE:", savedPassenger?.passenger_id);

      console.log("📦 Draft trước khi update passenger:", draft);

      // Update draft
      const updatedDraft = { ...draft };
      if (!updatedDraft.passengers[passengerIndex]) {
        updatedDraft.passengers[passengerIndex] = {};
      }

      updatedDraft.passengers[passengerIndex] = {
        ...updatedDraft.passengers[passengerIndex],
        info: passenger,
        passenger_id: savedPassenger.passenger_id,
      };

      localStorage.setItem("bookingDraft", JSON.stringify(updatedDraft));
      console.log(
        "✅ Draft sau khi lưu passenger:",
        JSON.parse(localStorage.getItem("bookingDraft"))
      );
      console.log(
        "🆔 passenger_id đã lưu:",
        JSON.parse(localStorage.getItem("bookingDraft"))
          ?.passengers?.[passengerIndex]?.passenger_id
      );

      return true;
    } catch (err) {
      console.error(err);
      alert(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !passenger.first_name ||
      !passenger.last_name ||
      !passenger.email ||
      !passenger.date_of_birth
    ) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc (*)");
      return;
    }

    const success = await savePassengerToBE();
    if (!success) return;

    const draft = JSON.parse(localStorage.getItem("bookingDraft"));

    if (passengerIndex + 1 < draft.passengerCount) {
      navigate(`/passengerinfo?index=${passengerIndex + 1}`);
    } else {
      const leg = draft.tripType === "roundtrip" ? "outbound" : "main";
      navigate(
        `/seatselection?leg=${leg}&index=0&reservation_id=${reservationId}`
      );
    }
  };

  if (loading) return <div className="loading">Đang xử lý...</div>;

  /* =======================
      Render
  ======================= */
  return (
    <div className="passenger-info-page">
      <header className="passenger-header">
        <h1>Thông tin hành khách {passengerIndex + 1}</h1>
        <div className="progress">Bước 2/4: Thông tin hành khách</div>
      </header>

      <form onSubmit={handleSubmit} className="passenger-form">
        <div className="form-section">
          <h3>Thông tin cá nhân</h3>

          <div className="form-row">
            <div className="form-group">
              <label>Giới tính *</label>
              <select
                name="gender"
                value={passenger.gender}
                onChange={handleChange}
                required
              >
                <option value="MALE">Nam</option>
                <option value="FEMALE">Nữ</option>
                <option value="OTHER">Khác</option>
              </select>
            </div>

            <div className="form-group">
              <label>Loại hành khách *</label>
              <select
                name="passenger_type"
                value={passenger.passenger_type}
                onChange={handleChange}
                required
              >
                <option value="adult">Người lớn</option>
                <option value="child">Trẻ em</option>
                <option value="infant">Em bé</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Tên *</label>
              <input
                type="text"
                name="first_name"
                value={passenger.first_name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Họ *</label>
              <input
                type="text"
                name="last_name"
                value={passenger.last_name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Ngày sinh *</label>
              <input
                type="date"
                name="date_of_birth"
                value={passenger.date_of_birth}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                name="email"
                value={passenger.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Số điện thoại *</label>
            <input
              type="tel"
              name="phone_number"
              value={passenger.phone_number}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Giấy tờ tùy thân</h3>

          <div className="form-row">
            <div className="form-group">
              <label>Loại giấy tờ *</label>
              <select
                name="document_type"
                value={passenger.document_type}
                onChange={handleChange}
                required
              >
                <option value="CCCD">CCCD</option>
                <option value="PASSPORT">Hộ chiếu</option>
              </select>
            </div>

            <div className="form-group">
              <label>
                {passenger.document_type === "CCCD"
                  ? "Số CCCD *"
                  : "Số hộ chiếu *"}
              </label>
              <input
                type="text"
                name="document_number"
                value={passenger.document_number}
                onChange={handleChange}
                required
                placeholder={
                  passenger.document_type === "CCCD"
                    ? "VD: 012345678901"
                    : "VD: B12345678"
                }
              />
            </div>
          </div>
        </div>


        <div className="form-actions">
          <button
            type="button"
            className="btn-back"
            onClick={() => navigate(-1)}
          >
            Quay lại
          </button>

          <button type="submit" className="btn-next" disabled={loading}>
            {passengerIndex + 1 <
            JSON.parse(localStorage.getItem("bookingDraft")).passengerCount
              ? "Tiếp tục hành khách tiếp theo"
              : "Tiếp tục chọn ghế"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PassengerInfoPage;
