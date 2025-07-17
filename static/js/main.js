// Main JavaScript for Suntyn AI
console.log('🚀 Initializing Suntyn AI...');

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Suntyn AI initialized successfully');

    // Initialize components
    initializeToolSearch();
    initializeToolForms();
    initializeFileUploads();

    // Log page load time
    const loadTime = performance.now();
    console.log(`Page load time: ${loadTime.toFixed(2)}ms`);
});

// Tool search functionality
function initializeToolSearch() {
    const searchInput = document.getElementById('tool-search');
    const filterButtons = document.querySelectorAll('.filter-btn');

    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const query = this.value.toLowerCase();
            filterTools(query);
        });
    }

    filterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            filterButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            const filter = this.dataset.filter;
            filterToolsByCategory(filter);
        });
    });
}

// Filter tools by search query
function filterTools(query) {
    const toolCards = document.querySelectorAll('.tool-card, .category-card');

    toolCards.forEach(card => {
        const title = card.querySelector('h5, h6, .card-title')?.textContent.toLowerCase() || '';
        const description = card.querySelector('p, .card-text')?.textContent.toLowerCase() || '';

        if (title.includes(query) || description.includes(query)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Filter tools by category
function filterToolsByCategory(category) {
    const toolCards = document.querySelectorAll('.tool-card, .category-card');

    if (category === 'all') {
        toolCards.forEach(card => card.style.display = 'block');
        return;
    }

    toolCards.forEach(card => {
        const cardCategory = card.dataset.category?.toLowerCase() || '';
        const cardTitle = card.querySelector('h5, h6, .card-title')?.textContent.toLowerCase() || '';

        if (cardCategory.includes(category) || cardTitle.includes(category)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Initialize tool forms
function initializeToolForms() {
    const toolForms = document.querySelectorAll('.tool-form');

    toolForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            handleToolSubmission(this);
        });
    });
}

// Handle tool form submission
async function handleToolSubmission(form) {
    const toolName = form.dataset.tool;
    const submitBtn = form.querySelector('button[type="submit"]');
    const resultDiv = document.getElementById('tool-result') || createResultDiv();

    if (!toolName) {
        showError('Tool name not specified');
        return;
    }

    // Show loading state
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Processing...';

    try {
        const formData = new FormData(form);

        const response = await fetch(`/api/process-tool/${toolName}`, {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            showSuccess(result);
        } else {
            showError(result.error || 'Processing failed');
        }

    } catch (error) {
        console.error('Tool processing error:', error);
        showError('Network error occurred. Please try again.');
    } finally {
        // Reset button
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

// Show success result
function showSuccess(result) {
    const resultDiv = document.getElementById('tool-result') || createResultDiv();

    let html = `
        <div class="alert alert-success" role="alert">
            <i class="ti ti-check-circle me-2"></i>
            ${result.message || 'Processing completed successfully!'}
        </div>
    `;

    // Add download link if available
    if (result.download_url) {
        html += `
            <div class="mt-3">
                <a href="${result.download_url}" class="btn btn-primary" download>
                    <i class="ti ti-download me-2"></i>Download Result
                </a>
            </div>
        `;
    }

    // Add specific result content
    if (result.password) {
        html += `
            <div class="mt-3">
                <label class="form-label">Generated Password:</label>
                <div class="input-group">
                    <input type="text" class="form-control" value="${result.password}" readonly>
                    <button class="btn btn-outline-secondary" onclick="copyToClipboard('${result.password}')">
                        <i class="ti ti-copy"></i>
                    </button>
                </div>
                <small class="text-muted">Strength: ${result.strength}</small>
            </div>
        `;
    }

    if (result.hash) {
        html += `
            <div class="mt-3">
                <label class="form-label">${result.type.toUpperCase()} Hash:</label>
                <div class="input-group">
                    <input type="text" class="form-control" value="${result.hash}" readonly>
                    <button class="btn btn-outline-secondary" onclick="copyToClipboard('${result.hash}')">
                        <i class="ti ti-copy"></i>
                    </button>
                </div>
            </div>
        `;
    }

    if (result.formatted) {
        html += `
            <div class="mt-3">
                <label class="form-label">Formatted JSON:</label>
                <textarea class="form-control" rows="10" readonly>${result.formatted}</textarea>
            </div>
        `;
    }

    if (result.summary) {
        html += `
            <div class="mt-3">
                <label class="form-label">Summary:</label>
                <div class="card">
                    <div class="card-body">
                        <p>${result.summary}</p>
                        <small class="text-muted">
                            Compression: ${result.compression_ratio} 
                            (${result.original_length} → ${result.summary_length} characters)
                        </small>
                    </div>
                </div>
            </div>
        `;
    }

    if (result.emi) {
        html += `
            <div class="mt-3">
                <div class="row">
                    <div class="col-md-6">
                        <div class="card">
                            <div class="card-body text-center">
                                <h5 class="card-title">Monthly EMI</h5>
                                <h3 class="text-primary">₹${result.emi}</h3>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="card">
                            <div class="card-body text-center">
                                <h5 class="card-title">Total Interest</h5>
                                <h3 class="text-warning">₹${result.total_interest}</h3>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="mt-3">
                    <p><strong>Total Amount:</strong> ₹${result.total_amount}</p>
                </div>
            </div>
        `;
    }

    if (result.uuids) {
        html += `
            <div class="mt-3">
                <label class="form-label">Generated UUIDs:</label>
                <div class="list-group">
                    ${result.uuids.map(uuid => `
                        <div class="list-group-item d-flex justify-content-between align-items-center">
                            <code>${uuid}</code>
                            <button class="btn btn-sm btn-outline-secondary" onclick="copyToClipboard('${uuid}')">
                                <i class="ti ti-copy"></i>
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    resultDiv.innerHTML = html;
    resultDiv.scrollIntoView({ behavior: 'smooth' });
}

// Show error message
function showError(message) {
    const resultDiv = document.getElementById('tool-result') || createResultDiv();

    resultDiv.innerHTML = `
        <div class="alert alert-danger" role="alert">
            <i class="ti ti-alert-circle me-2"></i>
            ${message}
        </div>
    `;

    resultDiv.scrollIntoView({ behavior: 'smooth' });
}

// Create result div if it doesn't exist
function createResultDiv() {
    const resultDiv = document.createElement('div');
    resultDiv.id = 'tool-result';
    resultDiv.className = 'mt-4';

    const container = document.querySelector('.tool-form')?.parentNode || document.querySelector('.container');
    if (container) {
        container.appendChild(resultDiv);
    }

    return resultDiv;
}

// Copy to clipboard function
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        // Show toast notification
        showToast('Copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
}

// Show toast notification
function showToast(message) {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'toast align-items-center text-white bg-success border-0 position-fixed top-0 end-0 m-3';
    toast.style.zIndex = '9999';
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" aria-label="Close"></button>
        </div>
    `;

    document.body.appendChild(toast);

    // Initialize and show toast
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();

    // Remove element after hidden
    toast.addEventListener('hidden.bs.toast', () => {
        toast.remove();
    });
}

// Initialize file uploads
function initializeFileUploads() {
    const fileInputs = document.querySelectorAll('input[type="file"]');

    fileInputs.forEach(input => {
        const dropZone = input.closest('.drag-drop-zone');

        if (dropZone) {
            // Drag and drop events
            dropZone.addEventListener('dragover', (e) => {
                e.preventDefault();
                dropZone.classList.add('drag-over');
            });

            dropZone.addEventListener('dragleave', () => {
                dropZone.classList.remove('drag-over');
            });

            dropZone.addEventListener('drop', (e) => {
                e.preventDefault();
                dropZone.classList.remove('drag-over');

                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    input.files = files;
                    updateFileDisplay(input);
                }
            });

            // Click to select
            dropZone.addEventListener('click', () => {
                input.click();
            });
        }

        // File selection change
        input.addEventListener('change', function() {
            updateFileDisplay(this);
        });
    });
}

// Update file display
function updateFileDisplay(input) {
    const dropZone = input.closest('.drag-drop-zone');
    const files = Array.from(input.files);

    if (files.length === 0) return;

    let html = '<div class="selected-files mt-3">';
    files.forEach(file => {
        html += `
            <div class="file-item d-flex align-items-center mb-2">
                <i class="ti ti-file me-2"></i>
                <span class="file-name">${file.name}</span>
                <span class="file-size ms-auto text-muted">${formatFileSize(file.size)}</span>
            </div>
        `;
    });
    html += '</div>';

    const existingFiles = dropZone.querySelector('.selected-files');
    if (existingFiles) {
        existingFiles.remove();
    }

    dropZone.insertAdjacentHTML('beforeend', html);
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Service Worker registration (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

class SuntynAI {
    constructor() {
        this.isInitialized = false;
        this.currentUser = null;
        this.notifications = [];
        this.init();
    }

    async init() {
        if (this.isInitialized) return;

        try {
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.initializeApp());
            } else {
                this.initializeApp();
            }
        } catch (error) {
            console.error('Failed to initialize Suntyn AI:', error);
            this.showNotification('Failed to initialize application', 'error');
        }
    }

    initializeApp() {
        // Initialize core features
        this.initializeGlobalEventListeners();
        this.initializeTooltips();
        this.initializeModals();
        this.initializeNotifications();
        this.initializeProgressIndicators();
        this.initializeFormValidation();
        this.initializeAnimations();
        this.initializeKeyboardShortcuts();
        this.initializePerformanceMonitoring();

        // Initialize PWA features
        this.initializePWA();

        // Set initialization flag
        this.isInitialized = true;

        console.log('✅ Suntyn AI initialized successfully');
        this.showNotification('Application ready', 'success');
    }

    initializeGlobalEventListeners() {
        // Global click handlers
        document.addEventListener('click', (e) => {
            // Close dropdowns when clicking outside
            if (!e.target.closest('.dropdown')) {
                document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
                    menu.classList.remove('show');
                });
            }

            // Handle copy buttons
            if (e.target.matches('[data-copy]') || e.target.closest('[data-copy]')) {
                const button = e.target.closest('[data-copy]');
                this.copyToClipboard(button.dataset.copy);
            }

            // Handle download buttons
            if (e.target.matches('[data-download]') || e.target.closest('[data-download]')) {
                const button = e.target.closest('[data-download]');
                this.downloadFile(button.dataset.download, button.dataset.filename);
            }
        });

        // Global form submission
        document.addEventListener('submit', (e) => {
            if (e.target.classList.contains('tool-form')) {
                e.preventDefault();
                this.handleToolFormSubmission(e.target);
            }
        });

        // Global input changes
        document.addEventListener('input', (e) => {
            if (e.target.type === 'file') {
                this.handleFileInput(e.target);
            }
        });

        // Global error handling
        window.addEventListener('error', (e) => {
            console.error('Global error:', e.error);
            this.showNotification('An unexpected error occurred', 'error');
        });

        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (e) => {
            console.error('Unhandled promise rejection:', e.reason);
            this.showNotification('A network error occurred', 'error');
        });
    }

    initializeTooltips() {
        // Initialize Bootstrap tooltips
        if (typeof bootstrap !== 'undefined') {
            const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
            tooltipTriggerList.map(function (tooltipTriggerEl) {
                return new bootstrap.Tooltip(tooltipTriggerEl);
            });
        }
    }

    initializeModals() {
        // Initialize Bootstrap modals
        if (typeof bootstrap !== 'undefined') {
            const modalTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="modal"]'));
            modalTriggerList.map(function (modalTriggerEl) {
                return new bootstrap.Modal(modalTriggerEl);
            });
        }
    }

    initializeNotifications() {
        // Create notification container if it doesn't exist
        if (!document.getElementById('notification-container')) {
            const container = document.createElement('div');
            container.id = 'notification-container';
            container.className = 'position-fixed top-0 end-0 p-3';
            container.style.zIndex = '9999';
            document.body.appendChild(container);
        }
    }

    initializeProgressIndicators() {
        // Initialize progress bars
        document.querySelectorAll('.progress-bar').forEach(bar => {
            const width = bar.getAttribute('aria-valuenow');
            if (width) {
                bar.style.width = width + '%';
            }
        });
    }

    initializeFormValidation() {
        // Enhanced form validation
        document.querySelectorAll('form.needs-validation').forEach(form => {
            form.addEventListener('submit', (e) => {
                if (!form.checkValidity()) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.showNotification('Please fill in all required fields', 'warning');
                }
                form.classList.add('was-validated');
            });
        });
    }

    initializeAnimations() {
        // Modern animation system with Lenis + GSAP
        if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
            gsap.registerPlugin(ScrollTrigger);
            
            // Wait for smooth scroll to initialize
            setTimeout(() => {
                // Hero section timeline animation
                const heroTl = gsap.timeline();
                
                if (document.querySelector('.hero-title')) {
                    heroTl.fromTo('.hero-title', 
                        { y: 100, opacity: 0 },
                        { y: 0, opacity: 1, duration: 1.2, ease: "power3.out" }
                    );
                }
                
                if (document.querySelector('.hero-subtitle')) {
                    heroTl.fromTo('.hero-subtitle',
                        { y: 50, opacity: 0 },
                        { y: 0, opacity: 1, duration: 1, ease: "power2.out" },
                        "-=0.6"
                    );
                }
                
                if (document.querySelector('.hero-buttons')) {
                    heroTl.fromTo('.hero-buttons',
                        { y: 30, opacity: 0 },
                        { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" },
                        "-=0.4"
                    );
                }

                // Create floating icons if they don't exist
                this.createFloatingIcons();

                // Enhanced parallax with better performance
                const parallaxElements = document.querySelectorAll('[data-parallax]');
                parallaxElements.forEach(element => {
                    const speed = parseFloat(element.dataset.parallax) || 0.5;
                    gsap.to(element, {
                        yPercent: -50 * speed,
                        ease: "none",
                        scrollTrigger: {
                            trigger: element,
                            start: "top bottom",
                            end: "bottom top",
                            scrub: 1
                        }
                    });
                });

                // Animate floating icons if they exist
                const floatingIcons = document.querySelectorAll('.floating-icon');
                if (floatingIcons.length > 0) {
                    gsap.to(floatingIcons, {
                        y: -20,
                        rotation: 360,
                        duration: 6,
                        ease: "none",
                        repeat: -1,
                        stagger: 0.5
                    });
                }

                console.log('✨ Modern animation system initialized');
            }, 300);
        } else {
            // Fallback to CSS animations
            this.initializeCSSAnimations();
        }
    }

    initializeKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K for search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                const searchInput = document.getElementById('tool-search');
                if (searchInput) {
                    searchInput.focus();
                }
            }

            // Escape to close modals
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal.show').forEach(modal => {
                    bootstrap.Modal.getInstance(modal)?.hide();
                });
            }
        });
    }

    initializePerformanceMonitoring() {
        // Monitor performance using modern Performance API
        if ('performance' in window) {
            window.addEventListener('load', () => {
                setTimeout(() => {
                    if (performance.getEntriesByType) {
                        const navigation = performance.getEntriesByType('navigation')[0];
                        if (navigation) {
                            const loadTime = navigation.loadEventEnd - navigation.fetchStart;
                            console.log(`Page load time: ${Math.round(loadTime)}ms`);
                        }
                    } else {
                        const loadTime = performance.now();
                        console.log(`Page load time: ${Math.round(loadTime)}ms`);
                    }
                }, 100);
            });
        }

        // Safe Chart.js cleanup
        if (typeof Chart !== 'undefined') {
            window.addEventListener('beforeunload', () => {
                try {
                    if (Chart.instances && Array.isArray(Chart.instances)) {
                        Chart.instances.forEach(chart => {
                            if (chart && typeof chart.destroy === 'function') {
                                chart.destroy();
                            }
                        });
                    }
                } catch (error) {
                    console.warn('Chart cleanup error:', error);
                }
            });
        }
    }

    initializePWA() {
        // Register service worker with proper error handling
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/service-worker.js', {
                    scope: '/'
                })
                .then(registration => {
                    console.log('✅ Service Worker registered successfully');
                    
                    // Check for updates
                    registration.addEventListener('updatefound', () => {
                        console.log('Service Worker update found');
                    });
                })
                .catch(error => {
                    console.warn('⚠️ Service Worker registration failed, continuing without PWA features');
                });
            });
        }

        // Handle PWA install prompt
        let deferredPrompt;
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            window.deferredPrompt = e;
            this.showInstallPrompt();
        });
    }


    createFloatingIcons() {
        // Create floating background icons if hero section exists
        const heroSection = document.querySelector('.hero-section');
        if (heroSection && !document.querySelector('.floating-icon')) {
            const icons = ['🚀', '💡', '⚡', '🎯', '🔧', '📊'];
            
            icons.forEach((icon, index) => {
                const iconEl = document.createElement('div');
                iconEl.className = 'floating-icon';
                iconEl.textContent = icon;
                iconEl.style.cssText = `
                    position: absolute;
                    font-size: 2rem;
                    opacity: 0.1;
                    pointer-events: none;
                    z-index: 0;
                    top: ${Math.random() * 80 + 10}%;
                    left: ${Math.random() * 80 + 10}%;
                `;
                heroSection.appendChild(iconEl);
            });
        }
    }

    initializeCSSAnimations() {
        // Intersection Observer for CSS animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                } else {
                    entry.target.classList.remove('animate-in');
                }
            });
        }, observerOptions);

        // Observe tool cards
        document.querySelectorAll('.tool-card').forEach(card => {
            observer.observe(card);
        });

        // Observe category headers
        document.querySelectorAll('.category-header').forEach(header => {
            observer.observe(header);
        });
    }

    // Utility Methods
    showNotification(message, type = 'info', duration = 5000) {
        const container = document.getElementById('notification-container');
        if (!container) return;

        const notification = document.createElement('div');
        notification.className = `alert alert-${type} alert-dismissible fade show`;
        notification.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="ti ti-${this.getIconForType(type)} me-2"></i>
                <span>${message}</span>
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;

        container.appendChild(notification);

        // Auto-dismiss after duration
        setTimeout(() => {
            if (notification.parentNode) {
                notification.classList.remove('show');
                setTimeout(() => {
                    notification.remove();
                }, 300);
            }
        }, duration);
    }

    getIconForType(type) {
        const icons = {
            'success': 'check-circle',
            'error': 'alert-circle',
            'warning': 'alert-triangle',
            'info': 'info-circle',
            'primary': 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showNotification('Copied to clipboard!', 'success');
        } catch (err) {
            console.error('Failed to copy:', err);
            this.showNotification('Failed to copy to clipboard', 'error');
        }
    }

    downloadFile(url, filename) {
        const a = document.createElement('a');
        a.href = url;
        a.download = filename || 'download';
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    handleFileDrop(event, zone) {
        const files = Array.from(event.dataTransfer.files);
        const input = zone.querySelector('input[type="file"]');

        if (input) {
            // Create a new FileList and assign to input
            const dt = new DataTransfer();
            files.forEach(file => dt.items.add(file));
            input.files = dt.files;

            // Trigger change event
            input.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }

    handleFileInput(input) {
        const files = Array.from(input.files);
        const zone = input.closest('.drag-drop-zone');

        if (zone && files.length > 0) {
            // Update UI to show selected files
            const fileList = zone.querySelector('.file-list') || this.createFileList(zone);
            this.updateFileList(fileList, files);
        }
    }

    createFileList(zone) {
        const fileList = document.createElement('div');
        fileList.className = 'file-list mt-3';
        zone.appendChild(fileList);
        return fileList;
    }

    updateFileList(fileList, files) {
        fileList.innerHTML = '';
        files.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item d-flex align-items-center justify-content-between p-2 bg-light rounded mb-2';
            fileItem.innerHTML = `
                <div class="d-flex align-items-center">
                    <i class="ti ti-file me-2"></i>
                    <span>${file.name}</span>
                    <small class="text-muted ms-2">(${this.formatFileSize(file.size)})</small>
                </div>
                <button type="button" class="btn btn-sm btn-outline-danger" onclick="this.parentElement.remove()">
                    <i class="ti ti-x"></i>
                </button>
            `;
            fileList.appendChild(fileItem);
        });
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    performSearch(query) {
        const cards = document.querySelectorAll('.tool-card');
        const categories = document.querySelectorAll('.category-section');

        if (!query.trim()) {
            cards.forEach(card => card.parentElement.style.display = 'block');
            categories.forEach(cat => cat.style.display = 'block');
            return;
        }

        let visibleCount = 0;
        cards.forEach(card => {
            const title = card.querySelector('.card-title').textContent.toLowerCase();
            const description = card.querySelector('.card-text').textContent.toLowerCase();
            const matches = title.includes(query.toLowerCase()) || description.includes(query.toLowerCase());

            card.parentElement.style.display = matches ? 'block' : 'none';
            if (matches) visibleCount++;
        });

        // Hide empty categories
        categories.forEach(category => {
            const visibleCards = category.querySelectorAll('.tool-card:not([style*="display: none"])').length;
            category.style.display = visibleCards > 0 ? 'block' : 'none';
        });

        // Show search results summary
        this.showSearchResults(visibleCount, query);
    }

    showSearchResults(count, query) {
        let summaryEl = document.getElementById('search-summary');
        if (!summaryEl) {
            summaryEl = document.createElement('div');
            summaryEl.id = 'search-summary';
            summaryEl.className = 'alert alert-info';
            const searchSection = document.querySelector('.search-section');
            if (searchSection) {
                searchSection.parentNode.insertBefore(summaryEl, searchSection.nextSibling);
            }
        }

        if (query.trim()) {
            summaryEl.innerHTML = `
                <i class="ti ti-search me-2"></i>
                Found ${count} tool${count !== 1 ? 's' : ''} matching "${query}"
                <button type="button" class="btn-close" onclick="this.parentElement.remove(); document.getElementById('tool-search').value = ''; app.performSearch('')"></button>
            `;
            summaryEl.style.display = 'block';
        } else {
            summaryEl.style.display = 'none';
        }
    }

    showInstallPrompt() {
        const installBanner = document.createElement('div');
        installBanner.className = 'alert alert-primary alert-dismissible fade show position-fixed bottom-0 start-0 m-3';
        installBanner.style.zIndex = '9999';
        installBanner.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="ti ti-download me-2"></i>
                <span>Install Suntyn AI for offline access</span>
                <button type="button" class="btn btn-sm btn-primary ms-3" onclick="app.installPWA()">Install</button>
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
        document.body.appendChild(installBanner);
    }

    async installPWA() {
        if (window.deferredPrompt) {
            window.deferredPrompt.prompt();
            const result = await window.deferredPrompt.userChoice;
            console.log('PWA install result:', result);
            window.deferredPrompt = null;
        }
    }

    // Tool form submission handler
    async handleToolFormSubmission(form) {
        const formData = new FormData(form);
        const toolName = form.dataset.tool || window.location.pathname.split('/').pop();

        try {
            this.showProgress('Processing...', 0);

            const response = await fetch(`/api/tools/${toolName}`, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                this.showToolResult(result);
                this.showNotification('Processing completed successfully!', 'success');
            } else {
                this.showToolError(result.error || 'Processing failed');
            }
        } catch (error) {
            console.error('Tool submission error:', error);
            this.showToolError('Network error occurred');
        } finally {
            this.hideProgress();
        }
    }

    showProgress(message, percentage) {
        const progressCard = document.getElementById('progress-card');
        if (progressCard) {
            progressCard.style.display = 'block';
            const progressBar = progressCard.querySelector('.progress-bar');
            const progressText = progressCard.querySelector('#progress-text');

            if (progressBar) progressBar.style.width = percentage + '%';
            if (progressText) progressText.textContent = message;
        }
    }

    hideProgress() {
        const progressCard = document.getElementById('progress-card');
        if (progressCard) {
            progressCard.style.display = 'none';
        }
    }

    showToolResult(result) {
        const resultCard = document.getElementById('result-card');
        const successResult = document.getElementById('success-result');

        if (resultCard && successResult) {
            resultCard.style.display = 'block';
            successResult.style.display = 'block';

            // Update result content based on tool type
            this.updateResultContent(result);
        }
    }

    showToolError(errorMessage) {
        const resultCard = document.getElementById('result-card');
        const errorResult = document.getElementById('error-result');
        const errorMessageEl = document.getElementById('error-message');

        if (resultCard && errorResult) {
            resultCard.style.display = 'block';
            errorResult.style.display = 'block';

            if (errorMessageEl) {
                errorMessageEl.textContent = errorMessage;
            }
        }

        this.showNotification(errorMessage, 'error');
    }

    updateResultContent(result) {
        // This method will be overridden by individual tool scripts
        console.log('Tool result:', result);
    }
}

// Initialize the application
const app = new SuntynAI();

// Export for global access
window.SuntynAI = SuntynAI;
window.app = app;