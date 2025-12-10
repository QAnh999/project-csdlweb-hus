/*
const FLIGHT_API = {
  baseURL: "https://api.example.com/flights", // Replace with your API URL
  endpoints: {
    search: "/search",
    getFlight: "/flight",
    addFlight: "/flight",
  },
};
*/

const USE_API = false;

const SEAT_CLASS_MULTIPLIERS = {
  economy: 1,
  business: 2.5,
  first: 5,
};

let flightData = [
  {
    id: 1,
    airline: "Vietnam Airlines",
    airlineLogo: "assets/img/logo-vietnam-airlines.png",
    flightNumber: "VN-001",
    departure: {
      time: "6:00 AM",
      location: "Hà Nội",
      airport: "HAN",
    },
    arrival: {
      time: "7:00 PM",
      location: "Hồ Chí Minh",
      airport: "SGN",
    },
    duration: "2 hours",
    isDirect: true,
    price: 350,
  },
  {
    id: 2,
    airline: "Bamboo Airways",
    airlineLogo: "assets/img/Bamboo-Airways.png",
    flightNumber: "QH-002",
    departure: {
      time: "8:00 AM",
      location: "Hà Nội",
      airport: "HAN",
    },
    arrival: {
      time: "10:00 PM",
      location: "Hồ Chí Minh",
      airport: "SGN",
    },
    duration: "3h 30m",
    isDirect: true,
    price: 400,
  },
  {
    id: 3,
    airline: "Vietjet Air",
    airlineLogo: "assets/img/vietjet-text-logo.png",
    flightNumber: "VJ-003",
    departure: {
      time: "10:00 AM",
      location: "Hà Nội",
      airport: "HAN",
    },
    arrival: {
      time: "12:45 PM",
      location: "Hồ Chí Minh",
      airport: "SGN",
    },
    duration: "2h 45m",
    isDirect: true,
    price: 450,
  },
  {
    id: 4,
    airline: "Vietravel Airlines",
    airlineLogo: "assets/img/Vietravel_Airlines_Logo.png",
    flightNumber: "VU-004",
    departure: {
      time: "10:30 AM",
      location: "Hà Nội",
      airport: "HAN",
    },
    arrival: {
      time: "1:00 PM",
      location: "Hồ Chí Minh",
      airport: "SGN",
    },
    duration: "2h 30m",
    isDirect: true,
    price: 600,
  },
  {
    id: 5,
    airline: "Pacific Airlines",
    airlineLogo: "assets/img/pacific-airlines-logo.png",
    flightNumber: "BL-005",
    departure: {
      time: "11:00 AM",
      location: "Hà Nội",
      airport: "HAN",
    },
    arrival: {
      time: "2:00 PM",
      location: "Hồ Chí Minh",
      airport: "SGN",
    },
    duration: "3 hours",
    isDirect: true,
    price: 600,
  },
  {
    id: 6,
    airline: "Vietnam Airlines",
    airlineLogo: "assets/img/logo-vietnam-airlines.png",
    flightNumber: "VN-006",
    departure: {
      time: "12:00 PM",
      location: "Hà Nội",
      airport: "HAN",
    },
    arrival: {
      time: "3:30 PM",
      location: "Hồ Chí Minh",
      airport: "SGN",
    },
    duration: "3h 30m",
    isDirect: true,
    price: 380,
  },
  {
    id: 7,
    airline: "Vietnam Airlines",
    airlineLogo: "assets/img/logo-vietnam-airlines.png",
    flightNumber: "VN-007",
    departure: {
      time: "2:00 PM",
      location: "Hà Nội",
      airport: "HAN",
    },
    arrival: {
      time: "5:15 PM",
      location: "Hồ Chí Minh",
      airport: "SGN",
    },
    duration: "3h 15m",
    isDirect: true,
    price: 420,
  },
  {
    id: 8,
    airline: "Pacific Airlines",
    airlineLogo: "assets/img/pacific-airlines-logo.png",
    flightNumber: "BL-008",
    departure: {
      time: "4:00 PM",
      location: "Hà Nội",
      airport: "HAN",
    },
    arrival: {
      time: "7:00 PM",
      location: "Hồ Chí Minh",
      airport: "SGN",
    },
    duration: "3 hours",
    isDirect: true,
    price: 390,
  },
  {
    id: 9,
    airline: "Vietjet Air",
    airlineLogo: "assets/img/vietjet-text-logo.png",
    flightNumber: "VJ-009",
    departure: {
      time: "6:00 PM",
      location: "Hà Nội",
      airport: "HAN",
    },
    arrival: {
      time: "9:45 PM",
      location: "Hồ Chí Minh",
      airport: "SGN",
    },
    duration: "3h 45m",
    isDirect: true,
    price: 480,
  },
  {
    id: 10,
    airline: "Bamboo Airways",
    airlineLogo: "assets/img/Bamboo-Airways.png",
    flightNumber: "QH-010",
    departure: {
      time: "8:00 PM",
      location: "Hà Nội",
      airport: "HAN",
    },
    arrival: {
      time: "11:30 PM",
      location: "Hồ Chí Minh",
      airport: "SGN",
    },
    duration: "3h 30m",
    isDirect: true,
    price: 550,
  },
];

