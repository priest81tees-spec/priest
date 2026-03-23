// Cart Page JavaScript
document.addEventListener('DOMContentLoaded', () => {
    renderCart();
});

function renderCart() {
    const cartItems = cart.getItems();
    const emptyCart = document.getElementById('emptyCart');
    const cartContent = document.getElementById('cartContent');
    
    if (cartItems.length === 0) {
        emptyCart.style.display = 'flex';
        cartContent.style.display = 'none';
        return;
    }

    emptyCart.style.display = 'none';
    cartContent.style.display = 'grid';

    renderCartItems(cartItems);
    updateSummary();
}

function renderCartItems(items) {
    const container = document.getElementById('cartItems');
    
    container.innerHTML = items.map(item => `
        <div class="cart-item">
            <a href="product.html?id=${item.id}">
                <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            </a>

            <div class="cart-item-details">
                <div>
                    <a href="product.html?id=${item.id}">
                        <h3 class="cart-item-name">${item.name}</h3>
                    </a>
                    <p class="cart-item-size">Size: ${item.selectedSize}</p>
                    <p class="cart-item-price">${formatCurrency(item.price)}</p>
                </div>

                <div class="cart-item-controls">
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="updateQuantity('${item.id}', '${item.selectedSize}', ${item.quantity - 1})">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M5 12h14"/>
                            </svg>
                        </button>
                        <span class="quantity-display">${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateQuantity('${item.id}', '${item.selectedSize}', ${item.quantity + 1})">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M12 5v14M5 12h14"/>
                            </svg>
                        </button>
                    </div>
                    <button class="remove-btn" onclick="removeItem('${item.id}', '${item.selectedSize}')">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                        </svg>
                    </button>
                </div>
            </div>

            <div class="cart-item-total">
                <p>${formatCurrency(item.price * item.quantity)}</p>
            </div>
        </div>
    `).join('');
}

function updateSummary() {
    const total = cart.getTotal();
    const count = cart.getCount();

    document.getElementById('itemCount').textContent = count;
    document.getElementById('subtotal').textContent = formatCurrency(total);
    document.getElementById('total').textContent = formatCurrency(total);
}

function updateQuantity(productId, size, quantity) {
    cart.updateQuantity(productId, size, quantity);
    renderCart();
}

function removeItem(productId, size) {
    if (confirm('Remove this item from cart?')) {
        cart.removeItem(productId, size);
        renderCart();
    }
}

function proceedToCheckout() {
    if (cart.getItems().length === 0) {
        alert('Your cart is empty');
        return;
    }
    window.location.href = 'checkout.html';
}
