// Media Management System
// Admin Password: kiuma2025 (same for all admin features - prayer times, notifications, media)
const UPLOAD_PASSWORD = 'kiuma2025';

// Initialize media system
document.addEventListener('DOMContentLoaded', function() {
    initializeMedia();
    setupUploadForm();
    setupTypeSelector();
});

// Initialize media display
function initializeMedia() {
    loadMedia();
    displayMedia();
}

// Setup upload form
function setupUploadForm() {
    const form = document.getElementById('upload-form');
    if (form) {
        form.addEventListener('submit', handleFileUpload);
    }
}

// Setup type selector to show/hide weekly category
function setupTypeSelector() {
    const typeSelect = document.getElementById('file-type');
    const weeklyCategoryGroup = document.getElementById('weekly-category-group');
    
    if (typeSelect && weeklyCategoryGroup) {
        typeSelect.addEventListener('change', function() {
            if (this.value === 'weekly') {
                weeklyCategoryGroup.style.display = 'block';
                document.getElementById('weekly-category').required = true;
            } else {
                weeklyCategoryGroup.style.display = 'none';
                document.getElementById('weekly-category').required = false;
            }
        });
    }
}

// Show upload section
function showUploadSection() {
    const uploadSection = document.getElementById('upload-section');
    if (uploadSection) {
        uploadSection.classList.add('active');
        uploadSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// Hide upload section
function hideUploadSection() {
    const uploadSection = document.getElementById('upload-section');
    if (uploadSection) {
        uploadSection.classList.remove('active');
        document.getElementById('upload-form').reset();
        document.getElementById('upload-message').textContent = '';
        document.getElementById('weekly-category-group').style.display = 'none';
    }
}

// Handle file upload
function handleFileUpload(e) {
    e.preventDefault();
    
    const password = document.getElementById('upload-password').value;
    const fileInput = document.getElementById('file-input');
    const title = document.getElementById('file-title').value;
    const type = document.getElementById('file-type').value;
    const weeklyCategory = document.getElementById('weekly-category').value;
    const description = document.getElementById('file-description').value;
    const teacher = document.getElementById('file-teacher').value;
    const messageDiv = document.getElementById('upload-message');
    
    // Verify password
    if (password !== UPLOAD_PASSWORD) {
        messageDiv.innerHTML = '<p style="color: #e74c3c;">❌ Incorrect password. Only authorized personnel can upload files.</p>';
        return;
    }
    
    // Validate file
    if (!fileInput.files || fileInput.files.length === 0) {
        messageDiv.innerHTML = '<p style="color: #e74c3c;">Please select a file to upload.</p>';
        return;
    }
    
    const file = fileInput.files[0];
    
    // Validate weekly category if type is weekly
    if (type === 'weekly' && !weeklyCategory) {
        messageDiv.innerHTML = '<p style="color: #e74c3c;">Please select a weekly teaching category.</p>';
        return;
    }
    
    // Read file as base64
    const reader = new FileReader();
    reader.onload = function(e) {
        const fileData = e.target.result;
        
        // Create media object
        const mediaItem = {
            id: Date.now().toString(),
            title: title,
            type: type,
            weeklyCategory: type === 'weekly' ? weeklyCategory : null,
            description: description || '',
            teacher: teacher || '',
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            fileData: fileData,
            uploadDate: new Date().toISOString(),
            downloadCount: 0
        };
        
        // Save to localStorage
        saveMediaItem(mediaItem);
        
        // Display success message
        messageDiv.innerHTML = '<p style="color: var(--islamic-green);">✅ File uploaded successfully!</p>';
        
        // Reset form
        document.getElementById('upload-form').reset();
        document.getElementById('weekly-category-group').style.display = 'none';
        
        // Refresh media display
        displayMedia();
        
        // Clear message after 3 seconds
        setTimeout(() => {
            messageDiv.textContent = '';
        }, 3000);
    };
    
    reader.onerror = function() {
        messageDiv.innerHTML = '<p style="color: #e74c3c;">Error reading file. Please try again.</p>';
    };
    
    reader.readAsDataURL(file);
}

// Save media item to localStorage
function saveMediaItem(mediaItem) {
    let mediaItems = getMediaItems();
    mediaItems.push(mediaItem);
    localStorage.setItem('kiuma_media', JSON.stringify(mediaItems));
}

// Get all media items from localStorage
function getMediaItems() {
    const stored = localStorage.getItem('kiuma_media');
    return stored ? JSON.parse(stored) : [];
}

// Display media items
function displayMedia(filterType = 'all') {
    const mediaItems = getMediaItems();
    const container = document.getElementById('media-container');
    const noMediaMessage = document.getElementById('no-media-message');
    
    if (!container) return;
    
    // Clear container
    container.innerHTML = '';
    
    // Filter media items
    let filteredItems = mediaItems;
    if (filterType !== 'all') {
        filteredItems = mediaItems.filter(item => item.type === filterType);
    }
    
    // Show/hide no media message
    if (filteredItems.length === 0) {
        noMediaMessage.style.display = 'block';
    } else {
        noMediaMessage.style.display = 'none';
    }
    
    // Group weekly teachings by category
    if (filterType === 'all' || filterType === 'weekly') {
        const weeklyItems = filteredItems.filter(item => item.type === 'weekly');
        const otherItems = filteredItems.filter(item => item.type !== 'weekly');
        
        // Display weekly teachings grouped by category
        if (weeklyItems.length > 0) {
            const weeklyCategories = {};
            weeklyItems.forEach(item => {
                const category = item.weeklyCategory || 'other';
                if (!weeklyCategories[category]) {
                    weeklyCategories[category] = [];
                }
                weeklyCategories[category].push(item);
            });
            
            // Create section for each weekly category
            Object.keys(weeklyCategories).forEach(category => {
                const categoryTitle = getCategoryTitle(category);
                const categoryDiv = document.createElement('div');
                categoryDiv.className = 'card';
                categoryDiv.style.marginBottom = '2rem';
                categoryDiv.innerHTML = `
                    <h3 style="margin-bottom: 1rem; color: var(--islamic-green);">${categoryTitle}</h3>
                    <div class="card-grid" style="grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1rem;">
                        ${weeklyCategories[category].map(item => createMediaCard(item)).join('')}
                    </div>
                `;
                container.appendChild(categoryDiv);
            });
            
            // Display other items
            otherItems.forEach(item => {
                container.appendChild(createMediaCardElement(item));
            });
        } else {
            // Display all filtered items
            filteredItems.forEach(item => {
                container.appendChild(createMediaCardElement(item));
            });
        }
    } else {
        // Display all filtered items
        filteredItems.forEach(item => {
            container.appendChild(createMediaCardElement(item));
        });
    }
}

// Create media card HTML
function createMediaCard(item) {
    const icon = getFileIcon(item.type);
    const badgeClass = `badge-${item.type}`;
    const typeLabel = getTypeLabel(item.type);
    const size = formatFileSize(item.fileSize);
    const date = new Date(item.uploadDate).toLocaleDateString();
    
    return `
        <div class="card media-item" data-type="${item.type}" data-id="${item.id}" style="padding: 1rem;">
            <div class="file-icon" style="text-align: center;">${icon}</div>
            <span class="media-type-badge ${badgeClass}">${typeLabel}</span>
            <h4 style="font-size: 1rem; margin-bottom: 0.5rem; min-height: 2.5rem;">${item.title}</h4>
            ${item.teacher ? `<p style="font-size: 0.85rem; color: var(--text-light); margin-bottom: 0.25rem;"><strong>Teacher:</strong> ${item.teacher}</p>` : ''}
            ${item.description ? `<p style="font-size: 0.85rem; color: var(--text-light); margin-bottom: 0.5rem;">${item.description.substring(0, 60)}${item.description.length > 60 ? '...' : ''}</p>` : ''}
            <p style="font-size: 0.75rem; color: var(--text-light); margin-bottom: 0.75rem;">
                ${size} • ${date}
            </p>
            <button class="btn btn-primary" onclick="downloadFile('${item.id}')" style="width: 100%; padding: 0.6rem; font-size: 0.9rem;">
                📥 Download
            </button>
        </div>
    `;
}

// Create media card element
function createMediaCardElement(item) {
    const div = document.createElement('div');
    div.innerHTML = createMediaCard(item);
    return div.firstElementChild;
}

// Get file icon based on type
function getFileIcon(type) {
    const icons = {
        'weekly': '📖',
        'audio': '🎵',
        'video': '▶️',
        'books': '📚',
        'documents': '📄'
    };
    return icons[type] || '📄';
}

// Get type label
function getTypeLabel(type) {
    const labels = {
        'weekly': 'Weekly Teaching',
        'audio': 'Audio',
        'video': 'Video',
        'books': 'Book',
        'documents': 'Document'
    };
    return labels[type] || type;
}

// Get category title
function getCategoryTitle(category) {
    const titles = {
        'quran-yasaruna': '📖 Monday - Thursday: Quran and Yasaruna',
        'hadith-memorisation': '📚 Tuesday: Hadith Memorisation',
        'hadith-explanation': '📖 Friday: Hadith Explanation',
        'tawheed': '🕌 Saturday: Kitaabu Tawheed',
        'fiqh-swalah': '📚 Sunday: Fiqh Swalah',
        'arbauna-nawawi': '📖 Sunday: Arbauna Nawawi',
        'tafsir': '📖 Sunday: Tafsir',
        'arabic-classes': '📚 Saturday & Sunday: Arabic Classes'
    };
    return titles[category] || category;
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Filter media by type
function filterMedia(type) {
    // Update button states
    document.querySelectorAll('.media-filter-btn').forEach(btn => {
        btn.classList.remove('active', 'btn-primary');
        btn.classList.add('btn-outline');
    });
    
    const activeBtn = document.querySelector(`[data-type="${type}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active', 'btn-primary');
        activeBtn.classList.remove('btn-outline');
    }
    
    // Display filtered media
    displayMedia(type);
}

// Download file
function downloadFile(id) {
    const mediaItems = getMediaItems();
    const item = mediaItems.find(m => m.id === id);
    
    if (!item) {
        alert('File not found.');
        return;
    }
    
    // Create download link
    const link = document.createElement('a');
    link.href = item.fileData;
    link.download = item.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Update download count
    item.downloadCount = (item.downloadCount || 0) + 1;
    saveMediaItems(mediaItems);
}

// Save all media items
function saveMediaItems(mediaItems) {
    localStorage.setItem('kiuma_media', JSON.stringify(mediaItems));
}

// Load media (can be used to initialize with sample data)
function loadMedia() {
    // Check if media already exists
    if (localStorage.getItem('kiuma_media')) {
        return;
    }
    
    // You can add sample data here if needed
    // For now, we'll start with an empty array
}

