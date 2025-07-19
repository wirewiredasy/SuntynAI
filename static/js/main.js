// Professional Toolkit JavaScript
document.addEventListener('DOMContentLoaded', function() {
    
    // Category Tab Switching
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
            document.getElementById(targetTab).classList.add('active');
        });
    });
    
    // Tool Card Hover Effects
    const toolCards = document.querySelectorAll('.tool-card');
    toolCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.classList.add('hovered');
        });
        
        card.addEventListener('mouseleave', function() {
            this.classList.remove('hovered');
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
    
    // Tool Search Functionality
    const searchInput = document.getElementById('toolSearch');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const toolCards = document.querySelectorAll('.tool-card');
            
            toolCards.forEach(card => {
                const toolName = card.querySelector('h4').textContent.toLowerCase();
                const toolDesc = card.querySelector('p').textContent.toLowerCase();
                
                if (toolName.includes(searchTerm) || toolDesc.includes(searchTerm)) {
                    card.style.display = 'block';
                    card.classList.add('fade-in');
                } else {
                    card.style.display = 'none';
                    card.classList.remove('fade-in');
                }
            });
        });
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