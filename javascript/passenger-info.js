document.addEventListener("DOMContentLoaded", () => {
  // Hiển thị/ẩn phần tùy chọn khi tick checkbox
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

  // Xử lý khi nhấn nút xác nhận
  const passengerForm = document.querySelector(".passenger-info-form");
  passengerForm.addEventListener("submit", (e) => {
    e.preventDefault();

    // Lấy thông tin hành khách
    const passengerData = {
      Danh_xung: document.getElementById("title").value,
      Ho: document.getElementById("lastname").value,
      Ten_dem_va_ten: document.getElementById("firstname").value,
      Ngay_sinh: document.getElementById("dob").value,
      Email: document.getElementById("email").value,
      Ma_quoc_gia: document.getElementById("countrycode").value,
      So_dien_thoai: document.getElementById("phonenumber").value,
    };

    // Lấy thông tin dịch vụ bổ sung
    const baggage = document.getElementById("baggage").checked
      ? document.querySelector("select[name='baggage-weight']").value
      : "Không";
    const meal = document.getElementById("meal").checked
      ? document.querySelector("select[name='meal-type']").value
      : "Không";
    const serviceData = {
      Hanh_ly: baggage,
      Suat_an: meal,
    };

    // Gộp tất cả
    const fullData = { ...passengerData, ...serviceData };
    console.log("Dữ liệu hành khách:", fullData);

    localStorage.setItem("passengerInfo", JSON.stringify(fullData));

    window.location.href = "seat-selection.html";
  });
});

