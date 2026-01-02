import React, { useState, useEffect, useRef } from "react";
import DashboardLayout from "../components/DashboardLayout";
import {
  CheckCircle,
  Plane,
  UserRoundPlus,
  PiggyBank,
  ArrowUp,
  ArrowDown,
  MoreVertical,
} from "lucide-react";
import Chart from "chart.js/auto";
import "../styles/main.css";
import { toast } from "sonner";
import axios from "axios";

const API_BASE_URL = "http://localhost:8000";

const topRoutes = [
  {
    from: "Hà Nội (HAN)",
    to: "Hồ Chí Minh (SGN)",
    passengers: "140,000",
    progress: 85,
  },
  {
    from: "Hà Nội (HAN)",
    to: "Đà Nẵng (DAD)",
    passengers: "130,000",
    progress: 75,
  },
  {
    from: "Hồ Chí Minh (SGN)",
    to: "Phú Quốc (PQC)",
    passengers: "120,000",
    progress: 65,
  },
  {
    from: "Nha Trang (CXR)",
    to: "Huế (HUI)",
    passengers: "110,000",
    progress: 55,
  },
  {
    from: "Quy Nhơn (UIH)",
    to: "Hồ Chí Minh (SGN)",
    passengers: "100,000",
    progress: 45,
  },
];