let currentFlights = [];
let currentSortPrice = "cheapest";
let currentSortTime = "earliest";

/**
 * Search flights
 * @param {Object} searchParams - Search parameters
 * @returns {Promise<Array>} Array of flights
 */
async function searchFlightsAPI(searchParams) {
  if (!USE_API) {
    return searchFlightsLocal(searchParams);
  }
  /*
  try {
    const response = await fetch(
      `${FLIGHT_API.baseURL}${FLIGHT_API.endpoints.search}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(searchParams),
      }
    );

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.flights || [];
  } catch (error) {
    console.error("Error fetching flights:", error);
    // Fallback to local data
    return searchFlightsLocal(searchParams);
  }
  */
}

/**
 * Get single flight by ID
 * @param {number} flightId - Flight ID
 * @returns {Promise<Object>} Flight object
 */
async function getFlightAPI(flightId) {
  if (!USE_API) {
    return flightData.find((f) => f.id === flightId) || null;
  }

  /*
  try {
    const response = await fetch(
      `${FLIGHT_API.baseURL}${FLIGHT_API.endpoints.getFlight}/${flightId}`
    );

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching flight:", error);
    return flightData.find((f) => f.id === flightId) || null;
  }
  */
}

/**
 * Add new flight
 * @param {Object} newFlightData - Flight data
 * @returns {Promise<Object>} Created flight
 */
async function addFlightAPI(newFlightData) {
  if (!USE_API) {
    console.warn("Add flight is not available.");
    throw new Error("API not available");
  }

  /*
  try {
    const response = await fetch(
      `${FLIGHT_API.baseURL}${FLIGHT_API.endpoints.addFlight}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newFlightData),
      }
    );

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error adding flight:", error);
    throw error;
  }
  */
}

/**
 * Search flights locally
 * @param {Object} searchParams - Search parameters
 * @returns {Array} Filtered flights
 */
function searchFlightsLocal(searchParams) {
  const { from, to, date, seatClass } = searchParams;

  // Extract airport codes and location names from input
  const extractSearchTerms = (input) => {
    if (!input) return { location: "", airport: "" };
    const lowerInput = input.toLowerCase();
    // Try to extract airport code (3-4 letters in parentheses)
    const airportMatch = lowerInput.match(/\(([a-z]{3,4})\)/);
    const airport = airportMatch ? airportMatch[1] : "";
    // Extract location name (everything before the parenthesis)
    const location = lowerInput.split("(")[0].trim();
    return { location, airport, full: lowerInput };
  };

  const fromTerms = extractSearchTerms(from);
  const toTerms = extractSearchTerms(to);

  let filteredFlights = flightData.filter((flight) => {
    // Match from location
    let matchesFrom = true;
    if (from) {
      const depLocation = flight.departure.location.toLowerCase();
      const depAirport = flight.departure.airport.toLowerCase();
      matchesFrom =
        depLocation.includes(fromTerms.location) ||
        depAirport === fromTerms.airport ||
        depLocation.includes(fromTerms.full) ||
        depAirport.includes(fromTerms.full) ||
        fromTerms.full.includes(depLocation) ||
        fromTerms.full.includes(depAirport);
    }

    // Match to location
    let matchesTo = true;
    if (to) {
      const arrLocation = flight.arrival.location.toLowerCase();
      const arrAirport = flight.arrival.airport.toLowerCase();
      matchesTo =
        arrLocation.includes(toTerms.location) ||
        arrAirport === toTerms.airport ||
        arrLocation.includes(toTerms.full) ||
        arrAirport.includes(toTerms.full) ||
        toTerms.full.includes(arrLocation) ||
        toTerms.full.includes(arrAirport);
    }

    return matchesFrom && matchesTo;
  });

  // Apply price multiplier based on seat class
  filteredFlights = filteredFlights.map((flight) => ({
    ...flight,
    price: Math.round(flight.price * (SEAT_CLASS_MULTIPLIERS[seatClass] || 1)),
  }));

  return filteredFlights;
}

