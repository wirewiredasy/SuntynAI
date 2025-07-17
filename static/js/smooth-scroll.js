
// Lenis Smooth Scroll Implementation
// Production-level smooth scrolling with GSAP integration

class SmoothScrollManager {
    constructor() {
        this.lenis = null;
        this.isInitialized = false;
        this.init();
    }

    init() {
        // Initialize Lenis smooth scroll
        this.lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            direction: 'vertical',
            gestureDirection: 'vertical',
            smooth: true,
            mouseMultiplier: 1,
            smoothTouch: false,
            touchMultiplier: 2,
            infinite: false,
        });

        // Listen for scroll events
        this.lenis.on('scroll', (e) => {
            this.onScroll(e);
        });

        // Integrate with GSAP ScrollTrigger
        this.setupGSAPIntegration();

        // Start the animation loop
        this.raf();

        // Handle resize
        window.addEventListener('resize', () => {
            this.lenis.resize();
        });

        this.isInitialized = true;
        console.log('🚀 Lenis smooth scroll initialized');
    }

    setupGSAPIntegration() {
        if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
            // Update GSAP ScrollTrigger on Lenis scroll
            this.lenis.on('scroll', ScrollTrigger.update);

            // Tell GSAP to use Lenis for scroll position
            gsap.ticker.add((time) => {
                this.lenis.raf(time * 1000);
            });

            gsap.ticker.lagSmoothing(0);
        }
    }

    onScroll(e) {
        // Handle scroll-based animations
        this.updateScrollToTopButton(e.scroll);
        this.updateParallaxElements(e.scroll);
    }

    updateScrollToTopButton(scrollY) {
        const scrollButton = document.querySelector('.scroll-to-top-btn');
        if (scrollButton) {
            if (scrollY > 300) {
                scrollButton.style.opacity = '1';
                scrollButton.style.pointerEvents = 'auto';
                scrollButton.style.transform = 'scale(1)';
            } else {
                scrollButton.style.opacity = '0';
                scrollButton.style.pointerEvents = 'none';
                scrollButton.style.transform = 'scale(0.8)';
            }
        }
    }

    updateParallaxElements(scrollY) {
        const parallaxElements = document.querySelectorAll('[data-parallax]');
        parallaxElements.forEach(element => {
            const speed = parseFloat(element.dataset.parallax) || 0.5;
            const yPos = -(scrollY * speed);
            element.style.transform = `translateY(${yPos}px)`;
        });
    }

    raf() {
        const animate = (time) => {
            this.lenis.raf(time);
            requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }

    scrollTo(target, options = {}) {
        if (this.lenis) {
            this.lenis.scrollTo(target, {
                offset: 0,
                duration: 1.2,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                ...options
            });
        }
    }

    scrollToTop() {
        this.scrollTo(0, { duration: 1.5 });
    }

    stop() {
        if (this.lenis) {
            this.lenis.stop();
        }
    }

    start() {
        if (this.lenis) {
            this.lenis.start();
        }
    }

    destroy() {
        if (this.lenis) {
            this.lenis.destroy();
            this.isInitialized = false;
        }
    }
}

// Production-level animation utilities
class AnimationUtils {
    static fadeInUp(elements, options = {}) {
        const defaults = {
            duration: 0.8,
            delay: 0.1,
            ease: "power2.out",
            y: 60,
            opacity: 0
        };
        
        const config = { ...defaults, ...options };
        
        gsap.set(elements, { y: config.y, opacity: config.opacity });
        
        return gsap.to(elements, {
            y: 0,
            opacity: 1,
            duration: config.duration,
            ease: config.ease,
            stagger: config.delay,
            scrollTrigger: {
                trigger: elements,
                start: "top 85%",
                toggleActions: "play none none reverse"
            }
        });
    }

