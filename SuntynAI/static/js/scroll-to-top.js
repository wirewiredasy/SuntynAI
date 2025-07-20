
// Enhanced Scroll to Top Button with Lenis Integration
if (typeof ScrollToTopButton === 'undefined') {
class ScrollToTopButton {
    constructor() {
        this.button = null;
        this.isVisible = false;
        this.init();
    }

    init() {
        this.createButton();
        this.setupEventListeners();
    }

    createButton() {
        // Check if button already exists
        if (document.querySelector('.scroll-to-top-btn')) return;

        this.button = document.createElement('button');
        this.button.className = 'scroll-to-top-btn';
        this.button.innerHTML = '<i class="ti ti-arrow-up"></i>';
        this.button.setAttribute('aria-label', 'Scroll to top');
        this.button.setAttribute('title', 'Scroll to top');

        document.body.appendChild(this.button);
    }

    setupEventListeners() {
        if (!this.button) return;

        // Click handler
        this.button.addEventListener('click', (e) => {
            e.preventDefault();
            this.scrollToTop();
        });

        // Keyboard accessibility
        this.button.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.scrollToTop();
            }
        });
    }

    scrollToTop() {
        // Use Lenis if available, otherwise fallback to native scroll
        if (window.smoothScroll && window.smoothScroll.isInitialized) {
            window.smoothScroll.scrollToTop();
        } else {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }

        // Add click animation
        this.button.style.transform = 'scale(0.9)';
        setTimeout(() => {
            this.button.style.transform = '';
        }, 150);
    }

    show() {
        if (this.isVisible) return;
        this.isVisible = true;
        this.button.classList.add('visible');
    }

    hide() {
        if (!this.isVisible) return;
        this.isVisible = false;
        this.button.classList.remove('visible');
    }

    updateVisibility(scrollY) {
        if (scrollY > 400) {
            this.show();
        } else {
            this.hide();
        }
    }
}

// Initialize scroll to top button
document.addEventListener('DOMContentLoaded', () => {
    window.scrollToTopButton = new ScrollToTopButton();
});

// Export for external use
window.ScrollToTopButton = ScrollToTopButton;
}
