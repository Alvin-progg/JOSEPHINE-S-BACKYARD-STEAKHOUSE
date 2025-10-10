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

      tr.innerHTML =
        columns
          .map((col) => `<td class="py-2 px-4">${row[col] ?? ""}</td>`)
          .join("") +
        `
        <td class="py-2 px-4 flex gap-2">
          <button class="delete-user " data-id="${row.user_id ?? ""}"><i class="bi bi-trash"></i></button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error(`Error loading ${url}:`, err);
  }
}

// ========== RENDER PAYMENTS TABLE WITH SCREENSHOT ==========
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
        <td class="py-2 px-4">${row.payment_status ?? ""}</td>
        <td class="py-2 px-4">${row.payment_date ?? ""}</td>
        <td class="py-2 px-4 flex gap-2">
          <button class="text-blue-400 hover:text-blue-600"><i class="bi bi-pen"></i></button>
          <button class="text-red-400 hover:text-red-600"><i class="bi bi-trash"></i></button>
        </td>
      `;

      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error("Error loading payments:", err);
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

  // Reservations
  renderTable("get/allReservations.php", "reservations-table-body", [
    "reservation_id",
    "user_name",
    "reservation_date",
    "reservation_time",
    "number_of_people",
    "status",
    "created_at",
  ]);

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
});

document.addEventListener("click", async (e) => {
  // Find button parent in case user clicks the <i>
  const deleteBtn = e.target.closest(".delete-user");
  const editBtn = e.target.closest(".edit-user");

  // SHOW PAYMENT SCREENSHOT
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

  // DELETE USER
  if (deleteBtn) {
    const userId = deleteBtn.getAttribute("data-id");
    console.log("Delete user ID:", userId); // Debug log
    const confirmDelete = await Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete the user!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (confirmDelete.isConfirmed) {
      try {
        const res = await fetch(
          "http://localhost:8000/api/admin/delete/deleteUser.php",
          {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: userId }),
          }
        );

        const result = await res.json();
        console.log(result);

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
        Swal.fire("Error", `Failed to Delete user: ${userId}`, "error");
        console.error(err);
      }
    }
  }

  // EDIT USER
  if (editBtn) {
    const userId = editBtn.getAttribute("data-id");

    const { value: formValues } = await Swal.fire({
      title: "Edit User",
      html:
        `<input id="swal-username" class="swal2-input" placeholder="Username">` +
        `<input id="swal-email" class="swal2-input" placeholder="Email">`,
      focusConfirm: false,
      preConfirm: () => {
        return {
          username: document.getElementById("swal-username").value,
          email: document.getElementById("swal-email").value,
        };
      },
    });

    if (formValues) {
      try {
        const res = await fetch(
          "http://localhost:8000/api/admin/updateUser.php",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ user_id: userId, ...formValues }),
          }
        );
        const result = await res.json();
        if (result.status === "success") {
          Swal.fire("Updated!", "User info updated.", "success");
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
        Swal.fire("Error", "Failed to update user", "error");
      }
    }
  }
});
