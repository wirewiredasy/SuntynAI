// Main JavaScript for Suntyn AI - Optimized for Performance
console.log('🚀 Initializing Suntyn AI...');

// Performance monitoring
const startTime = performance.now();

// Critical path optimization - only load essential components immediately
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Suntyn AI initialized successfully');

    // Initialize only critical components immediately
    initializeToolSearch();
    initializeToolForms();

    // Log initial load time
    const domLoadTime = performance.now() - startTime;
    console.log(`DOM ready in: ${domLoadTime.toFixed(2)}ms`);

    // Use intersection observer for lazy initialization
    initializeLazyComponents();
});

// Optimized lazy component initialization
function initializeLazyComponents() {
    const lazyComponents = [
        { selector: '.chart-container', init: initializeCharts },
        { selector: '.file-upload-zone', init: initializeFileUploads },
        { selector: '.animation-trigger', init: initializeAnimations }
    ];

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const component = lazyComponents.find(comp => 
                    entry.target.matches(comp.selector)
                );
                if (component) {
                    requestIdleCallback(() => component.init());
                    observer.unobserve(entry.target);
                }
            }
        });
    }, { rootMargin: '100px' });

    lazyComponents.forEach(comp => {
        document.querySelectorAll(comp.selector).forEach(el => {
            observer.observe(el);
        });
    });

    // Fallback initialization after 2 seconds
    setTimeout(() => {
        initializeFileUploads();
        initializeCharts();
        initializeAnimations();
    }, 2000);
}

