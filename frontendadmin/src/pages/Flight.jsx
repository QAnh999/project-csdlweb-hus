import React, { useState, useEffect, useCallback, useMemo } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { ArrowLeftRight, Search, Plus, Plane, X, Pencil } from "lucide-react";
import "../styles/main.css";
import "../styles/flight.css";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const getAirlineLogo = (airlineName) => {
  const logoMap = {
    "Vietnam Airlines": "/public/assets/logo-vietnam-airlines.png",
    "Bamboo Airways": "/public/assets/Bamboo-Airways.png",
    Vietjet: "/public/assets/vietjet-text-logo.png",
    "Vietravel Airlines": "/public/assets/Vietravel_Airlines_Logo.png",
    "Pacific Airlines": "/public/assets/pacific-airlines-logo.png",
  };
  return logoMap[airlineName] || "";
};

const Flight = () => {
  // Data states
  const [flightData, setFlightData] = useState([]);
  const [airports, setAirports] = useState([]);
  const [airlines, setAirlines] = useState([]);
  const [aircrafts, setAircrafts] = useState([]);

  // Loading states - tách riêng cho từng thao tác
  const [isLoadingFlights, setIsLoadingFlights] = useState(false);
  const [isLoadingMasterData, setIsLoadingMasterData] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search states
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [seatClass, setSeatClass] = useState("economy");
  const [sortPrice, setSortPrice] = useState("rẻ nhất");
  const [sortTime, setSortTime] = useState("sớm nhất");

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState(null);

  // Form data
  const initialFormData = {
    airlineId: "",
    aircraftId: "",
    flightNumber: "",
    depAirportId: "",
    arrAirportId: "",
    depDatetime: "",
    arrDatetime: "",
    durationMinutes: "",
    priceEconomy: "",
    priceBusiness: "",
    priceFirst: "",
    seatsEconomy: "",
    seatsBusiness: "",
    seatsFirst: "",
    gate: "",
    terminal: "",
  };
  const [formData, setFormData] = useState(initialFormData);

  // Fetch master data
  const fetchMasterData = useCallback(async () => {
    setIsLoadingMasterData(true);
    try {
      const [airportsRes, airlinesRes, aircraftsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/admin/airports`),
        axios.get(`${API_BASE_URL}/admin/airlines`),
        axios.get(`${API_BASE_URL}/admin/aircrafts`),
      ]);
      setAirports(airportsRes.data);
      setAirlines(airlinesRes.data);
      setAircrafts(aircraftsRes.data);
    } catch (error) {
      console.error("Error fetching master data:", error);
      alert("Không thể tải dữ liệu cơ bản. Vui lòng thử lại!");
    } finally {
      setIsLoadingMasterData(false);
    }
  }, []);

  // Fetch flights
  const fetchFlights = useCallback(async () => {
    setIsLoadingFlights(true);

    const source = axios.CancelToken.source();

    try {
      const params = {};
      if (from) params.departure = from.split("(")[0].trim();
      if (to) params.arrival = to.split("(")[0].trim();
      if (date) params.departure_date = date;
      if (seatClass) params.seat_class = seatClass;

      const response = await axios.get(`${API_BASE_URL}/admin/flights/search`, {
        params,
        cancelToken: source.token,
      });

      setFlightData(
        response.data.map((flight) => ({
          id: flight.id,
          flightNumber: flight.flight_number,
          airline: flight.airline_name,
          airlineLogo: getAirlineLogo(flight.airline_name),
          departure: {
            time: flight.dep_datetime,
            location: flight.departure_city,
          },
          arrival: {
            time: flight.arr_datetime,
            location: flight.arrival_city,
          },
          duration: flight.duration_minutes,
          priceEconomy: Number(flight.base_price_economy),
          priceBusiness: flight.base_price_business
            ? Number(flight.base_price_business)
            : null,
          priceFirst: flight.base_price_first
            ? Number(flight.base_price_first)
            : null,
          status: flight.status,
          seatsEconomy: flight.available_seats_economy,
          seatsBusiness: flight.available_seats_business,
          seatsFirst: flight.available_seats_first,
          gate: flight.gate,
          terminal: flight.terminal,
        }))
      );
    } catch (error) {
      if (!axios.isCancel(error)) {
        console.error("Error fetching flights:", error);
        alert("Không thể tải danh sách chuyến bay. Vui lòng thử lại!");
      }
    } finally {
      setIsLoadingFlights(false);
    }
    return () => {
      source.cancel("Operation canceled due to new request");
    };
  }, [from, to, date, seatClass]);

  // Initialize
  useEffect(() => {
    fetchMasterData();
    const today = new Date();
    setDate(today.toISOString().split("T")[0]);
  }, [fetchMasterData]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFlights();
    }, 500);

    return () => clearTimeout(timer);
  }, [fetchFlights]);

  // Get display price based on seat class
  const getDisplayPrice = useCallback(
    (flight) => {
      if (seatClass === "business") return flight.priceBusiness || null;
      if (seatClass === "first") return flight.priceFirst || null;
      return flight.priceEconomy;
    },
    [seatClass]
  );

  // Sort flights
  const sortedFlights = useMemo(() => {
    let sorted = [...flightData];

    // Sort by price
    if (sortPrice === "rẻ nhất") {
      sorted.sort((a, b) => getDisplayPrice(a) - getDisplayPrice(b));
    } else {
      sorted.sort((a, b) => getDisplayPrice(b) - getDisplayPrice(a));
    }

    // Sort by time
    sorted.sort((a, b) => {
      const timeA = new Date(a.departure.time).getTime();
      const timeB = new Date(b.departure.time).getTime();
      return sortTime === "sớm nhất" ? timeA - timeB : timeB - timeA;
    });

    return sorted;
  }, [flightData, sortPrice, sortTime, getDisplayPrice]);

  // Handlers
  const handleSwapLocations = () => {
    setFrom(to);
    setTo(from);
  };

  const handleSearch = () => {
    fetchFlights();
  };

  const resetForm = () => {
    setFormData(initialFormData);
  };

  const handleAddFlight = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const aircraft = aircrafts.find(
        (a) => a.id === parseInt(formData.aircraftId)
      );
      const totalSeats =
        parseInt(formData.seatsEconomy || 0) +
        parseInt(formData.seatsBusiness || 0) +
        parseInt(formData.seatsFirst || 0);

      const payload = {
        flight_number: formData.flightNumber,
        id_airline: parseInt(formData.airlineId),
        id_aircraft: parseInt(formData.aircraftId),
        dep_airport: parseInt(formData.depAirportId),
        arr_airport: parseInt(formData.arrAirportId),
        dep_datetime: formData.depDatetime,
        arr_datetime: formData.arrDatetime,
        duration_minutes: parseInt(formData.durationMinutes),
        base_price_economy: parseFloat(formData.priceEconomy),
        base_price_business: formData.priceBusiness
          ? parseFloat(formData.priceBusiness)
          : null,
        base_price_first: formData.priceFirst
          ? parseFloat(formData.priceFirst)
          : null,
        total_seats: totalSeats || aircraft?.total_capacity || 180,
        available_seats_economy:
          parseInt(formData.seatsEconomy) || aircraft?.capacity_economy || 0,
        available_seats_business:
          parseInt(formData.seatsBusiness) || aircraft?.capacity_business || 0,
        available_seats_first:
          parseInt(formData.seatsFirst) || aircraft?.capacity_first || 0,
        gate: formData.gate || null,
        terminal: formData.terminal || null,
      };

      await axios.post(`${API_BASE_URL}/admin/flights/`, payload);
      alert("Thêm chuyến bay thành công!");
      setShowModal(false);
      resetForm();
      fetchFlights();
    } catch (error) {
      console.error("Error adding flight:", error);
      alert(error.response?.data?.detail || "Không thể thêm chuyến bay!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const viewFlightDetail = async (flightId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/admin/flights/${flightId}`
      );
      const data = response.data;

      setSelectedFlight({
        id: data.id,
        flightNumber: data.flight_number,
        airline: data.airline_name,
        airlineLogo: getAirlineLogo(data.airline_name),
        departure: { time: data.dep_datetime, location: data.departure_city },
        arrival: { time: data.arr_datetime, location: data.arrival_city },
        duration: data.duration_minutes,
        priceEconomy: Number(data.base_price_economy),
        priceBusiness: data.base_price_business
          ? Number(data.base_price_business)
          : 0,
        priceFirst: data.base_price_first ? Number(data.base_price_first) : 0,
        status: data.status,
        gate: data.gate,
        terminal: data.terminal,
        seatsEconomy: data.available_seats_economy,
        seatsBusiness: data.available_seats_business,
        seatsFirst: data.available_seats_first,
      });
      setShowDetailModal(true);
    } catch (error) {
      console.error("Error fetching flight details:", error);
      alert("Không thể tải thông tin chuyến bay!");
    }
  };

  const handleDeleteFlight = async (flightId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa chuyến bay này?")) {
      // Optimistic update - xóa ngay trong UI
      const previousFlights = [...flightData];
      setFlightData(flightData.filter((f) => f.id !== flightId));

      try {
        await axios.delete(`${API_BASE_URL}/admin/flights/${flightId}`);
        alert("Xóa chuyến bay thành công!");
      } catch (error) {
        console.error("Error deleting flight:", error);
        alert("Không thể xóa chuyến bay!");
        // Rollback nếu fail
        setFlightData(previousFlights);
      }
    }
  };

  const handleEditFlight = (flight) => {
    // Find airline and airports IDs from master data
    const airline = airlines.find((a) => a.name === flight.airline);
    const depAirport = airports.find(
      (a) => a.city === flight.departure.location
    );
    const arrAirport = airports.find((a) => a.city === flight.arrival.location);

    setFormData({
      airlineId: airline?.id?.toString() || "",
      aircraftId: "",
      flightNumber: flight.flightNumber,
      depAirportId: depAirport?.id?.toString() || "",
      arrAirportId: arrAirport?.id?.toString() || "",
      depDatetime: flight.departure.time
        ? new Date(flight.departure.time).toISOString().slice(0, 16)
        : "",
      arrDatetime: flight.arrival.time
        ? new Date(flight.arrival.time).toISOString().slice(0, 16)
        : "",
      durationMinutes: flight.duration?.toString() || "",
      priceEconomy: flight.priceEconomy?.toString() || "",
      priceBusiness: flight.priceBusiness?.toString() || "",
      priceFirst: flight.priceFirst?.toString() || "",
      seatsEconomy: flight.seatsEconomy?.toString() || "",
      seatsBusiness: flight.seatsBusiness?.toString() || "",
      seatsFirst: flight.seatsFirst?.toString() || "",
      gate: flight.gate || "",
      terminal: flight.terminal || "",
    });
    setSelectedFlight(flight);
    setShowEditModal(true);
  };

  const handleUpdateFlight = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Gọi API update
      const payload = {
        flight_number: formData.flightNumber,
        id_airline: parseInt(formData.airlineId),
        id_aircraft: parseInt(formData.aircraftId),
        dep_airport: parseInt(formData.depAirportId),
        arr_airport: parseInt(formData.arrAirportId),
        dep_datetime: formData.depDatetime,
        arr_datetime: formData.arrDatetime,
        duration_minutes: parseInt(formData.durationMinutes),
        base_price_economy: parseFloat(formData.priceEconomy),
        base_price_business: formData.priceBusiness
          ? parseFloat(formData.priceBusiness)
          : null,
        base_price_first: formData.priceFirst
          ? parseFloat(formData.priceFirst)
          : null,
        available_seats_economy: parseInt(formData.seatsEconomy),
        available_seats_business: parseInt(formData.seatsBusiness),
        available_seats_first: parseInt(formData.seatsFirst),
        gate: formData.gate || null,
        terminal: formData.terminal || null,
      };

      await axios.put(
        `${API_BASE_URL}/admin/flights/${selectedFlight.id}`,
        payload
      );

      alert("Cập nhật chuyến bay thành công!");
      setShowEditModal(false);
      resetForm();
      setSelectedFlight(null);

      fetchFlights();
    } catch (error) {
      console.error("Error updating flight:", error);
      alert(error.response?.data?.detail || "Không thể cập nhật chuyến bay!");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Utilities
  const formatDateTime = (isoString) => {
    if (!isoString) return "";
    return new Intl.DateTimeFormat("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(isoString));
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatDuration = (minutes) => {
    if (!minutes) return "";
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  };

  // Form component
  const renderFlightForm = (onSubmit, submitText) => (
    <form className="add-flight-form" onSubmit={onSubmit}>
      <div className="form-section">
        <h3>Thông tin hãng hàng không</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Hãng hàng không *</label>
            <select
              value={formData.airlineId}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  airlineId: e.target.value,
                  aircraftId: "",
                })
              }
              required
              disabled={isLoadingMasterData}
            >
              <option value="">
                {isLoadingMasterData ? "Đang tải..." : "Chọn hãng hàng không"}
              </option>
              {airlines.map((airline) => (
                <option key={airline.id} value={airline.id}>
                  {airline.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Loại máy bay *</label>
            <select
              value={formData.aircraftId}
              onChange={(e) =>
                setFormData({ ...formData, aircraftId: e.target.value })
              }
              required
              disabled={!formData.airlineId || isLoadingMasterData}
            >
              <option value="">
                {isLoadingMasterData ? "Đang tải..." : "Chọn loại máy bay"}
              </option>
              {aircrafts
                .filter((aircraft) =>
                  formData.airlineId
                    ? aircraft.id_airline === parseInt(formData.airlineId)
                    : true
                )
                .map((aircraft) => (
                  <option key={aircraft.id} value={aircraft.id}>
                    {aircraft.model}
                  </option>
                ))}
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
        <h3>Điểm khởi hành</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Sân bay khởi hành *</label>
            <select
              value={formData.depAirportId}
              onChange={(e) =>
                setFormData({ ...formData, depAirportId: e.target.value })
              }
              required
            >
              <option value="">Chọn sân bay</option>
              {airports.map((airport) => (
                <option key={airport.id} value={airport.id}>
                  {airport.city} - {airport.name} ({airport.iata})
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Thời gian khởi hành *</label>
            <input
              type="datetime-local"
              value={formData.depDatetime}
              onChange={(e) =>
                setFormData({ ...formData, depDatetime: e.target.value })
              }
              required
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>Điểm đến</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Sân bay đến *</label>
            <select
              value={formData.arrAirportId}
              onChange={(e) =>
                setFormData({ ...formData, arrAirportId: e.target.value })
              }
              required
            >
              <option value="">Chọn sân bay</option>
              {airports.map((airport) => (
                <option key={airport.id} value={airport.id}>
                  {airport.city} - {airport.name} ({airport.iata})
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Thời gian đến *</label>
            <input
              type="datetime-local"
              value={formData.arrDatetime}
              onChange={(e) =>
                setFormData({ ...formData, arrDatetime: e.target.value })
              }
              required
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>Chi tiết chuyến bay</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Thời gian bay (phút) *</label>
            <input
              type="number"
              value={formData.durationMinutes}
              onChange={(e) =>
                setFormData({ ...formData, durationMinutes: e.target.value })
              }
              placeholder="120"
              min="1"
              required
            />
          </div>
          <div className="form-group">
            <label>Cổng (Gate)</label>
            <input
              type="text"
              value={formData.gate}
              onChange={(e) =>
                setFormData({ ...formData, gate: e.target.value })
              }
              placeholder="A1"
            />
          </div>
          <div className="form-group">
            <label>Nhà ga (Terminal)</label>
            <input
              type="text"
              value={formData.terminal}
              onChange={(e) =>
                setFormData({ ...formData, terminal: e.target.value })
              }
              placeholder="T1"
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>Giá vé (VND)</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Phổ thông *</label>
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
            <label>Thương gia</label>
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
            <label>Hạng nhất</label>
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

      <div className="form-section">
        <h3>Số ghế trống</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Phổ thông</label>
            <input
              type="number"
              value={formData.seatsEconomy}
              onChange={(e) =>
                setFormData({ ...formData, seatsEconomy: e.target.value })
              }
              placeholder="150"
              min="0"
            />
          </div>
          <div className="form-group">
            <label>Thương gia</label>
            <input
              type="number"
              value={formData.seatsBusiness}
              onChange={(e) =>
                setFormData({ ...formData, seatsBusiness: e.target.value })
              }
              placeholder="20"
              min="0"
            />
          </div>
          <div className="form-group">
            <label>Hạng nhất</label>
            <input
              type="number"
              value={formData.seatsFirst}
              onChange={(e) =>
                setFormData({ ...formData, seatsFirst: e.target.value })
              }
              placeholder="10"
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
        <button type="submit" className="btn-submit" disabled={isSubmitting}>
          {isSubmitting && <span className="inline-spinner"></span>}
          {isSubmitting ? "Đang xử lý..." : submitText}
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
                placeholder="Hà Nội"
              />
            </div>
            <button
              className="swap-btn"
              onClick={handleSwapLocations}
              title="Đổi chiều"
            >
              <ArrowLeftRight size={20} />
            </button>
            <div className="search-field">
              <label>Điểm đến</label>
              <input
                type="text"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="TP HCM"
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
            <button className="search-btn" onClick={handleSearch}>
              <Search size={20} />
            </button>
          </div>
        </div>

        {/* Flight List Section */}
        <div className="flight-list-section">
          <div className="flight-list-header">
            <h2>
              Danh sách chuyến bay (<span>{sortedFlights.length}</span> kết quả)
            </h2>
            <div className="sort-controls">
              <select
                className="sort-select"
                value={sortPrice}
                onChange={(e) => setSortPrice(e.target.value)}
              >
                <option value="rẻ nhất">Sắp xếp: Rẻ nhất</option>
                <option value="đắt nhất">Đắt nhất</option>
              </select>
              <select
                className="sort-select"
                value={sortTime}
                onChange={(e) => setSortTime(e.target.value)}
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
            {isLoadingFlights ? (
              <div className="no-results">
                <p>Đang tải...</p>
              </div>
            ) : sortedFlights.length === 0 ? (
              <div className="no-results">
                <Plane
                  size={48}
                  style={{ opacity: 0.5, marginBottom: "1rem" }}
                />
                <p>Không tìm thấy chuyến bay</p>
                <span>Hãy thử điều chỉnh tiêu chí tìm kiếm</span>
              </div>
            ) : (
              sortedFlights.map((flight) => (
                <div key={flight.id} className="flight-card">
                  <div className="flight-card-header">
                    <div className="airline-logo">
                      <img
                        src={flight.airlineLogo}
                        alt={flight.airline}
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
                    <div className="flight-price">
                      {formatPrice(getDisplayPrice(flight))}
                    </div>
                  </div>
                  <div className="flight-details">
                    <div className="departure-info">
                      <span className="departure-time">
                        {formatDateTime(flight.departure.time)}
                      </span>
                      <span className="departure-location">
                        {flight.departure.location}
                      </span>
                    </div>
                    <div className="flight-route">
                      <div className="route-line"></div>
                      <div className="route-duration">
                        {formatDuration(flight.duration)}
                      </div>
                    </div>
                    <div className="arrival-info">
                      <span className="arrival-time">
                        {formatDateTime(flight.arrival.time)}
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
                      <Pencil size={14} />
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteFlight(flight.id)}
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
                    onError={(e) => (e.target.style.display = "none")}
                  />
                </div>
                <div className="detail-header-info">
                  <h3>{selectedFlight.airline}</h3>
                  <p className="flight-number-large">
                    {selectedFlight.flightNumber}
                  </p>
                </div>
              </div>

              <div className="detail-route-section">
                <div className="route-point">
                  <span className="route-time">
                    {formatDateTime(selectedFlight.departure.time)}
                  </span>
                  <span className="route-location">
                    {selectedFlight.departure.location}
                  </span>
                </div>
                <div className="route-middle">
                  <div className="route-line-detail"></div>
                  <span className="route-duration-detail">
                    {formatDuration(selectedFlight.duration)}
                  </span>
                </div>
                <div className="route-point">
                  <span className="route-time">
                    {formatDateTime(selectedFlight.arrival.time)}
                  </span>
                  <span className="route-location">
                    {selectedFlight.arrival.location}
                  </span>
                </div>
              </div>

              <div className="detail-info-grid">
                <div className="info-item">
                  <span className="info-label">Cổng (Gate)</span>
                  <span className="info-value">
                    {selectedFlight.gate || "Chưa có"}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Nhà ga (Terminal)</span>
                  <span className="info-value">
                    {selectedFlight.terminal || "Chưa có"}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Trạng thái</span>
                  <span className="info-value status-badge">
                    {selectedFlight.status}
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
                    <span className="seats-info">
                      {selectedFlight.seatsEconomy} ghế trống
                    </span>
                  </div>
                  <div className="price-item">
                    <span className="price-label">Thương gia (Business)</span>
                    <span className="price-value">
                      {selectedFlight.priceBusiness > 0
                        ? formatPrice(selectedFlight.priceBusiness)
                        : "Không có"}
                    </span>
                    <span className="seats-info">
                      {selectedFlight.seatsBusiness} ghế trống
                    </span>
                  </div>
                  <div className="price-item">
                    <span className="price-label">Hạng nhất (First)</span>
                    <span className="price-value">
                      {selectedFlight.priceFirst > 0
                        ? formatPrice(selectedFlight.priceFirst)
                        : "Không có"}
                    </span>
                    <span className="seats-info">
                      {selectedFlight.seatsFirst} ghế trống
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
    </DashboardLayout>
  );
};

export default Flight;
