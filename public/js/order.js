// global data

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

document.addEventListener("DOMContentLoaded", async () => {
  const category = document.getElementById("category");
  const products = document.getElementById("products");
  const selectedCategory = document.getElementById("selectedCategory");
  const quantity = document.getElementById("quantity");
  let customize = document.getElementById("customize").value.trim();
  const total = document.getElementById("total");
  let cart = [];

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
      // coffee has subcategories → make optgroups
      Object.entries(menuData.coffee).forEach(([type, items]) => {
        const optgroup = document.createElement("optgroup");
        optgroup.label = type.charAt(0).toUpperCase() + type.slice(1);

        items.forEach((item) => {
          const option = document.createElement("option");
          option.value = JSON.stringify({ name: item.name, price: item.price }); // store both
          option.textContent = `${item.name} - ${item.price}`;
          optgroup.appendChild(option);
        });

        products.appendChild(optgroup);
      });
    } else {
      // normal categories → just add items
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
    const numericPrice = parseFloat(price.replace(/[₱,]/g, "")); // clean ₱ and commas
    const qty = parseInt(quantity.value, 10);

    const totalPrice = numericPrice * qty;
    total.value = `₱${totalPrice.toFixed(2)}`;
  }

  // listen for category change
  category.addEventListener("change", (e) => {
    renderProducts(e.target.value);
    total.textContent = "₱0.00"; // reset total when category changes
  });

  // recalc total when product or quantity changes
  products.addEventListener("change", updateTotal);
  quantity.addEventListener("input", updateTotal);

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
    <td class="py-2 px-4 text-[#fffeee]">${customize}</td>
    <td class="py-2 px-4 text-center">
      <button class="text-red-500 hover:text-red-400">
        <i class="bi bi-trash"></i>
      </button>
    </td>
  `;

      // attach event listener properly
      row.querySelector("button").addEventListener("click", () => {
        removeFromCart(index);
      });

      tbody.appendChild(row);
    });
  }

  function removeFromCart(index) {
    cart.splice(index, 1);
    renderCart();
  }

  // Add to cart button
  document
    .getElementById("add-to-order")
    .addEventListener("click", async () => {
      if (!products.value || !quantity.value) {
        alertMessage("warning", "Input Warning", "Please input all fields");
        return;
      }

      if (!customize) {
        customize = "No Customization";
      }

      const { name, price } = JSON.parse(products.value);
      const numericPrice = parseFloat(price.replace(/[₱,]/g, ""));
      const qty = parseInt(quantity.value, 10);

      // ✅ Check if item already exists in cart (match by name + customize)
      const existingItem = cart.find(
        (item) => item.name === name && item.customize === customize
      );

      if (existingItem) {
        // merge quantities
        existingItem.quantity += qty;
      } else {
        // add new
        cart.push({
          name,
          price: numericPrice,
          quantity: qty,
          customize,
        });
      }

      successMessage("Add to Cart Successfully", `${name} x${qty} added!`);

      renderCart();
      document.getElementById("order-form").reset();
    });

  // Submit Order
  document
    .getElementById("submit-order")
    ?.addEventListener("click", async () => {
      if (cart.length === 0) {
        alertMessage(
          "warning",
          "Invalid Cart",
          "Please add some items to the cart"
        );
        return;
      }

      try {
        const response = await fetch("/api/orders/insertOrders.php", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ cart }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message);
          // alertMessage
        }
        const text = await response.text();
        const data = JSON.parse(text);

        successMessage("Order Placed Successfully", data.message);
        cart = [];
        renderCart();
      } catch (error) {
        alertMessage("error", "Submission Failed", error.message);
      }
    });
});
