document.addEventListener("DOMContentLoaded", () => {
  const seatMap = document.getElementById("seat-map");
  const rows = 40;
  const colsLeft = ["A", "B", "C"];
  const colsRight = ["D", "E", "F"];
  const exitAfter = [3, 27]; // EXIT sau hàng 3 và 27

  let selectedSeat = null;
  const selectedInfo = document.getElementById("selectedInfo");
  const params = new URLSearchParams(window.location.search);
  const leg = params.get("leg") || "oneway";
  const bookingDraft = JSON.parse(localStorage.getItem("bookingDraft"));

  const bookedSeats = [];
  Object.keys(localStorage).forEach(key => {
    if (!key.startsWith("booking_")){
      return;
    }

    const b = JSON.parse(localStorage.getItem(key));
    if (!b){
      return;
    }

    const currentFlightCode = leg === "outbound" ? bookingDraft?.outbound?.code 
      : leg === "inbound" ? bookingDraft?.inbound?.code 
      : bookingDraft?.flight?.code;

    if (leg === "oneway" && b.flight?.code === currentFlightCode && b.seat){
      bookedSeats.push(b.seat);
    }

    if (leg === "outbound" && b.outbound?.code === currentFlightCode && b.seatOutbound){
      bookedSeats.push(b.seatOutbound);
    }

    if (leg === "inbound" && b.inbound?.code === currentFlightCode && b.seatInbound){
      bookedSeats.push(b.seatInbound);
    }
  });

  // tạo từng hàng ghế
  for (let i = 1; i <= rows; i++) {
    const rowDiv = document.createElement("div");
    rowDiv.className = "row";

    // số hàng
    const rowNumber = document.createElement("div");
    rowNumber.className = "row-number";
    rowNumber.textContent = i;
    rowDiv.appendChild(rowNumber);

    // nhóm trái (A,B,C)
    const leftGroup = document.createElement("div");
    leftGroup.className = "seat-group";
    colsLeft.forEach((col) => {
      const code = `${i}${col}`;
      const seat = createSeatElement(code);
      leftGroup.appendChild(seat);
    });
    rowDiv.appendChild(leftGroup);

    // lối đi
    const aisle = document.createElement("div");
    aisle.className = "aisle";
    rowDiv.appendChild(aisle);

    // nhóm phải (D,E,F)
    const rightGroup = document.createElement("div");
    rightGroup.className = "seat-group";
    colsRight.forEach((col) => {
      const code = `${i}${col}`;
      const seat = createSeatElement(code);
      rightGroup.appendChild(seat);
    });
    rowDiv.appendChild(rightGroup);

    seatMap.appendChild(rowDiv);

    if (exitAfter.includes(i)) {
      seatMap.appendChild(makeExitRow());
    }
  }

  seatMap.appendChild(makeExitRow());

  // Hàm tạo ghế
  function createSeatElement(code) {
    const seat = document.createElement("div");
    seat.className = "seat";
    seat.textContent = code.slice(-1); // chỉ hiện chữ cái
    seat.dataset.code = code;   // gán mã ghế khi tạo

    if (bookedSeats.includes(code)) {
      seat.classList.add("booked");
    } else {
      seat.classList.add("regular");
      seat.addEventListener("click", () => toggleSelect(seat));
    }
    return seat;
  }


  function toggleSelect(seatEl) {
    if (selectedSeat && selectedSeat !== seatEl) {
      selectedSeat.classList.remove("selected");
    }
    const isNow = seatEl.classList.toggle("selected");
    selectedSeat = isNow ? seatEl : null;

    if (selectedSeat) {
      selectedInfo.textContent = `Bạn đã chọn: ${selectedSeat.dataset.code}`;
      // selectedSeat.dataset.code = code;
    } else {
      selectedInfo.textContent = "Chưa chọn ghế";
    }
  }


  function makeExitRow() {
    const container = document.createElement("div");
    container.className = "exit-row";

    const exitL = document.createElement("div");
    exitL.className = "exit exit-left";
    exitL.textContent = "EXIT";

    const exitR = document.createElement("div");
    exitR.className = "exit exit-right";
    exitR.textContent = "EXIT";

    container.appendChild(exitL);
    container.appendChild(exitR);
    return container;
  }


  document.getElementById("confirmSeat").addEventListener("click", () => {
    if (!selectedSeat){
      alert("Vui lòng chọn ghế trước khi xác nhận!");
      return;
    }

    const isOneWay = !!bookingDraft?.flight;
    const isRoundTrip = !!(bookingDraft?.outbound && bookingDraft?.inbound);
    
    if (!bookingDraft || (!isOneWay && !isRoundTrip) || !bookingDraft.passenger){
      alert("Thiếu thông tin đặt chỗ.");
      return;
    }

    const seatCode = selectedSeat.dataset.code;

    if (bookingDraft.outbound && bookingDraft.inbound){
      if (leg === "outbound"){
        bookingDraft.seatOutbound = seatCode;
        localStorage.setItem("bookingDraft", JSON.stringify(bookingDraft));
        alert("Bạn đã chọn xong ghế cho chuyến đi.\nTiếp theo: chọn ghế cho chuyến về.");
        window.location.href = "seat-selection.html?leg=inbound";
        return;
      }

      if (leg === "inbound"){
        bookingDraft.seatInbound = seatCode;
        localStorage.setItem("bookingDraft", JSON.stringify(bookingDraft));
        window.location.href = "payment.html";
        return;
      }
    }

    bookingDraft.seat = seatCode;
    localStorage.setItem("bookingDraft", JSON.stringify(bookingDraft));
    window.location.href = "payment.html";
  });
});


