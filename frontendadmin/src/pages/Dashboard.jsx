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
  const [topFlightRoutes, setTopFlightRoutes] = useState([]);

  // Data cho biểu đồ từ API
  const [weeklyTickets, setWeeklyTickets] = useState([]);
  const [weeklyRevenue, setWeeklyRevenue] = useState([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);

  const ticketChartRef = useRef(null);
  const revenueChartRef = useRef(null);
  const airlinesChartRef = useRef(null);
  const ticketChartInstance = useRef(null);
  const revenueChartInstance = useRef(null);
  const airlinesChartInstance = useRef(null);

  // Lấy tên ngày tiếng Việt từ date
  const getDayNameVN = (dateStr) => {
    const date = new Date(dateStr);
    const dayIndex = date.getDay();
    const dayNames = [
      "CN",
      "Thứ 2",
      "Thứ 3",
      "Thứ 4",
      "Thứ 5",
      "Thứ 6",
      "Thứ 7",
    ];
    return dayNames[dayIndex];
  };
  const fetchKPI = async () => {
    try {
      setLoadingKPI(true);
      const res = await axios.get(`${API_BASE_URL}/dashboard/daily-stats`);
      const data = res.data; // axios tự parse JSON

      // Cập nhật từng state riêng biệt
      setSuccessfulBookings(data.completed_flights || 0);
      setActiveFlights(data.active_flights || 0);
      setNewUsers(data.new_users_today || 0);
      setTotalRevenue(data.total_revenue_today || 0);
    } catch (error) {
      console.error("Error fetching KPI data:", error);
      toast.error("Lỗi khi tải dữ liệu KPI");
    } finally {
      setLoadingKPI(false);
    }
  };

  const fetchRecentBookings = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/dashboard/recent-bookings`);
      setRecentBookingsBuffer(
        res.data.map((item) => ({
          user: item.user_name,
          booking_id: item.booking_id,
          flight: item.flight_number,
          time: item.booking_time,
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
          airline: item.airline_name,
          popularity: item.percentage,
        }))
      );
    } catch (error) {
      console.error("Error fetching popular airlines:", error);
      toast.error("Lỗi khi tải dữ liệu hãng hàng không phổ biến");
    }
  };

  const fetchPopularRoutes = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/dashboard/popular-routes`);
      const data = res.data;
      setTopFlightRoutes(
        data.map((item) => ({
          from: item.departure_city,
          to: item.arrival_city,
          progress: item.percentage,
        }))
      );
      // Xử lý dữ liệu nếu cần
    } catch (error) {
      console.error("Error fetching popular routes:", error);
      toast.error("Lỗi khi tải dữ liệu chặng bay phổ biến");
    }
  };

  // Fetch weekly tickets data
  const fetchWeeklyTickets = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/dashboard/weekly-tickets`);
      setWeeklyTickets(res.data);
    } catch (error) {
      console.error("Error fetching weekly tickets:", error);
      toast.error("Lỗi khi tải dữ liệu vé bán ra trong tuần");
    }
  };

  // Fetch weekly revenue data
  const fetchWeeklyRevenue = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/dashboard/weekly-revenue`);
      setWeeklyRevenue(res.data);
    } catch (error) {
      console.error("Error fetching weekly revenue:", error);
      toast.error("Lỗi khi tải dữ liệu doanh thu tuần");
    }
  };

  // Fetch monthly revenue data
  const fetchMonthlyRevenue = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/dashboard/monthly-revenue`);
      setMonthlyRevenue(res.data);
    } catch (error) {
      console.error("Error fetching monthly revenue:", error);
      toast.error("Lỗi khi tải dữ liệu doanh thu tháng");
    }
  };

  useEffect(() => {
    fetchKPI();
    fetchRecentBookings();
    fetchPopularAirlines();
    fetchPopularRoutes();
    fetchWeeklyTickets();
    fetchWeeklyRevenue();
    fetchMonthlyRevenue();
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
    if (!ticketChartRef.current) return;

    if (ticketChartInstance.current) {
      ticketChartInstance.current.destroy();
    }
    const defaultLabels = [
      "CN",
      "Thứ 2",
      "Thứ 3",
      "Thứ 4",
      "Thứ 5",
      "Thứ 6",
      "Thứ 7",
    ];
    let labels = defaultLabels;
    let data = [0, 0, 0, 0, 0, 0, 0];

    if (weeklyTickets.length > 0) {
      const dataByDay = {};
      weeklyTickets.forEach((item) => {
        const dayName = getDayNameVN(item.date);
        dataByDay[dayName] = item.tickets_sold;
      });
      data = defaultLabels.map((day) => dataByDay[day] || 0);
    }

    const maxValue = Math.max(...data, 100);
    const ctx = ticketChartRef.current.getContext("2d");

    ticketChartInstance.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Vé bán ra trong tuần",
            data: data,
            backgroundColor: "#87b3ea",
            borderRadius: 4,
            borderSkipped: false,
            minBarLength: 5,
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
            max: Math.ceil(maxValue * 1.2),
            ticks: { callback: (value) => value },
            grid: { color: "#f3f4f6" },
          },
          x: { grid: { display: false } },
        },
      },
    });

    return () => {
      if (ticketChartInstance.current) ticketChartInstance.current.destroy();
    };
  }, [weeklyTickets]);

  useEffect(() => {
    if (!revenueChartRef.current) return;

    if (revenueChartInstance.current) {
      revenueChartInstance.current.destroy();
    }

    let labels = [];
    let data = [];

    if (revenuePeriod === "Tuần") {
      const defaultLabels = [
        "CN",
        "Thứ 2",
        "Thứ 3",
        "Thứ 4",
        "Thứ 5",
        "Thứ 6",
        "Thứ 7",
      ];

      if (weeklyRevenue.length > 0) {
        const dataByDay = {};
        weeklyRevenue.forEach((item) => {
          const dayName = getDayNameVN(item.date);
          dataByDay[dayName] = parseFloat(item.revenue);
        });

        labels = defaultLabels;
        data = defaultLabels.map((day) => dataByDay[day] || 0);
      } else {
        labels = defaultLabels;
        data = [0, 0, 0, 0, 0, 0, 0];
      }
    } else {
      if (monthlyRevenue.length > 0) {
        labels = monthlyRevenue.map((item) => `Week ${item.week_number}`);
        data = monthlyRevenue.map((item) => parseFloat(item.revenue));
      } else {
        labels = ["Week 1", "Week 2", "Week 3", "Week 4"];
        data = [0, 0, 0, 0];
      }
    }

    const ctx = revenueChartRef.current.getContext("2d");

    revenueChartInstance.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Doanh thu",
            data: data,
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
            min: 0,
            max: 100000000, // 100 triệu
            ticks: {
              stepSize: 20000000, // 20 triệu
              callback: (value) => {
                if (value === 0) return "0";
                return value / 1000000 + " triệu";
              },
            },
            grid: { color: "#f3f4f6" },
          },
          x: { grid: { display: false } },
        },
        interaction: { intersect: false, mode: "index" },
      },
    });

    return () => {
      if (revenueChartInstance.current) revenueChartInstance.current.destroy();
    };
  }, [revenuePeriod, weeklyRevenue, monthlyRevenue]);

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

          <div className="kpi-card">
            <div className="kpi-icon revenue">
              <PiggyBank size={24} />
            </div>
            <div className="kpi-content">
              <h3>Doanh thu</h3>
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
              <h3>Vé bán ra trong tuần</h3>
            </div>
            <div className="chart-content">
              <div className="chart-value">
                Tổng vé bán ra:{" "}
                {weeklyTickets
                  .reduce((sum, item) => sum + item.tickets_sold, 0)
                  .toLocaleString()}
              </div>
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
              <div className="chart-value">
                Tổng doanh thu:{" "}
                {revenuePeriod === "Tuần"
                  ? weeklyRevenue
                      .reduce(
                        (sum, item) => sum + parseFloat(item.revenue || 0),
                        0
                      )
                      .toLocaleString("vi-VN")
                  : monthlyRevenue
                      .reduce(
                        (sum, item) => sum + parseFloat(item.revenue || 0),
                        0
                      )
                      .toLocaleString("vi-VN")}{" "}
                đ
              </div>
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
                          {booking.status === "confirmed"
                            ? "Confirmed"
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
            </div>
            <div className="routes-list">
              {topFlightRoutes.map((route, index) => (
                <div key={index} className="route-item">
                  <div className="route-info">
                    <h4>
                      {route.from} - {route.to}
                    </h4>
                  </div>
                  <div className="route-stats">
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
