// Professional Toolkit JavaScript
console.log('🚀 Initializing Professional Toolkit System...');

// Enhanced theme manager
const themeManager = {
    init() {
        console.log('🎨 Enhanced theme manager initialized');
        this.applyTheme();
        this.setupEventListeners();
    },
    
    applyTheme() {
        const theme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', theme);
    },
    
    setupEventListeners() {
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', this.toggleTheme.bind(this));
        }
    },
    
    toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme');
        const newTheme = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    }
};

// Cookie preferences manager
const cookieManager = {
    preferences: {
        essential: true,
        functional: true,
        analytics: true,
        marketing: false
    },
    
    init() {
        this.loadPreferences();
        console.log('📊 Analytics cookies enabled');
        console.log('🍪 Cookies loaded based on preferences:', this.preferences);
    },
    
    loadPreferences() {
        const stored = localStorage.getItem('cookiePreferences');
        if (stored) {
            this.preferences = { ...this.preferences, ...JSON.parse(stored) };
        }
        this.preferences.timestamp = new Date().toISOString();
        this.preferences.version = '1.0';
    }
};

// Professional Category System
const categorySystem = {
    init() {
        console.log('🚀 Initializing Professional Category System...');
        this.setupTabNavigation();
        this.setupSubcategoryTabs();
        this.setupToolInteractions();
        this.setupSearch();
        this.initializeAnimations();
    },
    
    setupTabNavigation() {
        const navTabs = document.querySelectorAll('.nav-tab');
        const tabContents = document.querySelectorAll('.tab-content');
        
        navTabs.forEach(tab => {
            if (tab && typeof tab.addEventListener === 'function') {
                tab.addEventListener('click', (e) => {
                    e.preventDefault();
                    
                    // Remove active from all tabs
                    navTabs.forEach(t => t.classList.remove('active'));
                    tabContents.forEach(content => {
                        content.classList.remove('active');
                        content.style.display = 'none';
                    });
                    
                    // Activate clicked tab
                    tab.classList.add('active');
                    
                    const targetId = tab.getAttribute('data-tab');
                    const targetContent = document.getElementById(targetId);
                    
                    if (targetContent) {
                        targetContent.classList.add('active');
                        targetContent.style.display = 'block';
                        
                        // Animate tools in
                        this.animateToolsIn(targetContent);
                    }
                });
            }
        });
    },
    
    setupSubcategoryTabs() {
        const subTabs = document.querySelectorAll('.sub-tab');
        
        subTabs.forEach(subTab => {
            if (subTab && typeof subTab.addEventListener === 'function') {
                subTab.addEventListener('click', (e) => {
                    e.preventDefault();
                    
                    const parentContent = subTab.closest('.tab-content');
                    if (!parentContent) return;
                    
                    // Remove active from sibling sub-tabs
                    const siblings = parentContent.querySelectorAll('.sub-tab');
                    siblings.forEach(s => s.classList.remove('active'));
                    
                    // Activate clicked sub-tab
                    subTab.classList.add('active');
                    
                    // Show/hide tool groups
                    const category = subTab.getAttribute('data-category');
                    const toolGroups = parentContent.querySelectorAll('.tool-group');
                    
                    toolGroups.forEach(group => {
                        if (group.getAttribute('data-group') === category) {
                            group.classList.add('active');
                            group.style.display = 'block';
                            this.animateToolsIn(group);
                        } else {
                            group.classList.remove('active');
                            group.style.display = 'none';
                        }
                    });
                });
            }
        });
    },
    
    setupToolInteractions() {
        const toolCards = document.querySelectorAll('.tool-card-pro');
        
        toolCards.forEach(card => {
            if (card && typeof card.addEventListener === 'function') {
                // Hover effects
                card.addEventListener('mouseenter', () => {
                    card.style.transform = 'translateY(-8px)';
                    card.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
                });
                
                card.addEventListener('mouseleave', () => {
                    card.style.transform = 'translateY(0)';
                });
                
                // Click tracking
                card.addEventListener('click', (e) => {
                    const toolName = card.getAttribute('data-tool');
                    console.log(`🔧 Tool clicked: ${toolName}`);
                    
                    // Add ripple effect
                    this.createRipple(e, card);
                });
            }
        });
    },
    
    setupSearch() {
        const searchInput = document.getElementById('hero-search');
        if (searchInput && typeof searchInput.addEventListener === 'function') {
            let searchTimeout;
            
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.performSearch(e.target.value);
                }, 300);
            });
        }
    },
    
    performSearch(query) {
        const searchTerm = query.toLowerCase().trim();
        const toolCards = document.querySelectorAll('.tool-card-pro');
        let visibleCount = 0;
        
        toolCards.forEach(card => {
            try {
                const title = card.querySelector('h4');
                const description = card.querySelector('p');
                
                if (title && description) {
                    const text = (title.textContent + ' ' + description.textContent).toLowerCase();
                    const isVisible = searchTerm === '' || text.includes(searchTerm);
                    
                    card.style.display = isVisible ? 'block' : 'none';
                    card.style.opacity = isVisible ? '1' : '0';
                    
                    if (isVisible) visibleCount++;
                }
            } catch (error) {
                console.warn('Search error for card:', error);
            }
        });
        
        // Show search results count
        this.updateSearchResults(visibleCount, searchTerm);
    },
    
    updateSearchResults(count, term) {
        const resultsEl = document.getElementById('search-results');
        if (resultsEl) {
            if (term) {
                resultsEl.textContent = `Found ${count} tools matching "${term}"`;
                resultsEl.style.display = 'block';
            } else {
                resultsEl.style.display = 'none';
            }
        }
    },
    
    animateToolsIn(container) {
        const tools = container.querySelectorAll('.tool-card-pro');
        tools.forEach((tool, index) => {
            tool.style.opacity = '0';
            tool.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                tool.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
                tool.style.opacity = '1';
                tool.style.transform = 'translateY(0)';
            }, index * 100);
        });
    },
    
    createRipple(event, element) {
        const ripple = document.createElement('div');
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s ease-out;
            pointer-events: none;
            z-index: 10;
        `;
        
        element.style.position = 'relative';
        element.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
    },
    
    initializeAnimations() {
        // Add CSS animations for ripple effect
        const style = document.createElement('style');
        style.textContent = `
            @keyframes ripple {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
};

// Drag and Drop Manager
const dragDropManager = {
    init() {
        console.log('🔄 Drag and drop manager initialized');
        this.setupDropZones();
    },
    
    setupDropZones() {
        const dropZones = document.querySelectorAll('.upload-zone, .upload-area');
        
        dropZones.forEach(zone => {
            if (zone && typeof zone.addEventListener === 'function') {
                ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                    zone.addEventListener(eventName, this.preventDefaults, false);
                });
                
                ['dragenter', 'dragover'].forEach(eventName => {
                    zone.addEventListener(eventName, () => zone.classList.add('dragover'), false);
                });
                
                ['dragleave', 'drop'].forEach(eventName => {
                    zone.addEventListener(eventName, () => zone.classList.remove('dragover'), false);
                });
                
                zone.addEventListener('drop', this.handleDrop.bind(this), false);
            }
        });
    },
    
    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    },
    
    handleDrop(e) {
        const files = e.dataTransfer.files;
        const dropZone = e.target.closest('.upload-zone, .upload-area');
        
        if (files.length > 0 && dropZone) {
            const fileInput = dropZone.querySelector('input[type="file"]');
            if (fileInput) {
                fileInput.files = files;
                fileInput.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }
    }
};

