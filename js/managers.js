/*
const MANAGERS_API = {
  baseURL: "https://api.example.com/managers",
  endpoints: {
    getCustomers: "/customers",
    getAdmins: "/admins",
    getSuperAdmins: "/super-admins",
    getCustomer: "/customer",
    getAdmin: "/admin",
    updateCustomer: "/customer",
    updateAdmin: "/admin",
    createAdmin: "/admin",
    deleteCustomer: "/customer",
    deleteAdmin: "/admin",
    getBookingHistory: "/booking-history",
  },
};
*/

const USE_API = false; // Set to true when backend is ready

let customersData = [
  {
    id: 1,
    fullname: "Nguyễn Phương Bích",
    email: "npb342004@gmail.com",
    phone: "0123456789",
    gender: "Nữ",
    address: "Hà Nội, Việt Nam",
    joined: "October 2, 2010",
    lastLogin: "2025-01-13",
    status: "active",
    bookings: [
      {
        bookingId: 64,
        flightId: 52,
        bookingDate: "2025-01-14",
        paymentDate: "2025-01-16",
        status: "Hoàn thành",
      },
      {
        bookingId: 63,
        flightId: 49,
        bookingDate: "2025-01-13",
        paymentDate: "18/01/2025",
        status: "Hoàn thành",
      },
    ],
  },
  {
    id: 2,
    fullname: "Phương Bích",
    email: "phngbch04@gmail.com",
    phone: "",
    gender: "",
    address: "",
    joined: "October 3, 2011",
    lastLogin: "2025-01-12",
    status: "active",
    bookings: [],
  },
  {
    id: 3,
    fullname: "Nguyễn Văn A",
    email: "vana@gmail.com",
    phone: "0987654321",
    gender: "Nam",
    address: "Hồ Chí Minh, Việt Nam",
    joined: "March 13, 2018",
    lastLogin: "2025-01-10",
    status: "active",
    bookings: [],
  },
];

// Sample admin data
let adminsData = [
  {
    id: 1,
    username: "minhanh",
    fullname: "Trần Minh Anh",
    email: "minhanh@example.com",
    role: "Quản trị viên",
    status: "active",
    type: "admin",
  },
  {
    id: 2,
    username: "my",
    fullname: "Nguyễn Thị Hà My",
    email: "my@example.com",
    role: "Quản trị viên",
    status: "active",
    type: "admin",
  },
];

// Sample super admin data
let superAdminsData = [
  {
    id: 1,
    username: "superadmin",
    fullname: "Super Admin",
    email: "superadmin@lotustravel.com",
    role: "Siêu quản trị viên",
    status: "active",
    type: "super-admin",
  },
];

let currentTab = "customer";
let currentPage = 1;
let itemsPerPage = 10;
let searchQuery = "";
let filteredData = [];
let editingId = null;
let viewingCustomerId = null;

async function getCustomersAPI() {
  if (!USE_API) {
    return customersData;
  }
  // TODO: API call
}

/**
 * Get admins via API
 */
async function getAdminsAPI() {
  if (!USE_API) {
    return adminsData;
  }
  // TODO: API call
}

/**
 * Get super admins via API
 */
async function getSuperAdminsAPI() {
  if (!USE_API) {
    return superAdminsData;
  }
  // TODO: API call
}

/**
 * Get customer booking history via API
 */
async function getBookingHistoryAPI(customerId) {
  if (!USE_API) {
    const customer = customersData.find((c) => c.id === customerId);
    return customer ? customer.bookings || [] : [];
  }
  // TODO: API call
}

/**
 * Update customer via API
 */
async function updateCustomerAPI(customerId, data) {
  if (!USE_API) {
    const index = customersData.findIndex((c) => c.id === customerId);
    if (index !== -1) {
      customersData[index] = { ...customersData[index], ...data };
      return customersData[index];
    }
    return null;
  }
  // TODO: API call
}

/**
 * Update admin via API
 */
async function updateAdminAPI(adminId, data) {
  if (!USE_API) {
    const index = adminsData.findIndex((a) => a.id === adminId);
    if (index !== -1) {
      adminsData[index] = { ...adminsData[index], ...data };
      return adminsData[index];
    }
    return null;
  }
  // TODO: API call
}

/**
 * Create admin via API
 */
