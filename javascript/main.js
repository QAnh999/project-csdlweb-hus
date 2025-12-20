// // an hien ngay ve 
// function updateReturnDate() {
//   const selectedTrip = document.querySelector('input[name="trip"]:checked');
//   const returnDate = document.getElementById("return-date");
//   if (!selectedTrip || !returnDate) return;
//   if (selectedTrip.value === "oneway") {
//     returnDate.style.display = "none";
//   } else {
//     returnDate.style.display = "flex";
//   }
// }


// // an hien tab con trong phan Lam thu tuc
// const subTabs = document.querySelectorAll(".checkin-tabs .tab");
// const subForms = document.querySelectorAll(".checkin-container .tab-content");

// subTabs.forEach((subTab) => {
//   subTab.addEventListener("click", () => {
//     subTabs.forEach((t) => t.classList.remove("active"));
//     subTab.classList.add("active");
//     subForms.forEach((form) => form.classList.remove("active"));
//     const target = document.getElementById(subTab.dataset.sub);
//     if (target) target.classList.add("active");
//   });
// });


// // popup hanh khach
// document.addEventListener("DOMContentLoaded", function () {
//   const tripRadios = document.querySelectorAll('input[name="trip"]');
//   tripRadios.forEach(radio => {
//     radio.addEventListener("change", updateReturnDate);
//   });
//   updateReturnDate();

//   document.addEventListener("click", (e) => {
//     const popup = document.getElementById("passenger-popup");
//     const box = document.querySelector(".passenger-box");
//     if (popup && !popup.contains(e.target) && !box.contains(e.target)) {
//       popup.classList.remove("active");
//     }
//   });
//   const tabs = document.querySelectorAll(".booking-tabs .tab");
//   const mainSections = document.querySelectorAll(
//     ".booking-container, .checkin-container, .management-container"
//   );

//   tabs.forEach(tab => {
//     tab.addEventListener("click", () => {
//       tabs.forEach(t => t.classList.remove("active"));
//       mainSections.forEach(sec => sec.classList.remove("active"));

//       tab.classList.add("active");
//       const target = document.querySelector(`.${tab.dataset.tab}-container`);
//       if (target) target.classList.add("active");

//       if (tab.dataset.tab === "booking") {
//         updateReturnDate();
//       }
//     });
//   });

//   const defaultTab = document.querySelector('.tab[data-tab="booking"]');
//   if (defaultTab) defaultTab.classList.add("active");
//   const bookingContainer = document.querySelector(".booking-container");
//   if (bookingContainer) bookingContainer.classList.add("active");
// });


// // tinh toan so luong hanh khach
// function togglePassengerPopup() {
//   document.getElementById("passenger-popup").classList.toggle("active");
// }

// function changeCount(type, change) {
//   const el = document.getElementById(`${type}-count`);
//   let current = parseInt(el.textContent);
//   current = Math.max(0, current + change);
//   el.textContent = current;

//   const adult = parseInt(document.getElementById("adult-count").textContent);
//   const child = parseInt(document.getElementById("child-count").textContent);
//   const infant = parseInt(document.getElementById("infant-count").textContent);
//   document.getElementById("passenger-summary").textContent = adult + child + infant;
// }


// document.addEventListener("DOMContentLoaded", () => {
//   const bookingForm = document.getElementById("booking");
//   if (bookingForm) {
//     bookingForm.addEventListener("submit", function (e) {
//       e.preventDefault();
//       const from = document.getElementById("from").value;
//       const to = document.getElementById("to").value;
//       const date = document.getElementById("departure-time").value;

//       if (!from || !to || !date) {
//         alert("Vui lòng chọn đầy đủ thông tin chuyến bay!");
//         return;
//       }

//       window.location.href = `pages/booking.html?from=${from}&to=${to}&date=${date}`;
//     });
//   }
// });

// document.addEventListener("DOMContentLoaded", () => {
//     const btnSearch = document.getElementById("btn-search-flight");

//     btnSearch.addEventListener("click", () => {
//         const bookingCode = document.getElementById("flight-code").value.trim().toUpperCase();
//         const lastName = document.getElementById("flight-lastname").value.trim().toUpperCase();

//         if (!bookingCode || !lastName) {
//             alert("Vui lòng nhập đầy đủ thông tin!");
//             return;
//         }

//         const bookingStr = localStorage.getItem(`booking_${bookingCode}`);
//         if (!bookingStr) {
//             alert("Mã đặt chỗ không tồn tại");
//             return;
//         }

