
// Professional Category System JavaScript
document.addEventListener('DOMContentLoaded', function() {
    
    // Initialize category system
    initializeCategorySystem();
    
    // Initialize tab switching
    initializeTabSwitching();
    
    // Initialize subcategory filtering
    initializeSubcategoryFiltering();
    
    // Initialize search functionality
    initializeToolSearch();
    
    // Initialize animations
    initializeAnimations();
});

function initializeCategorySystem() {
    console.log('🚀 Initializing Professional Category System...');
    
    // Add interactive hover effects
    const toolCards = document.querySelectorAll('.tool-card-pro');
    toolCards.forEach(card => {
        card.addEventListener('mouseenter', handleToolCardHover);
        card.addEventListener('mouseleave', handleToolCardLeave);
    });
    
    // Add click tracking for analytics
    toolCards.forEach(card => {
        card.addEventListener('click', function(e) {
            const toolName = this.querySelector('h4').textContent;
            trackToolInteraction('tool_click', toolName);
        });
    });
}

function initializeTabSwitching() {
    const tabButtons = document.querySelectorAll('.nav-tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.dataset.tab;
            
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button and corresponding content
            this.classList.add('active');
            const targetContent = document.getElementById(targetTab);
            if (targetContent) {
                targetContent.classList.add('active');
            }
            
            // Animate tab change
            animateTabChange(targetTab);
            
            // Track tab switch
            trackToolInteraction('tab_switch', targetTab);
        });
    });
}

function initializeSubcategoryFiltering() {
    const subTabs = document.querySelectorAll('.sub-tab');
    
    subTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const parentCategory = this.closest('.tab-content').id;
            const targetCategory = this.dataset.category;
            
            // Update active sub-tab
            const parentSubTabs = this.closest('.subcategory-tabs').querySelectorAll('.sub-tab');
            parentSubTabs.forEach(st => st.classList.remove('active'));
            this.classList.add('active');
            
            // Show/hide tool groups
            const toolGroups = this.closest('.tab-content').querySelectorAll('.tool-group');
            toolGroups.forEach(group => {
                group.classList.remove('active');
                if (group.dataset.group === targetCategory) {
                    setTimeout(() => {
                        group.classList.add('active');
                    }, 150);
                }
            });
            
            // Track subcategory filter
            trackToolInteraction('subcategory_filter', `${parentCategory}_${targetCategory}`);
        });
    });
}

function initializeToolSearch() {
    // Create search functionality if search input exists
    const searchInput = document.getElementById('toolSearch');
    if (!searchInput) return;
    
    let searchTimeout;
    
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            const searchTerm = this.value.toLowerCase().trim();
            filterToolsBySearch(searchTerm);
        }, 300);
    });
}

function filterToolsBySearch(searchTerm) {
    const toolCards = document.querySelectorAll('.tool-card-pro');
    let visibleCount = 0;
    
    toolCards.forEach(card => {
        const toolName = card.querySelector('h4').textContent.toLowerCase();
        const toolDesc = card.querySelector('p').textContent.toLowerCase();
        
        if (searchTerm === '' || toolName.includes(searchTerm) || toolDesc.includes(searchTerm)) {
            card.style.display = 'block';
            card.style.animation = 'toolCardLoad 0.6s ease forwards';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });
    
    // Show no results message if needed
    updateSearchResults(visibleCount, searchTerm);
}

function updateSearchResults(count, searchTerm) {
    let resultsMsg = document.querySelector('.search-results-message');
    
    if (count === 0 && searchTerm !== '') {
        if (!resultsMsg) {
            resultsMsg = document.createElement('div');
            resultsMsg.className = 'search-results-message';
            resultsMsg.innerHTML = `
                <div class="no-results">
                    <i class="ti ti-search-off"></i>
                    <h4>No tools found</h4>
                    <p>Try adjusting your search terms or browse categories</p>
                </div>
            `;
            document.querySelector('.tools-grid-modern').appendChild(resultsMsg);
        }
        resultsMsg.style.display = 'block';
    } else {
        if (resultsMsg) {
            resultsMsg.style.display = 'none';
        }
    }
}

function handleToolCardHover(e) {
    const card = e.currentTarget;
    const icon = card.querySelector('.tool-icon');
    
    // Add hover animation to icon
    if (icon) {
        icon.style.transform = 'scale(1.1) rotate(5deg)';
    }
    
    // Add subtle background animation
    card.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.98))';
}

function handleToolCardLeave(e) {
    const card = e.currentTarget;
    const icon = card.querySelector('.tool-icon');
    
    // Reset icon animation
    if (icon) {
        icon.style.transform = '';
    }
    
    // Reset background
    card.style.background = '';
}

function animateTabChange(tabId) {
    // Add smooth transition animation
    const targetTab = document.getElementById(tabId);
    if (targetTab) {
        targetTab.style.transform = 'translateY(20px)';
        targetTab.style.opacity = '0';
        
        setTimeout(() => {
            targetTab.style.transform = '';
            targetTab.style.opacity = '';
        }, 100);
    }
}

function initializeAnimations() {
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                
                // Stagger animation for tool cards
                if (entry.target.classList.contains('tool-card-pro')) {
                    const cards = entry.target.parentNode.querySelectorAll('.tool-card-pro');
                    cards.forEach((card, index) => {
                        setTimeout(() => {
                            card.style.animation = `toolCardLoad 0.6s ease forwards`;
                        }, index * 100);
                    });
                }
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animatedElements = document.querySelectorAll('.tool-card-pro, .category-header-modern, .subcategory-tabs');
    animatedElements.forEach(el => observer.observe(el));
}

function trackToolInteraction(action, toolName) {
    // Analytics tracking - integrate with your analytics service
    console.log(`📊 Tool interaction: ${action} - ${toolName}`);
    
    // Example: Google Analytics tracking
    if (typeof gtag !== 'undefined') {
        gtag('event', action, {
            'event_category': 'Tools',
            'event_label': toolName,
            'value': 1
        });
    }
}

// Utility functions
const CategoryUtils = {
    // Get tool statistics
    getToolStats: function(toolElement) {
        const users = toolElement.querySelector('.stat-item:first-child')?.textContent || '0';
        const rating = toolElement.querySelector('.stat-item:last-child')?.textContent || '0';
        return { users, rating };
    },
    
    // Update tool popularity
    updateToolPopularity: function(toolId, increment = 1) {
        const toolCard = document.querySelector(`[data-tool="${toolId}"]`);
        if (toolCard) {
            const userStat = toolCard.querySelector('.stat-item:first-child');
            if (userStat) {
                // Update user count (simplified version)
                console.log(`Updated popularity for ${toolId}`);
            }
        }
    },
    
    // Show tool tooltip
    showToolTooltip: function(toolElement, message) {
        // Implementation for custom tooltips
        console.log(`Tooltip: ${message}`);
    }
};

// Export for global access
window.CategorySystem = {
    filterToolsBySearch,
    trackToolInteraction,
    CategoryUtils
};

// Performance optimization
const optimizePerformance = () => {
    // Lazy load tool cards that are not visible
    const lazyCards = document.querySelectorAll('.tool-card-pro[data-lazy="true"]');
    
    const lazyCardObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.removeAttribute('data-lazy');
                lazyCardObserver.unobserve(entry.target);
            }
        });
    });
    
    lazyCards.forEach(card => lazyCardObserver.observe(card));
};

// Initialize performance optimizations
setTimeout(optimizePerformance, 1000);
