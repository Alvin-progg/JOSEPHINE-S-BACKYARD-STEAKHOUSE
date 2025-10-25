document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("reservation-form");
  const submitButton = form?.querySelector('button[type="submit"]');
  window.loadingState = document.getElementById("loading-state"); //

  // Load reservations when page loads
  loadReservations();
  
  // Initialize filter to pending
  const filterSelect = document.getElementById("reservation-filter");
  if (filterSelect) {
    filterSelect.value = "pending";
  }

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const reservationDate = document.getElementById("date").value.trim();
    const reservationTime = document.getElementById("time").value.trim();
    const reservationGuestsRaw = document.getElementById("guests").value.trim();
    const reservationGuests = Number(reservationGuestsRaw);

    // Allowed time slots (keep in sync with server expectations)
    const allowedTimeSlots = [
      "8:00-10:00 AM",
      "10:30-12:30 PM",
      "1:00-3:00 PM",
      "3:30-5:30 PM",
      "6:30-8:30 PM",
    ];

    if (!reservationDate || !reservationTime || !reservationGuestsRaw) {
      Swal.fire({
        icon: "error",
        title: "Validation Error",
        text: "Please fill in all required fields.",
        timer: 1200,
        timerProgressBar: true,
        showConfirmButton: false,
      });
      return;
    }

    // Validate time slot
    if (!allowedTimeSlots.includes(reservationTime)) {
      Swal.fire({
        icon: "error",
        title: "Validation Error",
        text: "Please select a valid time slot.",
        timer: 1400,
        timerProgressBar: true,
        showConfirmButton: false,
      });
      return;
    }

    // Validate guests number
    if (!Number.isInteger(reservationGuests) || reservationGuests < 1 || reservationGuests > 150) {
      Swal.fire({
        icon: "error",
        title: "Validation Error",
        text: "Number of guests must be a whole number between 1 and 150.",
        timer: 1600,
        timerProgressBar: true,
        showConfirmButton: false,
      });
      return;
    }

    submitButton.disabled = true;

    try {
      const response = await fetch("/api/reservation/insertReservation.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          date: reservationDate,
          time: reservationTime,
          guests: reservationGuests,
        }),
      });

      const text = await response.text();
      const data = JSON.parse(text);

      console.log(data);

      if (!response.ok) {
        Swal.fire({
          icon: "error",
          title: "Reservation Failed",
          text: data.message || `Server error: ${response.status}`,
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
        });
        return;
      }

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Reservation successful!",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });

      form.reset();
      loadReservations();
    } catch (error) {
      const errorMsg = error.message.includes("Failed to fetch")
        ? "Network error: Unable to connect to the server."
        : error.message || "An unexpected error occurred.";
      Swal.fire({
        icon: "error",
        title: "Reservation Failed",
        text: errorMsg,
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
    } finally {
      submitButton.disabled = false;
    }
  });
});

// Global variable to store all reservations
let allReservationsData = [];

// Filter function
window.filterReservations = function(status) {
  if (status === 'all') {
    renderReservations(allReservationsData);
  } else {
    const filtered = allReservationsData.filter(res => res.status.toLowerCase() === status);
    renderReservations(filtered);
  }
};

