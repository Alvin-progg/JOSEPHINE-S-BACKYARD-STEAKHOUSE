

// Global cart variable
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Save cart to localStorage
function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

// Calculate grand total
function calculateGrandTotal() {
  return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2);
}

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

// Update order type notice
function updateOrderTypeNotice(type) {
  const notice = document.getElementById('order-type-notice');
  const icon = document.getElementById('order-type-icon');
  const title = document.getElementById('order-type-title');
  const desc = document.getElementById('order-type-desc');
  
  if (type === 'delivery') {
    notice.className = 'bg-green-900 bg-opacity-20 border border-green-500 rounded-lg p-4';
    icon.className = 'bi bi-truck text-green-400 text-2xl';
    title.textContent = 'Delivery Order';
    title.className = 'text-sm text-green-200 font-semibold';
    desc.textContent = 'Your order will be delivered to your specified address.';
    desc.className = 'text-xs text-green-300';
  } else {
    notice.className = 'bg-blue-900 bg-opacity-20 border border-blue-500 rounded-lg p-4';
    icon.className = 'bi bi-shop text-blue-400 text-2xl';
    title.textContent = 'Pickup Order';
    title.className = 'text-sm text-blue-200 font-semibold';
    desc.textContent = 'This order is for pickup only. Please pick up your order at our store location.';
    desc.className = 'text-xs text-blue-300';
  }
}

// Payment Modal Functions
function openPaymentModal() {
  const modal = document.getElementById('payment-modal');
  modal.classList.remove('hidden');
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  
  // Update modal total
  const grandTotal = calculateGrandTotal();
  document.getElementById('modal-grand-total').textContent = `₱${grandTotal}`;
  document.getElementById('cod-amount').textContent = `₱${grandTotal}`;
  
  // Reset to pickup and GCash by default
  document.getElementById('delivery-pickup').checked = true;
  document.getElementById('payment-gcash').checked = true;
  document.getElementById('delivery-address-section').classList.add('hidden');
  document.getElementById('gcash-section').classList.remove('hidden');
  document.getElementById('cod-section').classList.add('hidden');
  document.getElementById('payment-proof-section').classList.remove('hidden');
  updateOrderTypeNotice('pickup');
  updatePaymentReminders('Payonline');
}

function closePaymentModal() {
  const modal = document.getElementById('payment-modal');
  modal.classList.add('hidden');
  modal.style.display = 'none';
  document.body.style.overflow = 'auto';
  
  // Reset form
  document.getElementById('payment-form').reset();
  document.getElementById('screenshot-preview').classList.add('hidden');
  document.getElementById('screenshot-preview').src = '';
  document.getElementById('delivery-address-section').classList.add('hidden');
  clearPaymentErrors();
}

