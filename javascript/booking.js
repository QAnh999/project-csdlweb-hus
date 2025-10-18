document.addEventListener("DOMContentLoaded", () => {
  const findBtn = document.getElementById("find-flight-btn");
  if (findBtn) {
    findBtn.addEventListener("click", (event) => {
      event.preventDefault();
      const from = document.getElementById("from").value;
      const to = document.getElementById("to").value;
      const date = document.getElementById("departure-time").value;

      if (!from || !to || !date) {
        alert("Vui lòng chọn đầy đủ thông tin!");
        return;
      }

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

      renderFlights(filtered, container);
    })
    .catch(err => {
      console.error("Lỗi khi load CSV:", err);
      container.innerHTML = "<p>Lỗi khi tải dữ liệu chuyến bay.</p>";
    });
});

function renderFlights(flights, container) {
  container.innerHTML = "";

  if (flights.length === 0) {
    container.innerHTML = "<p>Không tìm thấy chuyến bay phù hợp.</p>";
    return;
  }

  flights.forEach(f => {
    const flightCode = f.f_code || f.code;
    const card = document.createElement("div");
    card.className = "flight-card";
    card.innerHTML = `
      <div class="flight-card">
        <div class="flight-info">
          <div class="time">
            <span class="depart">${f.f_time_from}</span>
            <span class="arrive">${f.f_time_to}</span>
          </div>

          <div class="route">
            <strong>${f.from}</strong> (${f.airport_from})
            ✈........... Bay thẳng ...........✈
            <strong>${f.to}</strong> (${f.airport_to})
          </div>

          <div class="details">
            <p>✈ Mã chuyến bay: <strong>${f.f_code || f.code}</strong></p>
            <p>💺 Hạng vé: <strong>${f.type}</strong></p>
          </div>
        </div>

        <div class="flight-price">
          <div class="price-block">
            <div class="price-label">từ</div>
            <div class="price-amount">${parseInt(f.total_price).toLocaleString()} VND</div>
            <div class="price-label">${f.type}</div>
          </div>
          <button class="confirm-btn" onclick="xacNhanChuyenBay('${flightCode}')">Xác nhận</button>
        </div>
      </div>

    `;
    container.appendChild(card);
  });
}

function xacNhanChuyenBay(maChuyenBay) {
  window.location.href = `passenger-info.html?flight=${encodeURIComponent(maChuyenBay)}`;
}