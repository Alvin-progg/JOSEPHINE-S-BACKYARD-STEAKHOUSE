// open websocket server for notifications
// ================== admin.js ==================
const token = localStorage.getItem("token"); // token from login
const socket = new WebSocket(`ws://localhost:8080/notify?token=${token}`);

socket.onopen = () => {
  console.log("Connected to WebSocket notification server (admin)");
};

socket.onerror = (err) => {
  console.error("WebSocket error:", err);
};

socket.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  console.log("Received message:", msg);
};

// ========== RENDER GENERIC TABLES ==========
async function renderTable(url, tbodyId, columns) {
  try {
    const response = await fetch(`http://localhost:8000/api/admin/${url}`, {
      method: "GET",
      credentials: "include",
    });

    const result = await response.json();
    if (result.status !== "success") {
      console.error(`Failed to load ${url}:`, result.message);
      return;
    }

    const tbody = document.getElementById(tbodyId);
    tbody.innerHTML = "";

    result.data.forEach((row) => {
      const tr = document.createElement("tr");
      tr.classList.add("border-b", "border-gray-700");

      // detect table type from url
      let deleteClass = "";
      let deleteId = "";

      if (url.includes("allUsers")) {
        deleteClass = "delete-user";
        deleteId = row.user_id ?? "";
      } else if (url.includes("allReservations")) {
        deleteClass = "delete-reservation";
        deleteId = row.reservation_id ?? "";
      } else if (url.includes("allOrders")) {
        deleteClass = "delete-order";
        deleteId = row.order_id ?? "";
      }

      tr.innerHTML =
        columns
          .map((col) => `<td class="py-2 px-4">${row[col] ?? ""}</td>`)
          .join("") +
        `
          <td class="py-2 px-4 flex gap-2">
            ${
              deleteClass
                ? `<button class="${deleteClass}" data-id="${deleteId}">
                    <i class="bi bi-trash"></i>
                  </button>`
                : ""
            }
          </td>
        `;

      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error(`Error loading ${url}:`, err);
  }
}
// ========== RENDER RESERVATIONS TABLE WITH STATUS DROPDOWN ==========
const renderReservationsTable = async () => {
  try {
    const response = await fetch(
      "http://localhost:8000/api/admin/get/allReservations.php",
      {
        method: "GET",
        credentials: "include",
      }
    );

    const result = await response.json();
    if (result.status !== "success") {
      console.error("Failed to load reservations:", result.message);
      return;
    }

    const tbody = document.getElementById("reservations-table-body");
    tbody.innerHTML = "";

    result.data.forEach((row) => {
      const tr = document.createElement("tr");
      tr.classList.add("border-b", "border-gray-700");

      tr.innerHTML = `
          <td class="py-2 px-4">${row.reservation_id ?? ""}</td>
          <td class="py-2 px-4">${row.user_name ?? ""}</td>
          <td class="py-2 px-4">${row.reservation_date ?? ""}</td>
          <td class="py-2 px-4">${row.reservation_time ?? ""}</td>
          <td class="py-2 px-4">${row.number_of_people ?? ""}</td>
          
          <td class="py-2 px-4 flex items-center gap-2">
            <select 
              class="reservation-status bg-[#1e1e1e] border border-gray-600 rounded px-2 py-1"
              data-id="${row.reservation_id}">
              <option value="Pending" ${row.status === "Pending" ? "selected" : ""}>Pending</option>
              <option value="Approved" ${row.status === "Approved" ? "selected" : ""}>Approved</option>
              <option value="Cancelled" ${row.status === "Cancelled" ? "selected" : ""}>Cancelled</option>
              <option value="Completed" ${row.status === "Completed" ? "selected" : ""}>Completed</option>
            </select>
            <button 
              class="save-reservation hidden text-green-400 hover:text-green-600 transition-all duration-200" 
              data-id="${row.reservation_id}">
              <i class="bi bi-check2-circle text-xl"></i>
            </button>
          </td>

          <td class="py-2 px-4">${row.created_at ?? ""}</td>
          <td class="py-2 px-4 flex gap-2">
            <button class="delete-reservation text-red-400 hover:text-red-600" data-id="${row.reservation_id}">
              <i class="bi bi-trash"></i>
            </button>
          </td>
        `;

      tbody.appendChild(tr);
    });

    // --- Attach the status change listener (inside the render for safety) ---
    tbody.querySelectorAll(".reservation-status").forEach((select) => {
      select.addEventListener("change", (e) => {
        const tr = e.target.closest("tr");
        const saveBtn = tr.querySelector(".save-reservation");
        if (saveBtn) {
          saveBtn.classList.remove("hidden");
          saveBtn.classList.add("animate-pulse");
        }
      });
    });
  } catch (err) {
    console.error("Error loading reservations:", err);
  }
};

// ========== RENDER PAYMENTS TABLE WITH DROPDOWN + SAVE BUTTON ==========
const renderPaymentsTable = async () => {
  try {
    const response = await fetch(
      "http://localhost:8000/api/admin/get/allPayments.php",
      {
        method: "GET",
        credentials: "include",
      }
    );

    const result = await response.json();
    console.log(result);

    if (result.status !== "success") {
      console.error("Failed to load payments:", result.message);
      return;
    }

    const tbody = document.getElementById("payments-table-body");
    tbody.innerHTML = "";

    result.data.forEach((row) => {
      const tr = document.createElement("tr");
      tr.classList.add("border-b", "border-gray-700");

      tr.innerHTML = `
    <td class="py-2 px-4">${row.payment_id ?? ""}</td>
    <td class="py-2 px-4">${row.user_name ?? ""}</td>
    <td class="py-2 px-4">${row.reference_number ?? ""}</td>
    <td class="py-2 px-4">
      ${
        row.screenshot_path
          ? `<button class="show-screenshot text-green-500 hover:text-green-700" data-src="${row.screenshot_path}">View</button>`
          : "N/A"
      }
    </td>
    <td class="py-2 px-4">${row.total_amount ?? ""}</td>
    
    <td class="py-2 px-4 flex items-center gap-2">
      <select 
        class="payment-status bg-[#1e1e1e] border border-gray-600 rounded px-2 py-1" 
        data-id="${row.payment_id}">
        <option value="pending" ${row.payment_status === "pending" ? "Selected" : ""}>Pending</option>
        <option value="verified" ${row.payment_status === "verified" ? "Selected" : ""}>Verified</option>
        <option value="rejected" ${row.payment_status === "rejected" ? "Selected" : ""}>Rejected</option>
      </select>
      <button 
        class="save-status hidden text-green-400 hover:text-green-600" 
        data-id="${row.payment_id}">
        <i class="bi bi-check2-circle text-xl"></i>
      </button>
    </td>
    <td class="py-2 px-4">${row.mop ?? ""}</td>  
    <td class="py-2 px-4">${row.payment_date ?? ""}</td>
    <td class="py-2 px-4 flex gap-2">
      <button class="delete-payment text-red-400 hover:text-red-600" data-id="${row.payment_id}">
        <i class="bi bi-trash"></i>
      </button>
    </td>
  `;

      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error("Error loading payments:", err);
  }
};
// Handle click on save-reservation button
// ================== Reservation Update Logic ==================
document.addEventListener("click", async (e) => {
  const btn = e.target.closest(".save-reservation");
  if (!btn) return;

  const tr = btn.closest("tr");
  const select = tr.querySelector(".reservation-status");
  const reservationId = btn.getAttribute("data-id");
  const newStatus = select.value;

  try {
    const res = await fetch(
      "http://localhost:8000/api/admin/update/updateReservationStatus.php",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          reservation_id: reservationId,
          status: newStatus,
        }),
      }
    );

    const result = await res.json();

    if (result.status === "success") {
      Swal.fire({
        title: "Updated!",
        text: "Reservation status saved successfully.",
        icon: "success",
        timer: 1200,
        showConfirmButton: false,
      });

      btn.classList.add("hidden");
      select.classList.remove("animate-pulse");

      // ✅ Notify user via WebSocket
      const notification = {
        type: "notify_user",
        data: {
          reservation_id: reservationId,
          message: `Your reservation status has been updated to "${newStatus}".`,
        },
      };
      socket.send(JSON.stringify(notification));
    } else {
      Swal.fire("Error", result.message || "Failed to update.", "error");
    }
  } catch (err) {
    console.error("Error updating reservation status:", err);
    Swal.fire("Error", "A network or server error occurred.", "error");
  }
});
// ========== RENDER DELIVERIES TABLE WITH DROPDOWN AND SAVE button ==========
const renderDeliveriesTable = async () => {
  try {
    const response = await fetch(
      "http://localhost:8000/api/admin/get/allPayments.php",
      {
        method: "GET",
        credentials: "include",
      }
    );

    const result = await response.json();
    if (result.status !== "success") return;

    const tbody = document.getElementById("delivery-table-body");
    tbody.innerHTML = "";

    // Filter for deliveries only
    result.data
      .filter((row) => row.delivery_type === "delivery")
      .forEach((row) => {
        const tr = document.createElement("tr");
        tr.classList.add("border-b", "border-gray-700");

        tr.innerHTML = `
            <td class="py-2 px-4">${row.user_name ?? ""}</td>
            <td class="py-2 px-4">${row.delivery_type ?? ""}</td>
            <td class="py-2 px-4">${row.delivery_address || "No address provided"}</td>
            <td class="py-2 px-4 flex items-center gap-2">
    <select 
      class="delivery-status bg-[#1e1e1e] border border-gray-600 rounded px-2 py-1" 
      data-id="${row.payment_id}">
      <option value="pending" ${row.delivery_status === "pending" ? "selected" : ""}>Pending</option>
      <option value="preparing" ${row.delivery_status === "preparing" ? "selected" : ""}>Preparing</option>
      <option value="out_for_delivery" ${row.delivery_status === "out_for_delivery" ? "selected" : ""}>Out for Delivery</option>
      <option value="delivered" ${row.delivery_status === "delivered" ? "selected" : ""}>Delivered</option>
      <option value="cancelled" ${row.delivery_status === "cancelled" ? "selected" : ""}>Cancelled</option>
    </select>
    <button 
      class="save-delivery hidden text-green-400 hover:text-green-600" 
      data-id="${row.payment_id}">
      <i class="bi bi-check2-circle text-xl"></i>
    </button>
  </td>
            <td class="py-2 px-4">${row.mop ?? ""}</td>
            <td class="py-2 px-4">${row.payment_date ?? ""}</td>
          `;

        tbody.appendChild(tr);
      });
  } catch (err) {
    console.error("Error loading deliveries:", err);
  }
};

// ========== PAGE LOAD ==========
document.addEventListener("DOMContentLoaded", () => {
  // Users
  renderTable("get/allUsers.php", "users-table-body", [
    "user_id",
    "username",
    "email",
    "created_at",
  ]);
  // reservations
  renderReservationsTable();
  // Orders
  renderTable("get/allOrders.php", "orders-table-body", [
    "order_id",
    "user_name",
    "product_name",
    "quantity",
    "price",
    "customize",
    "payment_id",
    "payment_status",
    "order_date",
  ]);

  // Payments
  renderPaymentsTable();
  renderDeliveriesTable();
});

// ========== SHOW PAYMENT SCREENSHOT ==========
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("show-screenshot")) {
    let imgSrc = e.target.getAttribute("data-src");
    if (imgSrc && !imgSrc.startsWith("http")) {
      imgSrc = `http://localhost:8000/${imgSrc}`;
    }
    const modal = document.getElementById("imageModal");
    const modalImg = document.getElementById("modalImage");
    modalImg.src = imgSrc || "";
    modal.classList.remove("hidden");
  }

  if (e.target.id === "closeModal" || e.target.id === "imageModal") {
    document.getElementById("imageModal").classList.add("hidden");
    document.getElementById("modalImage").src = "";
  }
});

