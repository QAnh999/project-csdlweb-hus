// Dashboard JavaScript functionality
document.addEventListener("DOMContentLoaded", function () {
  // Initialize all dashboard features
  initializeCharts();
  initializeSidebar();
  initializeSearch();
  initializeNotifications();
  initializeAnimations();
});

// Initialize Chart.js charts
function initializeCharts() {
  // Ticket Sales Chart
  const ticketSalesCtx = document.getElementById("ticketSalesChart");
  if (ticketSalesCtx) {
    new Chart(ticketSalesCtx, {
      type: "bar",
      data: {
        labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        datasets: [
          {
            label: "Tickets Sold",
            data: [1200, 1900, 3000, 4000, 2500, 3200, 2800],
            backgroundColor: [
              "var(--text-light)",
              "var(--text-light)",
              "var(--primary-color)",
              "var(--primary-color)",
              "var(--text-light)",
              "var(--text-light)",
              "var(--text-light)",
            ],
            borderRadius: 4,
            borderSkipped: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 4000,
            ticks: {
              callback: function (value) {
                return value + "K";
              },
            },
            grid: {
              color: "var(--extra-light)",
            },
          },
          x: {
            grid: {
              display: false,
            },
          },
        },
      },
    });
  }

  // Flights Schedule Chart
  const flightsScheduleCtx = document.getElementById("flightsScheduleChart");
  if (flightsScheduleCtx) {
    new Chart(flightsScheduleCtx, {
      type: "line",
      data: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"],
        datasets: [
          {
            label: "Domestic",
            data: [120, 135, 150, 140, 170, 160, 180, 175],
            borderColor: "var(--primary-color)",
            backgroundColor: "rgba(135, 179, 234, 0.1)",
            fill: true,
            tension: 0.4,
          },
          {
            label: "International",
            data: [80, 90, 100, 95, 110, 105, 120, 115],
            borderColor: "var(--text-dark)",
            backgroundColor: "rgba(53, 38, 92, 0.1)",
            fill: true,
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: "var(--extra-light)",
            },
          },
          x: {
            grid: {
              display: false,
            },
          },
        },
        interaction: {
          intersect: false,
          mode: "index",
        },
      },
    });
  }

  // Revenue Growth Chart
  const revenueCtx = document.getElementById("revenueChart");
  if (revenueCtx) {
    new Chart(revenueCtx, {
      type: "line",
      data: {
        labels: ["Feb", "Mar", "Apr", "May", "Jun", "Jul"],
        datasets: [
          {
            label: "Income",
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
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 20000,
            ticks: {
              callback: function (value) {
                return value + "K";
              },
            },
            grid: {
              color: "var(--extra-light)",
            },
          },
          x: {
            grid: {
              display: false,
            },
          },
        },
        interaction: {
          intersect: false,
          mode: "index",
        },
      },
    });
  }

  // Popular Airlines Donut Chart
  const airlinesCtx = document.getElementById("airlinesChart");
  if (airlinesCtx) {
    new Chart(airlinesCtx, {
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
              "var(--primary-color)",
              "var(--text-dark)",
              "var(--text-light)",
              "var(--extra-light)",
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
        plugins: {
          legend: {
            display: false,
          },
        },
      },
    });
  }
}

// Initialize sidebar functionality
function initializeSidebar() {
  const menuToggle = document.querySelector(".menu-toggle");
  const sidebar = document.querySelector(".sidebar");
  const mainContent = document.querySelector(".main-content");

  if (menuToggle && sidebar && mainContent) {
    menuToggle.addEventListener("click", function () {
      sidebar.classList.toggle("collapsed");
      mainContent.classList.toggle("expanded");
    });

    // Close sidebar on mobile when clicking outside
    document.addEventListener("click", function (e) {
      if (window.innerWidth <= 768) {
        if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
          sidebar.classList.add("collapsed");
          mainContent.classList.remove("expanded");
        }
      }
    });
  }

  // Handle admin profile click
  const adminProfile = document.querySelector(".admin-profile");
  if (adminProfile) {
    adminProfile.addEventListener("click", function () {
      // Có thể thêm dropdown menu hoặc action khác ở đây
      console.log("Admin profile clicked");
      // Ví dụ: showUserMenu();
    });
  }

  // Handle sidebar navigation
  const navLinks = document.querySelectorAll(".sidebar-nav a");
  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();

      // Remove active class from all links
      navLinks.forEach((l) => l.parentElement.classList.remove("active"));

      // Add active class to clicked link
      this.parentElement.classList.add("active");

      // Update page title
      const pageTitle = this.querySelector("span").textContent;
      document.querySelector(".main-header h1").textContent = pageTitle;
    });
  });
}

// Initialize search functionality
function initializeSearch() {
  const searchInput = document.querySelector(".search-bar input");
  if (searchInput) {
    searchInput.addEventListener("input", function () {
      const query = this.value.toLowerCase();

      // Simple search functionality - highlight matching content
      if (query.length > 2) {
        highlightSearchResults(query);
      } else {
        clearHighlights();
      }
    });

    // Add search icon click functionality
    const searchIcon = document.querySelector(".search-bar i");
    if (searchIcon) {
      searchIcon.addEventListener("click", function () {
        searchInput.focus();
      });
    }
  }
}

// Highlight search results
function highlightSearchResults(query) {
  const cards = document.querySelectorAll(
    ".kpi-card, .chart-card, .bottom-card"
  );

  cards.forEach((card) => {
    const text = card.textContent.toLowerCase();
    if (text.includes(query)) {
      card.style.border = "2px solid var(--primary-color)";
      card.style.boxShadow = "0 4px 12px rgba(135, 179, 234, 0.2)";
    } else {
      card.style.border = "";
      card.style.boxShadow = "";
    }
  });
}

