// Component Loader - Load sidebar and header components
document.addEventListener("DOMContentLoaded", function () {
  loadSidebar();
  loadHeader();
  initializeThemeToggle();
  initializeSidebarNavigation();
});

// Load sidebar component
function loadSidebar() {
  const sidebarContainer = document.getElementById("sidebar-container");
  if (!sidebarContainer) return;

  fetch("components/sidebar.html")
    .then((response) => response.text())
    .then((html) => {
      sidebarContainer.innerHTML = html;
      // Set active menu item based on current page
      setActiveMenuItem();
      // Initialize sidebar toggle
      initializeSidebarToggle();
    })
    .catch((error) => {
      console.error("Error loading sidebar:", error);
    });
}

// Load header component
function loadHeader() {
  const headerContainer = document.getElementById("header-container");
  if (!headerContainer) return;

  fetch("components/header.html")
    .then((response) => response.text())
    .then((html) => {
      headerContainer.innerHTML = html;
      // Set page title
      setPageTitle();
      // Initialize theme toggle
      initializeThemeToggle();
    })
    .catch((error) => {
      console.error("Error loading header:", error);
    });
}

// Set active menu item based on current page
function setActiveMenuItem() {
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  const navLinks = document.querySelectorAll(".sidebar-nav a");

  navLinks.forEach((link) => {
    const href = link.getAttribute("href");
    // Check if current page matches href
    if (
      href === currentPage ||
      (currentPage === "" && href === "index.html") ||
      (currentPage === "flight.html" && href === "flight.html")
    ) {
      link.parentElement.classList.add("active");
    } else {
      link.parentElement.classList.remove("active");
    }
  });
}

// Set page title
function setPageTitle() {
  const pageTitle = document.getElementById("page-title");
  if (!pageTitle) return;

  // Get title from data attribute or use default
  const title = document.body.getAttribute("data-page-title") || "Dashboard";
  pageTitle.textContent = title;
}

// Initialize sidebar toggle
function initializeSidebarToggle() {
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
}

// Initialize theme toggle (works globally)
function initializeThemeToggle() {
  const themeToggle = document.getElementById("theme-toggle");
  if (!themeToggle) return;

  // Set initial theme
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-mode");
    setThemeIcon(true);
  } else {
    setThemeIcon(false);
  }

  // Theme toggle event
  themeToggle.addEventListener("click", function () {
    const isDark = document.body.classList.toggle("dark-mode");
    setThemeIcon(isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  });
}

// Set theme icon
function setThemeIcon(isDark) {
  const themeToggle = document.getElementById("theme-toggle");
  if (!themeToggle) return;

  if (isDark) {
    themeToggle.innerHTML = '<i class="fas fa-sun" aria-hidden="true"></i>';
  } else {
    themeToggle.innerHTML = '<i class="far fa-moon" aria-hidden="true"></i>';
  }
}

// Initialize sidebar navigation
function initializeSidebarNavigation() {
  // Handle sidebar navigation clicks
  document.addEventListener("click", function (e) {
    const navLink = e.target.closest(".sidebar-nav a");
    if (!navLink) return;

    const href = navLink.getAttribute("href");

    // Handle logout
    if (href === "#logout") {
      e.preventDefault();
      showLogoutConfirmation();
      return;
    }

    // Handle hash links (stay on same page)
    if (href.startsWith("#")) {
      e.preventDefault();
      // Update active state
      document
        .querySelectorAll(".sidebar-nav li")
        .forEach((li) => li.classList.remove("active"));
      navLink.parentElement.classList.add("active");
      return;
    }

    // Regular navigation - let browser handle it
  });
}

// Show logout confirmation dialog
function showLogoutConfirmation() {
  // Create modal backdrop
  const backdrop = document.createElement("div");
  backdrop.className = "logout-modal-backdrop";

  // Create modal dialog
  const modal = document.createElement("div");
  modal.className = "logout-modal";

  modal.innerHTML = `
    <h2>Xác nhận đăng xuất</h2>
    <p>Bạn có chắc chắn muốn đăng xuất không?</p>
    <div class="logout-modal-buttons">
      <button class="logout-cancel">Hủy</button>
      <button class="logout-confirm">Có</button>
    </div>
  `;

  backdrop.appendChild(modal);
  document.body.appendChild(backdrop);

  // Handle cancel button
  const cancelBtn = modal.querySelector(".logout-cancel");
  cancelBtn.addEventListener("click", function () {
    backdrop.style.animation = "fadeOut 0.2s ease";
    setTimeout(() => {
      if (backdrop.parentNode) {
        backdrop.parentNode.removeChild(backdrop);
      }
    }, 200);
  });

  const confirmBtn = modal.querySelector(".logout-confirm");
  confirmBtn.addEventListener("click", function () {
    sessionStorage.clear();
    localStorage.removeItem("isLoggedIn");

    history.pushState({ loggedOut: true }, "", "login.html");

    setTimeout(() => {
      window.location.replace("login.html");
    }, 100);
  });
}

// Apply theme on page load (for all pages)
window.addEventListener("DOMContentLoaded", function () {
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-mode");
  }
});
