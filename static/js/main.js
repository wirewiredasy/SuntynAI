// Suntyn AI - Main Application JavaScript
// Handles global app functionality, initialization, and utilities

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
        console.log('🚀 Initializing Suntyn AI...');
        
        // Initialize core features
        this.initializeGlobalEventListeners();
        this.initializeTooltips();
        this.initializeModals();
        this.initializeNotifications();
        this.initializeProgressIndicators();
        this.initializeFormValidation();
        this.initializeFileUploads();
        this.initializeSearchFunctionality();
        this.initializeKeyboardShortcuts();
        this.initializePerformanceMonitoring();
        
        // Initialize PWA features
        this.initializePWA();
        
        // Initialize animations
        this.initializeAnimations();
        
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

    initializeFileUploads() {
        // Initialize drag and drop for file uploads
        document.querySelectorAll('.drag-drop-zone').forEach(zone => {
            zone.addEventListener('dragover', (e) => {
                e.preventDefault();
                zone.classList.add('dragover');
            });

            zone.addEventListener('dragleave', (e) => {
                e.preventDefault();
                zone.classList.remove('dragover');
            });

            zone.addEventListener('drop', (e) => {
                e.preventDefault();
                zone.classList.remove('dragover');
                this.handleFileDrop(e, zone);
            });
        });
    }

    initializeSearchFunctionality() {
        const searchInput = document.getElementById('tool-search');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.performSearch(e.target.value);
                }, 300);
            });
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
        // Monitor performance
        if ('performance' in window) {
            window.addEventListener('load', () => {
                const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
                console.log(`Page load time: ${loadTime}ms`);
            });
        }
    }

    initializePWA() {
        // Handle PWA install prompt
        let deferredPrompt;
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            window.deferredPrompt = e;
            this.showInstallPrompt();
        });
    }

    initializeAnimations() {
        // Initialize GSAP animations if available
        if (typeof gsap !== 'undefined') {
            // Register ScrollTrigger plugin
            if (typeof ScrollTrigger !== 'undefined') {
                gsap.registerPlugin(ScrollTrigger);
                
                // Enhanced tool cards animation with stagger effect
                gsap.utils.toArray('.tool-card').forEach((card, index) => {
                    gsap.fromTo(card, 
                        { 
                            y: 80, 
                            opacity: 0,
                            scale: 0.8,
                            rotationY: -15
                        },
                        { 
                            y: 0, 
                            opacity: 1,
                            scale: 1,
                            rotationY: 0,
                            duration: 0.8,
                            ease: "back.out(1.7)",
                            delay: index * 0.1,
                            scrollTrigger: {
                                trigger: card,
                                start: "top 85%",
                                end: "bottom 15%",
                                toggleActions: "play none none reverse",
                                onEnter: () => card.classList.add('animate-in'),
                                onLeave: () => card.classList.remove('animate-in')
                            }
                        }
                    );
                });

                // Category headers animation
                gsap.utils.toArray('.category-header').forEach(header => {
                    gsap.fromTo(header,
                        {
                            x: -100,
                            opacity: 0
                        },
                        {
                            x: 0,
                            opacity: 1,
                            duration: 1,
                            ease: "power2.out",
                            scrollTrigger: {
                                trigger: header,
                                start: "top 90%",
                                toggleActions: "play none none reverse"
                            }
                        }
                    );
                });

                // Hero section elements animation
                gsap.timeline()
                    .fromTo('.hero-title', 
                        { y: 100, opacity: 0 },
                        { y: 0, opacity: 1, duration: 1, ease: "power2.out" }
                    )
                    .fromTo('.hero-subtitle',
                        { y: 50, opacity: 0 },
                        { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" },
                        "-=0.5"
                    )
                    .fromTo('.hero-buttons',
                        { y: 30, opacity: 0 },
                        { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" },
                        "-=0.3"
                    );

                // Statistics counters animation
                gsap.utils.toArray('.stat-number').forEach(stat => {
                    const finalNumber = parseInt(stat.textContent);
                    gsap.fromTo(stat,
                        { textContent: 0 },
                        {
                            textContent: finalNumber,
                            duration: 2,
                            ease: "power2.out",
                            snap: { textContent: 1 },
                            scrollTrigger: {
                                trigger: stat,
                                start: "top 80%",
                                toggleActions: "play none none none"
                            }
                        }
                    );
                });

                // Features section animation
                gsap.utils.toArray('.feature-item').forEach((feature, index) => {
                    gsap.fromTo(feature,
                        {
                            y: 60,
                            opacity: 0,
                            scale: 0.9
                        },
                        {
                            y: 0,
                            opacity: 1,
                            scale: 1,
                            duration: 0.7,
                            ease: "back.out(1.4)",
                            delay: index * 0.2,
                            scrollTrigger: {
                                trigger: feature,
                                start: "top 85%",
                                toggleActions: "play none none reverse"
                            }
                        }
                    );
                });

                // Parallax effect for background elements
                gsap.utils.toArray('.parallax-element').forEach(element => {
                    gsap.to(element, {
                        yPercent: -50,
                        ease: "none",
                        scrollTrigger: {
                            trigger: element,
                            start: "top bottom",
                            end: "bottom top",
                            scrub: true
                        }
                    });
                });

            } else {
                console.warn('ScrollTrigger plugin not loaded');
                // Enhanced fallback animation without ScrollTrigger
                const timeline = gsap.timeline();
                
                gsap.utils.toArray('.tool-card').forEach((card, index) => {
                    timeline.fromTo(card, 
                        { y: 80, opacity: 0, scale: 0.8 },
                        { 
                            y: 0, 
                            opacity: 1,
                            scale: 1,
                            duration: 0.6,
                            ease: "back.out(1.7)"
                        },
                        index * 0.1
                    );
                });
            }
        } else {
            // CSS-only fallback animations
            this.initializeCSSAnimations();
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