async function createAdminAPI(data) {
  if (!USE_API) {
    const newId =
      adminsData.length > 0 ? Math.max(...adminsData.map((a) => a.id)) + 1 : 1;
    const newAdmin = {
      id: newId,
      ...data,
      status: "active",
      type: data.role === "Siêu quản trị viên" ? "super-admin" : "admin",
    };
    adminsData.push(newAdmin);
    return newAdmin;
  }
  // TODO: API call
}

/**
 * Delete customer via API
 */
async function deleteCustomerAPI(customerId) {
  if (!USE_API) {
    customersData = customersData.filter((c) => c.id !== customerId);
    return true;
  }
  // TODO: API call
}

/**
 * Delete admin via API
 */
async function deleteAdminAPI(adminId) {
  if (!USE_API) {
    adminsData = adminsData.filter((a) => a.id !== adminId);
    return true;
  }
  // TODO: API call
}

// Initialize page
document.addEventListener("DOMContentLoaded", function () {
  function initWhenReady() {
    const tableBody = document.getElementById("table-body");
    const tabs = document.querySelectorAll(".tab-btn");

    if (tableBody && tabs.length > 0) {
      initializeTabs();
      initializeSearch();
      initializeAddButton();
      initializeModals();
      initializePagination();
      renderTable();
    } else {
      setTimeout(initWhenReady, 100);
    }
  }

  initWhenReady();
});

// Initialize tabs
function initializeTabs() {
  const tabs = document.querySelectorAll(".tab-btn");
  tabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      tabs.forEach((t) => t.classList.remove("active"));
      this.classList.add("active");
      currentTab = this.getAttribute("data-tab");
      currentPage = 1;
      filterData();
      renderTable();
    });
  });
}

// Initialize search
function initializeSearch() {
  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.addEventListener("input", function () {
      searchQuery = this.value.toLowerCase();
      currentPage = 1;
      filterData();
      renderTable();
    });
  }
}

// Filter data based on tab and search
async function filterData() {
  let data = [];

  if (currentTab === "customer") {
    data = await getCustomersAPI();
  } else if (currentTab === "admin") {
    data = await getAdminsAPI();
  } else if (currentTab === "super-admin") {
    data = await getSuperAdminsAPI();
  }

  // Filter by search query
  if (searchQuery) {
    filteredData = data.filter((item) => {
      const matchesId = item.id.toString().includes(searchQuery);
      const matchesName = (item.fullname || item.username || "")
        .toLowerCase()
        .includes(searchQuery);
      const matchesEmail = item.email.toLowerCase().includes(searchQuery);
      return matchesId || matchesName || matchesEmail;
    });
  } else {
    filteredData = data;
  }
}

// Render table headers
function renderTableHeaders() {
  const tableHead = document.getElementById("table-head");
  if (!tableHead) return;

  let headers = "";

  if (currentTab === "customer") {
    headers = `
      <tr>
        <th>Mã khách hàng</th>
        <th>Họ và tên</th>
        <th>Email</th>
        <th>Ngày tham gia</th>
        <th>Hành động</th>
      </tr>
    `;
  } else if (currentTab === "admin" || currentTab === "super-admin") {
    headers = `
      <tr>
        <th>ID quản trị viên</th>
        <th>Tên</th>
        <th>Vai trò</th>
        <th>E-mail</th>
        <th>Hành động</th>
      </tr>
    `;
  }

  tableHead.innerHTML = headers;
}

