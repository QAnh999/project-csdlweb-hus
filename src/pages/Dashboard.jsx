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

const kpiData = [
  {
    id: 1,
    title: "Thành công",
    value: "125",
    trend: "+1.35%",
    isPositive: true,
    icon: CheckCircle,
    iconClass: "completed",
  },
  {
    id: 2,
    title: "Đang hoạt động",
    value: "80",
    trend: "+3.68%",
    isPositive: true,
    icon: Plane,
    iconClass: "active",
  },
  {
    id: 3,
    title: "Người dùng mới",
    value: "25",
    trend: "-1.45%",
    isPositive: false,
    icon: UserRoundPlus,
    iconClass: "new-users",
  },
  {
    id: 4,
    title: "Tổng doanh thu",
    value: "15,000,000",
    trend: "+5.94%",
    isPositive: true,
    icon: PiggyBank,
    iconClass: "revenue",
  },
];

const recentBookings = [
  {
    name: "User1",
    bookingId: "BK001",
    flight: "VN123",
    time: "14:30",
    status: "completed",
  },
  {
    name: "User2",
    bookingId: "BK002",
    flight: "VN456",
    time: "16:45",
    status: "pending",
  },
  {
    name: "User3",
    bookingId: "BK003",
    flight: "VN789",
    time: "18:20",
    status: "completed",
  },
];

const airlinesData = [
  { name: "Vietjet", percentage: 35, color: "var(--primary-color)" },
  { name: "Vietnam Airlines", percentage: 30, color: "var(--text-dark)" },
  { name: "Bamboo Airways", percentage: 20, color: "var(--text-light)" },
  { name: "Vietravel Airlines", percentage: 10, color: "var(--extra-light)" },
  { name: "Pacific Airlines", percentage: 5, color: "#ff6b6b" },
];

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
  const [chartPeriod, setChartPeriod] = useState("Hàng ngày");
  const [revenuePeriod, setRevenuePeriod] = useState("Hôm nay");

  const ticketChartRef = useRef(null);
  const revenueChartRef = useRef(null);
  const airlinesChartRef = useRef(null);
  const ticketChartInstance = useRef(null);
  const revenueChartInstance = useRef(null);
  const airlinesChartInstance = useRef(null);

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

    // Airlines Chart
    if (airlinesChartRef.current) {
      if (airlinesChartInstance.current) {
        airlinesChartInstance.current.destroy();
      }
      const ctx = airlinesChartRef.current.getContext("2d");
      airlinesChartInstance.current = new Chart(ctx, {
        type: "doughnut",
        data: {
          labels: [
            "Vietjet",
            "Vietnam Airlines",
            "Bamboo Airways",
            "Vietravel Airlines",
            "Pacific Airlines",
          ],
          datasets: [
            {
              data: [35, 30, 20, 10, 5],
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
    }

    return () => {
      if (ticketChartInstance.current) ticketChartInstance.current.destroy();
      if (revenueChartInstance.current) revenueChartInstance.current.destroy();
      if (airlinesChartInstance.current)
        airlinesChartInstance.current.destroy();
    };
  }, []);

  return (
    <DashboardLayout title="Dashboard">
      <div className="dashboard-content">
        {/* KPI Cards */}
        <div className="kpi-section">
          {kpiData.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <div key={kpi.id} className="kpi-card">
                <div className={`kpi-icon ${kpi.iconClass}`}>
                  <Icon size={24} />
                </div>
                <div className="kpi-content">
                  <h3>{kpi.title}</h3>
                  <div className="kpi-value">{kpi.value}</div>
                  <div
                    className={`kpi-trend ${
                      kpi.isPositive ? "positive" : "negative"
                    }`}
                  >
                    {kpi.isPositive ? (
                      <ArrowUp size={14} />
                    ) : (
                      <ArrowDown size={14} />
                    )}
                    <span>{kpi.trend}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts Section */}
        <div className="charts-section">
          <div className="chart-card ticket-sales">
            <div className="chart-header">
              <h3>Vé bán ra</h3>
              <div className="chart-toggles">
                <button
                  className={`toggle-btn ${
                    chartPeriod === "Hàng ngày" ? "active" : ""
                  }`}
                  onClick={() => setChartPeriod("Hàng ngày")}
                >
                  Hàng ngày
                </button>
                <button
                  className={`toggle-btn ${
                    chartPeriod === "Hàng tuần" ? "active" : ""
                  }`}
                  onClick={() => setChartPeriod("Hàng tuần")}
                >
                  Hàng tuần
                </button>
              </div>
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
                <option>Hôm nay</option>
                <option>Tuần</option>
                <option>Tháng</option>
                <option>6 Tháng qua</option>
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
                  {recentBookings.map((booking, index) => (
                    <tr key={index}>
                      <td>{booking.name}</td>
                      <td>{booking.bookingId}</td>
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
                {airlinesData.map((airline, index) => (
                  <div key={index} className="legend-item">
                    <span
                      className="legend-color"
                      style={{ background: airline.color }}
                    ></span>
                    <span>
                      {airline.name} {airline.percentage}%
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
