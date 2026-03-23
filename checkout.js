// checkout.js – Revised with error handling and logging
const SHIPPING_COST = 0;

document.addEventListener('DOMContentLoaded', () => {
    firebase.auth().onAuthStateChanged((user) => {
        if (!user) {
            window.location.href = 'login.html?redirect=checkout.html';
            return;
        }
        if (cart.getItems().length === 0) {
            window.location.href = 'cart.html';
            return;
        }
        loadOrderSummary();
        prefillUserData(user);
        setupForm();
    });
});

function loadOrderSummary() {
    const items = cart.getItems();
    const subtotal = cart.getTotal();
    const total = subtotal + SHIPPING_COST;

    const container = document.getElementById('orderItems');
    container.innerHTML = items.map(item => `
        <div class="order-item">
            <img src="${item.image}" alt="${item.name}" class="order-item-image">
            <div class="order-item-details">
                <p class="order-item-name">${item.name}</p>
                <p class="order-item-meta">Size: ${item.selectedSize} × ${item.quantity}</p>
                <p class="order-item-price">${formatCurrency(item.price * item.quantity)}</p>
            </div>
        </div>
    `).join('');

    document.getElementById('summarySubtotal').textContent = formatCurrency(subtotal);
    document.getElementById('summaryTotal').textContent = formatCurrency(total);
    document.getElementById('payAmount').textContent = formatCurrency(total);
}

function prefillUserData(user) {
    const form = document.getElementById('checkoutForm');
    const name = user.displayName || (user.email ? user.email.split('@')[0] : '');
    form.name.value = name;
    form.email.value = user.email || '';
}

function setupForm() {
    const form = document.getElementById('checkoutForm');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        processPayment();
    });
}

function processPayment() {
    const form = document.getElementById('checkoutForm');
    const formData = new FormData(form);

    const orderDetails = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        gender: formData.get('gender'),
        address: formData.get('address'),
        city: formData.get('city'),
        state: formData.get('state'),
        zipCode: formData.get('zipCode'),
        country: formData.get('country')
    };

    if (!orderDetails.email || !orderDetails.phone) {
        alert('Please fill in all required fields');
        return;
    }

    const subtotal = cart.getTotal();
    const total = subtotal + SHIPPING_COST;
    const totalInKobo = Math.round(total * 100);
    const paymentReference = generateOrderId();

    const handler = PaystackPop.setup({
        key: 'pk_test_a5facbbd701b9e70e9e0265f583be09be59e5de6',
        email: orderDetails.email,
        amount: totalInKobo,
        currency: 'GHS',
        ref: paymentReference,
        metadata: {
            custom_fields: [
                { display_name: 'Customer Name', variable_name: 'customer_name', value: orderDetails.name },
                { display_name: 'Phone Number', variable_name: 'phone_number', value: orderDetails.phone },
                { display_name: 'Gender', variable_name: 'gender', value: orderDetails.gender },
                { display_name: 'Shipping Address', variable_name: 'shipping_address', value: `${orderDetails.address}, ${orderDetails.city}, ${orderDetails.state} ${orderDetails.zipCode}, ${orderDetails.country}` }
            ]
        },
        callback: function(response) {
            saveOrder(orderDetails, paymentReference, response);
        },
        onClose: function() {
            console.log('Payment cancelled');
        }
    });

    handler.openIframe();
}

function saveOrder(orderDetails, paymentReference, paymentResponse) {
    const currentUser = firebase.auth().currentUser;
    if (!currentUser) {
        alert('You must be logged in to complete the order.');
        return;
    }

    const order = {
        orderId: paymentReference,
        userId: currentUser.uid,
        customerDetails: orderDetails,
        items: cart.getItems(),
        subtotal: cart.getTotal(),
        shippingCost: SHIPPING_COST,
        total: cart.getTotal() + SHIPPING_COST,
        status: 'paid',
        paymentReference: paymentReference,
        paymentStatus: paymentResponse.status,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    console.log('Saving order:', order); // for debugging

    db.collection('orders').add(order)
        .then((docRef) => {
            console.log('Order saved with ID:', docRef.id);
            cart.clear();
            localStorage.setItem('latest_order', JSON.stringify({ ...order, orderId: paymentReference }));
            window.location.href = 'order-confirmation.html';
        })
        .catch((error) => {
            console.error('Error saving order: ', error);
            alert('Order was placed but could not be saved. Please contact support with your order reference: ' + paymentReference);
        });
}