document.addEventListener("DOMContentLoaded", function () {
  function initWhenReady() {
    const fromInput = document.getElementById("from-input");
    const flightResults = document.getElementById("flight-results");

    if (fromInput && flightResults) {
      initializeFlightPage();
      initializeSearch();
      initializeSorting();
      initializeAddFlight();
      setDefaultDate();
    } else {
      setTimeout(initWhenReady, 100);
    }
  }

  initWhenReady();
});

async function initializeFlightPage() {
  const searchParams = getSearchParams();

  // If no search params, show all flights
  if (!searchParams.from && !searchParams.to) {
    currentFlights = [...flightData];
  } else {
    currentFlights = searchFlightsLocal(searchParams);
  }

  applySorting();
  renderFlights(currentFlights);
  updateResultCount(currentFlights.length);
}

// Get search parameters from form
function getSearchParams() {
  const fromInput = document.getElementById("from-input");
  const toInput = document.getElementById("to-input");
  const dateInput = document.getElementById("date-input");
  const seatClassInput = document.getElementById("seat-class-input");

  return {
    from: fromInput ? fromInput.value : "",
    to: toInput ? toInput.value : "",
    date: dateInput ? dateInput.value : "",
    seatClass: seatClassInput ? seatClassInput.value : "economy",
  };
}

function setDefaultDate() {
  const dateInput = document.getElementById("date-input");
  if (dateInput && !dateInput.value) {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    dateInput.value = `${year}-${month}-${day}`;
  }
}

function renderFlights(flights) {
  const flightResults = document.getElementById("flight-results");
  if (!flightResults) return;

  if (flights.length === 0) {
    flightResults.innerHTML = `
      <div style="text-align: center; padding: 3rem; color: var(--text-light);">
        <i class="fas fa-plane" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
        <p style="font-size: 1.125rem;">No flights found</p>
        <p style="font-size: 0.875rem;">Try adjusting your search criteria</p>
      </div>
    `;
    return;
  }

  flightResults.innerHTML = flights
    .map((flight) => createFlightCard(flight))
    .join("");
}

// Create flight card HTML
function createFlightCard(flight) {
  const directText = flight.isDirect ? "Direct" : "1 Stop";
  const logoPath = flight.airlineLogo || "assets/img/default-airline.png";
  const logoAlt = `${flight.airline} logo`;

  return `
    <div class="flight-card" data-flight-id="${flight.id}">
      <div class="flight-card-header">
        <div class="airline-logo">
          <img src="${logoPath}" alt="${logoAlt}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
          <div class="airline-logo-fallback" style="display: none;">
            <i class="fas fa-plane"></i>
          </div>
        </div>
        <div class="airline-info">
          <h3 class="airline-name">${flight.airline}</h3>
          <p class="flight-number">${flight.flightNumber}</p>
        </div>
        <div class="flight-price">$${flight.price}/pax</div>
      </div>
      <div class="flight-details">
        <div class="departure-info">
          <span class="departure-time">${flight.departure.time}</span>
          <span class="departure-location">${flight.departure.location}</span>
        </div>
        <div class="flight-route">
          <div class="route-airports">
            <span>${flight.departure.airport}</span>
            <span>${flight.arrival.airport}</span>
          </div>
          <div class="route-line"></div>
          <div class="route-duration">${directText}</div>
        </div>
        <div class="arrival-info">
          <span class="arrival-time">${flight.arrival.time}</span>
          <span class="arrival-location">${flight.arrival.location}</span>
        </div>
      </div>
      <div class="flight-card-footer">
        <button class="view-detail-btn" onclick="viewFlightDetail(${flight.id})">
          View Detail
        </button>
      </div>
    </div>
  `;
}

