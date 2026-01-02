import React, { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { ArrowLeftRight, Search, Plus, Plane, X, Pencil } from "lucide-react";
import "../styles/main.css";
import "../styles/flight.css";

const API_BASE_URL = "http://localhost:8000";

// Aircraft models data
const aircraftModels = [
  { id: 1, model: "Airbus A320", airline: "Vietjet Air" },
  { id: 2, model: "Airbus A321", airline: "Vietjet Air" },
  { id: 3, model: "Airbus A321", airline: "Vietnam Airlines" },
  { id: 4, model: "Airbus A350", airline: "Vietnam Airlines" },
  { id: 5, model: "Boeing 787", airline: "Vietnam Airlines" },
  { id: 6, model: "Airbus A320", airline: "Bamboo Airways" },
  { id: 7, model: "Airbus A321", airline: "Bamboo Airways" },
  { id: 8, model: "Airbus A321", airline: "Vietravel Airlines" },
  { id: 9, model: "Airbus A320", airline: "Pacific Airlines" },
];

const initialFlightData = [
  {
    id: 1,
    airline: "Vietnam Airlines",
    airlineLogo: "/assets/logo-vietnam-airlines.png",
    flightNumber: "VN-001",
    aircraftModel: "Airbus A321",
    departure: { time: "6:00 AM", location: "Hà Nội", airport: "HAN" },
    arrival: { time: "7:00 PM", location: "Hồ Chí Minh", airport: "SGN" },
    duration: "2 hours",
    isDirect: true,
    priceEconomy: 1500000,
    priceBusiness: 3500000,
    priceFirst: 7000000,
  },
  {
    id: 2,
    airline: "Bamboo Airways",
    airlineLogo: "/assets/Bamboo-Airways.png",
    flightNumber: "QH-002",
    aircraftModel: "Airbus A320",
    departure: { time: "8:00 AM", location: "Hà Nội", airport: "HAN" },
    arrival: { time: "10:00 PM", location: "Hồ Chí Minh", airport: "SGN" },
    duration: "3h 30m",
    isDirect: true,
    priceEconomy: 1200000,
    priceBusiness: 3000000,
    priceFirst: 0,
  },
  {
    id: 3,
    airline: "Vietjet Air",
    airlineLogo: "/assets/vietjet-text-logo.png",
    flightNumber: "VJ-003",
    aircraftModel: "Airbus A320",
    departure: { time: "10:00 AM", location: "Hà Nội", airport: "HAN" },
    arrival: { time: "12:45 PM", location: "Hồ Chí Minh", airport: "SGN" },
    duration: "2h 45m",
    isDirect: true,
    priceEconomy: 900000,
    priceBusiness: 2500000,
    priceFirst: 0,
  },
  {
    id: 4,
    airline: "Vietravel Airlines",
    airlineLogo: "/assets/Vietravel_Airlines_Logo.png",
    flightNumber: "VU-004",
    aircraftModel: "Airbus A321",
    departure: { time: "10:30 AM", location: "Hà Nội", airport: "HAN" },
    arrival: { time: "1:00 PM", location: "Hồ Chí Minh", airport: "SGN" },
    duration: "2h 30m",
    isDirect: true,
    priceEconomy: 1100000,
    priceBusiness: 2800000,
    priceFirst: 0,
  },
  {
    id: 5,
    airline: "Pacific Airlines",
    airlineLogo: "/assets/pacific-airlines-logo.png",
    flightNumber: "BL-005",
    aircraftModel: "Airbus A320",
    departure: { time: "11:00 AM", location: "Hà Nội", airport: "HAN" },
    arrival: { time: "2:00 PM", location: "Hồ Chí Minh", airport: "SGN" },
    duration: "3 hours",
    isDirect: true,
    priceEconomy: 850000,
    priceBusiness: 0,
    priceFirst: 0,
  },
];

const getAirlineLogo = (airlineName) => {
  const logoMap = {
    "Vietnam Airlines": "/assets/logo-vietnam-airlines.png",
    "Bamboo Airways": "/assets/Bamboo-Airways.png",
    "Vietjet Air": "/assets/vietjet-text-logo.png",
    "Vietravel Airlines": "/assets/Vietravel_Airlines_Logo.png",
    "Pacific Airlines": "/assets/pacific-airlines-logo.png",
  };
  return logoMap[airlineName] || "";
};

const Flight = () => {
  const [flightData, setFlightData] = useState(initialFlightData);
  const [currentFlights, setCurrentFlights] = useState([]);
  const [from, setFrom] = useState("Hà Nội (HAN)");
  const [to, setTo] = useState("Hồ Chí Minh (SGN)");
  const [date, setDate] = useState("");
  const [seatClass, setSeatClass] = useState("economy");
  const [sortPrice, setSortPrice] = useState("rẻ nhất");
  const [sortTime, setSortTime] = useState("sớm nhất");
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState(null);

  const [formData, setFormData] = useState({
    airline: "",
    aircraftModel: "",
    flightNumber: "",
    departureTime: "",
    departureLocation: "",
    departureAirport: "",
    arrivalTime: "",
    arrivalLocation: "",
    arrivalAirport: "",
    duration: "",
    priceEconomy: "",
    priceBusiness: "",
    priceFirst: "",
    isDirect: true,
  });

  // Set default date
  useEffect(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    setDate(`${year}-${month}-${day}`);
  }, []);

  // Initial search
  useEffect(() => {
    performSearch();
  }, [flightData]);

  const extractSearchTerms = (input) => {
    if (!input) return { location: "", airport: "" };
    const lowerInput = input.toLowerCase();
    const airportMatch = lowerInput.match(/\(([a-z]{3,4})\)/);
    const airport = airportMatch ? airportMatch[1] : "";
    const location = lowerInput.split("(")[0].trim();
    return { location, airport, full: lowerInput };
  };

  const searchFlightsLocal = () => {
    const fromTerms = extractSearchTerms(from);
    const toTerms = extractSearchTerms(to);

    let filteredFlights = flightData.filter((flight) => {
      let matchesFrom = true;
      if (from) {
        const depLocation = flight.departure.location.toLowerCase();
        const depAirport = flight.departure.airport.toLowerCase();
        matchesFrom =
          depLocation.includes(fromTerms.location) ||
          depAirport === fromTerms.airport ||
          depLocation.includes(fromTerms.full) ||
          depAirport.includes(fromTerms.full) ||
          fromTerms.full.includes(depLocation) ||
          fromTerms.full.includes(depAirport);
      }

      let matchesTo = true;
      if (to) {
        const arrLocation = flight.arrival.location.toLowerCase();
        const arrAirport = flight.arrival.airport.toLowerCase();
        matchesTo =
          arrLocation.includes(toTerms.location) ||
          arrAirport === toTerms.airport ||
          arrLocation.includes(toTerms.full) ||
          arrAirport.includes(toTerms.full) ||
          toTerms.full.includes(arrLocation) ||
          toTerms.full.includes(arrAirport);
      }

      return matchesFrom && matchesTo;
    });

    return filteredFlights;
  };

  const convertTimeToMinutes = (timeStr) => {
    const [time, period] = timeStr.split(" ");
    const [hours, minutes] = time.split(":").map(Number);
    let totalMinutes = hours * 60 + minutes;
    if (period === "PM" && hours !== 12) {
      totalMinutes += 12 * 60;
    }
    if (period === "AM" && hours === 12) {
      totalMinutes -= 12 * 60;
    }
    return totalMinutes;
  };

  const getDisplayPrice = (flight) => {
    if (seatClass === "economy") return flight.priceEconomy;
    if (seatClass === "business")
      return flight.priceBusiness || flight.priceEconomy * 2.5;
    if (seatClass === "first")
      return flight.priceFirst || flight.priceEconomy * 5;
    return flight.priceEconomy;
  };

  const applySorting = (flights) => {
    let sorted = [...flights];

    // Sort by price
    if (sortPrice === "rẻ nhất") {
      sorted.sort((a, b) => getDisplayPrice(a) - getDisplayPrice(b));
    } else {
      sorted.sort((a, b) => getDisplayPrice(b) - getDisplayPrice(a));
    }

    // Sort by time
    if (sortTime === "sớm nhất") {
      sorted.sort((a, b) => {
        const timeA = convertTimeToMinutes(a.departure.time);
        const timeB = convertTimeToMinutes(b.departure.time);
        return timeA - timeB;
      });
    } else {
      sorted.sort((a, b) => {
        const timeA = convertTimeToMinutes(a.departure.time);
        const timeB = convertTimeToMinutes(b.departure.time);
        return timeB - timeA;
      });
    }

    return sorted;
  };

  const performSearch = () => {
    const flights = searchFlightsLocal();
    const sortedFlights = applySorting(flights);
    setCurrentFlights(sortedFlights);
  };

  const handleSwapLocations = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
  };

  const handleSortChange = (type, value) => {
    if (type === "price") {
      setSortPrice(value);
    } else {
      setSortTime(value);
    }
  };

  useEffect(() => {
    const sortedFlights = applySorting(currentFlights);
    setCurrentFlights(sortedFlights);
  }, [sortPrice, sortTime, seatClass]);

  const formatTime = (time24) => {
    const [hours, minutes] = time24.split(":");
    const hour = parseInt(hours);
    const period = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${period}`;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const getAircraftModelsForAirline = (airlineName) => {
    return aircraftModels.filter((a) => a.airline === airlineName);
  };

  const resetForm = () => {
    setFormData({
      airline: "",
      aircraftModel: "",
      flightNumber: "",
      departureTime: "",
      departureLocation: "",
      departureAirport: "",
      arrivalTime: "",
      arrivalLocation: "",
      arrivalAirport: "",
      duration: "",
      priceEconomy: "",
      priceBusiness: "",
      priceFirst: "",
      isDirect: true,
    });
  };

  const handleAddFlight = (e) => {
    e.preventDefault();

    const newFlight = {
      id:
        flightData.length > 0
          ? Math.max(...flightData.map((f) => f.id)) + 1
          : 1,
      airline: formData.airline,
      airlineLogo: getAirlineLogo(formData.airline),
      flightNumber: formData.flightNumber,
      aircraftModel: formData.aircraftModel,
      departure: {
        time: formatTime(formData.departureTime),
        location: formData.departureLocation,
        airport: formData.departureAirport.toUpperCase(),
      },
      arrival: {
        time: formatTime(formData.arrivalTime),
        location: formData.arrivalLocation,
        airport: formData.arrivalAirport.toUpperCase(),
      },
      duration: formData.duration,
      isDirect: formData.isDirect,
      priceEconomy: parseInt(formData.priceEconomy) || 0,
      priceBusiness: parseInt(formData.priceBusiness) || 0,
      priceFirst: parseInt(formData.priceFirst) || 0,
    };

    setFlightData([...flightData, newFlight]);
    setShowModal(false);
    resetForm();
    alert(`Chuyến bay ${newFlight.flightNumber} đã được thêm thành công!`);
  };

  const viewFlightDetail = (flightId) => {
    const flight = flightData.find((f) => f.id === flightId);
    if (flight) {
      setSelectedFlight(flight);
      setShowDetailModal(true);
    }
  };

  const handleEditFlight = (flight) => {
    // Convert time from "6:00 AM" to "06:00"
    const convertTo24h = (timeStr) => {
      const [time, period] = timeStr.split(" ");
      let [hours, minutes] = time.split(":");
      hours = parseInt(hours);
      if (period === "PM" && hours !== 12) hours += 12;
      if (period === "AM" && hours === 12) hours = 0;
      return `${String(hours).padStart(2, "0")}:${minutes}`;
    };

    setFormData({
      airline: flight.airline,
      aircraftModel: flight.aircraftModel || "",
      flightNumber: flight.flightNumber,
      departureTime: convertTo24h(flight.departure.time),
      departureLocation: flight.departure.location,
      departureAirport: flight.departure.airport,
      arrivalTime: convertTo24h(flight.arrival.time),
      arrivalLocation: flight.arrival.location,
      arrivalAirport: flight.arrival.airport,
      duration: flight.duration,
      priceEconomy: flight.priceEconomy?.toString() || "",
      priceBusiness: flight.priceBusiness?.toString() || "",
      priceFirst: flight.priceFirst?.toString() || "",
      isDirect: flight.isDirect,
    });
    setSelectedFlight(flight);
    setShowEditModal(true);
  };

  const handleUpdateFlight = (e) => {
    e.preventDefault();

    const updatedFlight = {
      ...selectedFlight,
      airline: formData.airline,
      airlineLogo: getAirlineLogo(formData.airline),
      flightNumber: formData.flightNumber,
      aircraftModel: formData.aircraftModel,
      departure: {
        time: formatTime(formData.departureTime),
        location: formData.departureLocation,
        airport: formData.departureAirport.toUpperCase(),
      },
      arrival: {
        time: formatTime(formData.arrivalTime),
        location: formData.arrivalLocation,
        airport: formData.arrivalAirport.toUpperCase(),
      },
      duration: formData.duration,
      isDirect: formData.isDirect,
      priceEconomy: parseInt(formData.priceEconomy) || 0,
      priceBusiness: parseInt(formData.priceBusiness) || 0,
      priceFirst: parseInt(formData.priceFirst) || 0,
    };

    setFlightData(
      flightData.map((f) => (f.id === selectedFlight.id ? updatedFlight : f))
    );
    setShowEditModal(false);
    resetForm();
    setSelectedFlight(null);
    alert(`Chuyến bay ${updatedFlight.flightNumber} đã được cập nhật!`);
  };

  const renderFlightForm = (onSubmit, submitText) => (
    <form className="add-flight-form" onSubmit={onSubmit}>
      <div className="form-section">
        <h3>Thông tin hãng hàng không</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Tên hãng hàng không *</label>
            <select
              value={formData.airline}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  airline: e.target.value,
                  aircraftModel: "",
                });
              }}
              required
            >
              <option value="">Chọn hãng hàng không</option>
              <option value="Vietnam Airlines">Vietnam Airlines</option>
              <option value="Bamboo Airways">Bamboo Airways</option>
              <option value="Vietjet Air">Vietjet Air</option>
              <option value="Vietravel Airlines">Vietravel Airlines</option>
              <option value="Pacific Airlines">Pacific Airlines</option>
            </select>
          </div>
          <div className="form-group">
            <label>Tên loại máy bay *</label>
            <select
              value={formData.aircraftModel}
              onChange={(e) =>
                setFormData({ ...formData, aircraftModel: e.target.value })
              }
              required
              disabled={!formData.airline}
            >
              <option value="">Chọn loại máy bay</option>
              {formData.airline &&
                getAircraftModelsForAirline(formData.airline).map(
                  (aircraft) => (
                    <option key={aircraft.id} value={aircraft.model}>
                      {aircraft.model}
                    </option>
                  )
                )}
            </select>
          </div>
        </div>
        <div className="form-group">
          <label>Số hiệu chuyến bay *</label>
          <input
            type="text"
            value={formData.flightNumber}
            onChange={(e) =>
              setFormData({ ...formData, flightNumber: e.target.value })
            }
            placeholder="VN-001"
            required
          />
        </div>
      </div>

      <div className="form-section">
        <h3>Thời gian khởi hành</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Thời gian khởi hành *</label>
            <input
              type="time"
              value={formData.departureTime}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  departureTime: e.target.value,
                })
              }
              required
            />
          </div>
          <div className="form-group">
            <label>Điểm khởi hành *</label>
            <input
              type="text"
              value={formData.departureLocation}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  departureLocation: e.target.value,
                })
              }
              placeholder="Hà Nội"
              required
            />
          </div>
          <div className="form-group">
            <label>Mã sân bay khởi hành *</label>
            <input
              type="text"
              value={formData.departureAirport}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  departureAirport: e.target.value,
                })
              }
              placeholder="HAN"
              maxLength="4"
              required
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>Thời gian đến</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Thời gian đến *</label>
            <input
              type="time"
              value={formData.arrivalTime}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  arrivalTime: e.target.value,
                })
              }
              required
            />
          </div>
          <div className="form-group">
            <label>Điểm đến *</label>
            <input
              type="text"
              value={formData.arrivalLocation}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  arrivalLocation: e.target.value,
                })
              }
              placeholder="Hồ Chí Minh"
              required
            />
          </div>
          <div className="form-group">
            <label>Mã sân bay đến *</label>
            <input
              type="text"
              value={formData.arrivalAirport}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  arrivalAirport: e.target.value,
                })
              }
              placeholder="SGN"
              maxLength="4"
              required
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>Chi tiết chuyến bay</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Thời gian bay *</label>
            <input
              type="text"
              value={formData.duration}
              onChange={(e) =>
                setFormData({ ...formData, duration: e.target.value })
              }
              placeholder="2h 30m"
              required
            />
          </div>
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.isDirect}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    isDirect: e.target.checked,
                  })
                }
              />
              <span>Chuyến bay trực tiếp</span>
            </label>
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>Giá vé theo hạng ghế (VND)</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Giá hạng Phổ thông *</label>
            <input
              type="number"
              value={formData.priceEconomy}
              onChange={(e) =>
                setFormData({ ...formData, priceEconomy: e.target.value })
              }
              placeholder="1500000"
              min="0"
              required
            />
          </div>
          <div className="form-group">
            <label>Giá hạng Thương gia</label>
            <input
              type="number"
              value={formData.priceBusiness}
              onChange={(e) =>
                setFormData({ ...formData, priceBusiness: e.target.value })
              }
              placeholder="3500000"
              min="0"
            />
          </div>
          <div className="form-group">
            <label>Giá hạng Nhất</label>
            <input
              type="number"
              value={formData.priceFirst}
              onChange={(e) =>
                setFormData({ ...formData, priceFirst: e.target.value })
              }
              placeholder="7000000"
              min="0"
            />
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button
          type="button"
          className="btn-cancel"
          onClick={() => {
            setShowModal(false);
            setShowEditModal(false);
            resetForm();
          }}
        >
          Hủy
        </button>
        <button type="submit" className="btn-submit">
          {submitText}
        </button>
      </div>
    </form>
  );

  return (
    <DashboardLayout title="Flight Tracking">
      <div className="flight-content">
        {/* Search Section */}
        <div className="search-section">
          <div className="search-form">
            <div className="search-field">
              <label>Điểm đi</label>
              <input
                type="text"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                placeholder="Hà Nội (HAN)"
              />
            </div>
            <button
              className="swap-btn"
              onClick={handleSwapLocations}
              title="Swap origin and destination"
            >
              <ArrowLeftRight size={20} />
            </button>
            <div className="search-field">
              <label>Điểm đến</label>
              <input
                type="text"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="Hồ Chí Minh (SGN)"
              />
            </div>
            <div className="search-field">
              <label>Ngày khởi hành</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="search-field">
              <label>Hạng ghế</label>
              <select
                value={seatClass}
                onChange={(e) => setSeatClass(e.target.value)}
              >
                <option value="economy">Phổ thông</option>
                <option value="business">Thương gia</option>
                <option value="first">Hạng nhất</option>
              </select>
            </div>
            <button className="search-btn" onClick={performSearch}>
              <Search size={20} />
            </button>
          </div>
        </div>

        {/* Flight List Section */}
        <div className="flight-list-section">
          <div className="flight-list-header">
            <h2>
              Danh sách chuyến bay (<span>{currentFlights.length}</span> kết
              quả)
            </h2>
            <div className="sort-controls">
              <select
                className="sort-select"
                value={sortPrice}
                onChange={(e) => handleSortChange("price", e.target.value)}
              >
                <option value="rẻ nhất">Sắp xếp theo: Rẻ nhất</option>
                <option value="đắt nhất">Đắt nhất</option>
              </select>
              <select
                className="sort-select"
                value={sortTime}
                onChange={(e) => handleSortChange("time", e.target.value)}
              >
                <option value="sớm nhất">Sớm nhất</option>
                <option value="muộn nhất">Muộn nhất</option>
              </select>
              <button
                className="add-flight-btn"
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
              >
                <Plus size={16} /> Thêm chuyến bay
              </button>
            </div>
          </div>

          {/* Flight Results */}
          <div className="flight-results">
            {currentFlights.length === 0 ? (
              <div className="no-results">
                <Plane
                  size={48}
                  style={{ opacity: 0.5, marginBottom: "1rem" }}
                />
                <p>Không tìm thấy chuyến bay</p>
                <span>Hãy thử điều chỉnh tiêu chí tìm kiếm</span>
              </div>
            ) : (
              currentFlights.map((flight) => (
                <div key={flight.id} className="flight-card">
                  <div className="flight-card-header">
                    <div className="airline-logo">
                      <img
                        src={flight.airlineLogo}
                        alt={`${flight.airline} logo`}
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextElementSibling.style.display = "flex";
                        }}
                      />
                      <div
                        className="airline-logo-fallback"
                        style={{ display: "none" }}
                      >
                        <Plane size={20} />
                      </div>
                    </div>
                    <div className="airline-info">
                      <h3 className="airline-name">{flight.airline}</h3>
                      <p className="flight-number">{flight.flightNumber}</p>
                      {flight.aircraftModel && (
                        <p className="aircraft-model">{flight.aircraftModel}</p>
                      )}
                    </div>
                    <div className="flight-price">
                      {formatPrice(getDisplayPrice(flight))}
                    </div>
                  </div>
                  <div className="flight-details">
                    <div className="departure-info">
                      <span className="departure-time">
                        {flight.departure.time}
                      </span>
                      <span className="departure-location">
                        {flight.departure.location}
                      </span>
                    </div>
                    <div className="flight-route">
                      <div className="route-airports">
                        <span>{flight.departure.airport}</span>
                        <span>{flight.arrival.airport}</span>
                      </div>
                      <div className="route-line"></div>
                      <div className="route-duration">
                        {flight.isDirect ? "Direct" : "1 Stop"}
                      </div>
                    </div>
                    <div className="arrival-info">
                      <span className="arrival-time">
                        {flight.arrival.time}
                      </span>
                      <span className="arrival-location">
                        {flight.arrival.location}
                      </span>
                    </div>
                  </div>
                  <div className="flight-card-footer">
                    <button
                      className="view-detail-btn"
                      onClick={() => viewFlightDetail(flight.id)}
                    >
                      Xem chi tiết
                    </button>
                    <button
                      className="edit-btn"
                      onClick={() => handleEditFlight(flight)}
                    >
                      <Pencil size={14} /> Chỉnh sửa
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => {
                        if (
                          window.confirm(
                            `Bạn có chắc chắn muốn xóa chuyến bay ${flight.flightNumber}?`
                          )
                        ) {
                          setFlightData(
                            flightData.filter((f) => f.id !== flight.id)
                          );
                        }
                      }}
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add Flight Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Thêm chuyến bay mới</h2>
              <button
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                <X size={24} />
              </button>
            </div>
            {renderFlightForm(handleAddFlight, "Thêm chuyến bay")}
          </div>
        </div>
      )}

      {/* Edit Flight Modal */}
      {showEditModal && selectedFlight && (
        <div className="modal-backdrop" onClick={() => setShowEditModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Chỉnh sửa chuyến bay</h2>
              <button
                className="modal-close"
                onClick={() => {
                  setShowEditModal(false);
                  resetForm();
                }}
              >
                <X size={24} />
              </button>
            </div>
            {renderFlightForm(handleUpdateFlight, "Cập nhật")}
          </div>
        </div>
      )}

      {/* Flight Detail Modal */}
      {showDetailModal && selectedFlight && (
        <div
          className="modal-backdrop"
          onClick={() => setShowDetailModal(false)}
        >
          <div
            className="modal-container detail-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Chi tiết chuyến bay</h2>
              <button
                className="modal-close"
                onClick={() => setShowDetailModal(false)}
              >
                <X size={24} />
              </button>
            </div>
            <div className="flight-detail-content">
              <div className="detail-header">
                <div className="airline-logo-large">
                  <img
                    src={selectedFlight.airlineLogo}
                    alt={selectedFlight.airline}
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                </div>
                <div className="detail-header-info">
                  <h3>{selectedFlight.airline}</h3>
                  <p className="flight-number-large">
                    {selectedFlight.flightNumber}
                  </p>
                  {selectedFlight.aircraftModel && (
                    <p className="aircraft-info">
                      Máy bay: {selectedFlight.aircraftModel}
                    </p>
                  )}
                </div>
              </div>

              <div className="detail-route-section">
                <div className="route-point">
                  <span className="route-time">
                    {selectedFlight.departure.time}
                  </span>
                  <span className="route-location">
                    {selectedFlight.departure.location}
                  </span>
                  <span className="route-airport">
                    ({selectedFlight.departure.airport})
                  </span>
                </div>
                <div className="route-middle">
                  <div className="route-line-detail"></div>
                  <span className="route-duration-detail">
                    {selectedFlight.duration}
                  </span>
                  <span className="route-type">
                    {selectedFlight.isDirect ? "Bay thẳng" : "1 điểm dừng"}
                  </span>
                </div>
                <div className="route-point">
                  <span className="route-time">
                    {selectedFlight.arrival.time}
                  </span>
                  <span className="route-location">
                    {selectedFlight.arrival.location}
                  </span>
                  <span className="route-airport">
                    ({selectedFlight.arrival.airport})
                  </span>
                </div>
              </div>

              <div className="detail-prices-section">
                <h4>Giá vé theo hạng ghế</h4>
                <div className="price-grid">
                  <div className="price-item">
                    <span className="price-label">Phổ thông (Economy)</span>
                    <span className="price-value">
                      {selectedFlight.priceEconomy > 0
                        ? formatPrice(selectedFlight.priceEconomy)
                        : "Không có"}
                    </span>
                  </div>
                  <div className="price-item">
                    <span className="price-label">Thương gia (Business)</span>
                    <span className="price-value">
                      {selectedFlight.priceBusiness > 0
                        ? formatPrice(selectedFlight.priceBusiness)
                        : "Không có"}
                    </span>
                  </div>
                  <div className="price-item">
                    <span className="price-label">Hạng nhất (First)</span>
                    <span className="price-value">
                      {selectedFlight.priceFirst > 0
                        ? formatPrice(selectedFlight.priceFirst)
                        : "Không có"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn-cancel"
                onClick={() => setShowDetailModal(false)}
              >
                Đóng
              </button>
              <button
                className="btn-submit"
                onClick={() => {
                  setShowDetailModal(false);
                  handleEditFlight(selectedFlight);
                }}
              >
                <Pencil size={14} /> Chỉnh sửa
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .aircraft-model {
          font-size: 0.75rem;
          color: var(--text-light);
          margin-top: 2px;
        }
        
        .edit-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 0.5rem 1rem;
          background: var(--primary-color);
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 0.875rem;
          cursor: pointer;
          transition: var(--transition);
        }
        
        .edit-btn:hover {
          background: #5b9ad6;
        }
        
        /* Modal Styles */
        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          animation: fadeIn 0.2s ease;
        }
        
        .modal-container {
          background: var(--white);
          border-radius: var(--border-radius);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
          max-width: 700px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          animation: slideUp 0.3s ease;
        }
        
        .detail-modal {
          max-width: 550px;
        }
        
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid var(--extra-light);
        }
        
        .modal-header h2 {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-dark);
          margin: 0;
        }
        
        .modal-close {
          background: none;
          border: none;
          color: var(--text-light);
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 6px;
          transition: var(--transition);
        }
        
        .modal-close:hover {
          background: var(--extra-light);
          color: var(--text-dark);
        }
        
        .modal-footer {
          padding: 1rem 1.5rem;
          border-top: 1px solid var(--extra-light);
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
        }
        
        .btn-cancel {
          padding: 0.75rem 1.5rem;
          border: 1px solid var(--extra-light);
          background: var(--white);
          color: var(--text-dark);
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: var(--transition);
        }
        
        .btn-cancel:hover {
          background: var(--extra-light);
        }
        
        .btn-submit {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 0.75rem 1.5rem;
          border: none;
          background: var(--primary-color);
          color: var(--white);
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: var(--transition);
        }
        
        .btn-submit:hover {
          background: #5b9ad6;
        }
        
        /* Flight Detail Content */
        .flight-detail-content {
          padding: 1.5rem;
        }
        
        .detail-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid var(--extra-light);
        }
        
        .airline-logo-large {
          width: 80px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--extra-light);
          border-radius: 12px;
          overflow: hidden;
        }
        
        .airline-logo-large img {
          max-width: 70px;
          max-height: 70px;
          object-fit: contain;
        }
        
        .detail-header-info h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-dark);
          margin: 0 0 4px 0;
        }
        
        .flight-number-large {
          font-size: 1rem;
          color: var(--primary-color);
          font-weight: 500;
          margin: 0;
        }
        
        .aircraft-info {
          font-size: 0.875rem;
          color: var(--text-light);
          margin: 4px 0 0 0;
        }
        
        .detail-route-section {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem;
          background: var(--extra-light);
          border-radius: 12px;
          margin-bottom: 1.5rem;
        }
        
        .route-point {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
        
        .route-time {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--text-dark);
        }
        
        .route-location {
          font-size: 0.95rem;
          color: var(--text-dark);
          margin-top: 4px;
        }
        
        .route-airport {
          font-size: 0.875rem;
          color: var(--text-light);
        }
        
        .route-middle {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 0 1rem;
        }
        
        .route-line-detail {
          width: 100%;
          height: 2px;
          background: var(--primary-color);
          position: relative;
        }
        
        .route-line-detail::before,
        .route-line-detail::after {
          content: '';
          position: absolute;
          width: 8px;
          height: 8px;
          background: var(--primary-color);
          border-radius: 50%;
          top: 50%;
          transform: translateY(-50%);
        }
        
        .route-line-detail::before {
          left: 0;
        }
        
        .route-line-detail::after {
          right: 0;
        }
        
        .route-duration-detail {
          font-size: 0.875rem;
          color: var(--text-dark);
          font-weight: 500;
          margin-top: 8px;
        }
        
        .route-type {
          font-size: 0.75rem;
          color: var(--text-light);
        }
        
        .detail-prices-section {
          background: var(--white);
          border: 1px solid var(--extra-light);
          border-radius: 12px;
          padding: 1.25rem;
        }
        
        .detail-prices-section h4 {
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--text-dark);
          margin: 0 0 1rem 0;
        }
        
        .price-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
        }
        
        .price-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 0.75rem;
          background: var(--extra-light);
          border-radius: 8px;
        }
        
        .price-label {
          font-size: 0.75rem;
          color: var(--text-light);
          margin-bottom: 4px;
        }
        
        .price-value {
          font-size: 0.95rem;
          font-weight: 600;
          color: #10b981;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        @media (max-width: 500px) {
          .price-grid {
            grid-template-columns: 1fr;
          }
          
          .detail-route-section {
            flex-direction: column;
            gap: 1rem;
          }
          
          .route-middle {
            width: 100%;
          }
        }
      `}</style>
    </DashboardLayout>
  );
};

export default Flight;