// Render table
async function renderTable() {
  await filterData();
  renderTableHeaders();

  const tableBody = document.getElementById("table-body");
  if (!tableBody) return;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const pageData = filteredData.slice(startIndex, endIndex);

  if (pageData.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; padding: 3rem; color: var(--text-light);">
          <i class="fas fa-users" style="font-size: 2rem; margin-bottom: 1rem; opacity: 0.5;"></i>
          <p>Không tìm thấy dữ liệu</p>
        </td>
      </tr>
    `;
    updatePagination();
    return;
  }

  if (currentTab === "customer") {
    tableBody.innerHTML = pageData
      .map((item) => createCustomerRow(item))
      .join("");
  } else {
    tableBody.innerHTML = pageData.map((item) => createAdminRow(item)).join("");
  }

  updatePagination();
}

// Create customer row HTML
function createCustomerRow(item) {
  return `
    <tr>
      <td>${item.id}</td>
      <td>${item.fullname}</td>
      <td>${item.email}</td>
      <td>
        <span class="joined-date">${item.joined}</span>
      </td>
      <td>
        <div class="action-buttons">
          <button class="action-btn edit" onclick="editCustomer(${item.id})" title="Chỉnh sửa">
            <i class="fas fa-pencil-alt"></i>
          </button>
          <button class="action-btn delete" onclick="deleteCustomer(${item.id})" title="Xóa">
            <i class="fas fa-trash"></i>
          </button>
          <button class="action-btn view" onclick="viewBookingHistory(${item.id})" title="Xem lịch sử đặt chuyến bay">
            <i class="fas fa-history"></i>
          </button>
        </div>
      </td>
    </tr>
  `;
}

// Create admin row HTML
function createAdminRow(item) {
  return `
    <tr>
      <td>${item.id}</td>
      <td>${item.fullname || item.username}</td>
      <td>${item.role}</td>
      <td>${item.email}</td>
      <td>
        <div class="action-buttons">
          <button class="action-btn edit" onclick="editAdmin(${
            item.id
          })" title="Chỉnh sửa">
            <i class="fas fa-pencil-alt"></i>
          </button>
          <button class="action-btn delete" onclick="deleteAdmin(${
            item.id
          })" title="Xóa">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  `;
}

// Initialize add button
function initializeAddButton() {
  const addBtn = document.getElementById("add-manager-btn");
  if (addBtn) {
    addBtn.addEventListener("click", function () {
      if (currentTab === "customer") {
        showNotification("Vui lòng chọn tab Quản trị viên để thêm mới");
        return;
      }
      openAdminModal();
    });
  }
}

// Initialize modals
function initializeModals() {
  // Customer modal
  const customerModal = document.getElementById("customer-modal");
  const closeCustomerModalBtn = document.getElementById(
    "close-customer-modal-btn"
  );
  const cancelCustomerBtn = document.getElementById("cancel-customer-form-btn");
  const customerForm = document.getElementById("customer-form");

  function closeCustomerModal() {
    if (customerModal) {
      customerModal.style.display = "none";
      if (customerForm) {
        customerForm.reset();
        editingId = null;
      }
    }
  }

  if (closeCustomerModalBtn) {
    closeCustomerModalBtn.addEventListener("click", closeCustomerModal);
  }

  if (cancelCustomerBtn) {
    cancelCustomerBtn.addEventListener("click", closeCustomerModal);
  }

  if (customerModal) {
    customerModal.addEventListener("click", function (e) {
      if (e.target === customerModal) {
        closeCustomerModal();
      }
    });
  }

  if (customerForm) {
    customerForm.addEventListener("submit", function (e) {
      e.preventDefault();
      handleCustomerSubmit();
    });
  }

  // Admin modal
  const adminModal = document.getElementById("admin-modal");
  const closeAdminModalBtn = document.getElementById("close-admin-modal-btn");
  const cancelAdminBtn = document.getElementById("cancel-admin-form-btn");
  const adminForm = document.getElementById("admin-form");

  function closeAdminModal() {
    if (adminModal) {
      adminModal.style.display = "none";
      if (adminForm) {
        adminForm.reset();
        editingId = null;
        document.getElementById("admin-modal-title").textContent =
          "Tạo quản trị viên mới";
      }
    }
  }

  if (closeAdminModalBtn) {
    closeAdminModalBtn.addEventListener("click", closeAdminModal);
  }

  if (cancelAdminBtn) {
    cancelAdminBtn.addEventListener("click", closeAdminModal);
  }

  if (adminModal) {
    adminModal.addEventListener("click", function (e) {
      if (e.target === adminModal) {
        closeAdminModal();
      }
    });
  }

  if (adminForm) {
    adminForm.addEventListener("submit", function (e) {
      e.preventDefault();
      handleAdminSubmit();
    });
  }

  // Booking history modal
  const bookingModal = document.getElementById("booking-history-modal");
  const closeBookingModalBtn = document.getElementById(
    "close-booking-modal-btn"
  );

  function closeBookingModal() {
    if (bookingModal) {
      bookingModal.style.display = "none";
      viewingCustomerId = null;
    }
  }

  if (closeBookingModalBtn) {
    closeBookingModalBtn.addEventListener("click", closeBookingModal);
  }

  if (bookingModal) {
    bookingModal.addEventListener("click", function (e) {
      if (e.target === bookingModal) {
        closeBookingModal();
      }
    });
  }

  // Booking search
  const bookingSearchInput = document.getElementById("booking-search-input");
  if (bookingSearchInput) {
    bookingSearchInput.addEventListener("input", function () {
      renderBookingHistory(viewingCustomerId);
    });
  }
}

