// Home Page JavaScript
document.addEventListener('DOMContentLoaded', () => {
    loadFeaturedProducts();
    setupNewsletter();
});

function loadFeaturedProducts() {
    const container = document.getElementById('featuredProducts');
    if (!container) return;

    container.innerHTML = products.map(product => `
        <a href="product.html?id=${product.id}" class="product-card">
            <div class="product-image-wrapper">
                <img src="${product.image}" alt="${product.name}" class="product-image">
            </div>
            <h3 class="product-name">${product.name}</h3>
            <p class="product-price">${formatCurrency(product.price)}</p>
        </a>
    `).join('');
}

function setupNewsletter() {
    const form = document.getElementById('newsletterForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = form.querySelector('input[type="email"]').value;
        
        // In production, send to backend
        console.log('Newsletter subscription:', email);
        showNotification('Thank you for subscribing!');
        form.reset();
    });
}