function initializeSearch() {
  const searchBtn = document.getElementById("search-btn");
  const swapBtn = document.getElementById("swap-btn");
  const fromInput = document.getElementById("from-input");
  const toInput = document.getElementById("to-input");
  const dateInput = document.getElementById("date-input");
  const seatClassInput = document.getElementById("seat-class-input");

  if (searchBtn) {
    searchBtn.addEventListener("click", performSearch);
  }

  if (swapBtn) {
    swapBtn.addEventListener("click", swapLocations);
  }

  // Allow Enter key to trigger search
  [fromInput, toInput, dateInput, seatClassInput].forEach((input) => {
    if (input) {
      input.addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
          performSearch();
        }
      });
    }
  });
}

// Perform search
async function performSearch() {
  const searchParams = getSearchParams();

  // Search flights from local data (frontend only)
  currentFlights = searchFlightsLocal(searchParams);

  applySorting();
  renderFlights(currentFlights);
  updateResultCount(currentFlights.length);

  // Show notification
  showSearchNotification(
    `Found ${currentFlights.length} flight(s) for ${searchParams.seatClass} class`
  );
}

// Swap origin and destination
function swapLocations() {
  const fromInput = document.getElementById("from-input");
  const toInput = document.getElementById("to-input");

  if (fromInput && toInput) {
    const temp = fromInput.value;
    fromInput.value = toInput.value;
    toInput.value = temp;
  }
}

// Initialize sorting
function initializeSorting() {
  const sortPrice = document.getElementById("sort-price");
  const sortTime = document.getElementById("sort-time");

  if (sortPrice) {
    sortPrice.addEventListener("change", function () {
      currentSortPrice = this.value;
      applySorting();
      renderFlights(currentFlights);
    });
  }

  if (sortTime) {
    sortTime.addEventListener("change", function () {
      currentSortTime = this.value;
      applySorting();
      renderFlights(currentFlights);
    });
  }
}

// Apply sorting
function applySorting() {
  // Sort by price
  if (currentSortPrice === "cheapest") {
    currentFlights.sort((a, b) => a.price - b.price);
  } else {
    currentFlights.sort((a, b) => b.price - a.price);
  }

  // Sort by time (departure time)
  if (currentSortTime === "earliest") {
    currentFlights.sort((a, b) => {
      const timeA = convertTimeToMinutes(a.departure.time);
      const timeB = convertTimeToMinutes(b.departure.time);
      return timeA - timeB;
    });
  } else {
    currentFlights.sort((a, b) => {
      const timeA = convertTimeToMinutes(a.departure.time);
      const timeB = convertTimeToMinutes(b.departure.time);
      return timeB - timeA;
    });
  }
}

// Convert time string to minutes for sorting
function convertTimeToMinutes(timeStr) {
  const [time, period] = timeStr.split(" ");
  const [hours, minutes] = time.split(":").map(Number);
  let totalMinutes = hours * 60 + minutes;
  if (period === "PM" && hours !== 12) {
    totalMinutes += 12 * 60;
  }
  if (period === "AM" && hours === 12) {
    totalMinutes -= 12 * 60;
  }
  return totalMinutes;
}

// Initialize add flight button
function initializeAddFlight() {
  const addFlightBtn = document.getElementById("add-flight-btn");
  const modal = document.getElementById("add-flight-modal");
  const closeModalBtn = document.getElementById("close-modal-btn");
  const cancelBtn = document.getElementById("cancel-form-btn");
  const addFlightForm = document.getElementById("add-flight-form");

  // Open modal
  if (addFlightBtn && modal) {
    addFlightBtn.addEventListener("click", function () {
      modal.style.display = "flex";
    });
  }

  // Close modal
  function closeModal() {
    if (modal) {
      modal.style.display = "none";
      if (addFlightForm) {
        addFlightForm.reset();
      }
    }
  }

  if (closeModalBtn) {
    closeModalBtn.addEventListener("click", closeModal);
  }

  if (cancelBtn) {
    cancelBtn.addEventListener("click", closeModal);
  }

  // Close modal when clicking outside
  if (modal) {
    modal.addEventListener("click", function (e) {
      if (e.target === modal) {
        closeModal();
      }
    });
  }

  // Handle form submission
  if (addFlightForm) {
    addFlightForm.addEventListener("submit", function (e) {
      e.preventDefault();
      handleAddFlight();
    });
  }
}