function clearPaymentErrors() {
  const errorElements = document.querySelectorAll('.error-message');
  errorElements.forEach(el => el.remove());
  
  const inputs = document.querySelectorAll('#payment-form input, #payment-form textarea');
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

function updatePaymentReminders(paymentMethod) {
  const reminderPayment = document.getElementById('reminder-payment');
  const reminderAmount = document.getElementById('reminder-amount');
  const reminderProcessing = document.getElementById('reminder-processing');
  
  if (paymentMethod === 'COD') {
    reminderPayment.innerHTML = '• Payment method: <strong>Cash on Delivery</strong>';
    reminderAmount.textContent = '• Prepare exact cash amount';
    reminderProcessing.textContent = '• Payment will be collected upon delivery/pickup';
  } else {
    reminderPayment.innerHTML = '• Payment method: <strong>GCash only</strong>';
    reminderAmount.textContent = '• Send the exact amount shown above';
    reminderProcessing.textContent = '• Your order will be processed once payment is verified';
  }
}

function validatePaymentForm() {
  clearPaymentErrors();
  let isValid = true;
  
  const paymentMethod = document.querySelector('input[name="payment_method"]:checked').value;
  
  // Only validate GCash fields if GCash is selected
  if (paymentMethod === 'Payonline') {
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
  }
  
  // Delivery address validation (only if delivery is selected)
  const deliveryType = document.querySelector('input[name="delivery_type"]:checked').value;
  if (deliveryType === 'delivery') {
    const address = document.getElementById('delivery-address').value.trim();
    if (!address) {
      showFieldError('delivery-address', 'Delivery address is required');
      isValid = false;
    } else if (address.length < 15) {
      showFieldError('delivery-address', 'Please provide complete delivery address');
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
  console.log('Order page DOMContentLoaded');
  console.log('Global cart from localStorage:', localStorage.getItem('cart'));
  console.log('Parsed cart:', cart);
  
  const category = document.getElementById("category");
  const products = document.getElementById("products");
  const selectedCategory = document.getElementById("selectedCategory");
  const quantity = document.getElementById("quantity");
  const total = document.getElementById("total");

  // Check if cart is empty and show appropriate message
  const emptyCartSection = document.getElementById('empty-cart-checkout');
  const cartItemsSection = document.getElementById('cart-items-section');
  const cartItemCount = document.getElementById('cart-item-count');
  
  console.log('Initial cart length:', cart.length);
  
  if (cart.length === 0) {
    console.log('Showing empty cart message');
    if (emptyCartSection) emptyCartSection.classList.remove('hidden');
    if (cartItemsSection) cartItemsSection.classList.add('hidden');
  } else {
    console.log('Showing cart items');
    if (emptyCartSection) emptyCartSection.classList.add('hidden');
    if (cartItemsSection) cartItemsSection.classList.remove('hidden');
  }

  // Fetch menu data for adding more items (optional feature - keep the category/product selectors hidden)
  // We'll keep the functionality but hide the form since users should add from menu page
  if (category) category.style.display = 'none';
  if (products) products.style.display = 'none';
  if (selectedCategory) selectedCategory.style.display = 'none';
  if (quantity) quantity.style.display = 'none';
  if (total) total.style.display = 'none';

  // fetch the json file - kept for potential future use
  const menu = await fetch("../../public/json/menu.json");
  const menuData = await menu.json();

  // populate category select - only if element exists
  if (category) {
    Object.keys(menuData).forEach((cat) => {
      const option = document.createElement("option");
      option.value = cat;
      option.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
      category.appendChild(option);
    });
  }

  // render products based on category
  function renderProducts(cat) {
    if (!selectedCategory || !products) return;
    selectedCategory.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
    products.innerHTML =
      '<option value="" disabled selected>Select a product</option>';

    menuData[cat].forEach((item) => {
      const option = document.createElement("option");
      option.value = JSON.stringify({ name: item.name, price: item.price });
      option.textContent = `${item.name} - ${item.price}`;
      products.appendChild(option);
    });
  }

  // update total price
  function updateTotal() {
    if (!products || !quantity || !total) return;
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

  if (category) {
    category.addEventListener("change", (e) => {
      renderProducts(e.target.value);
      if (total) total.value = "₱0.00";
    });
  }

  if (products) products.addEventListener("change", updateTotal);
  if (quantity) quantity.addEventListener("input", updateTotal);

  function renderCart() {
    console.log('=== renderCart START ===');
    console.log('renderCart called, cart:', cart);
    console.log('Cart length:', cart.length);
    
    const container = document.getElementById("order-items");
    const emptyCartSection = document.getElementById('empty-cart-checkout');
    const cartItemsSection = document.getElementById('cart-items-section');
    const cartItemCount = document.getElementById('cart-item-count');
    const subtotal = document.getElementById('subtotal');
    const grandTotal = document.getElementById('grand-total');
    
    console.log('Elements found:', {
      container: container ? 'FOUND' : 'NULL',
      emptyCartSection: emptyCartSection ? 'FOUND' : 'NULL',
      cartItemsSection: cartItemsSection ? 'FOUND' : 'NULL'
    });
    
    if (!container) {
      console.error('Container element not found!');
      return;
    }
    
    container.innerHTML = "";
    console.log('Container cleared');

    if (cart.length === 0) {
      console.log('Cart is empty - showing empty message');
      if (emptyCartSection) {
        emptyCartSection.classList.remove('hidden');
        console.log('Empty section shown');
      }
      if (cartItemsSection) {
        cartItemsSection.classList.add('hidden');
        console.log('Cart section hidden');
      }
      return;
    }

    console.log('Cart has items - rendering', cart.length, 'items');
    if (emptyCartSection) {
      emptyCartSection.classList.add('hidden');
      console.log('Empty section hidden');
    }
    if (cartItemsSection) {
      cartItemsSection.classList.remove('hidden');
      console.log('Cart section shown');
    }
    
    // Update item count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    console.log('Total items:', totalItems);
    if (cartItemCount) cartItemCount.textContent = `${totalItems} ${totalItems === 1 ? 'item' : 'items'}`;

    cart.forEach((item, index) => {
      console.log(`Creating card for item ${index}:`, item.name);
      const card = document.createElement("div");
      card.classList.add(
        "bg-[#2a2a2a]", 
        "border", 
        "border-gray-700", 
        "rounded-lg", 
        "p-4", 
        "hover:border-[var(--color-primary-600)]", 
        "transition-all", 
        "duration-300",
        "hover:shadow-lg",
        "hover:shadow-[var(--color-primary-600)]/10"
      );
      
      const itemTotal = (item.price * item.quantity).toFixed(2);
      const hasCustomization = item.customize && item.customize !== 'No Customization';
      
      card.innerHTML = `
        <div class="flex items-start justify-between gap-4">
          <!-- Left: Product Info -->
          <div class="flex-1 min-w-0">
            <h3 class="text-lg font-semibold text-[#fffeee] mb-2 truncate">${item.name}</h3>
            <div class="flex flex-wrap gap-3 text-sm mb-2">
              <div class="flex items-center gap-1 text-gray-400">
                <i class="bi bi-tag"></i>
                <span>₱${item.price.toFixed(2)}</span>
              </div>
              <div class="flex items-center gap-1 text-gray-400">
                <i class="bi bi-box"></i>
                <span>x${item.quantity}</span>
              </div>
            </div>
            ${hasCustomization ? `
              <div class="flex items-start gap-2 mt-2 text-sm">
                <i class="bi bi-pencil text-[var(--color-primary-600)] mt-0.5"></i>
                <span class="text-gray-300 italic line-clamp-2">${item.customize}</span>
              </div>
            ` : '<div class="text-sm text-gray-500 italic">No customization</div>'}
          </div>
          
          <!-- Right: Total & Actions -->
          <div class="flex flex-col items-end gap-3">
            <div class="text-right">
              <div class="text-xs text-gray-400 mb-1">Total</div>
              <div class="text-2xl font-bold text-[var(--color-primary-600)]">₱${itemTotal}</div>
            </div>
            <button 
              onclick="removeFromCart(${index})"
              class="flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors duration-300 text-sm font-medium"
            >
              <i class="bi bi-trash"></i>
              <span>Remove</span>
            </button>
          </div>
        </div>
      `;
      
      container.appendChild(card);
      console.log(`Card ${index} added to container`);
    });
    
    // Update totals
    const total = calculateGrandTotal();
    if (subtotal) subtotal.textContent = `₱${total}`;
    if (grandTotal) grandTotal.textContent = `₱${total}`;
    
    console.log('=== renderCart END ===');
  }

  function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    renderCart();
  }

  // Add to cart button (only if element exists - deprecated since we add from menu)
  const addToOrderBtn = document.getElementById("add-to-order");
  if (addToOrderBtn) {
    addToOrderBtn.addEventListener("click", async () => {
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
  }

  // Submit Order - Opens Payment Modal
  document.getElementById("submit-order")?.addEventListener("click", async () => {
    console.log('Submit order clicked, cart:', cart);
    
    if (cart.length === 0) {
      alertMessage("warning", "Invalid Cart", "Please add some items to the cart");
      return;
    }
    
    // Open payment modal instead of directly submitting
    console.log('Opening payment modal...');
    openPaymentModal();
  });

  // Payment Modal Close Buttons
  document.getElementById('close-payment-modal')?.addEventListener('click', closePaymentModal);
  document.getElementById('cancel-payment')?.addEventListener('click', closePaymentModal);

  // Screenshot preview
  document.getElementById('payment-screenshot')?.addEventListener('change', function() {
    previewScreenshot(this);
  });

  // Delivery type change handler
  document.querySelectorAll('input[name="delivery_type"]').forEach(radio => {
    radio.addEventListener('change', function() {
      const deliverySection = document.getElementById('delivery-address-section');
      if (this.value === 'delivery') {
        deliverySection.classList.remove('hidden');
        updateOrderTypeNotice('delivery');
      } else {
        deliverySection.classList.add('hidden');
        document.getElementById('delivery-address').value = '';
        updateOrderTypeNotice('pickup');
      }
    });
  });

  // Payment method change handler
  document.querySelectorAll('input[name="payment_method"]').forEach(radio => {
    radio.addEventListener('change', function() {
      const gcashSection = document.getElementById('gcash-section');
      const codSection = document.getElementById('cod-section');
      const paymentProofSection = document.getElementById('payment-proof-section');
      
      if (this.value === 'COD') {
        gcashSection.classList.add('hidden');
        codSection.classList.remove('hidden');
        paymentProofSection.classList.add('hidden');
        updatePaymentReminders('COD');
      } else {
        gcashSection.classList.remove('hidden');
        codSection.classList.add('hidden');
        paymentProofSection.classList.remove('hidden');
        updatePaymentReminders('Payonline');
      }
    });
  });

  // Payment Form Submit
  document.getElementById('confirm-payment')?.addEventListener('click', async () => {
    if (!validatePaymentForm()) {
      alertMessage("warning", "Incomplete Payment Information", "Please fill all required fields");
      return;
    }

    // Get delivery type and payment method
    const deliveryType = document.querySelector('input[name="delivery_type"]:checked')?.value;
    const paymentMethod = document.querySelector('input[name="payment_method"]:checked')?.value;
    
    if (!deliveryType) {
      alertMessage("error", "Error", "Please select delivery type");
      return;
    }

    if (!paymentMethod) {
      alertMessage("error", "Error", "Please select payment method");
      return;
    }

    // Prepare FormData to handle file upload
    const formData = new FormData();
    
    // Add payment method
    formData.append('mop', paymentMethod);
    
    // For GCash, add reference and screenshot
    if (paymentMethod === 'Payonline') {
      formData.append('reference_number', document.getElementById('payment-reference').value.trim());
      formData.append('screenshot', document.getElementById('payment-screenshot').files[0]);
    } else {
      // For COD, use dummy values
      formData.append('reference_number', 'COD-' + Date.now());
      formData.append('screenshot', new Blob([''], { type: 'text/plain' }), 'cod.txt');
    }
    
    formData.append('cart', JSON.stringify(cart));
    formData.append('total_amount', calculateGrandTotal());
    formData.append('delivery_type', deliveryType);
    
    // Only add delivery address if delivery is selected
    if (deliveryType === 'delivery') {
      const deliveryAddress = document.getElementById('delivery-address').value.trim();
      formData.append('delivery_address', deliveryAddress);
    }

    try {
      const response = await fetch("/api/orders/insertOrders.php", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      const text = await response.text();
      const data = JSON.parse(text);

      closePaymentModal();
      
      if (paymentMethod === 'COD') {
        successMessage("Order Placed Successfully", "Your COD order has been confirmed! We'll contact you shortly.");
      } else {
        successMessage("Order Placed Successfully", data.message);
      }
      
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
