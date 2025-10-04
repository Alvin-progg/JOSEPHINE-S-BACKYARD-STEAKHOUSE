// order.js - Enhanced with Payment Modal

// Helper function to copy text to clipboard
function copyToClipboard(text, label) {
  navigator.clipboard.writeText(text).then(() => {
    Swal.fire({
      icon: 'success',
      title: 'Copied!',
      text: `${label} copied to clipboard`,
      timer: 1500,
      showConfirmButton: false
    });
  }).catch(() => {
    Swal.fire({
      icon: 'error',
      title: 'Failed to copy',
      text: 'Please copy manually',
      timer: 1500,
      showConfirmButton: false
    });
  });
}

const alertMessage = (type, title, text, timer = 1500) => {
  Swal.fire({
    icon: type,
    title: title,
    text: text,
    timer: timer,
    allowOutsideClick: false,
    showConfirmButton: false,
    showCancelButton: false,
  });
};

const successMessage = async (title, text, timer = 1500) => {
  Swal.fire({
    icon: "success",
    title: title,
    text: text,
    timer: timer,
    allowOutsideClick: false,
    showConfirmButton: false,
    showCancelButton: false,
  });
};

// Payment Modal Functions
function openPaymentModal() {
  document.getElementById('payment-modal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  
  // Update modal total
  const grandTotal = calculateGrandTotal();
  document.getElementById('modal-grand-total').textContent = `₱${grandTotal}`;
}

function closePaymentModal() {
  document.getElementById('payment-modal').classList.add('hidden');
  document.body.style.overflow = 'auto';
  
  // Reset form
  document.getElementById('payment-form').reset();
  document.getElementById('screenshot-preview').classList.add('hidden');
  document.getElementById('screenshot-preview').src = '';
  clearPaymentErrors();
}

function clearPaymentErrors() {
  const errorElements = document.querySelectorAll('.error-message');
  errorElements.forEach(el => el.remove());
  
  const inputs = document.querySelectorAll('#payment-form input');
  inputs.forEach(input => {
    input.classList.remove('border-red-500');
  });
}

function showFieldError(fieldId, message) {
  const field = document.getElementById(fieldId);
  field.classList.add('border-red-500');
  
  // Remove existing error if any
  const existingError = field.parentElement.querySelector('.error-message');
  if (existingError) existingError.remove();
  
  // Add new error message
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message text-red-500 text-xs mt-1';
  errorDiv.textContent = message;
  field.parentElement.appendChild(errorDiv);
}

function validatePaymentForm() {
  clearPaymentErrors();
  let isValid = true;
  
  // Reference Number validation
  const refNumber = document.getElementById('payment-reference').value.trim();
  if (!refNumber) {
    showFieldError('payment-reference', 'Reference number is required');
    isValid = false;
  } else if (refNumber.length < 5) {
    showFieldError('payment-reference', 'Please enter a valid reference number');
    isValid = false;
  }
  
  // Screenshot validation
  const screenshot = document.getElementById('payment-screenshot').files[0];
  if (!screenshot) {
    showFieldError('payment-screenshot', 'Payment screenshot is required');
    isValid = false;
  } else {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!validTypes.includes(screenshot.type)) {
      showFieldError('payment-screenshot', 'Please upload a valid image (JPG, PNG, GIF)');
      isValid = false;
    }
    // Validate file size (max 5MB)
    else if (screenshot.size > 5 * 1024 * 1024) {
      showFieldError('payment-screenshot', 'File size must be less than 5MB');
      isValid = false;
    }
  }
  
  return isValid;
}