// Performance Monitor
const performanceMonitor = {
    startTime: performance.now(),
    
    init() {
        this.trackPageLoad();
        this.setupErrorHandling();
    },
    
    trackPageLoad() {
        window.addEventListener('load', () => {
            const loadTime = performance.now() - this.startTime;
            console.log(`🚀 Page loaded in ${Math.round(loadTime)}ms`);
        });
        
        document.addEventListener('DOMContentLoaded', () => {
            const domTime = performance.now() - this.startTime;
            console.log(`🚀 Page loaded in ${Math.round(domTime)}ms`);
        });
    },
    
    setupErrorHandling() {
        window.addEventListener('error', (e) => {
            console.error('Application error:', e.message, 'at', e.filename + ':' + e.lineno);
        });
        
        window.addEventListener('unhandledrejection', (e) => {
            console.error('App error:', e.reason);
        });
    }
};

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    try {
        themeManager.init();
        cookieManager.init();
        categorySystem.init();
        dragDropManager.init();
        performanceMonitor.init();
        
        console.log('✅ Professional Toolkit System initialized successfully');
    } catch (error) {
        console.error('❌ Toolkit initialization error:', error);
    }
});

// Export for global access
window.ToolkitSystem = {
    themeManager,
    cookieManager,
    categorySystem,
    dragDropManager,
    performanceMonitor
};