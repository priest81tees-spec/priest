// admin.js – Full admin dashboard logic with order status management
let orders = [];
let allOrders = [];
let unsubscribeOrders = null;
let currentFilter = 'all';

document.addEventListener('DOMContentLoaded', () => {
    firebase.auth().onAuthStateChanged(async (user) => {
        if (!user) {
            window.location.href = 'login.html';
            return;
        }

        // Check if user is admin by querying the users collection where uid field matches
        try {
            const querySnapshot = await db.collection('users')
                .where('uid', '==', user.uid)
                .limit(1)
                .get();

            if (querySnapshot.empty) {
                // No user document found – deny access
                alert('Access denied. User record not found.');
                window.location.href = 'index.html';
                return;
            }

            const userData = querySnapshot.docs[0].data();
            if (userData.role !== 'admin') {
                alert('Access denied. Admins only.');
                window.location.href = 'index.html';
                return;
            }

            // User is admin – load dashboard
            loadDashboard();
            setupFilterButtons();
        } catch (error) {
            console.error('Error checking admin status:', error);
            alert('Error verifying admin status. Please try again.');
            window.location.href = 'index.html';
        }
    });
});

async function loadDashboard() {
    try {
        // Load customers count (all users)
        const usersSnapshot = await db.collection('users').get();
        document.getElementById('totalCustomers').textContent = usersSnapshot.size;

        // Real-time listener for all orders
        if (unsubscribeOrders) unsubscribeOrders();
        unsubscribeOrders = db.collection('orders')
            .orderBy('createdAt', 'desc')
            .onSnapshot((snapshot) => {
                allOrders = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                // 🔁 Update stats using ALL orders (not only 'paid')
                updateStats(allOrders);
                applyFilter(currentFilter);
            }, (error) => {
                console.error('Order snapshot error:', error);
                document.getElementById('ordersTableBody').innerHTML = `
                    <tr>
                        <td colspan="6" style="text-align: center; color: #ef4444; padding: 2rem;">
                            <svg style="width: 48px; height: 48px; margin: 0 auto 1rem; opacity: 0.5;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"/>
                                <path d="M12 8v4M12 16h.01"/>
                            </svg>
                            <p>Failed to load orders: ${error.message}</p>
                            <p style="font-size: 0.875rem; margin-top: 0.5rem;">Please check your Firebase configuration and security rules.</p>
                         </tr>
                    `;
            });

    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

function updateStats(orders) {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    const avgOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    document.getElementById('totalOrders').textContent = totalOrders;
    document.getElementById('totalRevenue').textContent = formatCurrency(totalRevenue);
    document.getElementById('avgOrder').textContent = formatCurrency(avgOrder);
}

function setupFilterButtons() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const status = btn.dataset.status;
            currentFilter = status;
            applyFilter(status);
        });
    });
}

function applyFilter(status) {
    let filteredOrders = allOrders;
    if (status !== 'all') {
        filteredOrders = allOrders.filter(order => order.status === status);
    }
    renderOrdersTable(filteredOrders);
}

function renderOrdersTable(orders) {
    const tbody = document.getElementById('ordersTableBody');

    if (!orders.length) {
        tbody.innerHTML = `
             <tr>
                <td colspan="6" class="empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M12 8v4M12 16h.01"/>
                    </svg>
                    <p>No orders found</p>
                 </td>
             </tr>
        `;
        return;
    }

    tbody.innerHTML = orders.map(order => {
        const customerName = order.customerDetails?.name || 'N/A';
        const customerEmail = order.customerDetails?.email || '';
        const orderId = order.orderId || order.id || '—';
        const date = order.createdAt?.toDate?.()
            ? order.createdAt.toDate().toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            })
            : 'N/A';
        const total = order.total || 0;
        const status = order.status || 'paid';
        const statusClass = getStatusClass(status);

        // Build action buttons based on current status
        let actionButtons = `
            <button class="view-btn" onclick="viewOrder('${orderId}')">View Details</button>
        `;
        if (status === 'paid') {
            actionButtons += `
                <button class="ship-btn" onclick="shipOrder('${order.id}', '${orderId}')">🚚 Ship Order</button>
            `;
        } else if (status === 'shipped') {
            actionButtons += `
                <button class="deliver-btn" onclick="deliverOrder('${order.id}', '${orderId}')">✅ Mark Delivered</button>
            `;
        }

        return `
             <tr>
                <td><span class="order-id">${orderId.substring(0, 20)}...</span></td>
                <td>
                    <div class="customer-info">
                        <span class="customer-name">${customerName}</span>
                        <span class="customer-email">${customerEmail}</span>
                    </div>
                </td>
                <td><span class="order-date">${date}</span></td>
                <td><span class="order-total">${formatCurrency(total)}</span></td>
                <td><span class="status-badge ${statusClass}">${status}</span></td>
                <td class="action-buttons">
                    ${actionButtons}
                </td>
             </tr>
        `;
    }).join('');
}