// Edit customer
async function editCustomer(id) {
  const customer = customersData.find((c) => c.id === id);
  if (!customer) return;

  editingId = id;
  const modal = document.getElementById("customer-modal");
  const form = document.getElementById("customer-form");

  if (modal && form) {
    document.getElementById("customer-fullname").value =
      customer.fullname || "";
    document.getElementById("customer-email").value = customer.email || "";
    document.getElementById("customer-phone").value = customer.phone || "";
    document.getElementById("customer-gender").value = customer.gender || "";
    document.getElementById("customer-address").value = customer.address || "";

    modal.style.display = "flex";
  }
}

// Delete customer
async function deleteCustomer(id) {
  if (confirm("Bạn có chắc chắn muốn xóa khách hàng này?")) {
    await deleteCustomerAPI(id);
    filterData();
    renderTable();
    showNotification("Xóa khách hàng thành công!");
  }
}

// Handle customer form submit
async function handleCustomerSubmit() {
  const formData = {
    fullname: document.getElementById("customer-fullname").value,
    email: document.getElementById("customer-email").value,
    phone: document.getElementById("customer-phone").value,
    gender: document.getElementById("customer-gender").value,
    address: document.getElementById("customer-address").value,
  };

  await updateCustomerAPI(editingId, formData);

  const modal = document.getElementById("customer-modal");
  if (modal) {
    modal.style.display = "none";
  }

  filterData();
  renderTable();
  showNotification("Cập nhật khách hàng thành công!");
}

// View booking history
async function viewBookingHistory(customerId) {
  viewingCustomerId = customerId;
  const modal = document.getElementById("booking-history-modal");
  if (modal) {
    modal.style.display = "flex";
    await renderBookingHistory(customerId);
  }
}

