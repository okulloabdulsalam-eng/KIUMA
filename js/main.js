// KIUMA - Main JavaScript File - Clean Responsive Version

// Webview Detection
function isInWebView() {
    // Check for various webview indicators
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    
    // Common webview user agents
    const webviewPatterns = [
        /wv/i,  // Android WebView
        /WebView/i,
        /Android.*(wv|\.0\.0\.0)/i,
        /iPhone.*Mobile.*Safari/i,  // iOS webview (often)
    ];
    
    // Check if running in standalone mode (PWA) or webview
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInApp = window.navigator.standalone || isStandalone;
    
    // Check for webview-specific properties
    const hasWebViewProperties = 
        (window.ReactNativeWebView !== undefined) ||
        (window.Android !== undefined) ||
        (window.webkit?.messageHandlers !== undefined);
    
    // Check URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const isWebViewParam = urlParams.get('webview') === 'true';
    
    return webviewPatterns.some(pattern => pattern.test(userAgent)) || 
           hasWebViewProperties || 
           isInApp || 
           isWebViewParam;
}

// Apply Native Mobile App Styling
function applyNativeMobileStyling() {
    if (!isInWebView()) return;
    
    // Add webview class to body
    document.body.classList.add('webview-mode');
    document.documentElement.classList.add('webview-mode');
    
    // Create bottom navigation if it doesn't exist
    if (!document.querySelector('.bottom-nav')) {
        createBottomNavigation();
    }
    
    // Hide top header in webview mode
    const header = document.querySelector('header');
    if (header) {
        header.classList.add('webview-hidden');
    }
    
    // Adjust body padding for bottom nav
    document.body.style.paddingBottom = '70px';
    document.body.style.paddingTop = '0';
    
    // Prevent pull-to-refresh
    let touchStartY = 0;
    document.addEventListener('touchstart', function(e) {
        touchStartY = e.touches[0].clientY;
    }, { passive: true });
    
    document.addEventListener('touchmove', function(e) {
        if (window.scrollY === 0 && e.touches[0].clientY > touchStartY) {
            e.preventDefault();
        }
    }, { passive: false });
}

// Create Bottom Navigation
function createBottomNavigation() {
    const bottomNav = document.createElement('nav');
    bottomNav.className = 'bottom-nav';
    bottomNav.innerHTML = `
        <a href="index.html" class="nav-item" data-page="home">
            <span class="nav-icon">🏠</span>
            <span class="nav-label">Home</span>
        </a>
        <a href="programs.html" class="nav-item" data-page="programs">
            <span class="nav-icon">📚</span>
            <span class="nav-label">Programs</span>
        </a>
        <a href="events.html" class="nav-item" data-page="events">
            <span class="nav-icon">📅</span>
            <span class="nav-label">Events</span>
        </a>
        <a href="notifications.html" class="nav-item" data-page="notifications">
            <span class="nav-icon">🔔</span>
            <span class="nav-label">Alerts</span>
        </a>
        <a href="contact.html" class="nav-item" data-page="contact">
            <span class="nav-icon">📞</span>
            <span class="nav-label">Contact</span>
        </a>
    `;
    
    document.body.appendChild(bottomNav);
    
    // Highlight current page
    const currentPage = getCurrentPageName();
    const currentNavItem = bottomNav.querySelector(`[data-page="${currentPage}"]`);
    if (currentNavItem) {
        currentNavItem.classList.add('active');
    }
}

// Get current page name for navigation highlighting
function getCurrentPageName() {
    const path = window.location.pathname;
    const page = path.split('/').pop() || 'index.html';
    
    if (page === 'index.html' || page === '') return 'home';
    if (page.includes('program')) return 'programs';
    if (page.includes('event')) return 'events';
    if (page.includes('notification')) return 'notifications';
    if (page.includes('contact')) return 'contact';
    
    return 'home';
}

