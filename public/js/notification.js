// Store the previous status values
const prevStatuses = {};

// Generic checker function
async function checkStatus(type, endpoint) {
  const username = localStorage.getItem("username");
  if (!username) return console.warn("No username found in localStorage.");

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });

    const text = await res.text();
    const data = JSON.parse(text);
    const newStatus = data.status;

    // Initialize baseline for this status type
    if (!prevStatuses[type]) {
      prevStatuses[type] = newStatus;
      return;
    }

    // Compare previous vs. new
    if (newStatus !== prevStatuses[type]) {
      Swal.fire({
        icon:
          newStatus === "cancelled" || newStatus === "rejected"
            ? "warning"
            : "info",
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} Status Changed`,
        text: `Your ${type} status is now "${newStatus}".`,
      });

      prevStatuses[type] = newStatus; // Update baseline
    }
  } catch (error) {
    console.error(`Error checking ${type} status:`, error);
  }
}

// Start polling all three statuses
function startStatusPolling() {
  const checks = [
    { type: "payment", endpoint: "/api/status/getPaymentStatus.php" },
    { type: "delivery", endpoint: "/api/status/getDeliveryStatus.php" },
    { type: "reservation", endpoint: "/api/status/getReservationStatus.php" },
  ];

  // Run immediately on page load
  checks.forEach((c) => checkStatus(c.type, c.endpoint));

  // Re-run every 2 minutes
  setInterval(() => {
    checks.forEach((c) => checkStatus(c.type, c.endpoint));
  }, 10000);
}
document.addEventListener("DOMContentLoaded", startStatusPolling());