// Get airline logo based on airline name
function getAirlineLogo(airlineName) {
  const logoMap = {
    "Vietnam Airlines": "assets/img/logo-vietnam-airlines.png",
    "Bamboo Airways": "assets/img/Bamboo-Airways.png",
    "Vietjet Air": "assets/img/vietjet-text-logo.png",
    "Vietravel Airlines": "assets/img/Vietravel_Airlines_Logo.png",
    "Pacific Airlines": "assets/img/pacific-airlines-logo.png",
  };

  return logoMap[airlineName] || "assets/img/default-airline.png";
}

// Handle add flight form submission
function handleAddFlight() {
  const form = document.getElementById("add-flight-form");
  if (!form) return;

  // Get form values
  const airline = document.getElementById("airline-name").value;
  const airlineLogo = getAirlineLogo(airline); // Tự động lấy logo từ tên hãng
  const flightNumber = document.getElementById("flight-number").value;
  const departureTime = document.getElementById("departure-time").value;
  const departureLocation = document.getElementById("departure-location").value;
  const departureAirport = document
    .getElementById("departure-airport")
    .value.toUpperCase();
  const arrivalTime = document.getElementById("arrival-time").value;
  const arrivalLocation = document.getElementById("arrival-location").value;
  const arrivalAirport = document
    .getElementById("arrival-airport")
    .value.toUpperCase();
  const duration = document.getElementById("duration").value;
  const price = parseFloat(document.getElementById("price").value);
  const isDirect = document.getElementById("is-direct").checked;

  // Convert time format (HH:MM to "H:MM AM/PM")
  const formatTime = (time24) => {
    const [hours, minutes] = time24.split(":");
    const hour = parseInt(hours);
    const period = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${period}`;
  };

  // Create new flight object
  const newFlight = {
    id:
      flightData.length > 0 ? Math.max(...flightData.map((f) => f.id)) + 1 : 1,
    airline: airline,
    airlineLogo: airlineLogo, // Logo đã được tự động lấy từ tên hãng
    flightNumber: flightNumber,
    departure: {
      time: formatTime(departureTime),
      location: departureLocation,
      airport: departureAirport,
    },
    arrival: {
      time: formatTime(arrivalTime),
      location: arrivalLocation,
      airport: arrivalAirport,
    },
    duration: duration,
    isDirect: isDirect,
    price: price,
  };

  // Add to flight data
  flightData.push(newFlight);

  // Refresh flight list
  const searchParams = getSearchParams();
  currentFlights = searchFlightsLocal(searchParams);
  applySorting();
  renderFlights(currentFlights);
  updateResultCount(currentFlights.length);

  // Close modal
  const modal = document.getElementById("add-flight-modal");
  if (modal) {
    modal.style.display = "none";
    form.reset();
  }

  // Show success notification
  showSearchNotification(`Chuyến bay ${flightNumber} đã được thêm thành công!`);
}

// View flight detail
async function viewFlightDetail(flightId) {
  // Get flight from local data (frontend only)
  const flight = flightData.find((f) => f.id === flightId);

  if (flight) {
    // In a real app, this would navigate to a detail page or open a modal
    alert(
      `Flight Details:\n\nAirline: ${flight.airline}\nFlight Number: ${flight.flightNumber}\nFrom: ${flight.departure.location} (${flight.departure.airport})\nTo: ${flight.arrival.location} (${flight.arrival.airport})\nDeparture: ${flight.departure.time}\nArrival: ${flight.arrival.time}\nDuration: ${flight.duration}\nPrice: $${flight.price}/pax`
    );
  }
}

// Update result count
function updateResultCount(count) {
  const resultCount = document.getElementById("result-count");
  if (resultCount) {
    resultCount.textContent = count;
  }
}

// Show search notification
function showSearchNotification(message) {
  // Use the notification function from app.js if available
  if (window.DashboardUtils && window.DashboardUtils.showNotification) {
    window.DashboardUtils.showNotification(message);
  } else {
    // Fallback notification
    console.log(message);
  }
}

// Export functions for potential external use
window.FlightTracking = {
  performSearch,
  swapLocations,
  viewFlightDetail,
  renderFlights,
  searchFlightsLocal,
  searchFlightsAPI,
  getFlightAPI,
  addFlightAPI,
};
