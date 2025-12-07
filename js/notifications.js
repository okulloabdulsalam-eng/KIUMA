// Notifications Management System
// Admin Password: kiuma2025 (same for all admin features - prayer times, notifications, media)
const ADMIN_PASSWORD = 'kiuma2025';

// Initialize notifications
document.addEventListener('DOMContentLoaded', function() {
    setupNotificationForm();
    setupAdminForm();
    loadNotifications();
    checkNotificationPermission();
});

// Setup notification subscription form
function setupNotificationForm() {
    const form = document.getElementById('notification-subscribe-form');
    if (form) {
        form.addEventListener('submit', handleNotificationSubscribe);
    }
}

// Handle notification subscription
function handleNotificationSubscribe(e) {
    e.preventDefault();
    
    const form = e.target;
    const messageDiv = document.getElementById('subscribe-message');
    
    // Get form data
    const formData = {
        name: document.getElementById('subscriber-name').value,
        email: document.getElementById('subscriber-email').value,
        phone: document.getElementById('subscriber-phone').value,
        notifications: Array.from(form.querySelectorAll('input[name="notifications[]"]:checked'))
            .map(checkbox => checkbox.value),
        timestamp: new Date().toISOString()
    };
    
    // Validate at least one notification type selected
    if (formData.notifications.length === 0) {
        messageDiv.innerHTML = '<p style="color: #e74c3c;">❌ Please select at least one notification type.</p>';
        return;
    }
    
    // Save subscription to localStorage
    saveSubscription(formData);
    
    // Request browser notification permission
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                showTestNotification();
            }
        });
    }
    
    // Show success message
    messageDiv.innerHTML = `
        <div style="background: linear-gradient(135deg, rgba(13, 125, 61, 0.1) 0%, rgba(212, 175, 55, 0.1) 100%); 
                    padding: 1.5rem; border-radius: 10px; border: 2px solid var(--islamic-green);">
            <h3 style="color: var(--islamic-green); margin-bottom: 1rem;">✅ Successfully Subscribed!</h3>
            <p style="color: var(--text-dark); margin-bottom: 0.5rem;">
                You have been subscribed to receive notifications for:
            </p>
            <ul style="text-align: left; margin: 1rem 0; color: var(--text-dark);">
                ${formData.notifications.map(notif => `<li>${getNotificationLabel(notif)}</li>`).join('')}
            </ul>
            <p style="color: var(--text-light); font-size: 0.9rem; margin-top: 1rem;">
                You will receive notifications via email${formData.phone ? ' and SMS' : ''}.
            </p>
        </div>
    `;
    
    // Reset form after a delay
    setTimeout(() => {
        form.reset();
        // Re-check all checkboxes that were selected
        formData.notifications.forEach(notif => {
            const checkbox = document.getElementById(`notif-${notif}`);
            if (checkbox) checkbox.checked = true;
        });
    }, 5000);
}

// Get notification label
function getNotificationLabel(type) {
    const labels = {
        'salah': '🕌 Salah Reminders',
        'events': '📅 Events',
        'updates': '📢 Updates from School',
        'blog': '📚 Blog Posts',
        'courses': '📖 New Courses',
        'ramadan': '🌙 Ramadan Programs',
        'friday': '🕌 Friday Reminders'
    };
    return labels[type] || type;
}

// Save subscription to localStorage
function saveSubscription(subscriptionData) {
    try {
        let subscriptions = JSON.parse(localStorage.getItem('kiuma_notifications') || '[]');
        subscriptions.push({
            ...subscriptionData,
            id: Date.now().toString(),
            active: true
        });
        localStorage.setItem('kiuma_notifications', JSON.stringify(subscriptions));
    } catch (e) {
        console.error('Error saving subscription:', e);
    }
}

// Load notifications
function loadNotifications() {
    // This would typically load from a server
    // For now, we'll use the static notifications in the HTML
    // In a real implementation, this would fetch from an API
}

// Check browser notification permission
function checkNotificationPermission() {
    if ('Notification' in window) {
        if (Notification.permission === 'granted') {
            // User has granted permission
            console.log('Browser notifications enabled');
        } else if (Notification.permission === 'denied') {
            // User has denied permission
            console.log('Browser notifications denied');
        }
    }
}

// Show test notification
function showTestNotification() {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('KIUMA Notifications', {
            body: 'You will now receive notifications from KIUMA',
            icon: 'logo.png', // KIUMA logo
            tag: 'kiuma-subscription'
        });
    }
}

// Function to send notification (would be called by server or scheduled task)
function sendNotification(title, body, category = 'updates') {
    // Check if user is subscribed to this category
    const subscriptions = JSON.parse(localStorage.getItem('kiuma_notifications') || '[]');
    const activeSubscriptions = subscriptions.filter(sub => sub.active);
    
    // Send browser notification if permission granted
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
            body: body,
            icon: 'logo.png',
            tag: `kiuma-${category}`,
            requireInteraction: false
        });
    }
    
    // In a real implementation, this would also send email/SMS notifications
    // based on user preferences stored in the database
}

// Schedule prayer time notifications (example)
function schedulePrayerNotifications() {
    // This would integrate with the prayer timetable widget
    // and schedule notifications for each prayer time
    // Implementation would depend on the prayer times API
}