// ========== SAVE PAYMENT STATUS ==========
document.addEventListener("change", (e) => {
  if (e.target.classList.contains("payment-status")) {
    const saveBtn = e.target.parentElement.querySelector(".save-status");
    saveBtn.classList.remove("hidden");
  }
});
// SAVE button click
document.addEventListener("click", async (e) => {
  if (e.target.closest(".save-status")) {
    const btn = e.target.closest(".save-status");
    const paymentId = btn.getAttribute("data-id");
    const select = btn.parentElement.querySelector(".payment-status");
    const newStatus = select.value;

    try {
      const res = await fetch(
        "http://localhost:8000/api/admin/update/updatePayment.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            payment_id: paymentId,
            payment_status: newStatus,
          }),
        }
      );

      const text = await res.text();
      const result = JSON.parse(text);

      if (result.status === "success") {
        Swal.fire({
          title: "Success",
          text: "Payment status updated.",
          icon: "success",
          timer: 1200,
          showConfirmButton: false,
        });

        btn.classList.add("hidden");
        setTimeout(() => {
          window.location.reload();
        }, 1201);
      } else {
        Swal.fire("Error", result.message || "Failed to update.", "error");
      }
    } catch (err) {
      console.error("Error:", err);
      Swal.fire("Error", "Something went wrong with the server.", "error");
    }
  }
});
// ========== SAVE DELIVERY STATUS ==========
document.addEventListener("change", (e) => {
  if (e.target.classList.contains("delivery-status")) {
    const saveBtn = e.target.parentElement.querySelector(".save-delivery");
    saveBtn.classList.remove("hidden");
  }
});

