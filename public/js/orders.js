// Load and display orders when page loads
document.addEventListener("DOMContentLoaded", () => {
  loadOrders();
});

// Function to load orders from the API
async function loadOrders() {
  try {
    const response = await fetch("/api/orders/getOrders.php", {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("Orders API Response:", result);

    if (result.success) {
      renderOrders(result.data);
    } else {
      console.error("Failed to load orders:", result.message);
      showEmptyOrdersState();
    }
  } catch (error) {
    console.error("Error loading orders:", error);
    showEmptyOrdersState();
  }
}

// Function to render orders in both mobile and desktop views
function renderOrders(orders) {
  const mobileContainer = document.querySelector("#order_table .block.lg\\:hidden");
  const desktopTableBody = document.querySelector("#order_table tbody");

  if (!orders || orders.length === 0) {
    showEmptyOrdersState();
    return;
  }

  // Clear existing content
  if (mobileContainer) mobileContainer.innerHTML = "";
  if (desktopTableBody) desktopTableBody.innerHTML = "";

  orders.forEach((order) => {
    const deliveryStatusStyle = getDeliveryStatusStyle(order.delivery_status);
    const paymentStatusStyle = getPaymentStatusStyle(order.payment_status);

    // Render mobile card
    if (mobileContainer) {
      const mobileCard = createMobileOrderCard(order, deliveryStatusStyle, paymentStatusStyle);
      mobileContainer.appendChild(mobileCard);
    }

    // Render desktop table row
    if (desktopTableBody) {
      const tableRow = createOrderTableRow(order, deliveryStatusStyle, paymentStatusStyle);
      desktopTableBody.appendChild(tableRow);
    }
  });
}

// Function to create mobile order card
function createMobileOrderCard(order, deliveryStatusStyle, paymentStatusStyle) {
  const card = document.createElement("div");
  card.className = "bg-[#2a2a2a] p-4 rounded-lg border border-gray-600";

  const totalPrice = (parseFloat(order.price) * parseInt(order.quantity)).toFixed(2);
  const orderDate = order.order_date ? new Date(order.order_date).toLocaleDateString() : 'N/A';

  card.innerHTML = `
    <div class="flex justify-between items-start mb-3">
      <div>
        <p class="text-[var(--color-primary-400)] font-semibold">ORD${order.order_id}</p>
        <p class="text-[#fffeee] text-sm font-medium">₱${totalPrice}</p>
        <p class="text-gray-400 text-xs mt-1">${orderDate}</p>
      </div>
      <div class="flex flex-col gap-1">
        <span class="${paymentStatusStyle.bgClass} text-white px-2 py-1 rounded text-xs text-center">
          Pay: ${order.payment_status || 'N/A'}
        </span>
        <span class="${deliveryStatusStyle.bgClass} text-white px-2 py-1 rounded text-xs text-center">
          Del: ${order.delivery_status || 'N/A'}
        </span>
      </div>
    </div>
    <div class="mb-3">
      <p class="text-gray-400 text-sm">Product</p>
      <p class="text-[#fffeee] text-sm">${order.product_name}</p>
    </div>
    <div class="grid grid-cols-2 gap-4 text-sm mb-3">
      <div>
        <p class="text-gray-400">Quantity</p>
        <p class="text-[#fffeee]">${order.quantity}</p>
      </div>
      <div>
        <p class="text-gray-400">Delivery</p>
        <p class="text-[#fffeee] capitalize">${order.delivery_type || 'N/A'}</p>
      </div>
    </div>
    ${order.delivery_address ? `
      <div class="mb-3">
        <p class="text-gray-400 text-sm">Address</p>
        <p class="text-[#fffeee] text-sm">${order.delivery_address}</p>
      </div>
    ` : ''}
    ${canCancelOrder(order.delivery_status, order.payment_status) ? `
      <button
        onclick="cancelOrder(${order.order_id})"
        class="w-full bg-red-600 text-[#fffeee] py-2 rounded-md hover:bg-red-700 transition-colors duration-300"
      >
        <i class="bi bi-x-circle mr-2"></i>Cancel Order
      </button>
    ` : `
      <button
        class="w-full bg-gray-600 text-[#fffeee] py-2 rounded-md cursor-not-allowed"
        disabled
      >
        <i class="bi bi-x-circle mr-2"></i>Cannot Cancel
      </button>
    `}
  `;

  return card;
}

// Function to create desktop table row
function createOrderTableRow(order, deliveryStatusStyle, paymentStatusStyle) {
  const row = document.createElement("tr");
  row.className = "hover:bg-[#2a2a2a] transition-colors duration-200 border-b border-gray-700";

  const totalPrice = (parseFloat(order.price) * parseInt(order.quantity)).toFixed(2);

  row.innerHTML = `
    <td class="py-4 px-4 text-sm text-[var(--color-primary-400)] font-semibold">
      ORD${order.order_id}
    </td>
    <td class="py-4 px-4 text-sm text-[#fffeee]">${order.product_name}</td>
    <td class="py-4 px-4 text-sm text-[#fffeee]">${order.quantity}</td>
    <td class="py-4 px-4 text-sm text-[#fffeee] font-medium">₱${totalPrice}</td>
    <td class="py-4 px-4 text-sm">
      <div class="flex gap-2">
        <span class="${paymentStatusStyle.bgClass} text-white px-2 py-1 rounded text-xs">
          ${order.payment_status || 'N/A'}
        </span>
      </div>
    </td>
    <td class="py-4 px-4 text-sm">
      <div class="flex gap-2">
        <span class="${deliveryStatusStyle.bgClass} text-white px-2 py-1 rounded text-xs">
          ${order.delivery_status || 'N/A'}
        </span>
      </div>
    </td>
    <td class="py-4 px-4 text-center">
      ${canCancelOrder(order.delivery_status, order.payment_status) ? `
        <button
          onclick="cancelOrder(${order.order_id})"
          class="bg-red-600 text-[#fffeee] px-3 py-1 rounded-md hover:bg-red-700 transition-colors duration-300 text-sm"
        >
          <i class="bi bi-x-circle mr-1"></i>Cancel
        </button>
      ` : `
        <button
          class="bg-gray-600 text-[#fffeee] px-3 py-1 rounded-md cursor-not-allowed text-sm"
          disabled
        >
          <i class="bi bi-x-circle mr-1"></i>Cannot Cancel
        </button>
      `}
    </td>
  `;

  return row;
}

// Function to determine if order can be cancelled
function canCancelOrder(deliveryStatus, paymentStatus) {
  const nonCancellableDeliveryStatuses = ['completed', 'delivered', 'cancelled'];
  const nonCancellablePaymentStatuses = ['rejected'];
  
  return !nonCancellableDeliveryStatuses.includes(deliveryStatus?.toLowerCase()) &&
         !nonCancellablePaymentStatuses.includes(paymentStatus?.toLowerCase());
}

// Function to get delivery status styling
function getDeliveryStatusStyle(status) {
  if (!status) return { bgClass: "bg-gray-600" };
  
  switch (status.toLowerCase()) {
    case "pending":
      return { bgClass: "bg-yellow-600" };
    case "processing":
    case "preparing":
      return { bgClass: "bg-blue-600" };
    case "shipped":
    case "out for delivery":
      return { bgClass: "bg-purple-600" };
    case "delivered":
    case "completed":
      return { bgClass: "bg-green-600" };
    case "cancelled":
      return { bgClass: "bg-red-600" };
    default:
      return { bgClass: "bg-gray-600" };
  }
}

// Function to get payment status styling
function getPaymentStatusStyle(status) {
  if (!status) return { bgClass: "bg-gray-600" };
  
  switch (status.toLowerCase()) {
    case "pending":
      return { bgClass: "bg-yellow-600" };
    case "verified":
    case "paid":
    case "completed":
      return { bgClass: "bg-green-600" };
    case "rejected":
    case "failed":
      return { bgClass: "bg-red-600" };
    default:
      return { bgClass: "bg-gray-600" };
  }
}

// Function to show empty state
function showEmptyOrdersState() {
  const mobileContainer = document.querySelector("#order_table .block.lg\\:hidden");
  const desktopTableBody = document.querySelector("#order_table tbody");

  const emptyMessage = `
    <div class="text-center py-8 text-gray-400">
      <i class="bi bi-cart-x text-4xl mb-3"></i>
      <p class="text-lg">No orders found</p>
      <p class="text-sm">Place your first order from our menu!</p>
    </div>
  `;

  if (mobileContainer) {
    mobileContainer.innerHTML = emptyMessage;
  }

  if (desktopTableBody) {
    desktopTableBody.innerHTML = `
      <tr>
        <td colspan="7" class="py-8 text-center text-gray-400">
          <div>
            <i class="bi bi-cart-x text-4xl mb-3 block"></i>
            <p class="text-lg">No orders found</p>
            <p class="text-sm">Place your first order from our menu!</p>
          </div>
        </td>
      </tr>
    `;
  }
}

// Function to cancel an order
async function cancelOrder(orderId) {
  const result = await Swal.fire({
    title: "Cancel Order?",
    text: "Are you sure you want to cancel this order? This action cannot be undone.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#dc2626",
    cancelButtonColor: "#6b7280",
    confirmButtonText: "Yes, cancel it!",
    cancelButtonText: "Keep order",
  });

  if (!result.isConfirmed) {
    return;
  }

  try {
    const response = await fetch("/api/orders/cancelOrder.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        order_id: orderId,
      }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      Swal.fire({
        icon: "success",
        title: "Cancelled!",
        text: "Your order has been cancelled.",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });

      // Reload orders
      loadOrders();
    } else {
      Swal.fire({
        icon: "error",
        title: "Cancellation Failed",
        text: data.message || "Failed to cancel order.",
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