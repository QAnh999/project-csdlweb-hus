document.addEventListener("DOMContentLoaded", () => {
  // service options 
  const services = [
    { checkbox: "baggage", options: "baggage-options" },
    { checkbox: "meal", options: "meal-options" },
  ];

  services.forEach(({ checkbox, options }) => {
    const check = document.getElementById(checkbox);
    const detail = document.getElementById(options);
    check.addEventListener("change", () => {
      detail.style.display = check.checked ? "block" : "none";
    });
  });


  // submit form
  const passengerForm = document.querySelector(".passenger-info-form");
  passengerForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const passengerData = {
      Danh_xung: document.getElementById("title").value,
      Ho: document.getElementById("lastname").value.trim(),
      Ten_dem_va_ten: document.getElementById("firstname").value.trim(),
      Ngay_sinh: document.getElementById("dob").value,
      Email: document.getElementById("email").value.trim(),
      Ma_quoc_gia: document.getElementById("countrycode").value.trim(),
      So_dien_thoai: document.getElementById("phonenumber").value.trim(),
    };

    let baggageInfo = { type: "Không", price: 0 };
    let mealInfo = { type: "Không", price: 0 };

    const baggageCheckbox = document.getElementById("baggage");
    if (baggageCheckbox.checked) {
      const baggageSelect = document.querySelector("select[name='baggage-weight']");
      const selected = baggageSelect.options[baggageSelect.selectedIndex];
      baggageInfo = {
        type: selected.value || "Không",
        price: Number(selected.dataset.price || 0),
      };
    }

    const mealCheckbox = document.getElementById("meal");
    if (mealCheckbox.checked) {
      const mealSelect = document.querySelector("select[name='meal-type']");
      const selected = mealSelect.options[mealSelect.selectedIndex];
      mealInfo = {
        type: selected.value || "Không",
        price: Number(selected.dataset.price || 0),
      };
    }


    // load bookingDraft
    const bookingDraft = JSON.parse(localStorage.getItem("bookingDraft"));

    if (!bookingDraft){
      alert("Không tìm thấy thông tin chuyến bay.");
      return;
    }

    const isOneWay = !!bookingDraft?.flight;
    const isRoundTrip = !!(bookingDraft?.outbound && bookingDraft?.inbound);

    if (!isOneWay && !isRoundTrip){
      alert("Thiếu thông tin chuyến bay.");
      return;
    }

    bookingDraft.passenger = passengerData;
    bookingDraft.services = {
      baggage: baggageInfo,
      meal: mealInfo
    };

    localStorage.setItem("bookingDraft", JSON.stringify(bookingDraft));
    
    if (isRoundTrip){
      window.location.href = "seat-selection.html?leg=outbound";
    } else {
      window.location.href = "seat-selection.html";
    }
  });
});