//         const booking = JSON.parse(bookingStr);

//         if (!booking.passenger || booking.passenger.Ho.trim().toUpperCase() !== lastName) {
//             alert("Họ không khớp với mã đặt chỗ");
//             return;
//         }

//         localStorage.setItem("current_booking_code", bookingCode);
//         window.location.href = "../pages/managebooking.html";
//     });
// });

// document.addEventListener("DOMContentLoaded", () => {
//     const btnCheckin = document.getElementById("btn-checkin");
//     if (btnCheckin) {
//         btnCheckin.addEventListener("click", () => {
//             const bookingCode = document.getElementById("checkin-code").value.trim().toUpperCase();
//             const lastName = document.getElementById("checkin-lastname").value.trim().toUpperCase();
//             const result = document.getElementById("checkin-result");

//             result.innerHTML = "";

//             if (!bookingCode || !lastName) {
//                 result.innerHTML = `<p style="color:red; text-align:center; margin-top:10px;">Vui lòng nhập đầy đủ thông tin!</p>`;
//                 return;
//             }

//             const bookingStr = localStorage.getItem(`booking_${bookingCode}`);
//             if (!bookingStr) {
//                 result.innerHTML = `<p style="color:red; text-align:center; margin-top:10px;">Mã đặt chỗ không tồn tại</p>`;
//                 return;
//             }

//             const booking = JSON.parse(bookingStr);

//             if (!booking.passenger || booking.passenger.Ho.trim().toUpperCase() !== lastName) {
//                 result.innerHTML = `<p style="color:red; text-align:center; margin-top:10px;">Họ không khớp với mã đặt chỗ</p>`;
//                 return;
//             }

//             if (booking.checkedIn) {
//                 result.innerHTML = `<p style="color:red; text-align:center; margin-top:10px;">Bạn đã làm thủ tục trước đó</p>`;
//                 return;
//             }

//             localStorage.setItem("current_checkin_code", bookingCode);

//             window.location.href = "../pages/checkin.html";
//         });
//     }
//   });
  
// document.addEventListener("DOMContentLoaded", () => {
//   const bookingForm = document.getElementById("booking");

//   if (!bookingForm){
//     return;
//   }

//   bookingForm.addEventListener("submit", function(e) {
//     const from = document.getElementById("from").value;
//     const to = document.getElementById("to").value;
//     const departureDate = document.getElementById("departure-time").value;
//     const returnDate = document.getElementById("return-time").value;
//     const tripType = document.querySelector('input[name="trip"]:checked').value;

//     if (tripType === "oneway"){
//       return;
//     }

//     e.preventDefault();

//     if (!from || !to || !departureDate){
//       alert("Vui lòng nhập đầy đủ thông tin chuyến đi!");
//       return;
//     }

//     if (from === to){
//       alert("Điểm đi và điểm đến không được trùng nhau!");
//       return;
//     }

//     if (tripType === "roundtrip"){
//       if (!returnDate){
//         alert("Vui lòng chọn ngày về!");
//         return;
//       }

//       if (returnDate < departureDate){
//         alert("Ngày về phải sau ngày đi!");
//         return;
//       }
//     }

//     let url = `pages/booking.html?from=${encodeURIComponent(from)}` +
//               `&to=${encodeURIComponent(to)}` +
//               `&departureDate=${departureDate}` +
//               `&tripType=${tripType}`;

//     if (tripType === "roundtrip"){
//       url += `&returnDate=${returnDate}`;
//     }

//     window.location.href = url;
//   });
// });





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


// popup hanh khach + tab booking
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


// ==========================
// SUBMIT CŨ – ONE WAY
// ==========================
document.addEventListener("DOMContentLoaded", () => {
  const bookingForm = document.getElementById("booking");
  if (!bookingForm) return;

  bookingForm.addEventListener("submit", function (e) {
    const tripType = document.querySelector('input[name="trip"]:checked').value;
    if (tripType !== "oneway") return;

    e.preventDefault();

    const from = document.getElementById("from").value;
    const to = document.getElementById("to").value;
    const date = document.getElementById("departure-time").value;

    if (!from || !to || !date) {
      alert("Vui lòng chọn đầy đủ thông tin chuyến bay!");
      return;
    }

    window.location.href =
      `pages/booking.html?from=${encodeURIComponent(from)}` +
      `&to=${encodeURIComponent(to)}` +
      `&date=${date}`;
  });
});


