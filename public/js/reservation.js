document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("reservation-form");
  const submitButton = form?.querySelector('button[type="submit"]');
  window.loadingState = document.getElementById("loading-state"); // ✅ keep loadingState accessible

  // Load reservations when page loads
  loadReservations();

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const reservationDate = document.getElementById("date").value.trim();
    const reservationTime = document.getElementById("time").value.trim();
    const reservationGuests = document.getElementById("guests").value.trim();

    if (!reservationDate || !reservationTime || !reservationGuests) {
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

    if (result.success) {
      renderReservations(result.data);
    } else {
      console.error("Failed to load reservations:", result.message);
      showEmptyState();
      loadingState.style.display = "none";
    }
  } catch (error) {
    console.error("Error loading reservations:", error);
    showEmptyState();
    loadingState.style.display = "none";
  }
}

// Function to render reservations
function renderReservations(reservations) {
  const mobileContainer = document.querySelector(".block.md\\:hidden"); // ✅ fixed
  const desktopTableBody = document.querySelector("tbody");

  if (!reservations || reservations.length === 0) {
    showEmptyState();
    loadingState.style.display = "none"; // ✅ hide spinner if empty
    return;
  }

  if (mobileContainer) mobileContainer.innerHTML = "";
  if (desktopTableBody) desktopTableBody.innerHTML = "";

  reservations.forEach((reservation) => {
    const statusStyle = getStatusStyle(reservation.status);
    const buttonStyle = getButtonStyle(reservation.status);

    if (mobileContainer) {
      const mobileCard = createMobileCard(
        reservation,
        statusStyle,
        buttonStyle
      );
      mobileContainer.appendChild(mobileCard);
    }

    if (desktopTableBody) {
      const tableRow = createTableRow(reservation, statusStyle, buttonStyle);
      desktopTableBody.appendChild(tableRow);
    }
  });

  loadingState.style.display = "none"; // ✅ hide spinner after rendering
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
  const mobileContainer = document.querySelector(".block.md\\:hidden"); // ✅ fixed
  const desktopTableBody = document.querySelector("tbody");

  const emptyMessage = `
    <div class="text-center py-8 text-gray-400">
      <i class="bi bi-calendar-x text-4xl mb-3"></i>
      <p class="text-lg">No reservations found</p>
      <p class="text-sm">Make your first reservation above!</p>
    </div>
  `;

  if (mobileContainer) {
    mobileContainer.innerHTML = emptyMessage;
  }

  if (desktopTableBody) {
    desktopTableBody.innerHTML = `
      <tr>
        <td colspan="6" class="py-8 text-center text-gray-400">
          <div>
            <i class="bi bi-calendar-x text-4xl mb-3 block"></i>
            <p class="text-lg">No reservations found</p>
            <p class="text-sm">Make your first reservation above!</p>
          </div>
        </td>
      </tr>
    `;
  }

  loadingState.style.display = "none"; // ✅ hide spinner
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
