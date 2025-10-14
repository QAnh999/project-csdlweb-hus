// document.addEventListener("DOMContentLoaded", () => {
//   fetch("flights_sample_102.csv")
//     .then(res => res.text())
//     .then(csv => {
//       const data = Papa.parse(csv.trim(), { header: true }).data;
//       renderFlights(data);
//     })
//     .catch(err => console.error("Lỗi khi load CSV:", err));
// });

// function renderFlights(flights) {
//   const container = document.getElementById("flight-list");
//   container.innerHTML = "";

//   flights.forEach(f => {
//     if (!f.id) return; 

//     const card = document.createElement("div");
//     card.className = "flight-card";
//     card.innerHTML = `
//       <div class="flight-info">
//         <h3>${f.f_time_from} → ${f.f_time_to}</h3>
//         <p><strong>${f.from}</strong> → <strong>${f.to}</strong></p>
//         <p>Mã chuyến bay: ${f.f_code || f.code}</p>
//         <p>Loại vé: ${f.type || "Economy"}</p>
//     </div>
//       <div class="flight-price">
//         <div>Giá vé</div>
//         <div style="font-size:1.3rem;">${f.total_price}</div>
//         <div>VND</div>
//       </div>
//     `;
//     container.appendChild(card);
//   });
// }

// // --- Xử lý nút "Tìm chuyến bay" ---
// document.addEventListener("DOMContentLoaded", () => {
//   const findBtn = document.getElementById("find-flight-btn");
//   if (!findBtn) return;

//   findBtn.addEventListener("click", (event) => {
//     event.preventDefault(); // Ngăn reload form

//     const from = document.getElementById("from").value;
//     const to = document.getElementById("to").value;
//     const date = document.getElementById("departure-time").value;

//     if (!from || !to || !date) {
//       alert("Vui lòng chọn đầy đủ thông tin trước khi tìm chuyến bay!");
//       return;
//     }

//     // Chuyển sang trang flights.html và truyền tham số
//     window.location.href = `flights.html?from=${from}&to=${to}&date=${date}`;
//   });
// });

document.addEventListener("DOMContentLoaded", () => {
  // --- Nếu có nút tìm chuyến bay (index.html)
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

      window.location.href = `flights.html?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${encodeURIComponent(date)}`;
    });
    return;
  }

  // --- Nếu có #flight-list (flights.html)
  const container = document.getElementById("flight-list");
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const from = params.get("from");
  const to = params.get("to");
  const date = params.get("date");

  fetch("flights_sample_102.csv")
    .then(res => res.text())
    .then(csv => {
      const flights = Papa.parse(csv.trim(), { header: true }).data;

      const filtered = flights.filter(f => {
        if (!f.f_time_from) return false;
        const flightDate = f.f_time_from.split(" ")[0]; // chỉ lấy yyyy-mm-dd
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
        </div>
      </div>

    `;
    container.appendChild(card);
  });
}