function getStatusClass(status) {
    switch (status) {
        case 'paid': return 'status-paid';
        case 'processing': return 'status-processing';
        case 'shipped': return 'status-shipped';
        case 'delivered': return 'status-delivered';
        default: return 'status-paid';
    }
}

function viewOrder(orderId) {
    const order = allOrders.find(o => o.orderId === orderId || o.id === orderId);
    if (!order) {
        alert('Order not found');
        return;
    }

    const modal = document.getElementById('orderModal');
    const modalContent = document.getElementById('modalContent');

    const itemsHtml = order.items?.map(item => `
        <div class="order-item">
            <img src="${item.image}" alt="${item.name}" class="order-item-image">
            <div class="order-item-details">
                <div class="order-item-name">${item.name}</div>
                <div class="order-item-meta">Size: ${item.selectedSize} × ${item.quantity}</div>
                <div class="order-item-meta">${formatCurrency(item.price * item.quantity)}</div>
            </div>
        </div>
    `).join('') || '<p>No items</p>';

    const createdAtStr = order.createdAt?.toDate?.()
        ? order.createdAt.toDate().toLocaleString('en-US', {
            dateStyle: 'full',
            timeStyle: 'short'
        })
        : 'N/A';

    modalContent.innerHTML = `
        <div class="order-detail-section">
            <h3>Order Information</h3>
            <div class="detail-row">
                <span class="detail-label">Order ID:</span>
                <span class="detail-value">${order.orderId}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Date:</span>
                <span class="detail-value">${createdAtStr}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Status:</span>
                <span class="detail-value"><span class="status-badge ${getStatusClass(order.status)}">${order.status}</span></span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Payment Ref:</span>
                <span class="detail-value">${order.paymentReference}</span>
            </div>
        </div>

        <div class="order-detail-section">
            <h3>Customer Details</h3>
            <div class="detail-row">
                <span class="detail-label">Name:</span>
                <span class="detail-value">${order.customerDetails?.name || 'N/A'}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Email:</span>
                <span class="detail-value">${order.customerDetails?.email || 'N/A'}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Phone:</span>
                <span class="detail-value">${order.customerDetails?.phone || 'N/A'}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Address:</span>
                <span class="detail-value">${order.customerDetails?.address || ''}, ${order.customerDetails?.city || ''}, ${order.customerDetails?.state || ''} ${order.customerDetails?.zipCode || ''}, ${order.customerDetails?.country || ''}</span>
            </div>
        </div>

        <div class="order-items-list">
            <h3>Order Items</h3>
            ${itemsHtml}
        </div>

        <div class="order-totals">
            <div class="total-row">
                <span>Subtotal:</span>
                <span>${formatCurrency(order.subtotal || 0)}</span>
            </div>
            <div class="total-row">
                <span>Shipping:</span>
                <span>${formatCurrency(order.shippingCost || 0)}</span>
            </div>
            <div class="total-row grand-total">
                <span>Total:</span>
                <span>${formatCurrency(order.total || 0)}</span>
            </div>
        </div>
    `;

    modal.classList.add('show');
}

function closeModal() {
    document.getElementById('orderModal').classList.remove('show');
}

// --- Order status management functions ---
async function shipOrder(docId, orderId) {
    if (!confirm(`Mark order ${orderId} as shipped?`)) return;

    try {
        await db.collection('orders').doc(docId).update({
            status: 'shipped',
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        showNotification(`Order ${orderId} has been marked as shipped.`, 'success');
    } catch (error) {
        console.error('Error updating order status:', error);
        showNotification('Failed to update order status. Please try again.', 'error');
    }
}

async function deliverOrder(docId, orderId) {
    if (!confirm(`Mark order ${orderId} as delivered?`)) return;

    try {
        await db.collection('orders').doc(docId).update({
            status: 'delivered',
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        showNotification(`Order ${orderId} has been marked as delivered.`, 'success');
    } catch (error) {
        console.error('Error updating order status:', error);
        showNotification('Failed to update order status. Please try again.', 'error');
    }
}

// Close modal when clicking outside
document.addEventListener('click', (e) => {
    const modal = document.getElementById('orderModal');
    if (e.target === modal) {
        closeModal();
    }
});