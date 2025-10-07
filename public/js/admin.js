async function renderTable(url, tbodyId, columns) {
  try {
    const response = await fetch(`http://localhost:8000/api/admin/${url}`, {
      method: "GET",
      credentials: "include",
    });

    const result = await response.json();

    // log the result
    console.log(result);
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
          <button class="text-blue-400 hover:text-blue-600">✏️</button>
          <button class="text-red-400 hover:text-red-600">🗑️</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error(`Error loading ${url}:`, err);
  }
}
// FUNCTION TO RENder payments table with screenshot column
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
              ? `<button class="show-screenshot text-green-500 hover:text-green-700" 
                        data-src="${row.screenshot_path}">View</button>`
              : "N/A"
          }
        </td>
        <td class="py-2 px-4">${row.total_amount ?? ""}</td>
        <td class="py-2 px-4">${row.payment_status ?? ""}</td>
        <td class="py-2 px-4">${row.payment_date ?? ""}</td>
        <td class="py-2 px-4 flex gap-2">
          <button class="text-blue-400 hover:text-blue-600">✏️</button>
          <button class="text-red-400 hover:text-red-600">🗑️</button>
        </td>
      `;

      tbody.appendChild(tr); // ✅ inside the loop
    });
  } catch (err) {
    console.error("Error loading payments:", err);
  }
};

document.addEventListener("DOMContentLoaded", () => {
  // Users
  renderTable("get/allUsers.php", "users-table-body", [
    "user_id",
    "username",
    "email",
    "created_at",
  ]);
  renderTable("get/allReservations.php", "reservations-table-body", [
    "reservation_id",
    "user_name", // instead of user_id
    "reservation_date",
    "reservation_time",
    "number_of_people",
    "status",
    "created_at",
  ]);

  // Orders
  renderTable("get/allOrders.php", "orders-table-body", [
    "order_id",
    "user_name", // instead of user_id
    "product_name",
    "quantity",
    "price",
    "customize",
    "payment_id",
    "payment_status", // NEW
    "order_date",
  ]);

  // Payments with screenshot column
  renderPaymentsTable();
});

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("show-screenshot")) {
    let imgSrc = e.target.getAttribute("data-src");

    // ✅ Ensure full URL (important if backend returns relative path)
    if (imgSrc && !imgSrc.startsWith("http")) {
      imgSrc = `http://localhost:8000/${imgSrc}`;
    }

    const modal = document.getElementById("imageModal");
    const modalImg = document.getElementById("modalImage");

    modalImg.src = imgSrc || ""; // fallback if empty
    modal.classList.remove("hidden");
  }

  if (e.target.id === "closeModal" || e.target.id === "imageModal") {
    document.getElementById("imageModal").classList.add("hidden");
    document.getElementById("modalImage").src = ""; // clear img when closing
  }
});
