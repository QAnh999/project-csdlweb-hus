// doc parameter cho oneway va roundtrip
document.addEventListener("DOMContentLoaded", () => {
  const findBtn = document.getElementById("find-flight-btn");
  if (findBtn) {
    findBtn.addEventListener("click", (event) => {
      event.preventDefault();
      const from = document.getElementById("from").value;
      const to = document.getElementById("to").value;
      const date = document.getElementById("departure-time").value;
      const tripType = document.querySelector('input[name="trip"]:checked').value;
      const returnDate = document.getElementById("return-time")?.value || "";

      if (!from || !to || !date) {
        alert("Vui lòng chọn đầy đủ thông tin!");
        return;
      }

      if (tripType === "roundtrip" && !returnDate){
        alert("Vui lòng chọn ngày về!");
        return;
      }

      let url = `pages/booking.html?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${encodeURIComponent(date)}&tripType=${tripType}`;

      if (tripType === "roundtrip"){
        url += `&returnDate=${encodeURIComponent(returnDate)}`;
      }

      window.location.href = url;
    });

    return;
  }

  const container = document.getElementById("flight-list");
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const from = params.get("from");
  const to = params.get("to");
  const date = params.get("date");
  const tripType = params.get("tripType") || "oneway";
  const returnDate = params.get("returnDate");

  fetch("../flights_processed.csv")
    .then(res => res.text())
    .then(csv => {
      const flights = Papa.parse(csv.trim(), { header: true }).data;

      // if (tripType) {
      //   renderRoundTrip(flights, container, {from, to, date, returnDate});
      // } else {
      //   renderOneWay(flights, container, {from, to, date});
      // }
      
      if (tripType === "roundtrip"){
        renderOutbound(flights,  container, {from, to, date});
      } else {
        renderOneWay(flights, container, {from, to, date});
      }


      // const filtered = flights.filter(f => {
      //   if (!f.f_time_from) return false;
      //   const flightDate = f.f_time_from.split(" ")[0];
      //   return (
      //     f.airport_from.includes(from) &&
      //     f.airport_to.includes(to) &&
      //     flightDate === date
      //   );
      // });

      // window.currentFlights = filtered;
      
      // renderFlights(filtered, container);
    })
    .catch(err => {
      console.error("Lỗi khi load CSV:", err);
      container.innerHTML = "<p>Lỗi khi tải dữ liệu chuyến bay.</p>";
    });
});

function renderOneWay(flights, container, {from, to, date}){
  const filtered = flights.filter(f => {
    if (!f.f_time_from){
      return false;
    }
    const d = f.f_time_from.split(" ")[0];
    return (f.airport_from.includes(from) && f.airport_to.includes(to) && d === date);
  });
  
  window.currentFlights = filtered;
  container.innerHTML = "<h3>Chuyến bay một chiều</h3>";
  renderFlights(filtered, container);
}


function renderOutbound(flights, container, {from, to, date}){
  localStorage.removeItem("selectedOutbound");

  const outbound = flights.filter(f => {
    const d = f.f_time_from?.split(" ")[0];
    return (f.airport_from.includes(from) && f.airport_to.includes(to) && d === date); 
  });

  window.currentFlights = outbound;
  container.innerHTML = "<h3>Chọn chuyến đi</h3>";
  renderFlights(outbound, container);
}


function renderInbound(){
  const params = new URLSearchParams(window.location.search);
  
  const from = params.get("from");
  const to = params.get("to");
  const returnDate = params.get("returnDate");

  fetch("../flights_processed.csv")
  .then(res => res.text())
  .then(csv => {
    const flights = Papa.parse(csv.trim(), {header: true}).data;

    const inbound = flights.filter(f => {
      const d = f.f_time_from?.split(" ")[0];
      return (f.airport_from.includes(to) && f.airport_to.includes(from) && d === returnDate);
    });

    window.currentFlights = inbound;
    const container = document.getElementById("flight-list");
    container.innerHTML = "<h3>Chọn chuyến về</h3>";
    renderFlights(inbound, container);
  });
}


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
            <div class="from"><strong>${f.from}</strong> (${f.airport_from})</div>
            <div class="direct">✈........... Bay thẳng ...........✈</div>
            <div class="to"><strong>${f.to}</strong> (${f.airport_to})</div>
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
  const params = new URLSearchParams(window.location.search);
  const tripType = params.get("tripType") || "oneway";
  const flight = window.currentFlights.find(f => (f.f_code || f.code) === maChuyenBay);

  if (!flight){
    return;
  }

  function normalizeFlight(f) {
  return {
    code: f.f_code || f.code,
    airport_from: f.airport_from,
    airport_to: f.airport_to,
    time_from: f.time_from || f.f_time_from,
    time_to: f.time_to || f.f_time_to,
    type: f.type,
    price: Number(f.total_price || f.price || 0)
  };
}

  if (tripType === "roundtrip"){
    const outbound = localStorage.getItem("selectedOutbound");

    if (!outbound){
      localStorage.setItem("selectedOutbound", JSON.stringify(normalizeFlight(flight)));
      alert("Đã chọn chuyến đi. Vui lòng chọn chuyến về.");
      renderInbound();
      return;
    }

    const outboundFlight = JSON.parse(outbound);
    const inboundFlight = normalizeFlight(flight);
    
    localStorage.setItem("bookingDraft", JSON.stringify({
      outbound: outboundFlight,
      inbound: inboundFlight,
      passenger: null,
      services: null,
      seatOutbound: null,
      seatInbound: null
    }));

    localStorage.removeItem("selectedOutbound");
    window.location.href = "passenger-info.html";
    return;
  }

  localStorage.setItem("bookingDraft", JSON.stringify({
    flight: normalizeFlight(flight), 
    passenger: null,
    services: null,
    seat: null
  }));

  window.location.href = "passenger-info.html";
}