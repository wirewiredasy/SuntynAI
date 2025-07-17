// Hero Section Animations and Interactions

class HeroAnimations {
    constructor() {
        this.init();
    }

    init() {
        this.animateStatNumbers();
        this.setupToolNodeInteractions();
        this.setupParallaxEffect();
        this.setupIntersectionObserver();
    }

    // Animate stat numbers counting up
    animateStatNumbers() {
        const statNumbers = document.querySelectorAll('.stat-number[data-count]');
        
        statNumbers.forEach(stat => {
            const target = parseInt(stat.getAttribute('data-count'));
            const duration = 2000; // 2 seconds
            const start = performance.now();
            
            const animate = (currentTime) => {
                const elapsed = currentTime - start;
                const progress = Math.min(elapsed / duration, 1);
                
                // Easing function for smooth animation
                const easeOutQuart = 1 - Math.pow(1 - progress, 4);
                const current = Math.floor(target * easeOutQuart);
                
                stat.textContent = current.toLocaleString();
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
            };
            
            // Start animation when element comes into view
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        requestAnimationFrame(animate);
                        observer.unobserve(stat);
                    }
                });
            }, { threshold: 0.5 });
            
            observer.observe(stat);
        });
    }

    // Setup tool node interactions
    setupToolNodeInteractions() {
        const toolNodes = document.querySelectorAll('.tool-node');
        
        toolNodes.forEach(node => {
            node.addEventListener('mouseenter', () => {
                this.highlightConnectedElements(node);
            });
            
            node.addEventListener('mouseleave', () => {
                this.removeHighlights();
            });
            
            node.addEventListener('click', () => {
                this.pulseEffect(node);
            });
        });
    }

    // Highlight connected elements
    highlightConnectedElements(node) {
        // Add glow effect to central hub
        const hubCore = document.querySelector('.hub-core');
        if (hubCore) {
            hubCore.style.boxShadow = '0 0 50px rgba(255, 215, 0, 0.8)';
        }
        
        // Enhance connection beams
        const beams = document.querySelectorAll('.beam');
        beams.forEach(beam => {
            beam.style.background = 'linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.8), transparent)';
        });
    }

    // Remove highlights
    removeHighlights() {
        const hubCore = document.querySelector('.hub-core');
        if (hubCore) {
            hubCore.style.boxShadow = '0 0 30px rgba(255, 215, 0, 0.5)';
        }
        
        const beams = document.querySelectorAll('.beam');
        beams.forEach(beam => {
            beam.style.background = 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent)';
        });
    }

    // Pulse effect on click
    pulseEffect(element) {
        element.style.transform = 'scale(1.3)';
        element.style.boxShadow = '0 0 30px rgba(255, 255, 255, 0.8)';
        
        setTimeout(() => {
            element.style.transform = '';
            element.style.boxShadow = '';
        }, 300);
    }

    // Setup parallax scrolling effect
    setupParallaxEffect() {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const parallaxElements = document.querySelectorAll('.hero-bg-animated, .floating-particles');
            
            parallaxElements.forEach(element => {
                const speed = 0.5;
                element.style.transform = `translateY(${scrolled * speed}px)`;
            });
        });
    }

    // Setup intersection observer for animations
    setupIntersectionObserver() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        // Observe elements that should animate on scroll
        const elementsToObserve = document.querySelectorAll(
            '.stat-card, .trust-item, .preview-card, .tool-node'
        );
        
        elementsToObserve.forEach(el => observer.observe(el));
    }

    // Create dynamic particles
    createDynamicParticles() {
        const particleContainer = document.querySelector('.floating-particles');
        if (!particleContainer) return;

        setInterval(() => {
            if (document.querySelectorAll('.dynamic-particle').length < 10) {
                const particle = document.createElement('div');
                particle.className = 'dynamic-particle';
                particle.style.cssText = `
                    position: absolute;
                    width: ${Math.random() * 6 + 4}px;
                    height: ${Math.random() * 6 + 4}px;
                    background: rgba(255, 255, 255, ${Math.random() * 0.5 + 0.1});
                    border-radius: 50%;
                    left: ${Math.random() * 100}%;
                    top: 100%;
                    pointer-events: none;
                    animation: floatUp ${Math.random() * 10 + 10}s linear forwards;
                `;
                
                particleContainer.appendChild(particle);
                
                // Remove particle after animation
                setTimeout(() => {
                    if (particle.parentNode) {
                        particle.parentNode.removeChild(particle);
                    }
                }, 20000);
            }
        }, 2000);
    }

    // Add typing effect to hero title
    addTypingEffect() {
        const titleLines = document.querySelectorAll('.hero-title span');
        let delay = 0;
        
        titleLines.forEach((line, index) => {
            const text = line.textContent;
            line.textContent = '';
            line.style.borderRight = index === titleLines.length - 1 ? '2px solid white' : 'none';
            
            setTimeout(() => {
                this.typeText(line, text, () => {
                    if (index === titleLines.length - 1) {
                        // Remove cursor after typing is complete
                        setTimeout(() => {
                            line.style.borderRight = 'none';
                        }, 1000);
                    }
                });
            }, delay);
            
            delay += text.length * 50 + 500; // Delay between lines
        });
    }

    // Type text effect
    typeText(element, text, callback) {
        let i = 0;
        const interval = setInterval(() => {
            element.textContent += text.charAt(i);
            i++;
            if (i >= text.length) {
                clearInterval(interval);
                if (callback) callback();
            }
        }, 50);
    }

    // Add mouse follow effect
    addMouseFollowEffect() {
        const hero = document.querySelector('.hero-section-modern');
        if (!hero) return;

        hero.addEventListener('mousemove', (e) => {
            const rect = hero.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;

            // Create subtle gradient shift based on mouse position
            hero.style.background = `
                radial-gradient(circle at ${x}% ${y}%, 
                    rgba(255, 255, 255, 0.1) 0%, 
                    transparent 50%),
                linear-gradient(135deg, #667eea 0%, #764ba2 100%)
            `;
        });

        hero.addEventListener('mouseleave', () => {
            hero.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        });
    }
}