// Preview screenshot
function previewScreenshot(input) {
  const preview = document.getElementById('screenshot-preview');
  const file = input.files[0];
  
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      preview.src = e.target.result;
      preview.classList.remove('hidden');
    }
    reader.readAsDataURL(file);
  } else {
    preview.src = '';
    preview.classList.add('hidden');
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const category = document.getElementById("category");
  const products = document.getElementById("products");
  const selectedCategory = document.getElementById("selectedCategory");
  const quantity = document.getElementById("quantity");
  const total = document.getElementById("total");
  
  // Load cart from localStorage or initialize empty
  let cart = JSON.parse(localStorage.getItem('cart')) || [];

  // fetch the json file
  const menu = await fetch("../../public/json/menu.json");
  const menuData = await menu.json();

  // populate category select
  Object.keys(menuData).forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
    category.appendChild(option);
  });

  // render products based on category
  function renderProducts(cat) {
    selectedCategory.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
    products.innerHTML =
      '<option value="" disabled selected>Select a product</option>';

    if (cat === "coffee") {
      Object.entries(menuData.coffee).forEach(([type, items]) => {
        const optgroup = document.createElement("optgroup");
        optgroup.label = type.charAt(0).toUpperCase() + type.slice(1);

        items.forEach((item) => {
          const option = document.createElement("option");
          option.value = JSON.stringify({ name: item.name, price: item.price });
          option.textContent = `${item.name} - ${item.price}`;
          optgroup.appendChild(option);
        });

        products.appendChild(optgroup);
      });
    } else {
      menuData[cat].forEach((item) => {
        const option = document.createElement("option");
        option.value = JSON.stringify({ name: item.name, price: item.price });
        option.textContent = `${item.name} - ${item.price}`;
        products.appendChild(option);
      });
    }
  }

  // update total price
  function updateTotal() {
    if (!products.value || !quantity.value) {
      total.value = "₱0.00";
      return;
    }

    const { price } = JSON.parse(products.value);
    const numericPrice = parseFloat(price.replace(/[₱,]/g, ""));
    const qty = parseInt(quantity.value, 10);

    const totalPrice = numericPrice * qty;
    total.value = `₱${totalPrice.toFixed(2)}`;
  }

  category.addEventListener("change", (e) => {
    renderProducts(e.target.value);
    total.value = "₱0.00";
  });

  products.addEventListener("change", updateTotal);
  quantity.addEventListener("input", updateTotal);

  // Save cart to localStorage
  function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
  }

  // Calculate grand total
  window.calculateGrandTotal = function() {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2);
  }

  function renderCart() {
    const tbody = document.getElementById("order-items");
    tbody.innerHTML = "";

    if (cart.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center text-gray-400 py-4">No products added</td></tr>`;
      return;
    }

    cart.forEach((item, index) => {
      const row = document.createElement("tr");
      row.classList.add("border-b", "border-gray-600");
      row.innerHTML = `
        <td class="py-2 px-4 text-[#fffeee]">${item.name}</td>
        <td class="py-2 px-4 text-[#fffeee]">${item.quantity}</td>
        <td class="py-2 px-4 text-[#fffeee]">₱${item.price.toFixed(2)}</td>
        <td class="py-2 px-4 text-[#fffeee]">₱${(item.price * item.quantity).toFixed(2)}</td>
        <td class="py-2 px-4 text-[#fffeee]">${item.customize || 'No Customization'}</td>
        <td class="py-2 px-4 text-center">
          <button class="text-red-500 hover:text-red-400">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      `;

      row.querySelector("button").addEventListener("click", () => {
        removeFromCart(index);
      });

      tbody.appendChild(row);
    });
  }

  function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    renderCart();
  }

  // Add to cart button
  document.getElementById("add-to-order").addEventListener("click", async () => {
    if (!products.value || !quantity.value) {
      alertMessage("warning", "Input Warning", "Please input all fields");
      return;
    }

    let customize = document.getElementById("customize").value.trim();
    if (!customize) {
      customize = "No Customization";
    }

    const { name, price } = JSON.parse(products.value);
    const numericPrice = parseFloat(price.replace(/[₱,]/g, ""));
    const qty = parseInt(quantity.value, 10);

    const existingItem = cart.find(
      (item) => item.name === name && item.customize === customize
    );

    if (existingItem) {
      existingItem.quantity += qty;
    } else {
      cart.push({
        name,
        price: numericPrice,
        quantity: qty,
        customize,
      });
    }

    saveCart();
    successMessage("Add to Cart Successfully", `${name} x${qty} added!`);
    renderCart();
    document.getElementById("order-form").reset();
  });

  // Submit Order - Opens Payment Modal
  document.getElementById("submit-order")?.addEventListener("click", async () => {
    if (cart.length === 0) {
      alertMessage("warning", "Invalid Cart", "Please add some items to the cart");
      return;
    }
    
    // Open payment modal instead of directly submitting
    openPaymentModal();
  });

  // Payment Modal Close Buttons
  document.getElementById('close-payment-modal')?.addEventListener('click', closePaymentModal);
  document.getElementById('cancel-payment')?.addEventListener('click', closePaymentModal);

  // Screenshot preview
  document.getElementById('payment-screenshot')?.addEventListener('change', function() {
    previewScreenshot(this);
  });

  // Payment Form Submit
  document.getElementById('confirm-payment')?.addEventListener('click', async () => {
    if (!validatePaymentForm()) {
      alertMessage("warning", "Incomplete Payment Information", "Please provide reference number and payment screenshot");
      return;
    }

    // Prepare FormData to handle file upload
    const formData = new FormData();
    formData.append('reference_number', document.getElementById('payment-reference').value.trim());
    formData.append('screenshot', document.getElementById('payment-screenshot').files[0]);
    formData.append('cart', JSON.stringify(cart));
    formData.append('total_amount', calculateGrandTotal());

    try {
      const response = await fetch("/api/orders/insertOrders.php", {
        method: "POST",
        credentials: "include",
        body: formData, // Send as FormData for file upload
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      const text = await response.text();
      const data = JSON.parse(text);

      closePaymentModal();
      successMessage("Order Placed Successfully", data.message);
      
      // Clear cart
      cart = [];
      localStorage.removeItem('cart');
      renderCart();
      
    } catch (error) {
      alertMessage("error", "Submission Failed", error.message);
    }
  });

  // Initial cart render
  renderCart();
});