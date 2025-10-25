document.addEventListener("DOMContentLoaded", () => {
    const passengerInfo = JSON.parse(localStorage.getItem("pasengerInfo"));
    const flightInfo = JSON.parse(localStorage.getItem("flightInfo"));
    const seatInfo = JSON.parse(localStorage.getItem("seatInfo"));

    const summary = document.getElementById("summary");
    if (passengerInfo && flightInfo){
        summary.innerHTML = `
            <h2>Xác nhận thông tin</h2>
            <p>Mã chuyến bay: ${flightInfo.code}</p>
            <p>Nơi đi: ${flightInfo.from}</p>
            <p>Nơi đến: ${flightInfo.to}</p>
            <p>Giờ bay: ${flightInfo.time_from}</p>
            <p>Hạng vé: ${flightInfo.type}</p>
        `
    }
}) 