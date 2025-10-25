// Menu Cart Functionality
// Initialize cart from localStorage
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Modal state
let currentItem = {
  name: '',
  price: 0
};

// Cart panel state
let isCartPanelOpen = false;

// Toggle cart panel
window.toggleCartPanel = function() {
  const cartPanel = document.getElementById('cart-panel');
  const toggleBtn = document.getElementById('cart-toggle-btn');
  
  isCartPanelOpen = !isCartPanelOpen;
  
  if (isCartPanelOpen) {
    cartPanel.style.transform = 'translateY(0)';
    toggleBtn.style.transform = 'scale(0.9)';
  } else {
    cartPanel.style.transform = 'translateY(100%)';
    toggleBtn.style.transform = 'scale(1)';
  }
};

// Alert helper functions
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

// Open customization modal
window.openCustomizeModal = function(productName, productPrice) {
  currentItem = {
    name: productName,
    price: productPrice
  };
  
  document.getElementById('modal-product-name').textContent = productName;
  document.getElementById('modal-product-price').textContent = `₱${productPrice}`;
  document.getElementById('customize-quantity').value = 1;
  document.getElementById('customize-notes').value = '';
  
  const modal = document.getElementById('customize-modal');
  modal.classList.remove('hidden');
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
};

// Close customization modal
window.closeCustomizeModal = function() {
  const modal = document.getElementById('customize-modal');
  modal.classList.add('hidden');
  modal.style.display = 'none';
  document.body.style.overflow = 'auto';
  
  // Reset form fields
  document.getElementById('customize-quantity').value = 1;
  document.getElementById('customize-notes').value = '';
  
  // Reset current item
  currentItem = { name: '', price: 0 };
};

// Quick add to cart (without customization)
window.quickAddToCart = function(productName, productPrice) {
  const item = {
    name: productName,
    price: productPrice,
    quantity: 1,
    customize: 'No Customization'
  };
  
  addItemToCart(item);
  successMessage("Added to Cart!", `${productName} x1 added successfully`);
  
  // Open cart panel immediately to show the item
  if (!isCartPanelOpen) {
    window.toggleCartPanel();
  }
};

// Add customized item to cart from modal
window.addCustomizedItemToCart = function() {
  console.log('addCustomizedItemToCart called');
  const quantity = parseInt(document.getElementById('customize-quantity').value);
  const notes = document.getElementById('customize-notes').value.trim();
  
  console.log('Quantity:', quantity, 'Notes:', notes, 'Current Item:', currentItem);
  
  if (quantity < 1) {
    alertMessage("warning", "Invalid Quantity", "Quantity must be at least 1");
    return;
  }
  
  if (!currentItem.name || currentItem.price === 0) {
    alertMessage("error", "Error", "Please select an item first");
    return;
  }
  
  const item = {
    name: currentItem.name,
    price: currentItem.price,
    quantity: quantity,
    customize: notes || 'No Customization'
  };
  
  console.log('Adding item to cart:', item);
  
  // Add item to cart
  addItemToCart(item);
  
  // Close modal first
  window.closeCustomizeModal();
  
  // Force render again to make sure it's updated
  renderCart();
  
  // Show success message
  successMessage("Added to Cart!", `${currentItem.name} x${quantity} added successfully`);
  
  // Open cart panel immediately to show the item - use setTimeout to ensure DOM is ready
  setTimeout(() => {
    if (!isCartPanelOpen) {
      window.toggleCartPanel();
    }
    // Force render one more time after panel opens
    renderCart();
  }, 50);
};

// Add item to cart
function addItemToCart(item) {
  console.log('Adding item to cart array:', item);
  console.log('Current cart before add:', cart);
  
  // Check if item with same customization already exists
  const existingItem = cart.find(
    (cartItem) => cartItem.name === item.name && cartItem.customize === item.customize
  );
  
  if (existingItem) {
    console.log('Item exists, updating quantity');
    existingItem.quantity += item.quantity;
  } else {
    console.log('New item, adding to cart');
    cart.push(item);
  }
  
  console.log('Cart after add:', cart);
  saveCart();
  renderCart();
  console.log('Cart rendered');
}

// Save cart to localStorage
function saveCart() {
  console.log('Saving cart to localStorage:', cart);
  localStorage.setItem('cart', JSON.stringify(cart));
  console.log('Saved. Verifying:', localStorage.getItem('cart'));
}

