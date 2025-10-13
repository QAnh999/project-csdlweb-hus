document.addEventListener("DOMContentLoaded", () => {
  fetch("flights_sample_102.csv")
    .then(res => res.text())
    .then(csv => {
      const data = Papa.parse(csv.trim(), { header: true }).data;
      renderFlights(data);
    })
    .catch(err => console.error("Lỗi khi load CSV:", err));
});

function renderFlights(flights) {
  const container = document.getElementById("flight-list");
  container.innerHTML = "";

  flights.forEach(f => {
    if (!f.id) return; 

    const card = document.createElement("div");
    card.className = "flight-card";
    card.innerHTML = `
      <div class="flight-info">
        <h3>${f.f_time_from} → ${f.f_time_to}</h3>
        <p><strong>${f.from}</strong> → <strong>${f.to}</strong></p>
        <p>Mã chuyến bay: ${f.f_code || f.code}</p>
        <p>Loại vé: ${f.type || "Economy"}</p>
    </div>
      <div class="flight-price">
        <div>Giá vé</div>
        <div style="font-size:1.3rem;">${f.total_price}</div>
        <div>VND</div>
      </div>
    `;
    container.appendChild(card);
  });
}