// Dropdown Menu Functionality
function initDropdowns() {
    const dropdowns = document.querySelectorAll('.dropdown');
    if (dropdowns.length === 0) return;
    
    let hoverTimeouts = new Map();
    let activeDropdown = null;
    
    function closeAllDropdowns() {
        dropdowns.forEach(dropdown => {
            dropdown.classList.remove('active');
        });
        hoverTimeouts.forEach(timeout => clearTimeout(timeout));
        hoverTimeouts.clear();
        activeDropdown = null;
    }
    
    dropdowns.forEach(dropdown => {
        const toggle = dropdown.querySelector('.dropdown-toggle');
        const menu = dropdown.querySelector('.dropdown-menu');
        
        if (!toggle || !menu) return;
        
        // Click to toggle
        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const isActive = dropdown.classList.contains('active');
            closeAllDropdowns();
            
            if (!isActive) {
                dropdown.classList.add('active');
                activeDropdown = dropdown;
            }
        });
        
        // Hover to open (for devices with mouse)
        dropdown.addEventListener('mouseenter', function() {
            if (hoverTimeouts.has(dropdown)) {
                clearTimeout(hoverTimeouts.get(dropdown));
                hoverTimeouts.delete(dropdown);
            }
            
            dropdowns.forEach(other => {
                if (other !== dropdown && other.classList.contains('active')) {
                    other.classList.remove('active');
                    if (hoverTimeouts.has(other)) {
                        clearTimeout(hoverTimeouts.get(other));
                        hoverTimeouts.delete(other);
                    }
                }
            });
            
            dropdown.classList.add('active');
            activeDropdown = dropdown;
        });
        
        // Close on mouse leave
        dropdown.addEventListener('mouseleave', function() {
            const timeout = setTimeout(() => {
                dropdown.classList.remove('active');
                hoverTimeouts.delete(dropdown);
                if (activeDropdown === dropdown) {
                    activeDropdown = null;
                }
            }, 250);
            hoverTimeouts.set(dropdown, timeout);
        });
        
        // Close when clicking menu items
        menu.querySelectorAll('a').forEach(item => {
            item.addEventListener('click', function() {
                setTimeout(() => {
                    dropdown.classList.remove('active');
                    activeDropdown = null;
                }, 150);
            });
        });
    });
    
    // Close on outside click
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.dropdown')) {
            closeAllDropdowns();
        }
    });
}

// Initialize everything
document.addEventListener('DOMContentLoaded', function() {
    // Apply native mobile styling if in webview
    applyNativeMobileStyling();
    
    // Initialize dropdowns
    initDropdowns();

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#' && href.length > 1) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });

    // Form Validation and Submission
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Basic validation
            const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
            let isValid = true;

            inputs.forEach(input => {
                if (!input.value.trim()) {
                    isValid = false;
                    input.style.borderColor = '#e74c3c';
                } else {
                    input.style.borderColor = '#e0e0e0';
                }
            });

            if (isValid) {
                // Show success message
                const successMessage = document.createElement('div');
                successMessage.className = 'success-message';
                successMessage.style.cssText = `
                    background-color: #0d7d3d;
                    color: white;
                    padding: 1rem;
                    border-radius: 5px;
                    margin-top: 1rem;
                    text-align: center;
                `;
                successMessage.textContent = 'Thank you! Your submission has been received.';
                
                form.appendChild(successMessage);
                form.reset();

                // Remove success message after 5 seconds
                setTimeout(() => {
                    successMessage.remove();
                }, 5000);

                console.log('Form submitted:', new FormData(form));
            } else {
                alert('Please fill in all required fields.');
            }
        });
    });

    // Gallery Image Lightbox
    const galleryItems = document.querySelectorAll('.gallery-item img');
    galleryItems.forEach(item => {
        item.addEventListener('click', function() {
            const lightbox = document.createElement('div');
            lightbox.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.9);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                cursor: pointer;
            `;

            const img = document.createElement('img');
            img.src = this.src;
            img.style.cssText = `
                max-width: 90%;
                max-height: 90%;
                border-radius: 10px;
            `;

            lightbox.appendChild(img);
            document.body.appendChild(lightbox);

            lightbox.addEventListener('click', function() {
                document.body.removeChild(lightbox);
            });
        });
    });

    // Scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Apply animation to cards
    const animatedElements = document.querySelectorAll('.card, .value-card, .program-card, .event-card');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Donation amount buttons
    const donationButtons = document.querySelectorAll('.donation-amount');
    donationButtons.forEach(button => {
        button.addEventListener('click', function() {
            donationButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            const donationInput = document.querySelector('#donation-amount');
            if (donationInput) {
                donationInput.value = this.dataset.amount;
            }
        });
    });
});

// Add active class styling for donation buttons
const style = document.createElement('style');
style.textContent = `
    .donation-amount.active {
        background-color: var(--islamic-green) !important;
        color: white !important;
    }
`;
document.head.appendChild(style);


