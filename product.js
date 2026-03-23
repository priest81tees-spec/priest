// Product Detail Page JavaScript
let currentProduct = null;
let selectedSize = null;

document.addEventListener('DOMContentLoaded', () => {
    loadProduct();
});

function loadProduct() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    const product = products.find(p => p.id === productId);
    
    if (!product) {
        document.getElementById('productDetail').style.display = 'none';
        document.getElementById('notFound').style.display = 'block';
        return;
    }

    currentProduct = product;
    renderProduct(product);
}

function renderProduct(product) {
    const container = document.getElementById('productDetail');
    
    container.innerHTML = `
        <div class="product-grid">
            <div class="product-image-container">
                <img src="${product.image}" alt="${product.name}" class="product-image-large">
            </div>

            <div class="product-info">
                <div>
                    <p class="product-category">${product.category}</p>
                    <h1 class="product-title">${product.name}</h1>
                    <p class="product-price-large">${formatCurrency(product.price)}</p>
                </div>

                <p class="product-description">${product.description}</p>

                <div class="size-selector">
                    <label>Select Size</label>
                    <div class="size-options">
                        ${product.sizes.map(size => `
                            <button class="size-button" data-size="${size}" onclick="selectSize('${size}', event)">${size}</button>
                        `).join('')}
                    </div>
                </div>

                <button class="add-to-cart-button" onclick="addToCart()">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 2L7.17 4H3a1 1 0 00-1 1v12a1 1 0 001 1h18a1 1 0 001-1V5a1 1 0 00-1-1h-4.17L15 2H9z"/>
                        <path d="M9 17v-6M15 17v-6"/>
                    </svg>
                    Add to Cart
                </button>

                <div class="product-details-section">
                    <div class="detail-section">
                        <h3>Product Details</h3>
                        <ul>
                            <li>• Premium quality materials</li>
                            <li>• Ethically manufactured</li>
                            <li>• Free shipping on orders over GH₵300</li>
                            <li>• 30-day return policy</li>
                        </ul>
                    </div>
                    <div class="detail-section">
                        <h3>Care Instructions</h3>
                        <ul>
                            <li>• Machine wash cold</li>
                            <li>• Tumble dry low</li>
                            <li>• Do not bleach</li>
                            <li>• Iron on low heat if needed</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function selectSize(size, event) {
    selectedSize = size;
    
    document.querySelectorAll('.size-button').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    event.target.classList.add('selected');
}

function addToCart() {
    if (!selectedSize) {
        alert('Please select a size');
        return;
    }

    if (!currentProduct) return;

    cart.addItem(currentProduct, selectedSize);
    showAddToCartFeedback(currentProduct, selectedSize);
    animateCartIcon(); // trigger cart icon bounce
}

// Show a nice cart addition notification with product image
function showAddToCartFeedback(product, size) {
    // Remove any existing cart notification
    const existing = document.querySelector('.cart-notification');
    if (existing) existing.remove();

    // Create notification container
    const notification = document.createElement('div');
    notification.className = 'cart-notification';

    notification.innerHTML = `
        <div class="cart-notification-content">
            <img src="${product.image}" alt="${product.name}" class="cart-notification-image">
            <div class="cart-notification-details">
                <strong>Added to cart</strong>
                <span>${product.name} (${size})</span>
                <span class="cart-notification-price">${formatCurrency(product.price)}</span>
            </div>
            <button class="cart-notification-close">&times;</button>
        </div>
    `;

    document.body.appendChild(notification);

    // Trigger entry animation
    setTimeout(() => notification.classList.add('show'), 10);

    // Auto-remove after 4 seconds
    const timeout = setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 4000);

    // Close button
    const closeBtn = notification.querySelector('.cart-notification-close');
    closeBtn.addEventListener('click', () => {
        clearTimeout(timeout);
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    });
}

// Animate the cart icon (bounce effect)
function animateCartIcon() {
    const cartLink = document.querySelector('.cart-link');
    if (!cartLink) return;

    cartLink.classList.add('cart-bounce');
    setTimeout(() => cartLink.classList.remove('cart-bounce'), 500);
}