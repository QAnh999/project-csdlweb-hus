import React, { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { ArrowLeftRight, Search, Plus, Plane, X } from "lucide-react";
import "../styles/main.css";
import "../styles/flight.css";

const SEAT_CLASS_MULTIPLIERS = {
  economy: 1,
  business: 2.5,
  first: 5,
};

const initialFlightData = [
  {
    id: 1,
    airline: "Vietnam Airlines",
    airlineLogo: "/assets/logo-vietnam-airlines.png",
    flightNumber: "VN-001",
    departure: { time: "6:00 AM", location: "Hà Nội", airport: "HAN" },
    arrival: { time: "7:00 PM", location: "Hồ Chí Minh", airport: "SGN" },
    duration: "2 hours",
    isDirect: true,
    price: 350,
  },
  {
    id: 2,
    airline: "Bamboo Airways",
    airlineLogo: "/assets/Bamboo-Airways.png",
    flightNumber: "QH-002",
    departure: { time: "8:00 AM", location: "Hà Nội", airport: "HAN" },
    arrival: { time: "10:00 PM", location: "Hồ Chí Minh", airport: "SGN" },
    duration: "3h 30m",
    isDirect: true,
    price: 400,
  },
  {
    id: 3,
    airline: "Vietjet Air",
    airlineLogo: "/assets/vietjet-text-logo.png",
    flightNumber: "VJ-003",
    departure: { time: "10:00 AM", location: "Hà Nội", airport: "HAN" },
    arrival: { time: "12:45 PM", location: "Hồ Chí Minh", airport: "SGN" },
    duration: "2h 45m",
    isDirect: true,
    price: 450,
  },
  {
    id: 4,
    airline: "Vietravel Airlines",
    airlineLogo: "/assets/Vietravel_Airlines_Logo.png",
    flightNumber: "VU-004",
    departure: { time: "10:30 AM", location: "Hà Nội", airport: "HAN" },
    arrival: { time: "1:00 PM", location: "Hồ Chí Minh", airport: "SGN" },
    duration: "2h 30m",
    isDirect: true,
    price: 600,
  },
  {
    id: 5,
    airline: "Pacific Airlines",
    airlineLogo: "/assets/pacific-airlines-logo.png",
    flightNumber: "BL-005",
    departure: { time: "11:00 AM", location: "Hà Nội", airport: "HAN" },
    arrival: { time: "2:00 PM", location: "Hồ Chí Minh", airport: "SGN" },
    duration: "3 hours",
    isDirect: true,
    price: 600,
  },
  {
    id: 6,
    airline: "Vietnam Airlines",
    airlineLogo: "/assets/logo-vietnam-airlines.png",
    flightNumber: "VN-006",
    departure: { time: "12:00 PM", location: "Hà Nội", airport: "HAN" },
    arrival: { time: "3:30 PM", location: "Hồ Chí Minh", airport: "SGN" },
    duration: "3h 30m",
    isDirect: true,
    price: 380,
  },
  {
    id: 7,
    airline: "Vietnam Airlines",
    airlineLogo: "/assets/logo-vietnam-airlines.png",
    flightNumber: "VN-007",
    departure: { time: "2:00 PM", location: "Hà Nội", airport: "HAN" },
    arrival: { time: "5:15 PM", location: "Hồ Chí Minh", airport: "SGN" },
    duration: "3h 15m",
    isDirect: true,
    price: 420,
  },
  {
    id: 8,
    airline: "Pacific Airlines",
    airlineLogo: "/assets/pacific-airlines-logo.png",
    flightNumber: "BL-008",
    departure: { time: "4:00 PM", location: "Hà Nội", airport: "HAN" },
    arrival: { time: "7:00 PM", location: "Hồ Chí Minh", airport: "SGN" },
    duration: "3 hours",
    isDirect: true,
    price: 390,
  },
  {
    id: 9,
    airline: "Vietjet Air",
    airlineLogo: "/assets/vietjet-text-logo.png",
    flightNumber: "VJ-009",
    departure: { time: "6:00 PM", location: "Hà Nội", airport: "HAN" },
    arrival: { time: "9:45 PM", location: "Hồ Chí Minh", airport: "SGN" },
    duration: "3h 45m",
    isDirect: true,
    price: 480,
  },
  {
    id: 10,
    airline: "Bamboo Airways",
    airlineLogo: "/assets/Bamboo-Airways.png",
    flightNumber: "QH-010",
    departure: { time: "8:00 PM", location: "Hà Nội", airport: "HAN" },
    arrival: { time: "11:30 PM", location: "Hồ Chí Minh", airport: "SGN" },
    duration: "3h 30m",
    isDirect: true,
    price: 550,
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
  const [formData, setFormData] = useState({
    airline: "",
    flightNumber: "",
    departureTime: "",
    departureLocation: "",
    departureAirport: "",
    arrivalTime: "",
    arrivalLocation: "",
    arrivalAirport: "",
    duration: "",
    price: "",
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

    // Apply price multiplier based on seat class
    filteredFlights = filteredFlights.map((flight) => ({
      ...flight,
      price: Math.round(
        flight.price * (SEAT_CLASS_MULTIPLIERS[seatClass] || 1)
      ),
    }));

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

  const applySorting = (flights) => {
    let sorted = [...flights];

    // Sort by price
    if (sortPrice === "rẻ nhất") {
      sorted.sort((a, b) => a.price - b.price);
    } else {
      sorted.sort((a, b) => b.price - a.price);
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
    const sortedFlights = applySorting(currentFlights);
    setCurrentFlights(sortedFlights);
  };

  useEffect(() => {
    const sortedFlights = applySorting(currentFlights);
    setCurrentFlights(sortedFlights);
  }, [sortPrice, sortTime]);

  const formatTime = (time24) => {
    const [hours, minutes] = time24.split(":");
    const hour = parseInt(hours);
    const period = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${period}`;
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
      price: parseFloat(formData.price),
    };

    setFlightData([...flightData, newFlight]);
    setShowModal(false);
    setFormData({
      airline: "",
      flightNumber: "",
      departureTime: "",
      departureLocation: "",
      departureAirport: "",
      arrivalTime: "",
      arrivalLocation: "",
      arrivalAirport: "",
      duration: "",
      price: "",
      isDirect: true,
    });
    alert(`Chuyến bay ${newFlight.flightNumber} đã được thêm thành công!`);
  };

  const viewFlightDetail = (flightId) => {
    const flight = currentFlights.find((f) => f.id === flightId);
    if (flight) {
      alert(
        `Chi tiết chuyến bay:\n\nHãng hàng không: ${flight.airline}\nSố hiệu: ${flight.flightNumber}\nKhởi hành: ${flight.departure.location} (${flight.departure.airport})\nĐến: ${flight.arrival.location} (${flight.arrival.airport})\nKhởi hành: ${flight.departure.time}\nĐến: ${flight.arrival.time}\nThời gian bay: ${flight.duration}\nGiá: ${flight.price}/vé`
      );
    }
  };

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
                onClick={() => setShowModal(true)}
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
                    </div>
                    <div className="flight-price">{flight.price}/vé</div>
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
            <form className="add-flight-form" onSubmit={handleAddFlight}>
              <div className="form-section">
                <h3>Thông tin hãng hàng không</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Tên hãng hàng không *</label>
                    <select
                      value={formData.airline}
                      onChange={(e) =>
                        setFormData({ ...formData, airline: e.target.value })
                      }
                      required
                    >
                      <option value="">Chọn hãng hàng không</option>
                      <option value="Vietnam Airlines">Vietnam Airlines</option>
                      <option value="Bamboo Airways">Bamboo Airways</option>
                      <option value="Vietjet Air">Vietjet Air</option>
                      <option value="Vietravel Airlines">
                        Vietravel Airlines
                      </option>
                      <option value="Pacific Airlines">Pacific Airlines</option>
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
                      placeholder="2h"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Giá (VND) *</label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      placeholder="350"
                      min="0"
                      step="0.01"
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

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowModal(false)}
                >
                  Hủy
                </button>
                <button type="submit" className="btn-submit">
                  Thêm chuyến bay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Flight;
