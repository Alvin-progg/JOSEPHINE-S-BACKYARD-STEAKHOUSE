// Toggle dropdown menu with smooth animation
function toggleDropdown() {
  const dropdown = document.getElementById("dropdown-menu");
  const icon = document.getElementById("dropdown-icon");
  
  if (dropdown) {
    const isHidden = dropdown.classList.contains("hidden");
    
    if (isHidden) {
      // Show dropdown
      dropdown.classList.remove("hidden");
      dropdown.classList.remove("opacity-0");
      dropdown.classList.add("opacity-100");
      if (icon) {
        icon.style.transform = "rotate(180deg)";
      }
      
      // Update dropdown user info
      const user = sessionStorage.getItem("user");
      const dropdownUser = document.getElementById("dropdown-user");
      if (dropdownUser && user) {
        const userData = JSON.parse(user);
        dropdownUser.textContent = userData.username || "User";
      }
    } else {
      // Hide dropdown
      dropdown.classList.remove("opacity-100");
      dropdown.classList.add("opacity-0");
      if (icon) {
        icon.style.transform = "rotate(0deg)";
      }
      setTimeout(() => {
        dropdown.classList.add("hidden");
      }, 300);
    }
  }
}

// Show only the active category
function showCategory(category) {
  const categories = [
    "appetizers",
    "mains",
    "pasta",
    "drinks",
    "desserts",
  ];

  // Hide all categories
  categories.forEach((cat) => {
    const element = document.getElementById(cat);
    if (element) element.classList.add("hidden");
  });

  // Remove active state from all buttons
  document.querySelectorAll(".mini-nav-btn").forEach((btn) => {
    btn.classList.remove("text-yellow-500", "after:w-full");
  });

  // Show active category
  const activeElement = document.getElementById(category);
  if (activeElement) activeElement.classList.remove("hidden");

  // Set active button
  const activeButton = document.querySelector(
    `.mini-nav-btn[onclick="showCategory('${category}')"]`,
  );
  if (activeButton) {
    activeButton.classList.add("text-yellow-500", "after:w-full");
  }
}

// Show Appetizers by default
document.addEventListener("DOMContentLoaded", () => {
  showCategory("appetizers");
});

// Close dropdown when clicking outside
document.addEventListener("click", function (event) {
  const dropdown = document.getElementById("dropdown-menu");
  const button = event.target.closest('button[onclick="toggleDropdown()"]');
  const icon = document.getElementById("dropdown-icon");

  if (!button && dropdown && !dropdown.contains(event.target)) {
    if (!dropdown.classList.contains("hidden")) {
      dropdown.classList.remove("opacity-100");
      dropdown.classList.add("opacity-0");
      if (icon) {
        icon.style.transform = "rotate(0deg)";
      }
      setTimeout(() => {
        dropdown.classList.add("hidden");
      }, 300);
    }
  }
});
// Mobile menu toggle
const mobileMenuBtn = document.getElementById("mobile-menu-btn");
const mobileNav = document.getElementById("mobile-nav");
const mobileMenuIcon = mobileMenuBtn.querySelector("i");

mobileMenuBtn.addEventListener("click", function () {
  mobileNav.classList.toggle("hidden");
  if (mobileNav.classList.contains("hidden")) {
    mobileMenuIcon.className = "bi bi-list";
  } else {
    mobileMenuIcon.className = "bi bi-x";
  }
});

// Close mobile menu when clicking outside
document.addEventListener("click", function (event) {
  if (
    !mobileMenuBtn.contains(event.target) &&
    !mobileNav.contains(event.target)
  ) {
    mobileNav.classList.add("hidden");
    mobileMenuIcon.className = "bi bi-list";
  }
});

// Enhanced cancel functions with confirmations
function cancelReservation(reservationId) {
  if (
    confirm(`Are you sure you want to cancel reservation ${reservationId}?`)
  ) {
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
document.querySelectorAll('button[onclick*="cancel"]').forEach((button) => {
  button.addEventListener("click", function () {
    addLoadingState(this);
  });
});

// localstorage user display
const username = localStorage.getItem("username");

// domcontentLoaded for displaying username
document.addEventListener("DOMContentLoaded", () => {
  const userElements = document.querySelectorAll("#user");
  userElements.forEach((el) => {
    el.innerText = username;
  });
  
  // Also update welcome-user element on home page
  const welcomeUser = document.getElementById("welcome-user");
  if (welcomeUser) {
    welcomeUser.innerText = username;
  }
});

// domcontent for logout function
document.addEventListener("DOMContentLoaded", () => {
  // get the logout buttons
  const logoutButtons = document.querySelectorAll("#logout");
  logoutButtons.forEach((btn) => {
    btn.addEventListener("click", async () => {
      // fetch the data first before clearing local storage
      const response = await fetch("/api/logout/logout.php", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const text = await response.text();
      const data = JSON.parse(text);
      if (!response.ok) {
        alertMessage(
          "error",
          "Logout Failed",
          data.message || "Something went wrong.",
          2000,
        );
        return;
      }
      // clear local storage
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      // redirect to login page
      window.location.href = "/views/auth/login.html";
    });
  });
});