// Function to load and display reservations
async function loadReservations() {
  try {
    const response = await fetch("/api/reservation/getReservations.php", {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("Reservations API Response:", result);

    if (result.success) {
      allReservationsData = result.data; // Store all data
      updateDashboardStats(result.data);
      
      // Apply default filter (pending)
      const filterSelect = document.getElementById("reservation-filter");
      const currentFilter = filterSelect ? filterSelect.value : 'pending';
      window.filterReservations(currentFilter);
    } else {
      console.error("Failed to load reservations:", result.message);
      showEmptyState();
      updateDashboardStats([]); // Update with empty array
      loadingState.style.display = "none";
    }
  } catch (error) {
    console.error("Error loading reservations:", error);
    showEmptyState();
    updateDashboardStats([]); // Update with empty array
    loadingState.style.display = "none";
  }
}

// Function to render reservations
function renderReservations(reservations) {
  // Select container within the reserve_table section
  const reserveSection = document.getElementById("reserve_table");
  const container = reserveSection?.querySelector("#reservations-container");

  console.log("Rendering reservations:", {
    reservationsCount: reservations?.length,
    reserveSection: reserveSection,
    container: container
  });

  if (container) container.innerHTML = "";

  if (!reservations || reservations.length === 0) {
    if (container) {
      const filterSelect = document.getElementById("reservation-filter");
      const currentFilter = filterSelect ? filterSelect.value : 'all';
      const filterText = currentFilter === 'all' ? '' : ` with status "${currentFilter}"`;
      
      container.innerHTML = `
        <div class="text-center py-12 text-gray-400">
          <i class="bi bi-inbox text-6xl mb-4 block"></i>
          <p class="text-xl mb-2">No reservations found${filterText}</p>
          <p class="text-sm">Try adjusting the filter or make a new reservation</p>
        </div>
      `;
    }
    loadingState.style.display = "none";
    return;
  }

  reservations.forEach((reservation) => {
    const statusStyle = getStatusStyle(reservation.status);
    const buttonStyle = getButtonStyle(reservation.status);

    if (container) {
      const card = createReservationCard(reservation, statusStyle, buttonStyle);
      container.appendChild(card);
    }
  });

  loadingState.style.display = "none";
}

// Function to create modern reservation card
function createReservationCard(reservation, statusStyle, buttonStyle) {
  const card = document.createElement("div");
  card.className = "bg-[#2a2a2a] rounded-lg p-5 border border-gray-600 hover:border-[var(--color-primary-600)] transition-all duration-300 hover:shadow-lg";

  card.innerHTML = `
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <!-- Left Section: ID and Date Info -->
      <div class="flex-1">
        <div class="flex items-center gap-3 mb-3">
          <div class="bg-[var(--color-primary-600)] bg-opacity-20 p-2 rounded-lg">
            <i class="bi bi-calendar-event text-2xl text-[var(--color-primary-600)]"></i>
          </div>
          <div>
            <p class="text-[var(--color-primary-400)] font-bold text-lg">RES${reservation.id}</p>
            <p class="text-gray-400 text-sm">${reservation.formatted_date}</p>
          </div>
        </div>
        
        <div class="grid grid-cols-2 gap-3 text-sm">
          <div class="flex items-center gap-2">
            <i class="bi bi-clock text-[var(--color-primary-600)]"></i>
            <div>
              <p class="text-gray-400 text-xs">Time</p>
              <p class="text-[#fffeee] font-medium">${reservation.formatted_time}</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <i class="bi bi-people text-[var(--color-primary-600)]"></i>
            <div>
              <p class="text-gray-400 text-xs">Guests</p>
              <p class="text-[#fffeee] font-medium">${reservation.guests} people</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Section: Status and Action -->
      <div class="flex flex-col items-stretch sm:items-end gap-3 sm:min-w-[180px]">
        <span class="${statusStyle.bgClass} text-white px-4 py-2 rounded-lg text-sm font-semibold text-center">
          ${reservation.status}
        </span>
        <button
          onclick="cancelReservation(${reservation.id})"
          class="w-full sm:w-auto ${buttonStyle.bgClass} text-[#fffeee] px-4 py-2 rounded-lg ${buttonStyle.hoverClass} transition-all duration-300 text-sm font-semibold flex items-center justify-center gap-2"
          ${reservation.status === "Cancelled" ? "disabled" : ""}
        >
          <i class="bi bi-x-circle"></i>
          Cancel
        </button>
      </div>
    </div>
  `;

  return card;
}

// Function to create mobile reservation card
function createMobileCard(reservation, statusStyle, buttonStyle) {
  const card = document.createElement("div");
  card.className = "bg-[#2a2a2a] p-4 rounded-lg border border-gray-600";

  card.innerHTML = `
    <div class="flex justify-between items-start mb-3">
      <div>
        <p class="text-[var(--color-primary-400)] font-semibold">
          RES${reservation.id}
        </p>
        <p class="text-[#fffeee] text-sm">${reservation.formatted_date}</p>
      </div>
      <span class="${statusStyle.bgClass} text-white px-2 py-1 rounded text-xs">
        ${reservation.status}
      </span>
    </div>
    <div class="grid grid-cols-2 gap-4 text-sm mb-3">
      <div>
        <p class="text-gray-400">Time</p>
        <p class="text-[#fffeee]">${reservation.formatted_time}</p>
      </div>
      <div>
        <p class="text-gray-400">Guests</p>
        <p class="text-[#fffeee]">${reservation.guests} people</p>
      </div>
    </div>
    <button
      onclick="cancelReservation(${reservation.id})"
      class="w-full ${buttonStyle.bgClass} text-[#fffeee] py-2 rounded-md ${buttonStyle.hoverClass} transition-colors duration-300"
      ${reservation.status === "Cancelled" ? "disabled" : ""}
    >
      <i class="bi bi-x-circle mr-2"></i>Cancel Reservation
    </button>
  `;

  return card;
}

// Function to create desktop table row
function createTableRow(reservation, statusStyle, buttonStyle) {
  const row = document.createElement("tr");
  row.className =
    "hover:bg-[#2a2a2a] transition-colors duration-200 border-b border-gray-700";

  row.innerHTML = `
    <td class="py-4 px-4 text-sm text-[var(--color-primary-400)] font-semibold">
      RES${reservation.id}
    </td>
    <td class="py-4 px-4 text-sm text-[#fffeee]">
      ${reservation.formatted_date}
    </td>
    <td class="py-4 px-4 text-sm text-[#fffeee]">${reservation.formatted_time}</td>
    <td class="py-4 px-4 text-sm text-[#fffeee]">${reservation.guests}</td>
    <td class="py-4 px-4 text-sm">
      <span class="${statusStyle.bgClass} text-white px-2 py-1 rounded text-xs">
        ${reservation.status}
      </span>
    </td>
    <td class="py-4 px-4 text-center">
      <button
        onclick="cancelReservation(${reservation.id})"
        class="${buttonStyle.bgClass} text-[#fffeee] px-3 py-1 rounded-md ${buttonStyle.hoverClass} transition-colors duration-300 text-sm"
        ${reservation.status === "Cancelled" ? "disabled" : ""}
      >
        <i class="bi bi-x-circle mr-1"></i>Cancel
      </button>
    </td>
  `;

  return row;
}

// Function to get status styling
function getStatusStyle(status) {
  switch (status.toLowerCase()) {
    case "confirmed":
      return { bgClass: "bg-green-600" };
    case "pending":
      return { bgClass: "bg-yellow-600" };
    case "cancelled":
      return { bgClass: "bg-gray-600" };
    default:
      return { bgClass: "bg-gray-600" };
  }
}

// Function to get button styling
function getButtonStyle(status) {
  switch (status.toLowerCase()) {
    case "cancelled":
      return {
        bgClass: "bg-gray-600 cursor-not-allowed",
        hoverClass: "hover:bg-gray-600",
      };
    default:
      return {
        bgClass: "bg-red-600",
        hoverClass: "hover:bg-red-700",
      };
  }
}

// Function to show empty state
function showEmptyState() {
  const reserveSection = document.getElementById("reserve_table");
  const container = reserveSection?.querySelector("#reservations-container");

  const emptyMessage = `
    <div class="text-center py-12 text-gray-400">
      <div class="bg-[#2a2a2a] rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
        <i class="bi bi-calendar-x text-5xl text-gray-500"></i>
      </div>
      <p class="text-xl font-semibold text-[#fffeee] mb-2">No reservations found</p>
      <p class="text-sm">Make your first reservation to get started!</p>
    </div>
  `;

  if (container) {
    container.innerHTML = emptyMessage;
  }

  loadingState.style.display = "none";
}

// Function to cancel a reservation
async function cancelReservation(reservationId) {
  const result = await Swal.fire({
    title: "Cancel Reservation?",
    text: "Are you sure you want to cancel this reservation? This action cannot be undone.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#dc2626",
    cancelButtonColor: "#6b7280",
    confirmButtonText: "Yes, cancel it!",
    cancelButtonText: "Keep reservation",
  });

  if (!result.isConfirmed) {
    return;
  }

  try {
    const response = await fetch("/api/reservation/cancelReservation.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        reservation_id: reservationId,
      }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      Swal.fire({
        icon: "success",
        title: "Cancelled!",
        text: "Your reservation has been cancelled.",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });

      loadReservations();
    } else {
      Swal.fire({
        icon: "error",
        title: "Cancellation Failed",
        text: data.message || "Failed to cancel reservation.",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Network Error",
      text: "Unable to connect to the server. Please try again.",
      timer: 2000,
      timerProgressBar: true,
      showConfirmButton: false,
    });
  }
}

// Function to update dashboard stats
function updateDashboardStats(reservations) {
  // Only update if we're on the home page
  const totalReservationsEl = document.getElementById("total-reservations");
  if (!totalReservationsEl) return;

  // Safety check for reservations array
  if (!reservations || !Array.isArray(reservations)) {
    reservations = [];
  }

  // Count total reservations
  totalReservationsEl.textContent = reservations.length;

  // Count pending reservations (Pending status)
  const pendingReservations = reservations.filter(
    (res) => res.status === "Pending"
  ).length;

  // Update the stats (will be combined with pending orders)
  window.reservationStats = {
    total: reservations.length,
    pending: pendingReservations,
  };

  // Update pending count if orders are already loaded
  updatePendingCount();
}

// Function to update the pending count
function updatePendingCount() {
  const pendingItemsEl = document.getElementById("pending-items");
  if (!pendingItemsEl) return;

  const reservationPending = window.reservationStats?.pending || 0;
  const ordersPending = window.orderStats?.pending || 0;

  pendingItemsEl.textContent = reservationPending + ordersPending;
}