    static scaleIn(elements, options = {}) {
        const defaults = {
            duration: 0.6,
            delay: 0.1,
            ease: "back.out(1.7)",
            scale: 0.8,
            opacity: 0
        };
        
        const config = { ...defaults, ...options };
        
        gsap.set(elements, { scale: config.scale, opacity: config.opacity });
        
        return gsap.to(elements, {
            scale: 1,
            opacity: 1,
            duration: config.duration,
            ease: config.ease,
            stagger: config.delay,
            scrollTrigger: {
                trigger: elements,
                start: "top 85%",
                toggleActions: "play none none reverse"
            }
        });
    }

    static slideInFromLeft(elements, options = {}) {
        const defaults = {
            duration: 1,
            delay: 0.2,
            ease: "power2.out",
            x: -100,
            opacity: 0
        };
        
        const config = { ...defaults, ...options };
        
        gsap.set(elements, { x: config.x, opacity: config.opacity });
        
        return gsap.to(elements, {
            x: 0,
            opacity: 1,
            duration: config.duration,
            ease: config.ease,
            stagger: config.delay,
            scrollTrigger: {
                trigger: elements,
                start: "top 90%",
                toggleActions: "play none none reverse"
            }
        });
    }

    static counterAnimation(elements, options = {}) {
        elements.forEach(element => {
            const endValue = parseInt(element.textContent);
            const config = {
                duration: 2,
                ease: "power2.out",
                ...options
            };

            gsap.fromTo(element, 
                { textContent: 0 },
                {
                    textContent: endValue,
                    duration: config.duration,
                    ease: config.ease,
                    snap: { textContent: 1 },
                    scrollTrigger: {
                        trigger: element,
                        start: "top 80%",
                        toggleActions: "play none none none"
                    }
                }
            );
        });
    }

    static magnetEffect(elements) {
        elements.forEach(element => {
            element.addEventListener('mouseenter', () => {
                gsap.to(element, {
                    scale: 1.05,
                    duration: 0.3,
                    ease: "power2.out"
                });
            });

            element.addEventListener('mouseleave', () => {
                gsap.to(element, {
                    scale: 1,
                    duration: 0.3,
                    ease: "power2.out"
                });
            });

            element.addEventListener('mousemove', (e) => {
                const rect = element.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                
                gsap.to(element, {
                    x: x * 0.1,
                    y: y * 0.1,
                    duration: 0.3,
                    ease: "power2.out"
                });
            });
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize smooth scroll
    window.smoothScroll = new SmoothScrollManager();
    
    // Apply animations with improved performance
    setTimeout(() => {
        // Tool cards animation
        const toolCards = document.querySelectorAll('.tool-card');
        if (toolCards.length > 0) {
            AnimationUtils.scaleIn(toolCards, { delay: 0.1 });
            AnimationUtils.magnetEffect(toolCards);
        }

        // Category headers
        const categoryHeaders = document.querySelectorAll('.category-header');
        if (categoryHeaders.length > 0) {
            AnimationUtils.slideInFromLeft(categoryHeaders);
        }

        // Statistics counters
        const statNumbers = document.querySelectorAll('.stat-number');
        if (statNumbers.length > 0) {
            AnimationUtils.counterAnimation(statNumbers);
        }

        // Feature items
        const featureItems = document.querySelectorAll('.feature-item');
        if (featureItems.length > 0) {
            AnimationUtils.fadeInUp(featureItems, { delay: 0.2 });
        }

        // Buttons
        const buttons = document.querySelectorAll('.btn-modern, .btn-primary, .btn-outline-primary');
        if (buttons.length > 0) {
            AnimationUtils.magnetEffect(buttons);
        }

    }, 100);
});

// Handle scroll to top button
document.addEventListener('click', (e) => {
    if (e.target.closest('.scroll-to-top-btn')) {
        e.preventDefault();
        if (window.smoothScroll) {
            window.smoothScroll.scrollToTop();
        }
    }
});

// Export for global access
window.AnimationUtils = AnimationUtils;