document.addEventListener("click", async (e) => {
  if (e.target.closest(".save-delivery")) {
    const btn = e.target.closest(".save-delivery");
    const paymentId = btn.getAttribute("data-id");
    const select = btn.parentElement.querySelector(".delivery-status");
    const newStatus = select.value;

    try {
      const res = await fetch(
        "http://localhost:8000/api/admin/update/updateDeliveryStatus.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            payment_id: paymentId,
            delivery_status: newStatus,
          }),
        }
      );

      const text = await res.text();
      const result = JSON.parse(text);

      if (result.status === "success") {
        Swal.fire({
          title: "Success",
          text: "Delivery status updated.",
          icon: "success",
          timer: 1200,
          showConfirmButton: false,
        });

        btn.classList.add("hidden");
        setTimeout(() => {
          window.location.reload();
        }, 1201);
      } else {
        Swal.fire("Error", result.message || "Failed to update.", "error");
      }
    } catch (err) {
      console.error("Error:", err);
      Swal.fire("Error", "Something went wrong with the server.", "error");
    }
  }
});

// ========== DELETE HANDLERS ==========

// DELETE USER
document.addEventListener("click", async (e) => {
  const btn = e.target.closest(".delete-user");
  if (!btn) return;

  const id = btn.dataset.id;
  const confirmDelete = await Swal.fire({
    title: "Are you sure?",
    text: "This will permanently delete the user!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, delete it!",
  });

  if (!confirmDelete.isConfirmed) return;

  try {
    const res = await fetch(
      "http://localhost:8000/api/admin/delete/deleteUser.php",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ user_id: id }),
      }
    );
    const result = await res.json();

    if (result.status === "success") {
      Swal.fire("Deleted!", "User has been removed.", "success");
      renderTable("get/allUsers.php", "users-table-body", [
        "user_id",
        "username",
        "email",
        "created_at",
      ]);
    } else {
      Swal.fire("Error", result.message, "error");
    }
  } catch (err) {
    Swal.fire("Error", "Failed to delete user.", "error");
    console.error(err);
  }
});