// Calculate cart total
function calculateCartTotal() {
  return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Render cart
function renderCart() {
  console.log('renderCart called, current cart:', cart);
  
  const cartItemsContainer = document.getElementById('cart-items-container');
  const cartSummary = document.getElementById('cart-summary');
  const cartCountPanel = document.getElementById('cart-count-panel');
  const floatingCartCount = document.getElementById('floating-cart-count');
  const cartTotal = document.getElementById('cart-total');
  
  console.log('Cart container element:', cartItemsContainer);
  
  if (!cartItemsContainer || !cartSummary || !cartCountPanel || !floatingCartCount || !cartTotal) {
    console.error('One or more cart elements not found!');
    return;
  }
  
  // Update cart count
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCountPanel.textContent = totalItems;
  floatingCartCount.textContent = totalItems;
  
  console.log('Total items:', totalItems);
  
  // Show/hide badge
  if (totalItems > 0) {
    floatingCartCount.style.display = 'flex';
  } else {
    floatingCartCount.style.display = 'none';
  }
  
  if (cart.length === 0) {
    console.log('Cart is empty, showing empty message');
    // Show empty message - recreate it since it might not exist
    cartSummary.classList.add('hidden');
    cartItemsContainer.innerHTML = `
      <div id="empty-cart-message" class="text-center py-8 text-gray-400">
        <i class="bi bi-cart-x text-5xl mb-3 block"></i>
        <p class="text-lg">Your cart is empty</p>
        <p class="text-sm">Add items from the menu!</p>
      </div>
    `;
    return;
  }
  
  console.log('Cart has items, rendering...');
  
  // Show summary and clear container
  cartSummary.classList.remove('hidden');
  
  // Clear container (this will remove the empty message if it exists)
  cartItemsContainer.innerHTML = '';
  
  // Render cart items
  cart.forEach((item, index) => {
    console.log('Rendering item:', item);
    const itemDiv = document.createElement('div');
    itemDiv.className = 'bg-[#2a2a2a] rounded-lg p-4 mb-3 border border-gray-600';
    
    const itemTotal = (item.price * item.quantity).toFixed(2);
    
    itemDiv.innerHTML = `
      <div class="flex justify-between items-start mb-2">
        <h3 class="text-[#fffeee] font-semibold text-sm flex-1">${item.name}</h3>
        <button 
          onclick="removeFromCart(${index})"
          class="text-red-500 hover:text-red-400 ml-2"
          title="Remove item"
        >
          <i class="bi bi-trash"></i>
        </button>
      </div>
      <div class="text-xs text-gray-400 mb-2">
        ${item.customize !== 'No Customization' ? `<p class="italic"><i class="bi bi-pencil mr-1"></i>${item.customize}</p>` : ''}
      </div>
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-2">
          <button 
            onclick="updateQuantity(${index}, -1)"
            class="bg-gray-700 text-[#fffeee] w-7 h-7 rounded hover:bg-gray-600 flex items-center justify-center"
          >
            <i class="bi bi-dash"></i>
          </button>
          <span class="text-[#fffeee] font-semibold w-8 text-center">${item.quantity}</span>
          <button 
            onclick="updateQuantity(${index}, 1)"
            class="bg-gray-700 text-[#fffeee] w-7 h-7 rounded hover:bg-gray-600 flex items-center justify-center"
          >
            <i class="bi bi-plus"></i>
          </button>
        </div>
        <div class="text-right">
          <p class="text-xs text-gray-400">₱${item.price.toFixed(2)} each</p>
          <p class="text-[var(--color-primary-600)] font-bold">₱${itemTotal}</p>
        </div>
      </div>
    `;
    
    cartItemsContainer.appendChild(itemDiv);
  });
  
  // Update total
  const total = calculateCartTotal();
  cartTotal.textContent = `₱${total.toFixed(2)}`;
  
  console.log('Cart rendered successfully, total:', total);
}

// Update item quantity
window.updateQuantity = function(index, change) {
  if (cart[index]) {
    cart[index].quantity += change;
    
    if (cart[index].quantity < 1) {
      window.removeFromCart(index);
      return;
    }
    
    saveCart();
    renderCart();
  }
};

// Remove item from cart
window.removeFromCart = function(index) {
  Swal.fire({
    title: 'Remove Item?',
    text: 'Are you sure you want to remove this item from your cart?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc2626',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Yes, remove it',
    cancelButtonText: 'Cancel'
  }).then((result) => {
    if (result.isConfirmed) {
      cart.splice(index, 1);
      saveCart();
      renderCart();
      successMessage("Removed!", "Item removed from cart");
    }
  });
}

// Proceed to checkout - opens payment modal (reusing order.js functionality)
function proceedToCheckout() {
  if (cart.length === 0) {
    alertMessage("warning", "Cart is Empty", "Please add items to your cart first");
    return;
  }
  
  // Redirect to order page with cart data
  window.location.href = '/views/user/order.html';
}

// Close modal when clicking outside
document.addEventListener('click', function(event) {
  const modal = document.getElementById('customize-modal');
  if (event.target === modal) {
    window.closeCustomizeModal();
  }
});

// Close modal on Escape key
document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    window.closeCustomizeModal();
  }
});

// Initialize cart on page load
document.addEventListener('DOMContentLoaded', function() {
  renderCart();
});
