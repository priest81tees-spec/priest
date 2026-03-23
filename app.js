// app.js - Firebase Auth integration with uid field query

// Cart module (unchanged)
class Cart {
    constructor() {
        this.items = this.loadCart();
        this.updateCartCount();
    }
    loadCart() {
        const cartStr = localStorage.getItem('priest_cart');
        return cartStr ? JSON.parse(cartStr) : [];
    }
    saveCart() {
        localStorage.setItem('priest_cart', JSON.stringify(this.items));
        this.updateCartCount();
    }
    addItem(product, size) {
        const existingItem = this.items.find(
            item => item.id === product.id && item.selectedSize === size
        );
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({
                ...product,
                selectedSize: size,
                quantity: 1
            });
        }
        this.saveCart();
    }
    removeItem(productId, size) {
        this.items = this.items.filter(
            item => !(item.id === productId && item.selectedSize === size)
        );
        this.saveCart();
    }
    updateQuantity(productId, size, quantity) {
        if (quantity <= 0) {
            this.removeItem(productId, size);
            return;
        }
        const item = this.items.find(
            item => item.id === productId && item.selectedSize === size
        );
        if (item) {
            item.quantity = quantity;
            this.saveCart();
        }
    }
    getItems() {
        return this.items;
    }
    getTotal() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }
    getCount() {
        return this.items.reduce((count, item) => count + item.quantity, 0);
    }
    clear() {
        this.items = [];
        this.saveCart();
    }
    updateCartCount() {
        const cartCount = document.getElementById('cartCount');
        if (cartCount) {
            const count = this.getCount();
            cartCount.textContent = count;
            cartCount.style.display = count > 0 ? 'flex' : 'none';
        }
        const mobileCartCount = document.getElementById('mobileCartCount');
        if (mobileCartCount) {
            mobileCartCount.textContent = this.getCount();
        }
    }
}

// Initialize cart globally
const cart = new Cart();

// Firebase Auth state observer
firebase.auth().onAuthStateChanged(async (user) => {
    const userButton = document.getElementById('userButton');
    const userDropdown = document.getElementById('userDropdown');

    if (user) {
        let displayName = user.displayName || user.email.split('@')[0];
        let userRole = 'buyer';

        try {
            // Query for user document where uid field equals the current user's uid
            const querySnapshot = await db.collection('users')
                .where('uid', '==', user.uid)
                .limit(1)
                .get();

            if (!querySnapshot.empty) {
                // Document found – use its data
                const userData = querySnapshot.docs[0].data();
                displayName = userData.displayName || displayName;
                userRole = userData.role || 'buyer';
            } else {
                // No document found – create one (for backward compatibility)
                await db.collection('users').add({
                    uid: user.uid,
                    displayName: displayName,
                    email: user.email,
                    role: 'buyer',
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        }

        // Update UI
        if (userButton) {
            userButton.textContent = displayName;
            userButton.onclick = () => userDropdown.classList.toggle('show');
        }

        // Build dropdown menu
        let dropdownHTML = '';
        if (userRole === 'admin') {
            dropdownHTML += '<a href="admin.html">Admin Dashboard</a>';
        }
        dropdownHTML += `
            <button onclick="logout()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
                </svg>
                Logout
            </button>
        `;
        if (userDropdown) userDropdown.innerHTML = dropdownHTML;
    } else {
        // User is signed out
        if (userButton) {
            userButton.textContent = 'Login';
            userButton.onclick = () => window.location.href = 'login.html';
        }
        if (userDropdown) userDropdown.innerHTML = '';
    }
});

// Logout function
window.logout = function() {
    firebase.auth().signOut()
        .then(() => {
            window.location.href = 'index.html';
        })
        .catch((error) => {
            console.error('Logout error:', error);
        });
};

// Utility functions
function formatCurrency(amount) {
    return `GH₵${amount.toFixed(2)}`;
}
function showNotification(message, type = 'success') {
    // ... keep your existing implementation
}

function generateOrderId() {
    return `PRIEST-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
}