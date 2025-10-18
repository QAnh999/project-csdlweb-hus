document.addEventListener("DOMContentLoaded", () => {
  const seatMap = document.getElementById("seat-map");

  // Tạo danh sách ghế (6 cột x 10 hàng)
  const rows = 10;
  const cols = ["A", "B", "C", "D", "E", "F"];

  // Một số ghế đã đặt trước
  const bookedSeats = ["2B", "3C", "5E", "7A", "9F"];

  let selectedSeat = null;

  for (let i = 1; i <= rows; i++) {
    cols.forEach((col) => {
      const seatCode = `${i}${col}`;
      const seat = document.createElement("div");
      seat.textContent = col;
      seat.classList.add("seat");

      if (bookedSeats.includes(seatCode)) {
        seat.classList.add("booked");
      } else {
        seat.classList.add("available");
        seat.addEventListener("click", () => selectSeat(seat, seatCode));
      }

      seatMap.appendChild(seat);
    });
  }

  function selectSeat(seat, code) {
    if (selectedSeat) selectedSeat.classList.remove("selected");
    seat.classList.add("selected");
    selectedSeat = seat;
    selectedSeat.dataset.code = code;
  }

  document.getElementById("confirmSeat").addEventListener("click", () => {
    if (selectedSeat) {
      alert(`Bạn đã chọn ghế: ${selectedSeat.dataset.code}`);
      localStorage.setItem("selectedSeat", selectedSeat.dataset.code);
    } else {
      alert("Vui lòng chọn chỗ ngồi trước!");
    }
  });
});
