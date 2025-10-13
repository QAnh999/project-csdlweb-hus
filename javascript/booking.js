function normalize(str) {
    return str?.normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\./g, "")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();
}

function normalizeLocation(name) {
    const map = {
        "tphcm": "tp ho chi minh",
        "tp. ho chi minh": "tp ho chi minh",
        "tp hcm": "tp ho chi minh",
        "ho chi minh": "tp ho chi minh",
    };
    const n = normalize(name);
    return map[n] || n;
}

document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const from = params.get("from");
    const to = params.get("to");
    const date = params.get("date");

    document.getElementById("result-title").textContent =
        `Kết quả chuyến bay từ ${from} đến ${to} (${date})`;

    fetch("flights_sample_102.csv")
        .then(res => res.text())
        .then(csv => {
            const parsed = Papa.parse(csv, { header: true });
            const data = parsed.data;

            const results = data.filter(f =>
                normalizeLocation(f.from).includes(normalizeLocation(from)) &&
                normalizeLocation(f.to).includes(normalizeLocation(to)) &&
                f.f_time_from?.slice(0, 10) === date
            );

            console.log("Kết quả tìm thấy:", results);
            renderFlights(results);
        })
        .catch(err => {
            console.error("Lỗi đọc file CSV:", err);
            document.getElementById("flight-list").innerHTML =
                "<p style='color:red'>Không thể tải dữ liệu chuyến bay.</p>";
        });
});

function renderFlights(flights) {
    const container = document.getElementById("flight-list");
    container.innerHTML = "";

    if (!flights.length) {
        container.innerHTML = "<p>Không tìm thấy chuyến bay phù hợp.</p>";
        return;
    }

    flights.forEach(f => {
        const card = document.createElement("div");
        card.className = "flight-card";
        card.innerHTML = `
        <div class="flight-info">
          <h3>${f.f_code || "Chưa rõ"} - ${f.code_name || ""}</h3>
          <p>${f.from} → ${f.to}</p>
          <p>Giờ khởi hành: ${f.f_time_from}</p>
          <p>Giờ đến: ${f.f_time_to}</p>
        </div>
        <div class="flight-price">
          <strong>${Number(f.total_price || 0).toLocaleString()} VND</strong>
          <p>${f.type || ""}</p>
        </div>
      `;
        container.appendChild(card);
    });
}