// Add CSS for dynamic animations
const dynamicStyles = `
    @keyframes floatUp {
        from {
            transform: translateY(0);
            opacity: 1;
        }
        to {
            transform: translateY(-100vh);
            opacity: 0;
        }
    }

    @keyframes animate-in {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .animate-in {
        animation: animate-in 0.6s ease-out forwards;
    }

    .stat-card:hover {
        transform: translateY(-10px) rotateY(5deg);
    }

    .tool-node {
        transform-style: preserve-3d;
    }

    .tool-node:hover {
        transform: scale(1.2) rotateY(15deg);
    }

    /* Enhanced glow effects */
    .btn-modern-primary::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: inherit;
        border-radius: inherit;
        filter: blur(10px);
        opacity: 0.7;
        z-index: -1;
        transition: opacity 0.3s ease;
    }

    .btn-modern-primary:hover::before {
        opacity: 1;
    }

    /* Tool node rotation on orbit */
    .tool-node {
        animation: counterRotate 20s linear infinite reverse;
    }

    @keyframes counterRotate {
        from { transform: rotate(0deg); }
        to { transform: rotate(-360deg); }
    }
`;

// Add styles to head
const styleSheet = document.createElement('style');
styleSheet.textContent = dynamicStyles;
document.head.appendChild(styleSheet);

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const heroAnimations = new HeroAnimations();
    
    // Add additional effects with slight delay
    setTimeout(() => {
        heroAnimations.createDynamicParticles();
        heroAnimations.addMouseFollowEffect();
    }, 1000);
    
    // Optional: Add typing effect (uncomment to enable)
    // setTimeout(() => {
    //     heroAnimations.addTypingEffect();
    // }, 2000);
});

// Export for potential external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HeroAnimations;
}