const Dashboard = () => {
  // KPI states
  const [successfulBookings, setSuccessfulBookings] = useState(0);
  const [activeFlights, setActiveFlights] = useState(0);
  const [newUsers, setNewUsers] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loadingKPI, setLoadingKPI] = useState(true);
  const [recentBookingsBuffer, setRecentBookingsBuffer] = useState([]);
  const [revenuePeriod, setRevenuePeriod] = useState("Tuần");
  const [popularAirlines, setPopularAirlines] = useState([]);
  const ticketChartRef = useRef(null);
  const revenueChartRef = useRef(null);
  const airlinesChartRef = useRef(null);
  const ticketChartInstance = useRef(null);
  const revenueChartInstance = useRef(null);
  const airlinesChartInstance = useRef(null);
  const fetchKPI = async () => {
    try {
      setLoadingKPI(true);
      const res = await axios.get(`${API_BASE_URL}/dashboard`);
      const data = res.data; // axios tự parse JSON

      // Cập nhật từng state riêng biệt
      setSuccessfulBookings(data.completed_flights || 0);
      setActiveFlights(data.active_flights || 0);
      setNewUsers(data.new_users_today || 0);
      setTotalRevenue(data.revenue_today || 0);
    } catch (error) {
      console.error("Error fetching KPI data:", error);
      toast.error("Lỗi khi tải dữ liệu KPI");
    } finally {
      setLoadingKPI(false);
    }
  };

  const fetchRecentBookings = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/dashboard/top-bookings`);
      setRecentBookingsBuffer(
        res.data.map((item) => ({
          user: item.user,
          booking_id: item.booking_id,
          flight: item.flight,
          time: item.time,
          status: item.status,
        }))
      );
    } catch (error) {
      console.error("Error fetching recent bookings:", error);
      toast.error("Lỗi khi tải dữ liệu đặt chỗ gần đây");
    }
  };

  const fetchPopularAirlines = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/dashboard/popular-airlines`);
      setPopularAirlines(
        res.data.map((item) => ({
          airline: item.airline,
          popularity: item.popularity,
        }))
      );
    } catch (error) {
      console.error("Error fetching popular airlines:", error);
      toast.error("Lỗi khi tải dữ liệu hãng hàng không phổ biến");
    }
  };

  useEffect(() => {
    fetchKPI();
    fetchRecentBookings();
    fetchPopularAirlines();
  }, []);

  useEffect(() => {
    if (!airlinesChartRef.current || popularAirlines.length === 0) return;

    if (airlinesChartInstance.current) {
      airlinesChartInstance.current.destroy();
    }

    const ctx = airlinesChartRef.current.getContext("2d");

    airlinesChartInstance.current = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: popularAirlines.map((a) => a.airline),
        datasets: [
          {
            data: popularAirlines.map((a) => a.popularity),
            backgroundColor: [
              "#87b3ea",
              "#35265c",
              "#5d5e84",
              "#f3f4f6",
              "#ff6b6b",
            ],
            borderWidth: 0,
            cutout: "60%",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
      },
    });
    return () => {
      if (airlinesChartInstance.current)
        airlinesChartInstance.current.destroy();
    };
  }, [popularAirlines]);

  useEffect(() => {
    // Ticket Sales Chart
    if (ticketChartRef.current) {
      if (ticketChartInstance.current) {
        ticketChartInstance.current.destroy();
      }
      const ctx = ticketChartRef.current.getContext("2d");
      ticketChartInstance.current = new Chart(ctx, {
        type: "bar",
        data: {
          labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
          datasets: [
            {
              label: "Vé bán ra",
              data: [1200, 1900, 3000, 4000, 2500, 3200, 2800],
              backgroundColor: [
                "#5d5e84",
                "#5d5e84",
                "#87b3ea",
                "#87b3ea",
                "#5d5e84",
                "#5d5e84",
                "#5d5e84",
              ],
              borderRadius: 4,
              borderSkipped: false,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: {
              beginAtZero: true,
              max: 4000,
              ticks: { callback: (value) => value },
              grid: { color: "#f3f4f6" },
            },
            x: { grid: { display: false } },
          },
        },
      });
    }

    // Revenue Chart
    if (revenueChartRef.current) {
      if (revenueChartInstance.current) {
        revenueChartInstance.current.destroy();
      }
      const ctx = revenueChartRef.current.getContext("2d");
      revenueChartInstance.current = new Chart(ctx, {
        type: "line",
        data: {
          labels: ["Feb", "Mar", "Apr", "May", "Jun", "Jul"],
          datasets: [
            {
              label: "Thu nhập",
              data: [12000, 15000, 18000, 16000, 19000, 20000],
              borderColor: "#f59e0b",
              backgroundColor: "rgba(245, 158, 11, 0.1)",
              fill: true,
              tension: 0.4,
              pointRadius: 6,
              pointHoverRadius: 8,
              pointBackgroundColor: "#f59e0b",
              pointBorderColor: "#ffffff",
              pointBorderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: {
              beginAtZero: true,
              max: 20000,
              ticks: { callback: (value) => value + "K" },
              grid: { color: "#f3f4f6" },
            },
            x: { grid: { display: false } },
          },
          interaction: { intersect: false, mode: "index" },
        },
      });
    }

    return () => {
      if (ticketChartInstance.current) ticketChartInstance.current.destroy();
      if (revenueChartInstance.current) revenueChartInstance.current.destroy();
    };
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <DashboardLayout title="Dashboard">
      <div className="dashboard-content">
        {/* KPI Cards */}
        <div className="kpi-section">
          {/* 1. Thành công */}
          <div className="kpi-card">
            <div className="kpi-icon completed">
              <CheckCircle size={24} />
            </div>
            <div className="kpi-content">
              <h3>Thành công</h3>
              <div className="kpi-value">
                {loadingKPI ? "..." : successfulBookings.toLocaleString()}
              </div>
              <div className="kpi-trend positive">
                <ArrowUp size={14} />
                <span>+12%</span>
              </div>
            </div>
          </div>

          {/* 2. Đang hoạt động */}
          <div className="kpi-card">
            <div className="kpi-icon active">
              <Plane size={24} />
            </div>
            <div className="kpi-content">
              <h3>Đang hoạt động</h3>
              <div className="kpi-value">
                {loadingKPI ? "..." : activeFlights.toLocaleString()}
              </div>
              <div className="kpi-trend">
                <ArrowDown size={14} />
                <span>0%</span>
              </div>
            </div>
          </div>

          {/* 3. Người dùng mới */}
          <div className="kpi-card">
            <div className="kpi-icon new-users">
              <UserRoundPlus size={24} />
            </div>
            <div className="kpi-content">
              <h3>Người dùng mới</h3>
              <div className="kpi-value">
                {loadingKPI ? "..." : newUsers.toLocaleString()}
              </div>
              <div className="kpi-trend negative">
                <ArrowDown size={14} />
                <span>-5%</span>
              </div>
            </div>
          </div>

          {/* 4. Tổng doanh thu */}
          <div className="kpi-card">
            <div className="kpi-icon revenue">
              <PiggyBank size={24} />
            </div>
            <div className="kpi-content">
              <h3>Tổng doanh thu</h3>
              <div className="kpi-value">
                {loadingKPI ? "..." : formatCurrency(totalRevenue)}
              </div>
              <div className="kpi-trend positive">
                <ArrowUp size={14} />
                <span>+2%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="charts-section">
          <div className="chart-card ticket-sales">
            <div className="chart-header">
              <h3>Vé bán ra</h3>
            </div>
            <div className="chart-content">
              <div className="chart-value">Tổng vé bán ra: 5,000</div>
              <div className="chart-container">
                <canvas ref={ticketChartRef}></canvas>
              </div>
            </div>
          </div>

          <div className="chart-card revenue-growth">
            <div className="chart-header">
              <h3>Doanh thu</h3>
              <select
                className="chart-select"
                value={revenuePeriod}
                onChange={(e) => setRevenuePeriod(e.target.value)}
              >
                <option>Tuần</option>
                <option>Tháng</option>
              </select>
            </div>
            <div className="chart-content">
              <div className="chart-container">
                <canvas ref={revenueChartRef}></canvas>
              </div>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="table-section">
          <div className="table-card">
            <div className="table-header">
              <h3>Đặt chỗ gần đây</h3>
            </div>
            <div className="table-container">
              <table className="bookings-table">
                <thead>
                  <tr>
                    <th>Tên</th>
                    <th>Mã đặt chỗ</th>
                    <th>Chuyến bay</th>
                    <th>Thời gian</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookingsBuffer.map((booking, index) => (
                    <tr key={index}>
                      <td>{booking.user}</td>
                      <td>{booking.booking_id}</td>
                      <td>{booking.flight}</td>
                      <td>{booking.time}</td>
                      <td>
                        <span className={`status ${booking.status}`}>
                          {booking.status === "completed"
                            ? "Completed"
                            : "Pending"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="chart-card popular-airlines">
            <div className="card-header">
              <h3>Hãng hàng không phổ biến</h3>
            </div>
            <div className="airlines-chart">
              <div className="donut-chart">
                <canvas ref={airlinesChartRef}></canvas>
                <div className="chart-center">
                  <Plane size={24} />
                </div>
              </div>
              <div className="airlines-legend">
                {popularAirlines.map((airline, index) => (
                  <div key={index} className="legend-item">
                    <span
                      className="legend-color"
                      style={{
                        background: [
                          "#87b3ea",
                          "#35265c",
                          "#5d5e84",
                          "#f3f4f6",
                          "#ff6b6b",
                        ][index % 5],
                      }}
                    ></span>
                    <span>
                      {airline.airline} {airline.popularity}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Top Flight Routes */}
        <div className="routes-section">
          <div className="bottom-card top-routes">
            <div className="card-header">
              <h3>Chặng bay phổ biến</h3>
              <button className="menu-btn">
                <MoreVertical size={18} />
              </button>
            </div>
            <div className="routes-list">
              {topRoutes.map((route, index) => (
                <div key={index} className="route-item">
                  <div className="route-info">
                    <h4>
                      {route.from} - {route.to}
                    </h4>
                    <p>{route.distance}</p>
                  </div>
                  <div className="route-stats">
                    <span className="passengers">
                      {route.passengers} Hành khách
                    </span>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${route.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
