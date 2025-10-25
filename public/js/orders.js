// Global variable to store all orders
let allOrdersHomeData = [];

// Filter function for home page orders
window.filterOrders = function(status) {
  if (status === 'all') {
    renderOrders(allOrdersHomeData);
  } else {
    const filtered = allOrdersHomeData.filter(order => order.payment_status.toLowerCase() === status);
    renderOrders(filtered);
  }
};

// Load and display orders when page loads
document.addEventListener("DOMContentLoaded", () => {
  loadOrders();
  
  // Initialize filter to pending
  const filterSelect = document.getElementById("order-filter");
  if (filterSelect) {
    filterSelect.value = "pending";
  }
});

// Function to load orders from the API
async function loadOrders() {
  const loadingState = document.getElementById("orders-loading-state");
  
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
      allOrdersHomeData = result.data; // Store all data
      updateOrderStats(result.data);
      
      // Apply default filter (pending)
      const filterSelect = document.getElementById("order-filter");
      const currentFilter = filterSelect ? filterSelect.value : 'pending';
      window.filterOrders(currentFilter);
    } else {
      console.error("Failed to load orders:", result.message);
      showEmptyOrdersState();
    }
  } catch (error) {
    console.error("Error loading orders:", error);
    showEmptyOrdersState();
  } finally {
    if (loadingState) {
      loadingState.style.display = "none";
    }
  }
}

// Function to render orders in both mobile and desktop views
function renderOrders(orders) {
  const container = document.querySelector("#order_table #orders-container");
  const loadingState = document.getElementById("orders-loading-state");

  // Clear existing content
  if (container) container.innerHTML = "";

  if (!orders || orders.length === 0) {
    if (container) {
      const filterSelect = document.getElementById("order-filter");
      const currentFilter = filterSelect ? filterSelect.value : 'all';
      const filterText = currentFilter === 'all' ? '' : ` with status "${currentFilter}"`;
      
      container.innerHTML = `
        <div class="text-center py-12 text-gray-400">
          <i class="bi bi-inbox text-6xl mb-4 block"></i>
          <p class="text-xl mb-2">No orders found${filterText}</p>
          <p class="text-sm">Try adjusting the filter or place a new order</p>
        </div>
      `;
    }
    if (loadingState) loadingState.style.display = "none";
    return;
  }

  orders.forEach((order) => {
    const deliveryStatusStyle = getDeliveryStatusStyle(order.delivery_status);
    const paymentStatusStyle = getPaymentStatusStyle(order.payment_status);

    // Render order card
    if (container) {
      const orderCard = createOrderCard(order, deliveryStatusStyle, paymentStatusStyle);
      container.appendChild(orderCard);
    }
  });

  if (loadingState) loadingState.style.display = "none";
}

// Function to create modern order card
function createOrderCard(order, deliveryStatusStyle, paymentStatusStyle) {
  const card = document.createElement("div");
  card.className = "bg-[#2a2a2a] rounded-lg p-5 border border-gray-600 hover:border-[var(--color-primary-600)] transition-all duration-300 hover:shadow-lg";

  const totalPrice = (parseFloat(order.price) * parseInt(order.quantity)).toFixed(2);
  const orderDate = order.order_date ? new Date(order.order_date).toLocaleDateString() : 'N/A';
  const canCancel = order.delivery_status !== "Delivered" && order.delivery_status !== "Cancelled";

  card.innerHTML = `
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <!-- Left Section: Order Info -->
      <div class="flex-1">
        <div class="flex items-center gap-3 mb-3">
          <div class="bg-[var(--color-primary-600)] bg-opacity-20 p-2 rounded-lg">
            <i class="bi bi-bag-check text-2xl text-[var(--color-primary-600)]"></i>
          </div>
          <div>
            <p class="text-[var(--color-primary-400)] font-bold text-lg">ORD${order.order_id}</p>
            <p class="text-gray-400 text-sm">${orderDate}</p>
          </div>
        </div>
        
        <div class="mb-3">
          <p class="text-[#fffeee] font-semibold mb-1">${order.product_name}</p>
          <div class="flex items-center gap-4 text-sm">
            <span class="text-gray-400">Qty: <span class="text-[#fffeee] font-medium">${order.quantity}</span></span>
            <span class="text-[var(--color-primary-600)] font-bold text-lg">₱${totalPrice}</span>
          </div>
        </div>
        
        ${order.customize ? `
          <div class="bg-[#1e1e1e] rounded-lg p-2 text-xs">
            <p class="text-gray-400">Note: <span class="text-[#fffeee]">${order.customize}</span></p>
          </div>
        ` : ''}
      </div>

      <!-- Right Section: Status and Action -->
      <div class="flex flex-col items-stretch sm:items-end gap-2 sm:min-w-[180px]">
        <div class="flex gap-2">
          <span class="${paymentStatusStyle.bgClass} text-white px-3 py-1 rounded-lg text-xs font-semibold">
            ${order.payment_status || 'N/A'}
          </span>
          <span class="${deliveryStatusStyle.bgClass} text-white px-3 py-1 rounded-lg text-xs font-semibold">
            ${order.delivery_status || 'N/A'}
          </span>
        </div>
        ${canCancel ? `
          <button
            onclick="cancelOrder(${order.order_id})"
            class="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-[#fffeee] px-4 py-2 rounded-lg transition-all duration-300 text-sm font-semibold flex items-center justify-center gap-2"
          >
            <i class="bi bi-x-circle"></i>
            Cancel Order
          </button>
        ` : `
          <button
            disabled
            class="w-full sm:w-auto bg-gray-600 text-gray-400 px-4 py-2 rounded-lg text-sm font-semibold cursor-not-allowed"
          >
            ${order.delivery_status === "Delivered" ? "Completed" : "Cancelled"}
          </button>
        `}
      </div>
    </div>
  `;

  return card;
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
  const container = document.querySelector("#order_table #orders-container");
  const loadingState = document.getElementById("orders-loading-state");

  const emptyMessage = `
    <div class="text-center py-12 text-gray-400">
      <div class="bg-[#2a2a2a] rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
        <i class="bi bi-cart-x text-5xl text-gray-500"></i>
      </div>
      <p class="text-xl font-semibold text-[#fffeee] mb-2">No orders found</p>
      <p class="text-sm">Place your first order from our menu!</p>
    </div>
  `;

  if (container) {
    container.innerHTML = emptyMessage;
  }

  if (loadingState) loadingState.style.display = "none";
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
// Function to update dashboard stats for orders
function updateOrderStats(orders) {
  // Only update if we're on the home page
  const totalOrdersEl = document.getElementById("total-orders");
  if (!totalOrdersEl) return;

  // Count total orders
  totalOrdersEl.textContent = orders.length;

  // Count pending orders (orders that are not delivered or cancelled)
  const pendingOrders = orders.filter(
    (order) =>
      order.delivery_status !== "Delivered" &&
      order.delivery_status !== "Cancelled"
  ).length;

  // Store stats globally
  window.orderStats = {
    total: orders.length,
    pending: pendingOrders,
  };

  // Update pending count if reservations are already loaded
  if (typeof updatePendingCount === "function") {
    updatePendingCount();
  }
}
