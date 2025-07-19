// Professional Toolkit JavaScript
document.addEventListener('DOMContentLoaded', function() {
    
    // Professional Category Tab Switching
    const navTabs = document.querySelectorAll('.nav-tab-pro');
    const tabContents = document.querySelectorAll('.tab-content-pro');

    navTabs.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.dataset.tab;

            // Remove active class from all buttons and contents
            navTabs.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Add active class to clicked button and corresponding content
            this.classList.add('active');
            const targetContent = document.getElementById(targetTab);
            if (targetContent) {
                targetContent.classList.add('active');
            }
            
            // Track category switch
            console.log(`Switched to category: ${targetTab}`);
        });
    });

    // Subcategory Tab Switching
    const subTabs = document.querySelectorAll('.sub-tab-pro');
    const toolGroups = document.querySelectorAll('.tool-group-pro');

    subTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetGroup = this.dataset.group;
            const parentTab = this.closest('.tab-content-pro');

            // Update active sub-tab within parent category
            const parentSubTabs = parentTab.querySelectorAll('.sub-tab-pro');
            parentSubTabs.forEach(st => st.classList.remove('active'));
            this.classList.add('active');

            // Show/hide tool groups
            const parentToolGroups = parentTab.querySelectorAll('.tool-group-pro');
            parentToolGroups.forEach(group => {
                group.classList.remove('active');
                if (targetGroup === 'all-pdf' || group.dataset.category === targetGroup) {
                    setTimeout(() => {
                        group.classList.add('active');
                    }, 150);
                }
            });
            
            console.log(`Filtered tools by: ${targetGroup}`);
        });
    });

    // Professional Tool Card Interactions
    const toolCardsPro = document.querySelectorAll('.tool-card-pro');
    toolCardsPro.forEach((card, index) => {
        // Add stagger animation
        card.style.setProperty('--stagger', index);
        card.classList.add('stagger-animation');
        
        // Enhanced hover effects
        card.addEventListener('mouseenter', function() {
            const icon = this.querySelector('.tool-icon-pro');
            if (icon) {
                icon.style.transform = 'scale(1.1) rotate(5deg)';
            }
            
            // Track hover for analytics
            const toolName = this.querySelector('h4').textContent;
            console.log(`Tool hovered: ${toolName}`);
        });

        card.addEventListener('mouseleave', function() {
            const icon = this.querySelector('.tool-icon-pro');
            if (icon) {
                icon.style.transform = '';
            }
        });
        
        // Click tracking
        card.addEventListener('click', function(e) {
            if (!e.target.closest('.btn-tool-pro')) {
                const toolLink = this.querySelector('.btn-tool-pro');
                if (toolLink) {
                    window.location.href = toolLink.href;
                }
            }
        });
    });

    // Smooth Scrolling for Hero Buttons
    const heroButtons = document.querySelectorAll('.btn-hero-primary, .btn-hero-secondary');
    heroButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });

                // Activate the corresponding tab
                const targetTab = document.querySelector(`[data-tab="${targetId}"]`);
                if (targetTab) {
                    targetTab.click();
                }
            }
        });
    });

    // Floating Animation for Hero Cards
    const floatingCards = document.querySelectorAll('.floating-card');
    floatingCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.5}s`;
    });

    // Professional Search Functionality
    const heroSearch = document.getElementById('heroSearch');
    if (heroSearch) {
        let searchTimeout;
        
        heroSearch.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                const searchTerm = this.value.toLowerCase().trim();
                filterToolsBySearch(searchTerm);
            }, 300);
        });

        // Search button functionality
        const searchBtn = document.querySelector('.search-btn');
        if (searchBtn) {
            searchBtn.addEventListener('click', function() {
                const searchTerm = heroSearch.value.toLowerCase().trim();
                if (searchTerm) {
                    filterToolsBySearch(searchTerm);
                    // Scroll to results
                    document.getElementById('categories').scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        }
    }

    function filterToolsBySearch(searchTerm) {
        const toolCards = document.querySelectorAll('.tool-card-pro');
        let visibleCount = 0;
        
        toolCards.forEach(card => {
            const toolName = card.querySelector('h4').textContent.toLowerCase();
            const toolDesc = card.querySelector('p').textContent.toLowerCase();
            
            if (searchTerm === '' || toolName.includes(searchTerm) || toolDesc.includes(searchTerm)) {
                card.style.display = 'block';
                card.style.animation = 'fadeInUp 0.6s ease forwards';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });
        
        console.log(`Search results: ${visibleCount} tools found for "${searchTerm}"`);
    }

    // Initialize Particles Animation
    initParticles();

    // Initialize Gradient Animation
    initGradientAnimation();
});

// Particles Background Animation
function initParticles() {
    const particlesContainer = document.querySelector('.hero-particles');
    if (!particlesContainer) return;

    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 20 + 's';
        particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
        particlesContainer.appendChild(particle);
    }
}

// Gradient Animation
function initGradientAnimation() {
    const heroGradient = document.querySelector('.hero-gradient');
    if (!heroGradient) return;

    let angle = 0;
    setInterval(() => {
        angle += 1;
        heroGradient.style.background = `linear-gradient(${angle}deg, #667eea, #764ba2, #f093fb, #f5576c)`;
    }, 100);
}

// Tool Analytics (Optional)
function trackToolUsage(toolId) {
    // Analytics tracking code can go here
    console.log(`Tool used: ${toolId}`);
}

// File Upload Preview (for tool pages)
function initUploadPreview() {
    const fileInputs = document.querySelectorAll('input[type="file"]');
    fileInputs.forEach(input => {
        if (input) {
            input.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        // Show preview logic here
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
    });
}

// File Upload Preview (for tool pages)
function initFileUpload() {
    const fileInputs = document.querySelectorAll('input[type="file"]');
    fileInputs.forEach(input => {
        input.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                // Show file preview or info
                console.log(`File selected: ${file.name}`);
            }
        });
    });
}

// Utility Functions
const utils = {
    formatFileSize: function(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    showNotification: function(message, type = 'success') {
        // Create and show notification
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
};

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Add null checks to prevent errors
    try {
        initParticles();
        initGradientAnimation();
        initUploadPreview();

        // Stats counter animation
        const statNumbers = document.querySelectorAll('.stat-number');
        if (statNumbers.length > 0) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        animateCounter(entry.target);
                    }
                });
            });

            statNumbers.forEach(stat => {
                if (stat) observer.observe(stat);
            });
        }
    } catch (error) {
        console.warn('Some features could not be initialized:', error);
    }
});