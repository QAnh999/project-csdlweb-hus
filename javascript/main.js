// menu button
// const menuBtn = document.getElementById("menu-btn");
// const navLinks = document.getElementById("nav-links");

// if (menuBtn && navLinks) {
//   const menuBtnIcon = menuBtn.querySelector("i");

//   menuBtn.addEventListener("click", () => {
//     navLinks.classList.toggle("open");
//     const isOpen = navLinks.classList.contains("open");
//     menuBtnIcon.setAttribute("class", isOpen ? "ri-close-line" : "ri-menu-line");
//   });

//   navLinks.addEventListener("click", () => {
//     navLinks.classList.remove("open");
//     menuBtnIcon.setAttribute("class", "ri-menu-line");
//   });
// }

// an hien ngay ve 
function updateReturnDate() {
  const selectedTrip = document.querySelector('input[name="trip"]:checked');
  const returnDate = document.getElementById("return-date");
  if (!selectedTrip || !returnDate) return;
  if (selectedTrip.value === "oneway") {
    returnDate.style.display = "none";
  } else {
    returnDate.style.display = "flex";
  }
}


// an hien tab con trong phan Lam thu tuc
const subTabs = document.querySelectorAll(".checkin-tabs .tab");
const subForms = document.querySelectorAll(".checkin-container .tab-content");

subTabs.forEach((subTab) => {
  subTab.addEventListener("click", () => {
    subTabs.forEach((t) => t.classList.remove("active"));
    subTab.classList.add("active");
    subForms.forEach((form) => form.classList.remove("active"));
    const target = document.getElementById(subTab.dataset.sub);
    if (target) target.classList.add("active");
  });
});


// popup hanh khach
document.addEventListener("DOMContentLoaded", function () {
  const tripRadios = document.querySelectorAll('input[name="trip"]');
  tripRadios.forEach(radio => {
    radio.addEventListener("change", updateReturnDate);
  });
  updateReturnDate();

  document.addEventListener("click", (e) => {
    const popup = document.getElementById("passenger-popup");
    const box = document.querySelector(".passenger-box");
    if (popup && !popup.contains(e.target) && !box.contains(e.target)) {
      popup.classList.remove("active");
    }
  });
  const tabs = document.querySelectorAll(".booking-tabs .tab");
  const mainSections = document.querySelectorAll(
    ".booking-container, .checkin-container, .management-container"
  );

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      mainSections.forEach(sec => sec.classList.remove("active"));

      tab.classList.add("active");
      const target = document.querySelector(`.${tab.dataset.tab}-container`);
      if (target) target.classList.add("active");

      if (tab.dataset.tab === "booking") {
        updateReturnDate();
      }
    });
  });

  const defaultTab = document.querySelector('.tab[data-tab="booking"]');
  if (defaultTab) defaultTab.classList.add("active");
  const bookingContainer = document.querySelector(".booking-container");
  if (bookingContainer) bookingContainer.classList.add("active");
});


// tinh toan so luong hanh khach
function togglePassengerPopup() {
  document.getElementById("passenger-popup").classList.toggle("active");
}

function changeCount(type, change) {
  const el = document.getElementById(`${type}-count`);
  let current = parseInt(el.textContent);
  current = Math.max(0, current + change);
  el.textContent = current;

  const adult = parseInt(document.getElementById("adult-count").textContent);
  const child = parseInt(document.getElementById("child-count").textContent);
  const infant = parseInt(document.getElementById("infant-count").textContent);
  document.getElementById("passenger-summary").textContent = adult + child + infant;
}


// Xử lý form "Tìm chuyến bay"
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#booking");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const from = document.querySelector("#from").selectedOptions[0].text.split("(")[0].trim();
    const to = document.querySelector("#to").selectedOptions[0].text.split("(")[0].trim();
    const date = document.querySelector("#departure-time").value;

    if (!from || !to || !date) {
      alert("Vui lòng chọn đầy đủ nơi đi, nơi đến và ngày đi!");
      return;
    }

    const query = new URLSearchParams({ from, to, date }).toString();
    window.location.href = `flights.html?${query}`;
  });
});