// Clear search highlights
function clearHighlights() {
  const cards = document.querySelectorAll(
    ".kpi-card, .chart-card, .bottom-card"
  );
  cards.forEach((card) => {
    card.style.border = "";
    card.style.boxShadow = "";
  });
}

// Initialize notifications
function initializeNotifications() {
  const notificationBtn =
    document.querySelector(".icon-btn .fa-bell").parentElement;
  const notificationBadge = document.querySelector(".notification-badge");

  if (notificationBtn && notificationBadge) {
    notificationBtn.addEventListener("click", function () {
      // Simulate notification click
      showNotification("You have 5 new notifications");

      // Hide badge temporarily
      notificationBadge.style.display = "none";
      setTimeout(() => {
        notificationBadge.style.display = "block";
      }, 3000);
    });
  }
}

// Show notification toast
function showNotification(message) {
  // Create notification element
  const notification = document.createElement("div");
  notification.className = "notification-toast";
  notification.innerHTML = `
          <div class="notification-content">
              <i class="fas fa-bell"></i>
              <span>${message}</span>
          </div>
      `;

  // Add styles
  notification.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          background: var(--white);
          color: var(--text-dark);
          padding: 1rem 1.5rem;
          border-radius: var(--border-radius);
          box-shadow: var(--box-shadow);
          z-index: 10000;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          animation: slideInRight 0.3s ease;
      `;

  // Add animation keyframes
  if (!document.querySelector("#notification-styles")) {
    const style = document.createElement("style");
    style.id = "notification-styles";
    style.textContent = `
              @keyframes slideInRight {
                  from {
                      transform: translateX(100%);
                      opacity: 0;
                  }
                  to {
                      transform: translateX(0);
                      opacity: 1;
                  }
              }
              @keyframes slideOutRight {
                  from {
                      transform: translateX(0);
                      opacity: 1;
                  }
                  to {
                      transform: translateX(100%);
                      opacity: 0;
                  }
              }
          `;
    document.head.appendChild(style);
  }

  document.body.appendChild(notification);

  // Remove notification after 3 seconds
  setTimeout(() => {
    notification.style.animation = "slideOutRight 0.3s ease";
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

// Initialize animations and interactions
function initializeAnimations() {
  // Add hover effects to cards
  const cards = document.querySelectorAll(
    ".kpi-card, .chart-card, .bottom-card, .table-card"
  );

  cards.forEach((card) => {
    card.addEventListener("mouseenter", function () {
      this.style.transform = "translateY(-2px)";
    });

    card.addEventListener("mouseleave", function () {
      this.style.transform = "translateY(0)";
    });
  });

  // Initialize toggle buttons
  const toggleButtons = document.querySelectorAll(".toggle-btn");
  toggleButtons.forEach((button) => {
    button.addEventListener("click", function () {
      // Remove active class from all buttons in the same group
      const parent = this.parentElement;
      parent.querySelectorAll(".toggle-btn").forEach((btn) => {
        btn.classList.remove("active");
      });

      // Add active class to clicked button
      this.classList.add("active");
    });
  });

  // Add click effects to buttons
  const buttons = document.querySelectorAll("button, .see-all");
  buttons.forEach((button) => {
    button.addEventListener("click", function (e) {
      // Create ripple effect
      const ripple = document.createElement("span");
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      ripple.style.cssText = `
                  position: absolute;
                  width: ${size}px;
                  height: ${size}px;
                  left: ${x}px;
                  top: ${y}px;
                  background: rgba(135, 179, 234, 0.3);
                  border-radius: 50%;
                  transform: scale(0);
                  animation: ripple 0.6s linear;
                  pointer-events: none;
              `;

      this.style.position = "relative";
      this.style.overflow = "hidden";
      this.appendChild(ripple);

      setTimeout(() => {
        if (ripple.parentNode) {
          ripple.parentNode.removeChild(ripple);
        }
      }, 600);
    });
  });

  // Add ripple animation keyframes
  if (!document.querySelector("#ripple-styles")) {
    const style = document.createElement("style");
    style.id = "ripple-styles";
    style.textContent = `
              @keyframes ripple {
                  to {
                      transform: scale(4);
                      opacity: 0;
                  }
              }
          `;
    document.head.appendChild(style);
  }
}

// Utility functions
function formatNumber(num) {
  return new Intl.NumberFormat("vi-VN").format(num);
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

// Handle window resize
window.addEventListener("resize", function () {
  const sidebar = document.querySelector(".sidebar");
  const mainContent = document.querySelector(".main-content");

  if (window.innerWidth > 768) {
    sidebar.classList.remove("collapsed");
    mainContent.classList.remove("expanded");
  }
});

// Export functions for potential external use
window.DashboardUtils = {
  formatNumber,
  formatCurrency,
  showNotification,
  highlightSearchResults,
  clearHighlights,
};
// Theme toggle
const themeToggle = document.getElementById("theme-toggle");

function setThemeIcon(isDark) {
  if (isDark) {
    themeToggle.innerHTML = '<i class="fas fa-sun" aria-hidden="true"></i>';
  } else {
    themeToggle.innerHTML = '<i class="far fa-moon" aria-hidden="true"></i>';
  }
}

if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark-mode");
  setThemeIcon(true);
} else {
  setThemeIcon(false);
}

themeToggle.addEventListener("click", () => {
  const isDark = document.body.classList.toggle("dark-mode");
  setThemeIcon(isDark);
  localStorage.setItem("theme", isDark ? "dark" : "light");
});
