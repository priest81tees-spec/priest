// Shop Page JavaScript
let currentFilter = 'All';

document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    setupFilters();
});

function loadProducts(filter = 'All') {
    const container = document.getElementById('productsGrid');
    const emptyState = document.getElementById('emptyState');
    
    let filteredProducts = products;
    if (filter !== 'All') {
        filteredProducts = products.filter(p => p.color === filter);
    }

    if (filteredProducts.length === 0) {
        container.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    container.style.display = 'grid';
    emptyState.style.display = 'none';

    container.innerHTML = filteredProducts.map(product => `
        <a href="product.html?id=${product.id}" class="product-card">
            <div class="product-image-wrapper">
                <img src="${product.image}" alt="${product.name}" class="product-image">
            </div>
            <h3 class="product-name">${product.name}</h3>
            <p class="product-price">${formatCurrency(product.price)}</p>
        </a>
    `).join('');
}

function setupFilters() {
    const filterButtons = document.querySelectorAll('.filter-button');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Update active class
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Filter products
            const color = button.getAttribute('data-color');
            currentFilter = color;
            loadProducts(color);
        });
    });
}