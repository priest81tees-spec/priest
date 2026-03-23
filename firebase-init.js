// firebase-init.js – Updated with robust notification function
const firebaseConfig = {
  apiKey: "AIzaSyBlxGATAZwl9ahQkDqLNNUQCcufWaD3AEo",
  authDomain: "prieststore.firebaseapp.com",
  projectId: "prieststore",
  storageBucket: "prieststore.firebasestorage.app",
  messagingSenderId: "757368090202",
  appId: "1:757368090202:web:4434826771cee3d9ae3263",
  measurementId: "G-XRM8XWV7ZW"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Global Firestore references
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Optional: enable offline persistence
db.enablePersistence().catch(err => console.log("Persistence failed:", err));

// ===== IMPROVED NOTIFICATION HELPER =====
function showNotification(message, type = 'info') {
  console.log(`🔔 Notification (${type}):`, message); // Debug line – remove after testing

  // Remove any existing notification
  const existing = document.querySelector('.notification');
  if (existing) existing.remove();

  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;

  // Emoji mapping
  let emoji = 'ℹ️';
  if (type === 'success') emoji = '✅';
  if (type === 'error') emoji = '❌';
  if (type === 'warning') emoji = '⚠️';

  notification.innerHTML = `
    <span class="notification-emoji">${emoji}</span>
    <span class="notification-message">${message}</span>
    <button class="notification-close">&times;</button>
  `;

  // Inline styles as a fallback (in case CSS is missing)
  notification.style.position = 'fixed';
  notification.style.top = '1.5rem';
  notification.style.right = '1.5rem';
  notification.style.backgroundColor = '#fff';
  notification.style.borderLeft = '4px solid #333';
  notification.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
  notification.style.padding = '1rem 1.5rem';
  notification.style.borderRadius = '4px';
  notification.style.display = 'flex';
  notification.style.alignItems = 'center';
  notification.style.gap = '0.75rem';
  notification.style.zIndex = '9999';
  notification.style.animation = 'slideIn 0.3s ease';

  // Add to DOM
  document.body.appendChild(notification);

  // Auto-remove after 4 seconds
  const timeout = setTimeout(() => {
    if (notification.parentNode) notification.remove();
  }, 4000);

  // Close button event
  const closeBtn = notification.querySelector('.notification-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      clearTimeout(timeout);
      notification.remove();
    });
  } else {
    console.warn('Close button not found in notification');
  }

  // Fallback alert if something went wrong (optional – remove after debugging)
  // alert(message);
}

// Inject keyframe animation if not already present
if (!document.querySelector('#notification-keyframes')) {
  const style = document.createElement('style');
  style.id = 'notification-keyframes';
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to   { transform: translateX(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);
}