// Optimized Chart.js initialization
function initializeCharts() {
        // Only proceed if Chart.js is loaded
        if (typeof Chart === 'undefined') {
            console.warn('Chart.js not loaded, skipping chart initialization');
            return;
        }

        // Safely destroy existing charts
        if (window.chartInstances && Array.isArray(window.chartInstances)) {
            window.chartInstances.forEach(chart => {
                if (chart && typeof chart.destroy === 'function') {
                    try {
                        chart.destroy();
                    } catch (error) {
                        console.warn('Error destroying chart:', error);
                    }
                }
            });
        }

        // Also destroy Chart.js registry instances
        if (typeof Chart !== 'undefined' && Chart.registry) {
            try {
                Object.values(Chart.registry.instances || {}).forEach(instance => {
                    if (instance && typeof instance.destroy === 'function') {
                        instance.destroy();
                    }
                });
            } catch (error) {
                console.warn('Error destroying Chart registry instances:', error);
            }
        }

        window.chartInstances = [];

        // Initialize dashboard charts if they exist
        const usageChartCanvas = document.getElementById('usageChart');
        const performanceChartCanvas = document.getElementById('performanceChart');

        if (usageChartCanvas && usageChartCanvas.getContext) {
            try {
                const usageChart = new Chart(usageChartCanvas, {
                    type: 'doughnut',
                    data: {
                        labels: ['PDF Tools', 'Image Tools', 'Video Tools', 'Finance Tools', 'Others'],
                        datasets: [{
                            data: [30, 25, 20, 15, 10],
                            backgroundColor: [
                                '#dc3545', '#007bff', '#28a745', '#ffc107', '#6c757d'
                            ],
                            borderWidth: 0
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'bottom'
                            }
                        }
                    }
                });
                window.chartInstances.push(usageChart);
            } catch (error) {
                console.warn('Failed to create usage chart:', error);
            }
        }

        if (performanceChartCanvas && performanceChartCanvas.getContext) {
            try {
                const performanceChart = new Chart(performanceChartCanvas, {
                    type: 'line',
                    data: {
                        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                        datasets: [{
                            label: 'Tools Used',
                            data: [12, 19, 15, 25, 22, 18, 20],
                            borderColor: '#007bff',
                            backgroundColor: 'rgba(0, 123, 255, 0.1)',
                            tension: 0.4,
                            fill: true
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        }
                    }
                });
                window.chartInstances.push(performanceChart);
            } catch (error) {
                console.warn('Failed to create performance chart:', error);
            }
        }

        console.log('✅ Charts initialized successfully');
    }

// Optimized animations with performance checks
function initializeAnimations() {
    if (window.animationsInitialized) return;

    try {
        // Check if animations are needed and supported
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;

        const animationElements = document.querySelectorAll('.floating-icon, .hero-animation');
        if (animationElements.length === 0) return;

        // Load GSAP only when needed
        if (typeof gsap !== 'undefined') {
            gsap.from('.floating-icon', {
                duration: 1,
                y: 10,
                opacity: 0,
                stagger: 0.1,
                ease: "power2.out"
            });
        } else {
            // Fallback CSS animations
            animationElements.forEach((el, i) => {
                el.style.animation = `fadeInUp 0.6s ease-out ${i * 0.1}s both`;
            });
        }

        window.animationsInitialized = true;
        console.log('✅ Animations initialized successfully');
    } catch (error) {
        console.warn('⚠️ Animation initialization failed');
    }
}

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

// Handle tool form submission with professional AI-like interface
async function handleToolSubmission(form) {
    const toolName = form.dataset.tool;
    const submitBtn = form.querySelector('button[type="submit"]');
    const resultDiv = document.getElementById('tool-result') || createResultDiv();
    
    // Professional AI-like processing interface

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

        formData.append('tool_name', toolName);
        
        const response = await fetch('/process-tool', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            showProfessionalSuccess(result);
        } else {
            showProfessionalError(result.error || 'Processing failed');
        }

    } catch (error) {
        console.error('Tool processing error:', error);
        showProfessionalError('Network error occurred. Please try again.');
    } finally {
        // Reset button
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

// Professional AI-like success display
function showProfessionalSuccess(result) {
    const resultDiv = document.getElementById('tool-result') || createResultDiv();

    let html = `
        <div class="card border-0 shadow-lg">
            <div class="card-body">
                <div class="d-flex align-items-center mb-3">
                    <div class="me-3">
                        <div class="bg-success rounded-circle d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;">
                            <i class="ti ti-check text-white"></i>
                        </div>
                    </div>
                    <div>
                        <h5 class="card-title mb-1">Processing Complete</h5>
                        <p class="text-muted mb-0">${result.message || 'Your request has been processed successfully'}</p>
                    </div>
                </div>
                
                ${result.processing_time ? `
                    <div class="d-flex align-items-center text-muted mb-3">
                        <i class="ti ti-clock me-2"></i>
                        <small>Processed in ${result.processing_time}</small>
                    </div>
                ` : ''}
    `;

    // Add download link if available
    if (result.download_url) {
        html += `
            <div class="d-grid gap-2 mb-3">
                <a href="${result.download_url}" class="btn btn-primary btn-lg" download>
                    <i class="ti ti-download me-2"></i>Download ${result.result_filename || 'Result'}
                </a>
            </div>
        `;
    }

    // Add specific result content with professional styling
    if (result.password) {
        html += `
            <div class="bg-light p-3 rounded mb-3">
                <label class="form-label fw-bold">Generated Password:</label>
                <div class="input-group">
                    <input type="text" class="form-control font-monospace" value="${result.password}" readonly>
                    <button class="btn btn-outline-secondary" onclick="copyToClipboard('${result.password}')">
                        <i class="ti ti-copy"></i>
                    </button>
                </div>
                <div class="d-flex justify-content-between align-items-center mt-2">
                    <span class="badge bg-${result.strength === 'Strong' ? 'success' : result.strength === 'Medium' ? 'warning' : 'danger'}">
                        ${result.strength} Password
                    </span>
                    <small class="text-muted">Length: ${result.length || result.password.length} characters</small>
                </div>
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

    // Close the card body and card
    html += `
            </div>
        </div>
    `;

    resultDiv.innerHTML = html;
    resultDiv.scrollIntoView({ behavior: 'smooth' });
}

// Professional AI-like error display
function showProfessionalError(message) {
    const resultDiv = document.getElementById('tool-result') || createResultDiv();

    const html = `
        <div class="card border-0 shadow-lg">
            <div class="card-body">
                <div class="d-flex align-items-center">
                    <div class="me-3">
                        <div class="bg-danger rounded-circle d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;">
                            <i class="ti ti-alert-circle text-white"></i>
                        </div>
                    </div>
                    <div>
                        <h5 class="card-title mb-1 text-danger">Processing Error</h5>
                        <p class="text-muted mb-0">${message}</p>
                    </div>
                </div>
                <div class="mt-3">
                    <button class="btn btn-outline-primary" onclick="location.reload()">
                        <i class="ti ti-refresh me-2"></i>Try Again
                    </button>
                </div>
            </div>
        </div>
    `;

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

    const existingFiles = dropZone ? dropZone.querySelector('.selected-files') : null;
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

function SuntynAI() {
    this.isInitialized = false;
    this.currentUser = null;
    this.notifications = [];
    this.init();
}

SuntynAI.prototype.init = function() {
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

SuntynAI.prototype.initializeApp = function() {
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

SuntynAI.prototype.initializeGlobalEventListeners = function() {
    // Global click handlers
    document.addEventListener('click', (e) => {
        try {
            // Close dropdowns when clicking outside
            if (!e.target.closest('.dropdown')) {
                document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
                    menu.classList.remove('show');
                });
            }

            // Handle copy buttons
            if (e.target.matches('[data-copy]') || e.target.closest('[data-copy]')) {
                const button = e.target.closest('[data-copy]');
                if (button && button.dataset.copy) {
                    this.copyToClipboard(button.dataset.copy);
                }
            }

            // Handle download buttons
            if (e.target.matches('[data-download]') || e.target.closest('[data-download]')) {
                const button = e.target.closest('[data-download]');
                if (button && button.dataset.download) {
                    this.downloadFile(button.dataset.download, button.dataset.filename);
                }
            }
        } catch (error) {
            console.warn('Click handler error:', error);
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

SuntynAI.prototype.initializeTooltips = function() {
    // Initialize Bootstrap tooltips
    if (typeof bootstrap !== 'undefined') {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }
}

SuntynAI.prototype.initializeModals = function() {
    // Initialize Bootstrap modals
    if (typeof bootstrap !== 'undefined') {
        const modalTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="modal"]'));
        modalTriggerList.map(function (modalTriggerEl) {
            return new bootstrap.Modal(modalTriggerEl);
        });
    }
}

SuntynAI.prototype.initializeNotifications = function() {
    // Create notification container if it doesn't exist
    if (!document.getElementById('notification-container')) {
        const container = document.createElement('div');
        container.id = 'notification-container';
        container.className = 'position-fixed top-0 end-0 p-3';
        container.style.zIndex = '9999';
        document.body.appendChild(container);
    }
}

SuntynAI.prototype.initializeProgressIndicators = function() {
    // Initialize progress bars
    document.querySelectorAll('.progress-bar').forEach(bar => {
        const width = bar.getAttribute('aria-valuenow');
        if (width) {
            bar.style.width = width + '%';
        }
    });
}

SuntynAI.prototype.initializeFormValidation = function() {
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

// Animation system with safe GSAP loading
SuntynAI.prototype.initializeAnimations = function() {
    // Wait for GSAP to load
    const initGSAP = () => {
        if (typeof gsap === 'undefined') {
            console.info('GSAP not available, using CSS animations');
            this.initializeCSSAnimations();
            return;
        }

        try {
            // Animate tool cards on scroll
            const toolCards = document.querySelectorAll('.tool-card');
            toolCards.forEach((card, index) => {
                gsap.set(card, { y: 50, opacity: 0 });

                gsap.to(card, {
                    y: 0,
                    opacity: 1,
                    duration: 0.6,
                    delay: index * 0.1,
                    ease: "power2.out"
                });
            });

            // Hero animations
            const heroTitle = document.querySelector('.hero-title');
            if (heroTitle) {
                gsap.from(heroTitle, {
                    y: 50,
                    opacity: 0,
                    duration: 1,
                    ease: "power2.out"
                });
            }

            console.log('✨ GSAP animations initialized');
        } catch (error) {
            console.warn('GSAP animation error:', error);
            this.initializeCSSAnimations();
        }
    };

    // Check if GSAP is already loaded
    if (typeof gsap !== 'undefined') {
        initGSAP();
    } else {
        // Wait for GSAP to load
        let attempts = 0;
        const checkGSAP = setInterval(() => {
            attempts++;
            if (typeof gsap !== 'undefined') {
                clearInterval(checkGSAP);
                initGSAP();
            } else if (attempts > 10) {
                clearInterval(checkGSAP);
                this.initializeCSSAnimations();
            }
        }, 100);
    }
}

// Fallback CSS animations
SuntynAI.prototype.initializeCSSAnimations = function() {
    const toolCards = document.querySelectorAll('.tool-card');
    toolCards.forEach((card, index) => {
        card.style.animation = `fadeInUp 0.6s ease-out ${index * 0.1}s both`;
    });

    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        heroTitle.style.animation = 'fadeInUp 1s ease-out';
    }

    console.log('✨ CSS animations initialized');
}

SuntynAI.prototype.initializeKeyboardShortcuts = function() {
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

SuntynAI.prototype.initializePerformanceMonitoring = function() {
    // Optimized performance monitoring
    if ('performance' in window) {
        const measurePerformance = () => {
            try {
                const navigation = performance.getEntriesByType('navigation')[0];
                if (navigation) {
                    const metrics = {
                        'DNS Lookup': Math.round(navigation.domainLookupEnd - navigation.domainLookupStart),
                        'Connection': Math.round(navigation.connectEnd - navigation.connectStart),
                        'Response': Math.round(navigation.responseEnd - navigation.responseStart),
                        'DOM Processing': Math.round(navigation.domContentLoadedEventEnd - navigation.responseEnd),
                        'Total Load': Math.round(navigation.loadEventEnd - navigation.fetchStart)
                    };
                    console.log('📊 Performance Metrics:', metrics);
                }
            } catch (error) {
                console.warn('Performance monitoring error:', error);
            }
        };

        if (document.readyState === 'complete') {
            measurePerformance();
        } else {
            window.addEventListener('load', measurePerformance);
        }
    }

    // Memory cleanup on page unload
    window.addEventListener('beforeunload', () => {
        try {
            // Clean up any running animations
            if (typeof gsap !== 'undefined') {
                gsap.killTweensOf('*');
            }

            // Clean up charts safely
            if (window.chartInstances && Array.isArray(window.chartInstances)) {
                window.chartInstances.forEach(chart => {
                    if (chart && typeof chart.destroy === 'function') {
                        try {
                            chart.destroy();
                        } catch (error) {
                            console.warn('Chart cleanup error:', error);
                        }
                    }
                });
            }

            // Clean up Chart.js registry instances
            if (typeof Chart !== 'undefined' && Chart.registry) {
                try {
                    Object.values(Chart.registry.instances || {}).forEach(instance => {
                        if (instance && typeof instance.destroy === 'function') {
                            instance.destroy();
                        }
                    });
                } catch (error) {
                    console.warn('Chart registry cleanup error:', error);
                }
            }
        } catch (error) {
            console.warn('Cleanup warning:', error);
        }
    });
}

SuntynAI.prototype.initializePWA = function() {
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


SuntynAI.prototype.createFloatingIcons = function() {
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

SuntynAI.prototype.initializeCSSAnimations = function() {
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
SuntynAI.prototype.showNotification = function(message, type = 'info', duration = 5000) {
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

SuntynAI.prototype.getIconForType = function(type) {
    const icons = {
        'success': 'check-circle',
        'error': 'alert-circle',
        'warning': 'alert-triangle',
        'info': 'info-circle',
        'primary': 'info-circle'
    };
    return icons[type] || 'info-circle';
}

SuntynAI.prototype.copyToClipboard = async function(text) {
    try {
        await navigator.clipboard.writeText(text);
        this.showNotification('Copied to clipboard!', 'success');
    } catch (err) {
        console.error('Failed to copy:', err);
        this.showNotification('Failed to copy to clipboard', 'error');
    }
}

SuntynAI.prototype.downloadFile = function(url, filename) {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'download';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

SuntynAI.prototype.handleFileDrop = function(event, zone) {
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

SuntynAI.prototype.handleFileInput = function(input) {
    const files = Array.from(input.files);
    const zone = input.closest('.drag-drop-zone');

    if (zone && files.length > 0) {
        // Update UI to show selected files
        const fileList = zone.querySelector('.file-list') || this.createFileList(zone);
        this.updateFileList(fileList, files);
    }
}

SuntynAI.prototype.createFileList = function(zone) {
    const fileList = document.createElement('div');
    fileList.className = 'file-list mt-3';
    zone.appendChild(fileList);
    return fileList;
}

SuntynAI.prototype.updateFileList = function(fileList, files) {
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

SuntynAI.prototype.formatFileSize = function(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

SuntynAI.prototype.performSearch = function(query) {
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

SuntynAI.prototype.showSearchResults = function(count, query) {
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

SuntynAI.prototype.showInstallPrompt = function() {
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

SuntynAI.prototype.installPWA = async function() {
    if (window.deferredPrompt) {
        window.deferredPrompt.prompt();
        const result = await window.deferredPrompt.userChoice;
        console.log('PWA install result:', result);
        window.deferredPrompt = null;
    }
}

// Tool form submission handler
SuntynAI.prototype.handleToolFormSubmission = async function(form) {
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

SuntynAI.prototype.showProgress = function(message, percentage) {
    const progressCard = document.getElementById('progress-card');
    if (progressCard) {
        progressCard.style.display = 'block';
        const progressBar = progressCard.querySelector('.progress-bar');
        const progressText = progressCard.querySelector('#progress-text');

        if (progressBar) progressBar.style.width = percentage + '%';
        if (progressText) progressText.textContent = message;
    }
}

SuntynAI.prototype.hideProgress = function() {
    const progressCard = document.getElementById('progress-card');
    if (progressCard) {
        progressCard.style.display = 'none';
    }
}

SuntynAI.prototype.showToolResult = function(result) {
    const resultCard = document.getElementById('result-card');
    const successResult = document.getElementById('success-result');

    if (resultCard && successResult) {
        resultCard.style.display = 'block';
        successResult.style.display = 'block';

        // Update result content based on tool type
        this.updateResultContent(result);
    }
}

SuntynAI.prototype.showToolError = function(errorMessage) {
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

SuntynAI.prototype.updateResultContent = function(result) {
    // This method will be overridden by individual tool scripts
    console.log('Tool result:', result);
}

// Chart management with proper cleanup
SuntynAI.prototype.initializeCharts = function() {
    // Clean up existing charts safely
    if (window.Chart && Chart.registry) {
        try {
            // Get all chart instances and destroy them
            Object.values(Chart.registry.instances || {}).forEach(chart => {
                if (chart && typeof chart.destroy === 'function') {
                    chart.destroy();
                }
            });
        } catch (error) {
            console.warn('Chart cleanup warning:', error.message);
        }
    }

    // Scroll to top button with error handling
    const scrollToTopBtn = document.querySelector('.scroll-to-top-btn');
    if (scrollToTopBtn) {
        const handleScroll = this.throttle(() => {
            try {
                if (window.pageYOffset > 300) {
                    scrollToTopBtn.classList.add('visible');
                } else {
                    scrollToTopBtn.classList.remove('visible');
                }
            } catch (error) {
                console.warn('Scroll handler error:', error);
            }
        }, 100);

        window.addEventListener('scroll', handleScroll);

        const handleClick = (e) => {
            try {
                e.preventDefault();
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            } catch (error) {
                // Fallback for older browsers
                window.scrollTo(0, 0);
            }
        };

        scrollToTopBtn.addEventListener('click', handleClick);
    }
}

// Initialize the application
const app = new SuntynAI();

// Export for global access
window.SuntynAI = SuntynAI;
window.app = app;
/**
 * The code has been updated by converting the class to function based approach, fixing the syntax errors and implementing error handling.
 */