// Toggle dropdown menu
      function toggleDropdown() {
        const dropdown = document.getElementById('dropdown-menu');
        if (dropdown) {
          dropdown.classList.toggle('hidden');
        }
      }

      // Show only the active category
      function showCategory(category) {
        const categories = ['mains', 'breads', 'pasta', 'coffee', 'drinks', 'signature'];
        
        // Hide all categories
        categories.forEach(cat => {
          const element = document.getElementById(cat);
          if (element) element.classList.add('hidden');
        });
        
        // Remove active state from all buttons
        document.querySelectorAll('.mini-nav-btn').forEach(btn => {
          btn.classList.remove('text-yellow-500', 'after:w-full');
        });
        
        // Show active category
        const activeElement = document.getElementById(category);
        if (activeElement) activeElement.classList.remove('hidden');
        
        // Set active button
        const activeButton = document.querySelector(`.mini-nav-btn[onclick="showCategory('${category}')"]`);
        if (activeButton) {
          activeButton.classList.add('text-yellow-500', 'after:w-full');
        }
      }

      // Show Mains by default
      document.addEventListener('DOMContentLoaded', () => {
        showCategory('mains');
      });

      // Close dropdown when clicking outside
      document.addEventListener('click', function(event) {
        const dropdown = document.getElementById('dropdown-menu');
        const button = event.target.closest('button[onclick="toggleDropdown()"]');
        
        if (!button && dropdown && !dropdown.contains(event.target)) {
          dropdown.classList.add('hidden');
        }
      });
      // Mobile menu toggle
      const mobileMenuBtn = document.getElementById('mobile-menu-btn');
      const mobileNav = document.getElementById('mobile-nav');
      const mobileMenuIcon = mobileMenuBtn.querySelector('i');

      mobileMenuBtn.addEventListener('click', function() {
        mobileNav.classList.toggle('hidden');
        if (mobileNav.classList.contains('hidden')) {
          mobileMenuIcon.className = 'bi bi-list';
        } else {
          mobileMenuIcon.className = 'bi bi-x';
        }
      });

      // Close mobile menu when clicking outside
      document.addEventListener('click', function(event) {
        if (!mobileMenuBtn.contains(event.target) && !mobileNav.contains(event.target)) {
          mobileNav.classList.add('hidden');
          mobileMenuIcon.className = 'bi bi-list';
        }
      });

      // Enhanced cancel functions with confirmations
      function cancelReservation(reservationId) {
        if (confirm(`Are you sure you want to cancel reservation ${reservationId}?`)) {
          // Add your cancellation logic here
          console.log(`Cancelling reservation: ${reservationId}`);
          // You can add AJAX call or form submission here
        }
      }

      function cancelOrder(orderId) {
        if (confirm(`Are you sure you want to cancel order ${orderId}?`)) {
          // Add your cancellation logic here
          console.log(`Cancelling order: ${orderId}`);
          // You can add AJAX call or form submission here
        }
      }

      // Loading states for buttons
      function addLoadingState(button) {
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="bi bi-hourglass-split mr-2"></i>Processing...';
        button.disabled = true;
        
        // Simulate processing time
        setTimeout(() => {
          button.innerHTML = originalText;
          button.disabled = false;
        }, 2000);
      }

      // Add loading states to cancel buttons
      document.querySelectorAll('button[onclick*="cancel"]').forEach(button => {
        button.addEventListener('click', function() {
          addLoadingState(this);
        }); 
      });

      
// localstorage user display
const username = localStorage.getItem('username');
console.log(username)

// domcontentLoaded for displaying username
document.addEventListener('DOMContentLoaded', () => {
    const userElements = document.querySelectorAll('#user');
userElements.forEach(el => {
el.innerText = username;
})
})


// domcontent for logout function
document.addEventListener('DOMContentLoaded', () => {

// get the logout buttons
const logoutButtons = document.querySelectorAll('#logout');
logoutButtons.forEach((btn) => {

btn.addEventListener('click', async() => {
 // fetch the data first before clearing local storage
  const response  = await fetch('/api/logout/logout.php', {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
    },
    credentials: "include",
  });
  const text = await response.text();
  const data = JSON.parse(text);
  if (!response.ok) {
    alertMessage('error', 'Logout Failed', data.message || 'Something went wrong.', 2000);
    return;
  }
  // clear local storage
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  // redirect to login page
  window.location.href = '/views/auth/login.html';
})
})
})

