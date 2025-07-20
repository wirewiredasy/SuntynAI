
/**
 * Professional AI Tools Platform - Main JavaScript
 * Enhanced search, animations, and interactions
 */

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Professional AI Tools Platform initialized');
    
    // Initialize all components
    initializeThemeManager();
    initializeAnalytics();
    initializeCookieConsent();
    initializePerformanceMonitoring();
    initializeProfessionalSearch();
    initializeToolInteractions();
    initializeAnimations();
    initializeScrollEffects();
});

// Professional Search System
function initializeProfessionalSearch() {
    const searchInput = document.getElementById('globalSearch');
    const filterToggle = document.getElementById('filterToggle');
    const searchFilters = document.getElementById('searchFilters');
    
    if (!searchInput) return;
    
    console.log('🔍 Initializing professional search system');
    
    // Search with debouncing
    let searchTimeout;
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            performAdvancedSearch(this.value);
        }, 300);
    });
    
    // Filter toggle
    if (filterToggle) {
        filterToggle.addEventListener('click', function() {
            if (searchFilters) {
                searchFilters.classList.toggle('active');
                this.classList.toggle('active');
            }
        });
    }
    
    // Suggestion tags
    document.querySelectorAll('.suggestion-tag').forEach(tag => {
        tag.addEventListener('click', function() {
            const searchTerm = this.dataset.search;
            searchInput.value = searchTerm;
            performAdvancedSearch(searchTerm);
        });
    });
    
    // Filter options
    document.querySelectorAll('.filter-option').forEach(option => {
        option.addEventListener('click', function() {
            // Toggle active state
            const parent = this.parentElement;
            parent.querySelectorAll('.filter-option').forEach(opt => {
                opt.classList.remove('active');
            });
            this.classList.add('active');
            
            // Apply filters
            applyAdvancedFilters();
        });
    });
}

// Advanced search function
function performAdvancedSearch(query) {
    if (!query || query.length < 2) {
        showAllTools();
        return;
    }
    
    const tools = document.querySelectorAll('.tool-card');
    const searchQuery = query.toLowerCase().trim();
    let visibleCount = 0;
    
    tools.forEach(tool => {
        const title = tool.querySelector('.tool-title')?.textContent.toLowerCase() || '';
        const description = tool.querySelector('.tool-description')?.textContent.toLowerCase() || '';
        const features = Array.from(tool.querySelectorAll('.feature-tag')).map(tag => 
            tag.textContent.toLowerCase()
        ).join(' ');
        
        const searchContent = `${title} ${description} ${features}`;
        
        if (searchContent.includes(searchQuery)) {
            showTool(tool);
            visibleCount++;
        } else {
            hideTool(tool);
        }
    });
    
    updateSearchResults(visibleCount, query);
    trackSearchInteraction(query, visibleCount);
}

// Apply advanced filters
function applyAdvancedFilters() {
    const activeCategory = document.querySelector('.filter-option[data-category].active');
    const activeType = document.querySelector('.filter-option[data-type].active');
    
    const tools = document.querySelectorAll('.tool-card');
    let visibleCount = 0;
    
    tools.forEach(tool => {
        let shouldShow = true;
        
        // Category filter
        if (activeCategory && activeCategory.dataset.category !== 'all') {
            const toolCategory = tool.closest('.tools-category')?.id.replace('-tools', '');
            if (toolCategory !== activeCategory.dataset.category) {
                shouldShow = false;
            }
        }
        
        // Type filter
        if (shouldShow && activeType && activeType.dataset.type) {
            const toolType = tool.dataset.type;
            if (toolType !== activeType.dataset.type) {
                shouldShow = false;
            }
        }
        
        if (shouldShow) {
            showTool(tool);
            visibleCount++;
        } else {
            hideTool(tool);
        }
    });
    
    updateSearchResults(visibleCount, 'filtered');
}

// Tool visibility functions
function showTool(tool) {
    tool.style.display = 'block';
    tool.style.opacity = '1';
    tool.style.transform = 'translateY(0)';
}

function hideTool(tool) {
    tool.style.opacity = '0';
    tool.style.transform = 'translateY(20px)';
    setTimeout(() => {
        tool.style.display = 'none';
    }, 200);
}

function showAllTools() {
    document.querySelectorAll('.tool-card').forEach(tool => {
        showTool(tool);
    });
    updateSearchResults(document.querySelectorAll('.tool-card').length, '');
}

// Update search results
function updateSearchResults(count, query) {
    const resultsCount = document.querySelector('.results-count');
    if (resultsCount) {
        if (query && query !== 'filtered') {
            resultsCount.textContent = `Found ${count} tools for "${query}"`;
        } else if (query === 'filtered') {
            resultsCount.textContent = `Showing ${count} filtered tools`;
        } else {
            resultsCount.textContent = `Showing all ${count} tools`;
        }
    }
}

// Tool interactions
function initializeToolInteractions() {
    console.log('🔧 Initializing tool interactions');
    
    // Category navigation
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const category = this.dataset.category;
            switchCategory(category, this);
        });
    });
    
    // Subcategory filters
    document.querySelectorAll('.subcategory-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const subcategory = this.dataset.subcategory;
            filterSubcategory(subcategory, this);
        });
    });
    
    // Tool card hover effects
    document.querySelectorAll('.tool-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
            this.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.boxShadow = '';
        });
        
        // Track tool clicks
        card.addEventListener('click', function(e) {
            if (!e.target.closest('.tool-btn')) {
                const toolName = this.querySelector('.tool-title')?.textContent;
                trackToolInteraction('tool_click', toolName);
            }
        });
    });
}