// DELETE RESERVATION
document.addEventListener("click", async (e) => {
  const btn = e.target.closest(".delete-reservation");
  if (!btn) return;

  const id = btn.dataset.id;
  const confirmDelete = await Swal.fire({
    title: "Delete reservation?",
    text: "This reservation will be removed!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, delete it!",
  });

  if (!confirmDelete.isConfirmed) return;

  try {
    const res = await fetch(
      "http://localhost:8000/api/admin/delete/deleteReservation.php",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ reservation_id: id }),
      }
    );
    const result = await res.json();

    if (result.status === "success") {
      Swal.fire("Deleted!", "Reservation has been removed.", "success");
      renderTable("get/allReservations.php", "reservations-table-body", [
        "reservation_id",
        "user_name",
        "reservation_date",
        "reservation_time",
        "number_of_people",
        "status",
        "created_at",
      ]);
    } else {
      Swal.fire("Error", result.message, "error");
    }
  } catch (err) {
    Swal.fire("Error", "Failed to delete reservation.", "error");
    console.error(err);
  }
});

// DELETE ORDER
document.addEventListener("click", async (e) => {
  const btn = e.target.closest(".delete-order");
  if (!btn) return;

  const id = btn.dataset.id;
  const confirmDelete = await Swal.fire({
    title: "Delete order?",
    text: "This order will be removed!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, delete it!",
  });

  if (!confirmDelete.isConfirmed) return;

  try {
    const res = await fetch(
      "http://localhost:8000/api/admin/delete/deleteOrder.php",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ order_id: id }),
      }
    );
    const result = await res.json();

    if (result.status === "success") {
      Swal.fire("Deleted!", "Order has been removed.", "success");
      renderTable("get/allOrders.php", "orders-table-body", [
        "order_id",
        "user_name",
        "product_name",
        "quantity",
        "price",
        "customize",
        "payment_id",
        "payment_status",
        "order_date",
      ]);
    } else {
      Swal.fire("Error", result.message, "error");
    }
  } catch (err) {
    Swal.fire("Error", "Failed to delete order.", "error");
    console.error(err);
  }
});

// DELETE PAYMENT
document.addEventListener("click", async (e) => {
  const btn = e.target.closest(".delete-payment");
  if (!btn) return;

  const id = btn.dataset.id;
  const confirmDelete = await Swal.fire({
    title: "Delete payment?",
    text: "This payment will be removed!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, delete it!",
  });

  if (!confirmDelete.isConfirmed) return;

  try {
    const res = await fetch(
      "http://localhost:8000/api/admin/delete/deletePayment.php",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ payment_id: id }),
      }
    );
    const result = await res.json();

    if (result.status === "success") {
      Swal.fire("Deleted!", "Payment has been removed.", "success");
      renderPaymentsTable();
    } else {
      Swal.fire("Error", result.message, "error");
    }
  } catch (err) {
    Swal.fire("Error", "Failed to delete payment.", "error");
    console.error(err);
  }
});
