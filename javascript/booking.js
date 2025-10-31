document.addEventListener("DOMContentLoaded", () => {
  const findBtn = document.getElementById("find-flight-btn");
  if (findBtn) {
    findBtn.addEventListener("click", (event) => {
      event.preventDefault();
      const from = document.getElementById("from").value;
      const to = document.getElementById("to").value;
      const date = document.getElementById("departure-time").value;
      const tripType = document.querySelector('input[name="trip"]:checked')?.value;
      const returnDate = document.getElementById("return-time")?.value;

      if (!from || !to || !date) {
        alert("Vui lòng chọn đầy đủ thông tin!");
        return;
      }

      if (tripType === "roundtrip" && !returnDate) {
        alert("Vui lòng chọn ngày về cho vé khứ hồi!");
        return;
      }

      localStorage.setItem("tripType", tripType || "oneway");
      localStorage.setItem("returnDate", returnDate || "");

      window.location.href = `pages/booking.html?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${encodeURIComponent(date)}`;
    });
    return;
  }


  const container = document.getElementById("flight-list");
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const from = params.get("from");
  const to = params.get("to");
  const date = params.get("date");
  const tripType = localStorage.getItem("tripType") || "oneway";
  const returnDate = localStorage.getItem("returnDate") || "";

  window.isReturnStep = false;
  loadFlights(from, to, date, container);

  function loadFlights(from, to, date, container) {
    fetch("../flights_sample_102.csv")
      .then(res => res.text())
      .then(csv => {
        const flights = Papa.parse(csv.trim(), { header: true }).data;

        const filtered = flights.filter(f => {
          if (!f.f_time_from) return false;
          const flightDate = f.f_time_from.split(" ")[0];
          return (
            f.airport_from.includes(from) &&
            f.airport_to.includes(to) &&
            flightDate === date
          );
        });

        window.currentFlights = filtered;
        renderFlights(filtered, container, isReturnStep ? "return" : "depart");
      })
      .catch(err => {
        console.error("Lỗi khi load CSV:", err);
        container.innerHTML = "<p>Lỗi khi tải dữ liệu chuyến bay.</p>";
      });
  }
});

function renderFlights(flights, container, step) {
  container.innerHTML = "";

  const title = step === "depart"
    ? "<h2>Chọn chuyến đi</h2>"
    : "<h2>Chọn chuyến về</h2>";

  container.innerHTML += title;

  if (flights.length === 0) {
    container.innerHTML += "<p>Không tìm thấy chuyến bay phù hợp.</p>";
    return;
  }

  flights.forEach(f => {
    const flightCode = f.f_code || f.code;
    const card = document.createElement("div");
    card.className = "flight-card";
    card.innerHTML = `
      <div class="flight-info">
        <div class="time">
          <span class="depart">${f.f_time_from}</span>
          <span class="arrive">${f.f_time_to}</span>
        </div>
        <div class="route">
          <div class="from"><strong>${f.from}</strong> (${f.airport_from})</div>
          <div class="direct">✈........... Bay thẳng ...........✈</div>
          <div class="to"><strong>${f.to}</strong> (${f.airport_to})</div>
        </div>
        <div class="details">
          <p>✈ Mã chuyến bay: <strong>${flightCode}</strong></p>
          <p>💺 Hạng vé: <strong>${f.type}</strong></p>
        </div>
      </div>
      <div class="flight-price">
        <div class="price-block">
          <div class="price-label">từ</div>
          <div class="price-amount">${parseInt(f.total_price).toLocaleString()} VND</div>
          <div class="price-label">${f.type}</div>
        </div>
        <button class="confirm-btn" onclick="xacNhanChuyenBay('${flightCode}', '${step}')">Xác nhận</button>
      </div>
    `;
    container.appendChild(card);
  });
}

function xacNhanChuyenBay(maChuyenBay, step) {
  const flight = window.currentFlights.find(f => (f.f_code || f.code) === maChuyenBay);
  if (!flight) return;

  // Lưu toàn bộ dữ liệu chuyến bay vào localStorage
  if (step === "depart") {
    localStorage.setItem("departFlight", JSON.stringify(flight));

    const tripType = localStorage.getItem("tripType");
    if (tripType === "roundtrip") {
      // Chuyển sang chọn chuyến về
      window.isReturnStep = true;
      const from = flight.airport_to;
      const to = flight.airport_from;
      const returnDate = localStorage.getItem("returnDate");
      const container = document.getElementById("flight-list");

      container.innerHTML = "<p>Đang tải danh sách chuyến bay về...</p>";
      fetch("../flights_sample_102.csv")
        .then(res => res.text())
        .then(csv => {
          const flights = Papa.parse(csv.trim(), { header: true }).data;
          const filtered = flights.filter(f => {
            if (!f.f_time_from) return false;
            const flightDate = f.f_time_from.split(" ")[0];
            return (
              f.airport_from.includes(from) &&
              f.airport_to.includes(to) &&
              flightDate === returnDate
            );
          });
          window.currentFlights = filtered;
          renderFlights(filtered, container, "return");
        });
      return;
    }
  } else if (step === "return") {
    localStorage.setItem("returnFlight", JSON.stringify(flight));
  }

  window.location.href = `passenger-info.html?flight=${encodeURIComponent(maChuyenBay)}`;
}