// ==========================
// SUBMIT MỚI – ROUND TRIP
// ==========================
document.addEventListener("DOMContentLoaded", () => {
  const bookingForm = document.getElementById("booking");
  if (!bookingForm) return;

  bookingForm.addEventListener("submit", function (e) {
    const tripType = document.querySelector('input[name="trip"]:checked').value;
    if (tripType !== "roundtrip") return;

    e.preventDefault();

    const from = document.getElementById("from").value;
    const to = document.getElementById("to").value;
    const departureDate = document.getElementById("departure-time").value;
    const returnDate = document.getElementById("return-time").value;

    if (!from || !to || !departureDate) {
      alert("Vui lòng nhập đầy đủ thông tin chuyến đi!");
      return;
    }

    if (from === to) {
      alert("Điểm đi và điểm đến không được trùng nhau!");
      return;
    }

    if (!returnDate) {
      alert("Vui lòng chọn ngày về!");
      return;
    }

    if (returnDate < departureDate) {
      alert("Ngày về phải sau ngày đi!");
      return;
    }

    // 🔥 GỬI date để booking.html đọc được
    let url =
      `pages/booking.html?from=${encodeURIComponent(from)}` +
      `&to=${encodeURIComponent(to)}` +
      `&date=${departureDate}` +
      `&tripType=roundtrip` +
      `&returnDate=${returnDate}`;

    window.location.href = url;
  });
});


// ==========================
// QUẢN LÝ ĐẶT CHỖ
// ==========================
document.addEventListener("DOMContentLoaded", () => {
  const btnSearch = document.getElementById("btn-search-flight");
  if (!btnSearch) return;

  btnSearch.addEventListener("click", () => {
    const bookingCode = document.getElementById("flight-code").value.trim().toUpperCase();
    const lastName = document.getElementById("flight-lastname").value.trim().toUpperCase();

    if (!bookingCode || !lastName) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    const bookingStr = localStorage.getItem(`booking_${bookingCode}`);
    if (!bookingStr) {
      alert("Mã đặt chỗ không tồn tại");
      return;
    }

    const booking = JSON.parse(bookingStr);

    if (!booking.passenger || booking.passenger.Ho.trim().toUpperCase() !== lastName) {
      alert("Họ không khớp với mã đặt chỗ");
      return;
    }

    localStorage.setItem("current_booking_code", bookingCode);
    window.location.href = "../pages/managebooking.html";
  });
});



// CHECK-IN
document.addEventListener("DOMContentLoaded", () => {
  const btnCheckin = document.getElementById("btn-checkin");
  if (!btnCheckin) return;

  btnCheckin.addEventListener("click", () => {
    const bookingCode = document.getElementById("checkin-code").value.trim().toUpperCase();
    const lastName = document.getElementById("checkin-lastname").value.trim().toUpperCase();
    const result = document.getElementById("checkin-result");

    result.innerHTML = "";

    if (!bookingCode || !lastName) {
      result.innerHTML =
        `<p style="color:red; text-align:center; margin-top:10px;">Vui lòng nhập đầy đủ thông tin!</p>`;
      return;
    }

    const bookingStr = localStorage.getItem(`booking_${bookingCode}`);
    if (!bookingStr) {
      result.innerHTML =
        `<p style="color:red; text-align:center; margin-top:10px;">Mã đặt chỗ không tồn tại</p>`;
      return;
    }

    const booking = JSON.parse(bookingStr);

    if (!booking.passenger || booking.passenger.Ho.trim().toUpperCase() !== lastName) {
      result.innerHTML =
        `<p style="color:red; text-align:center; margin-top:10px;">Họ không khớp với mã đặt chỗ</p>`;
      return;
    }

    if (booking.type === "roundtrip") {
      if (booking.checkedInOutbound === undefined) booking.checkedInOutbound = false;
      if (booking.checkedInInbound === undefined) booking.checkedInInbound = false;

      if (booking.checkedInOutbound && booking.checkedInInbound) {
        result.innerHTML =
          `<p style="color:red; text-align:center; margin-top:10px;">Bạn đã check-in cả 2 chặng</p>`;
        return;
      }
    }

    if (booking.checkedIn) {
      result.innerHTML =
        `<p style="color:red; text-align:center; margin-top:10px;">Bạn đã làm thủ tục trước đó</p>`;
      return;
    }

    localStorage.setItem("current_checkin_code", bookingCode);
    window.location.href = "../pages/checkin.html";
  });
});
