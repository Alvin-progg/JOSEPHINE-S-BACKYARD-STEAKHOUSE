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

  // Payments
  renderTable("get/allPayments.php", "payments-table-body", [
    "payment_id",
    "user_name", // instead of user_id
    "reference_number",
    "total_amount",
    "payment_status",
    "payment_date",
  ]);
});
