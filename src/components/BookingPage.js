import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../style/booking.css";

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

const BookingPage = () => {
  const navigate = useNavigate();
  const [tripType, setTripType] = useState("oneway");
  const [phase, setPhase] = useState("outbound");
  const [flights, setFlights] = useState([]);
  const [allFlights, setAllFlights] = useState({
    main_flights: [],
    return_flights: [],
  });
  const [selectedOutbound, setSelectedOutbound] = useState(null);
  const [loading, setLoading] = useState(false);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [cabinClass, setCabinClass] = useState("economy");

  const transformFlightData = (flight) => {
    const formatTime = (dt) =>
      !dt ? "N/A" : dt.includes("T") ? dt.split("T")[1].substring(0, 5) : dt;
    return {
      flight_id: flight.id,
      flight_number: flight.flight_number,
      f_time_from: formatTime(flight.dep_datetime),
      f_time_to: formatTime(flight.arr_datetime),
      airport_from:
        airportIdToIata[flight.dep_airport_id] || flight.dep_airport,
      airport_to: airportIdToIata[flight.arr_airport_id] || flight.arr_airport,
      cabin_class: flight.cabin_class || "economy",
      price: flight.price || 0,
      available_seats: flight.available_seats || 0,
      ...flight,
    };
  };

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      alert("Vui lòng đăng nhập để đặt vé");
      navigate("/login", { replace: true });
      return;
    }
    const params = new URLSearchParams(window.location.search);
    const f = params.get("from"),
      t = params.get("to"),
      d = params.get("date"),
      r = params.get("redate");
    const type = params.get("type") || "oneway";
    const passengers = Number(params.get("passengers")) || 1;
    const cabin = params.get("class") || "economy";

    if (!f || !t || !d) return;
    setFrom(f);
    setTo(t);
    setDate(d);
    setReturnDate(r || "");
    setTripType(type);
    setPhase("outbound");
    setCabinClass(cabin);

    // Lưu draft ban đầu
    const draft = {
      tripType: type,
      passengerCount: passengers,
      cabinClass: cabin,
      passengers: Array.from({ length: passengers }, () => ({
        info: null,
        services: {},
        seatMap: {},
      })),
    };
    localStorage.setItem("bookingDraft", JSON.stringify(draft));

    fetchFlights(airportMap[f], airportMap[t], d, r, cabin);
  }, []);

  const fetchFlights = async (fromId, toId, depDate, retDate = null, cabin) => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/flight/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from_airport: fromId,
          to_airport: toId,
          dep_date: depDate,
          ret_date: retDate || undefined,
          trip_type: retDate ? "round-trip" : "one-way",
          cabin_class: cabin,
          adult: 1,
          child: 0,
          infant: 0,
        }),
      });

      if (!res.ok) throw new Error("Không load được chuyến bay");

      const data = await res.json();
      setAllFlights({
        main_flights: (data.main_flights || []).map(transformFlightData),
        return_flights: (data.return_flights || []).map(transformFlightData),
      });
      setFlights((data.main_flights || []).map(transformFlightData));
    } catch (err) {
      console.error(err);
      alert(err.message);
      setFlights([]);
    } finally {
      setLoading(false);
    }
  };

  const getAuthToken = () => {
    const auth = JSON.parse(localStorage.getItem("auth") || "{}");
    return auth?.access_token || "";
  };

  const handleSelectFlight = async (flight) => {
    const token = getAuthToken();
    if (!token) {
      alert("Vui lòng đăng nhập");
      navigate("/login");
      return;
    }

    // Roundtrip: chọn outbound trước
    if (tripType === "roundtrip" && phase === "outbound") {
      const draft = JSON.parse(localStorage.getItem("bookingDraft"));
      draft.outboundFlight = flight;
      localStorage.setItem("bookingDraft", JSON.stringify(draft));
      setSelectedOutbound(flight);
      setFlights(allFlights.return_flights || []);
      setPhase("inbound");
      return;
    }

    // One-way hoặc inbound (roundtrip)
    try {
      setLoading(true);

      const draft = JSON.parse(localStorage.getItem("bookingDraft"));
      const mainFlightId =
        tripType === "roundtrip"
          ? draft.outboundFlight.flight_id
          : flight.flight_id;
      const returnFlightId = tripType === "roundtrip" ? flight.flight_id : null;

      // 1. Tạo reservation
      const res = await fetch("http://localhost:8000/booking/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          main_flight_id: mainFlightId,
          return_flight_id: returnFlightId,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Không thể tạo reservation");
      }

      const data = await res.json();

      // 2. Cập nhật draft với reservation info
      draft.reservation_id = data.reservation_id;
      draft.reservation_code = data.reservation_code;
      draft.created_at = data.created_at;
      draft.status = data.status;
      draft.mainFlightId = mainFlightId;
      draft.returnFlightId = returnFlightId;

      if (tripType === "roundtrip") {
        draft.inboundFlight = flight;
      } else {
        draft.mainFlight = flight;
      }

      localStorage.setItem("bookingDraft", JSON.stringify(draft));

      // 3. Đi đến passenger info
      navigate("/passengerinfo");
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const displayTime = (t) =>
    !t
      ? "N/A"
      : t.includes(":")
      ? t
      : t.includes("T")
      ? t.split("T")[1].substring(0, 5)
      : t;

  return (
    <div className="bookingPage-wrapper">
      <header className="site-header">
        <a href="/" className="logo">
          <img
            src="/assets/Lotus_Logo-removebg-preview.png"
            alt="Lotus Travel"
          />
          <span>Lotus Travel</span>
        </a>
      </header>

      <section className="select_flight">
        <h1>
          {tripType === "roundtrip"
            ? phase === "inbound"
              ? "Chọn chuyến bay về"
              : "Chọn chuyến bay đi"
            : "Chọn chuyến bay"}
        </h1>

        {tripType === "roundtrip" &&
          selectedOutbound &&
          phase === "inbound" && (
            <div className="selected-flight-info">
              <h4>Chuyến bay đi đã chọn:</h4>
              <p>
                <strong>{selectedOutbound.flight_number}</strong> -{" "}
                {selectedOutbound.airport_from} → {selectedOutbound.airport_to}
                {" | "} {displayTime(selectedOutbound.f_time_from)} -{" "}
                {displayTime(selectedOutbound.f_time_to)}
                {" | "} Hạng: {selectedOutbound.cabin_class}
              </p>
            </div>
          )}

        <div id="flight-list">
          {loading ? (
            <div className="loading">Đang tải chuyến bay...</div>
          ) : flights.length === 0 ? (
            <div className="no-flights">Không tìm thấy chuyến bay.</div>
          ) : (
            flights.map((f, idx) => (
              <div key={idx} className="flight-card">
                <div className="flight-info">
                  <div className="time">
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                      }}
                    >
                      <span className="depart">
                        {displayTime(f.f_time_from)}
                      </span>
                    </div>
                    <span>→</span>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                      }}
                    >
                      <span className="arrive">{displayTime(f.f_time_to)}</span>
                    </div>
                  </div>
                  <div className="route">
                    <span className="direct">Bay thẳng</span>
                  </div>
                  <div className="details">
                    <p>
                      Mã chuyến bay: <strong>{f.flight_number}</strong>
                    </p>
                    <p>
                      Hạng vé:{" "}
                      {f.cabin_class === "economy"
                        ? "Phổ thông"
                        : f.cabin_class === "business"
                        ? "Thương gia"
                        : "Hạng nhất"}
                    </p>
                    <p>
                      Còn <strong>{f.available_seats}</strong> chỗ
                    </p>
                  </div>
                </div>
                <div className="flight-price">
                  <div className="price-block">
                    <div className="price-amount">
                      {Number(f.price).toLocaleString()} VND
                    </div>
                    <div className="price-per-person"></div>
                  </div>
                  <button
                    className="confirm-btn"
                    onClick={() => handleSelectFlight(f)}
                    disabled={f.available_seats === 0}
                  >
                    {f.available_seats === 0 ? "Hết chỗ" : "Chọn"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default BookingPage;