// Render booking history
async function renderBookingHistory(customerId) {
  const bookings = await getBookingHistoryAPI(customerId);
  const searchQuery = document.getElementById("booking-search-input")
    ? document.getElementById("booking-search-input").value.toLowerCase()
    : "";

  let filteredBookings = bookings;
  if (searchQuery) {
    filteredBookings = bookings.filter(
      (b) =>
        b.bookingId.toString().includes(searchQuery) ||
        b.flightId.toString().includes(searchQuery)
    );
  }

  const bookingBody = document.getElementById("booking-history-body");
  if (!bookingBody) return;

  if (filteredBookings.length === 0) {
    bookingBody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; padding: 2rem; color: var(--text-light);">
          <p>Không có lịch sử đặt chuyến bay</p>
        </td>
      </tr>
    `;
    return;
  }

  bookingBody.innerHTML = filteredBookings
    .map(
      (booking) => `
      <tr>
        <td>${booking.bookingId}</td>
        <td>${booking.flightId}</td>
        <td>${booking.bookingDate}</td>
        <td>${booking.paymentDate}</td>
        <td>
          <span class="status-badge active">${booking.status}</span>
        </td>
      </tr>
    `
    )
    .join("");
}

// Edit admin
async function editAdmin(id) {
  const admin =
    adminsData.find((a) => a.id === id) ||
    superAdminsData.find((a) => a.id === id);
  if (!admin) return;

  editingId = id;
  openAdminModal(id, admin);
}

// Delete admin
async function deleteAdmin(id) {
  if (confirm("Bạn có chắc chắn muốn xóa quản trị viên này?")) {
    await deleteAdminAPI(id);
    filterData();
    renderTable();
    showNotification("Xóa quản trị viên thành công!");
  }
}

// Open admin modal
function openAdminModal(id = null, adminData = null) {
  const modal = document.getElementById("admin-modal");
  const form = document.getElementById("admin-form");
  const modalTitle = document.getElementById("admin-modal-title");

  if (!modal || !form) return;

  editingId = id;

  if (id && adminData) {
    // Edit mode
    document.getElementById("admin-username").value = adminData.username || "";
    document.getElementById("admin-email").value = adminData.email || "";
    document.getElementById("admin-fullname").value = adminData.fullname || "";
    document.getElementById("admin-role").value = adminData.role || "";
    document.getElementById("admin-password").required = false;
    modalTitle.textContent = "Chỉnh sửa quản trị viên";
  } else {
    // Add mode
    form.reset();
    document.getElementById("admin-password").required = true;
    modalTitle.textContent = "Tạo quản trị viên mới";
  }

  modal.style.display = "flex";
}

// Handle admin form submit
async function handleAdminSubmit() {
  const formData = {
    username: document.getElementById("admin-username").value,
    email: document.getElementById("admin-email").value,
    password: document.getElementById("admin-password").value,
    fullname: document.getElementById("admin-fullname").value,
    role: document.getElementById("admin-role").value,
  };

  if (editingId) {
    await updateAdminAPI(editingId, formData);
    showNotification("Cập nhật quản trị viên thành công!");
  } else {
    await createAdminAPI(formData);
    showNotification("Tạo quản trị viên mới thành công!");
  }

  const modal = document.getElementById("admin-modal");
  if (modal) {
    modal.style.display = "none";
    form.reset();
  }

  filterData();
  renderTable();
}

// Initialize pagination
function initializePagination() {
  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");

  if (prevBtn) {
    prevBtn.addEventListener("click", function () {
      if (currentPage > 1) {
        currentPage--;
        renderTable();
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", function () {
      const totalPages = Math.ceil(filteredData.length / itemsPerPage);
      if (currentPage < totalPages) {
        currentPage++;
        renderTable();
      }
    });
  }
}

// Update pagination
function updatePagination() {
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Update info (hidden)
  const paginationInfo = document.getElementById("pagination-info");
  if (paginationInfo) {
    paginationInfo.textContent = "";
  }

  // Update buttons
  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");

  if (prevBtn) {
    prevBtn.disabled = currentPage === 1;
  }

  if (nextBtn) {
    nextBtn.disabled = currentPage >= totalPages;
  }

  // Update page numbers with ellipsis
  const pageNumbers = document.getElementById("page-numbers");
  if (pageNumbers) {
    let html = "";

    if (totalPages <= 7) {
      // Show all pages if 7 or less
      for (let i = 1; i <= totalPages; i++) {
        html += `<span class="page-number ${
          i === currentPage ? "active" : ""
        }" onclick="goToPage(${i})">${i}</span>`;
      }
    } else {
      // Show with ellipsis
      if (currentPage <= 3) {
        // Show first 3, ellipsis, last
        for (let i = 1; i <= 3; i++) {
          html += `<span class="page-number ${
            i === currentPage ? "active" : ""
          }" onclick="goToPage(${i})">${i}</span>`;
        }
        html += `<span class="page-ellipsis">...</span>`;
        html += `<span class="page-number" onclick="goToPage(${totalPages})">${totalPages}</span>`;
      } else if (currentPage >= totalPages - 2) {
        // Show first, ellipsis, last 3
        html += `<span class="page-number" onclick="goToPage(1)">1</span>`;
        html += `<span class="page-ellipsis">...</span>`;
        for (let i = totalPages - 2; i <= totalPages; i++) {
          html += `<span class="page-number ${
            i === currentPage ? "active" : ""
          }" onclick="goToPage(${i})">${i}</span>`;
        }
      } else {
        // Show first, ellipsis, current-1, current, current+1, ellipsis, last
        html += `<span class="page-number" onclick="goToPage(1)">1</span>`;
        html += `<span class="page-ellipsis">...</span>`;
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          html += `<span class="page-number ${
            i === currentPage ? "active" : ""
          }" onclick="goToPage(${i})">${i}</span>`;
        }
        html += `<span class="page-ellipsis">...</span>`;
        html += `<span class="page-number" onclick="goToPage(${totalPages})">${totalPages}</span>`;
      }
    }

    pageNumbers.innerHTML = html;
  }
}

// Go to page
function goToPage(page) {
  currentPage = page;
  renderTable();
}

// Show notification
function showNotification(message) {
  if (window.DashboardUtils && window.DashboardUtils.showNotification) {
    window.DashboardUtils.showNotification(message);
  } else {
    console.log(message);
    alert(message);
  }
}

// Export functions
window.Managers = {
  editCustomer,
  deleteCustomer,
  editAdmin,
  deleteAdmin,
  viewBookingHistory,
  goToPage,
};
