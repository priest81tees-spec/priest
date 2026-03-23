// Order Confirmation Page JavaScript
document.addEventListener('DOMContentLoaded', () => {
    loadOrder();
});

function loadOrder() {
    const spinner = document.getElementById('loadingSpinner');
    const orderContent = document.getElementById('orderContent');
    const errorMessage = document.getElementById('errorMessage');

    // Get latest order from localStorage
    const orderJson = localStorage.getItem('latest_order');
    
    if (!orderJson) {
        spinner.style.display = 'none';
        errorMessage.style.display = 'block';
        return;
    }

    try {
        const order = JSON.parse(orderJson);
        displayOrder(order);
        spinner.style.display = 'none';
        orderContent.style.display = 'block';
        
        // Optional: clear the stored order so it doesn't show again on refresh
        // localStorage.removeItem('latest_order');
    } catch (e) {
        spinner.style.display = 'none';
        errorMessage.style.display = 'block';
    }
}

function displayOrder(order) {
    const container = document.getElementById('orderContent');
    
    // Format date - handle both timestamp and regular date
    let orderDate = 'N/A';
    if (order.createdAt) {
        if (order.createdAt.toDate) {
            // Firebase Timestamp
            orderDate = order.createdAt.toDate().toLocaleString('en-US', {
                dateStyle: 'full',
                timeStyle: 'short'
            });
        } else {
            // Regular date or timestamp number
            orderDate = new Date(order.createdAt).toLocaleString('en-US', {
                dateStyle: 'full',
                timeStyle: 'short'
            });
        }
    }

    // Generate items HTML
    const itemsHtml = order.items.map(item => `
        <div class="order-item">
            <img src="${item.image}" alt="${item.name}" class="order-item-image">
            <div class="order-item-details">
                <div class="order-item-name">${item.name}</div>
                <div class="order-item-meta">Size: ${item.selectedSize} × ${item.quantity}</div>
            </div>
            <div class="order-item-price">${formatCurrency(item.price * item.quantity)}</div>
        </div>
    `).join('');

    container.innerHTML = `
        <div class="success-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
        </div>
        <h1 class="confirmation-title">Thank You, ${order.customerDetails.name}!</h1>
        <p class="confirmation-message">Your order has been placed successfully. We'll send you a confirmation email shortly.</p>

        <div class="order-details">
            <div class="order-header">
                <span class="order-id">Order #${order.orderId}</span>
                <span class="order-date">${orderDate}</span>
            </div>

            <div class="customer-info">
                <div class="info-row">
                    <span class="info-label">Email:</span>
                    <span class="info-value">${order.customerDetails.email}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Phone:</span>
                    <span class="info-value">${order.customerDetails.phone}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Address:</span>
                    <span class="info-value">${order.customerDetails.address}, ${order.customerDetails.city}, ${order.customerDetails.state} ${order.customerDetails.zipCode}, ${order.customerDetails.country}</span>
                </div>
            </div>

            <h2 class="items-title">Order Items</h2>
            <div class="order-items">
                ${itemsHtml}
            </div>

            <div class="totals">
                <div class="total-row">
                    <span>Subtotal:</span>
                    <span>${formatCurrency(order.subtotal)}</span>
                </div>
                <div class="total-row">
                    <span>Shipping:</span>
                    <span>${formatCurrency(order.shippingCost)}</span>
                </div>
                <div class="total-row grand-total">
                    <span>Total:</span>
                    <span>${formatCurrency(order.total)}</span>
                </div>
            </div>

            <div class="actions">
                <a href="shop.html" class="btn btn-primary">Continue Shopping</a>
                <a href="index.html" class="btn btn-outline">Back to Home</a>
            </div>
        </div>
    `;
}