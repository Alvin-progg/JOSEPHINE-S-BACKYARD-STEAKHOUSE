document.addEventListener('DOMContentLoaded', async () => {
    const category = document.getElementById('category');
    const products = document.getElementById('products');
    const selectedCategory = document.getElementById('selectedCategory');
    const quantity = document.getElementById('quantity');
    const total = document.getElementById('total');

    // fetch the json file
    const menu = await fetch('../../public/json/menu.json');
    const menuData = await menu.json();

    // populate category select
    Object.keys(menuData).forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
        category.appendChild(option);
    });

    // render products based on category
    function renderProducts(cat) {
        selectedCategory.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
        products.innerHTML = '<option value="" disabled selected>Select a product</option>';

        if (cat === 'coffee') {
            // coffee has subcategories → make optgroups
            Object.entries(menuData.coffee).forEach(([type, items]) => {
                const optgroup = document.createElement('optgroup');
                optgroup.label = type.charAt(0).toUpperCase() + type.slice(1);

                items.forEach(item => {
                    const option = document.createElement('option');
                    option.value = JSON.stringify({ name: item.name, price: item.price }); // store both
                    option.textContent = `${item.name} - ${item.price}`;
                    optgroup.appendChild(option);
                });

                products.appendChild(optgroup);
            });
        } else {
            // normal categories → just add items
            menuData[cat].forEach(item => {
                const option = document.createElement('option');
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
    const numericPrice = parseFloat(price.replace(/[₱,]/g, '')); // clean ₱ and commas
    const qty = parseInt(quantity.value, 10);

    const totalPrice = numericPrice * qty;
    total.value = `₱${totalPrice.toFixed(2)}`;
}

    // listen for category change
    category.addEventListener('change', e => {
        renderProducts(e.target.value);
        total.textContent = "₱0.00"; // reset total when category changes
    });

    // recalc total when product or quantity changes
    products.addEventListener('change', updateTotal);
    quantity.addEventListener('input', updateTotal);

    // submit order form
    document.getElementById('order-form')?.addEventListener('submit', async(e) => {
        e.preventDefault();

        const categoryValue = category.value;
        const productData = products.value ? JSON.parse(products.value) : null;
        const quantityValue = quantity.value;
        const specialRequestsValue = document.getElementById('specialRequests')?.value.trim();

        if (!productData) {
            alert("Please select a product");
            return;
        }

        console.log({
            category: categoryValue,
            product: productData.name,
            unitPrice: productData.price,
            quantity: quantityValue,
            total: total.textContent,
            specialRequests: specialRequestsValue
        });

        // You can now send this to your backend 👇
        // await fetch('/api/order', { method:'POST', body: JSON.stringify({...}) })
    });
});