// Switch category
function switchCategory(category, tabElement) {
    // Update active tab
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    tabElement.classList.add('active');
    
    // Show category content
    document.querySelectorAll('.tools-category').forEach(cat => {
        cat.classList.remove('active');
    });
    
    const targetCategory = document.getElementById(category + '-tools');
    if (targetCategory) {
        targetCategory.classList.add('active');
        
        // Animate tools
        const tools = targetCategory.querySelectorAll('.tool-card');
        tools.forEach((tool, index) => {
            setTimeout(() => {
                tool.style.animation = 'fadeInUp 0.6s ease forwards';
            }, index * 100);
        });
    }
    
    trackToolInteraction('tab_switch', category);
}

// Filter subcategory
function filterSubcategory(subcategory, btnElement) {
    // Update active button
    btnElement.parentElement.querySelectorAll('.subcategory-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    btnElement.classList.add('active');
    
    // Filter tools
    const category = btnElement.closest('.tools-category').id.replace('-tools', '');
    const tools = btnElement.closest('.tools-category').querySelectorAll('.tool-card');
    
    tools.forEach(tool => {
        if (subcategory === 'all' || tool.dataset.subcategory === subcategory) {
            showTool(tool);
        } else {
            hideTool(tool);
        }
    });
    
    trackToolInteraction('subcategory_filter', `${category}_${subcategory}`);
}

// Animation system
function initializeAnimations() {
    console.log('✨ Initializing animations');
    
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                
                // Special handling for stats
                if (entry.target.querySelector('.stat-number[data-count]')) {
                    animateStats();
                }
                
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe elements
    document.querySelectorAll('.hero-stats, .tool-card, .feature-card, .category-header').forEach(el => {
        observer.observe(el);
    });
}

// Animate statistics
function animateStats() {
    const statNumbers = document.querySelectorAll('.stat-number[data-count]');
    
    statNumbers.forEach(stat => {
        const target = parseInt(stat.dataset.count);
        const duration = 2000;
        const start = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const current = Math.floor(target * easeOutQuart);
            
            if (target >= 1000) {
                stat.textContent = Math.floor(current / 1000) + 'K+';
            } else if (target >= 99) {
                stat.textContent = current.toFixed(1) + '%';
            } else {
                stat.textContent = current + '+';
            }
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    });
}

// Scroll effects
function initializeScrollEffects() {
    let scrollTimeout;
    
    window.addEventListener('scroll', function() {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            const scrolled = window.pageYOffset;
            
            // Parallax effect for floating elements
            document.querySelectorAll('.float-element').forEach((element, index) => {
                const speed = 0.5 + (index * 0.1);
                element.style.transform = `translateY(${scrolled * speed}px) rotate(${scrolled * 0.1}deg)`;
            });
            
            // Update navbar on scroll
            const navbar = document.querySelector('.navbar');
            if (navbar) {
                if (scrolled > 100) {
                    navbar.classList.add('scrolled');
                } else {
                    navbar.classList.remove('scrolled');
                }
            }
        }, 10);
    }, { passive: true });
}

// Theme Management
function initializeThemeManager() {
    console.log('🎨 Enhanced theme manager initialized');
    
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Theme toggle functionality
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            
            // Smooth transition
            document.body.style.transition = 'all 0.3s ease';
            setTimeout(() => {
                document.body.style.transition = '';
            }, 300);
        });
    }
}

// Analytics and tracking
function initializeAnalytics() {
    console.log('📊 Analytics initialized');
    
    // Check for analytics cookies
    const cookieConsent = getCookie('cookieConsent');
    if (cookieConsent) {
        const consent = JSON.parse(cookieConsent);
        if (consent.analytics) {
            console.log('📊 Analytics cookies enabled');
            // Initialize analytics here
        }
    }
}

// Cookie management
function initializeCookieConsent() {
    const existingConsent = getCookie('cookieConsent');
    if (existingConsent) {
        const consent = JSON.parse(existingConsent);
        console.log('🍪 Cookies loaded based on preferences:', consent);
        return;
    }
    
    // Show cookie consent banner if needed
    // Implementation depends on your cookie consent UI
}

// Performance monitoring
function initializePerformanceMonitoring() {
    // Monitor page load time
    window.addEventListener('load', function() {
        const loadTime = performance.now();
        console.log(`🚀 Page loaded in ${Math.round(loadTime)}ms`);
        
        // Track performance
        if (loadTime > 3000) {
            console.warn('⚠️ Slow page load detected');
        }
    });
}

// Utility functions
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

function setCookie(name, value, days) {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

// Track interactions
function trackToolInteraction(action, tool) {
    console.log(`📊 Tool interaction: ${action} - ${tool}`);
    
    // Send to analytics if enabled
    const cookieConsent = getCookie('cookieConsent');
    if (cookieConsent) {
        const consent = JSON.parse(cookieConsent);
        if (consent.analytics) {
            // Send analytics event
            // gtag('event', action, { tool_name: tool });
        }
    }
}

function trackSearchInteraction(query, results) {
    console.log(`🔍 Search: "${query}" - ${results} results`);
    
    // Track search analytics
    const cookieConsent = getCookie('cookieConsent');
    if (cookieConsent) {
        const consent = JSON.parse(cookieConsent);
        if (consent.analytics) {
            // Send search analytics
            // gtag('event', 'search', { search_term: query, results_count: results });
        }
    }
}

// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Error handling
window.addEventListener('error', function(e) {
    console.error('Application error:', e.error);
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('Promise rejection:', e.reason);
});

// Export for global access
window.ProfessionalToolkit = {
    performAdvancedSearch,
    switchCategory,
    trackToolInteraction,
    animateStats
};