// Admin Section Functions
function showAdminSection() {
    const adminSection = document.getElementById('admin-section');
    if (adminSection) {
        adminSection.style.display = 'block';
        adminSection.scrollIntoView({ behavior: 'smooth' });
    }
}

function hideAdminSection() {
    const adminSection = document.getElementById('admin-section');
    if (adminSection) {
        adminSection.style.display = 'none';
        document.getElementById('admin-notification-form').reset();
        document.getElementById('admin-message').textContent = '';
    }
}

// Setup admin form
function setupAdminForm() {
    const form = document.getElementById('admin-notification-form');
    if (form) {
        form.addEventListener('submit', handleAdminNotificationAdd);
    }
}

// Handle admin notification addition
function handleAdminNotificationAdd(e) {
    e.preventDefault();
    
    const password = document.getElementById('admin-password').value;
    const messageDiv = document.getElementById('admin-message');
    
    // Verify password
    if (password !== ADMIN_PASSWORD) {
        messageDiv.innerHTML = '<p style="color: #e74c3c;">❌ Incorrect password. Only authorized administrators can add notifications.</p>';
        return;
    }
    
    // Get form data
    const notificationData = {
        id: Date.now().toString(),
        title: document.getElementById('notification-title').value,
        content: document.getElementById('notification-content').value,
        category: document.getElementById('notification-category').value,
        priority: document.getElementById('notification-priority').value,
        timestamp: new Date().toISOString(),
        read: false
    };
    
    // Save notification
    saveNotification(notificationData);
    
    // Show success message
    messageDiv.innerHTML = '<p style="color: var(--islamic-green);">✅ Notification added successfully!</p>';
    
    // Reset form
    document.getElementById('admin-notification-form').reset();
    
    // Reload notifications
    loadNotifications();
    
    // Clear message after 3 seconds
    setTimeout(() => {
        messageDiv.textContent = '';
    }, 3000);
}

// Save notification to localStorage
function saveNotification(notificationData) {
    try {
        let notifications = JSON.parse(localStorage.getItem('kiuma_notifications_list') || '[]');
        notifications.unshift(notificationData); // Add to beginning
        localStorage.setItem('kiuma_notifications_list', JSON.stringify(notifications));
    } catch (e) {
        console.error('Error saving notification:', e);
    }
}

// Load and display notifications
function loadNotifications() {
    const container = document.getElementById('notifications-list');
    const noNotificationsMsg = document.getElementById('no-notifications-message');
    
    if (!container) return;
    
    try {
        const notifications = JSON.parse(localStorage.getItem('kiuma_notifications_list') || '[]');
        
        if (notifications.length === 0) {
            container.innerHTML = '';
            if (noNotificationsMsg) noNotificationsMsg.style.display = 'block';
            return;
        }
        
        if (noNotificationsMsg) noNotificationsMsg.style.display = 'none';
        
        container.innerHTML = notifications.map(notif => {
            const categoryClass = `category-${notif.category}`;
            const categoryLabel = getCategoryLabel(notif.category);
            const timeAgo = getTimeAgo(notif.timestamp);
            const unreadClass = !notif.read ? 'unread' : '';
            
            return `
                <div class="notification-item ${unreadClass}" data-id="${notif.id}">
                    <span class="notification-category ${categoryClass}">${categoryLabel}</span>
                    ${notif.priority === 'urgent' ? '<span style="background: #e74c3c; color: white; padding: 0.2rem 0.5rem; border-radius: 10px; font-size: 0.7rem; margin-left: 0.5rem;">URGENT</span>' : ''}
                    ${notif.priority === 'high' ? '<span style="background: var(--gold); color: var(--text-dark); padding: 0.2rem 0.5rem; border-radius: 10px; font-size: 0.7rem; margin-left: 0.5rem;">HIGH</span>' : ''}
                    <h3 style="margin: 0.5rem 0; color: var(--text-dark);">${notif.title}</h3>
                    <p style="color: var(--text-dark); margin: 0.5rem 0;">${notif.content}</p>
                    <p class="notification-time">${timeAgo}</p>
                </div>
            `;
        }).join('');
        
        // Add click handlers to mark as read
        container.querySelectorAll('.notification-item').forEach(item => {
            item.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                markAsRead(id);
                this.classList.remove('unread');
            });
        });
    } catch (e) {
        console.error('Error loading notifications:', e);
        if (noNotificationsMsg) noNotificationsMsg.style.display = 'block';
    }
}

// Get category label
function getCategoryLabel(category) {
    const labels = {
        'salah': '🕌 Salah Reminder',
        'events': '📅 Event',
        'updates': '📢 School Update',
        'blog': '📚 Blog Post',
        'courses': '📖 New Course',
        'ramadan': '🌙 Ramadan Program',
        'friday': '🕌 Friday Reminder'
    };
    return labels[category] || category;
}

// Get time ago
function getTimeAgo(timestamp) {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now - time;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return time.toLocaleDateString();
}

// Mark notification as read
function markAsRead(id) {
    try {
        let notifications = JSON.parse(localStorage.getItem('kiuma_notifications_list') || '[]');
        notifications = notifications.map(notif => {
            if (notif.id === id) {
                notif.read = true;
            }
            return notif;
        });
        localStorage.setItem('kiuma_notifications_list', JSON.stringify(notifications));
    } catch (e) {
        console.error('Error marking as read:', e);
    }
}

