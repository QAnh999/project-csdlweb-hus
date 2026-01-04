import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Papa from "papaparse";
import "../style/booking.css";
import { getBookingDraftPartial, updateBookingDraft } from '../utils/bookingUtils';

const BookingPage = () => {
  const navigate = useNavigate();

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [tripType, setTripType] = useState("oneway");
  const [flights, setFlights] = useState([]);
  const [selectedOutbound, setSelectedOutbound] = useState(null);
  const [phase, setPhase] = useState("outbound");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const f = params.get("from");
    const t = params.get("to");
    const d = params.get("date");
    const r = params.get("returnDate");
    const type = params.get("tripType") || "oneway";

    if (f && t && d) {
      setFrom(f);
      setTo(t);
      setDate(d);
      setReturnDate(r || "");
      setTripType(type);
      setPhase("outbound");
      setSelectedOutbound(null);

      fetchFlights(f, t, d);
    }
  }, []);

  useEffect(() => {
    if (tripType === "roundtrip" && phase === "inbound" && selectedOutbound) {
      if (!returnDate) {
        alert("Vui lòng chọn ngày về");
        setFlights([]);
        return;
      }

      fetchFlights(to, from, returnDate);
    }
  }, [phase, tripType, selectedOutbound, returnDate, to, from]);

  const fetchFlights = (fromAirport, toAirport, flightDate) => {
    setLoading(true);
    fetch("/flights_processed.csv")
      .then((res) => {
        if (!res.ok) throw new Error("Không load được CSV");
        return res.text();
      })
      .then((csv) => {
        const data = Papa.parse(csv.trim(), { header: true }).data;
        const filtered = data.filter((f) => {
          if (!f.f_time_from) return false;
          const fDate = f.f_time_from.split(" ")[0];
          return (
            f.airport_from.includes(fromAirport) &&
            f.airport_to.includes(toAirport) &&
            fDate === flightDate
          );
        });
        setFlights(filtered);
      })
      .catch((err) => {
        console.error(err);
        setFlights([]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleSelectFlight = (flight) => {
    if (tripType === "oneway") {
      const draft = {
        type: "oneway",
        flight,
        seat: null,
        passenger: null,
        services: null,
        checkedIn: false
      };

      localStorage.setItem("bookingDraft", JSON.stringify(draft));
      navigate("/passengerinfo");
      return;
    }

    if (tripType === "roundtrip" && phase === "outbound") {
      setSelectedOutbound(flight);
      const draft = {
        type: "roundtrip",
        outbound: flight,
        inbound: null,
        seatOutbound: null,
        seatInbound: null,
        passenger: null,
        services: null,
        checkedInOutbound: false,
        checkedInInbound: false
      };

      localStorage.setItem("bookingDraft", JSON.stringify(draft));

      setPhase("inbound");
      setFlights([]);
      return;
    }


    if (tripType === "roundtrip" && phase === "inbound") {
      const existingDraft = JSON.parse(localStorage.getItem("bookingDraft") || "{}");

      const draft = {
        type: "roundtrip",
        outbound: selectedOutbound || existingDraft.outbound,
        inbound: flight,
        seatOutbound: existingDraft.seatOutbound || null,
        seatInbound: null,
        passenger: existingDraft.passenger || null,
        services: existingDraft.services || null,
        checkedInOutbound: existingDraft.checkedInOutbound || false,
        checkedInInbound: false
      };

      localStorage.setItem("bookingDraft", JSON.stringify(draft));
      navigate("/passengerinfo");
      return;
    }
  };

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
          {tripType === "roundtrip" && phase === "inbound"
            ? "Chọn chuyến bay về"
            : "Chọn chuyến bay"}
        </h1>
        {tripType === "roundtrip" && selectedOutbound && phase === "inbound" && (
          <div style={{
            padding: "15px",
            background: "#e8f5e9",
            marginBottom: "20px",
            borderRadius: "8px",
            border: "1px solid #283655",
            fontSize: "14px"
          }}>
            <h4 style={{ margin: "0 0 10px 0", color: "#283655" }}>
              Chuyến bay đi đã chọn:
            </h4>
            <p style={{ margin: 0}}>
              <strong>{selectedOutbound.f_code}</strong> - {selectedOutbound.airport_from} → {selectedOutbound.airport_to}
              {" | "}
              {selectedOutbound.f_time_from} - {selectedOutbound.f_time_to}
            </p>
          </div>
        )}

        <div id="flight-list">
          {loading ? (
            <p>Đang tải chuyến bay...</p>
          ) : flights.length === 0 ? (
            <p>Không tìm thấy chuyến bay.</p>
          ) : (
            flights.map((f, index) => (
              <div key={index} className="flight-card">
                <div className="flight-info">
                  <div className="time">
                    <span className="depart">
                      {f.f_time_from?.split(" ")[1]}
                    </span>
                    <span>→</span>
                    <span className="arrive">
                      {f.f_time_to?.split(" ")[1]}
                    </span>
                  </div>

                  <div className="route">
                    <span className="from">{f.airport_from}</span>
                    <span className="direct">Bay thẳng</span>
                    <span className="to">{f.airport_to}</span>
                  </div>

                  <div className="details">
                    <p>Mã chuyến bay: {f.f_code}</p>
                    <p>Loại vé: {f.type}</p>
                  </div>
                </div>

                <div className="flight-price">
                  <div className="price-block">
                    <div className="price-amount">
                      {Number(f.total_price).toLocaleString()} VND
                    </div>
                  </div>

                  <button
                    className="confirm-btn"
                    onClick={() => handleSelectFlight(f)}
                  >
                    {tripType === "roundtrip" && phase === "outbound"
                      ? "Chọn"
                      : "Chọn"}
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

