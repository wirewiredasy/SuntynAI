
// Advanced Interactive Hero Demo System
class HeroInteractiveDemo {
    constructor() {
        this.currentDemo = 'pdf';
        this.animationTimers = new Map();
        this.init();
    }

    init() {
        this.setupDemoTabs();
        this.startDemoAnimations();
        this.setupStatsCounter();
        this.setupScrollEffects();
        this.setupResponsiveHandling();
    }

    setupDemoTabs() {
        const tabs = document.querySelectorAll('.demo-tab');
        const panels = document.querySelectorAll('.demo-panel');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const demoType = tab.dataset.demo;
                this.switchDemo(demoType);
            });
        });
    }

    switchDemo(demoType) {
        // Update active tab
        document.querySelectorAll('.demo-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-demo="${demoType}"]`).classList.add('active');

        // Update active panel
        document.querySelectorAll('.demo-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        document.getElementById(`demo-${demoType}`).classList.add('active');

        // Clear existing animations
        this.clearDemoAnimations();

        // Start new demo animation
        this.currentDemo = demoType;
        this.startDemoAnimation(demoType);
    }

    startDemoAnimations() {
        // Start with PDF demo by default
        this.startDemoAnimation('pdf');
    }

    startDemoAnimation(demoType) {
        switch (demoType) {
            case 'pdf':
                this.animatePDFDemo();
                break;
            case 'image':
                this.animateImageDemo();
                break;
            case 'qr':
                this.animateQRDemo();
                break;
            case 'ai':
                this.animateAIDemo();
                break;
        }
    }

    animatePDFDemo() {
        const progressBars = document.querySelectorAll('#demo-pdf .progress-bar');
        
        // Reset all progress bars
        progressBars.forEach(bar => {
            bar.style.width = '0%';
        });

        // Animate progress bars sequentially
        let delay = 0;
        progressBars.forEach((bar, index) => {
            const timer = setTimeout(() => {
                const targetWidth = index === 2 ? '75%' : '100%';
                bar.style.width = targetWidth;
                
                // Add completion effect
                if (index < 2) {
                    setTimeout(() => {
                        bar.style.background = 'linear-gradient(90deg, #10b981, #059669)';
                    }, 1000);
                }
            }, delay);
            
            this.animationTimers.set(`pdf-progress-${index}`, timer);
            delay += 800;
        });

        // Repeat animation
        const repeatTimer = setTimeout(() => {
            if (this.currentDemo === 'pdf') {
                this.animatePDFDemo();
            }
        }, 5000);
        this.animationTimers.set('pdf-repeat', repeatTimer);
    }

    animateImageDemo() {
        const beforeImage = document.querySelector('#demo-image .image-before .image-placeholder');
        const afterImage = document.querySelector('#demo-image .image-after .image-placeholder');
        const stats = document.querySelectorAll('#demo-image .stat .value');

        // Reset states
        afterImage.classList.remove('compressed');
        
        // Animate compression
        const timer1 = setTimeout(() => {
            afterImage.classList.add('compressed');
            
            // Animate stats
            this.animateValue(stats[0], 0, 70, '%', 1000);
            this.animateValue(stats[1], 0, 95, '%', 1000);
        }, 1000);

        this.animationTimers.set('image-compress', timer1);

        // Repeat animation
        const repeatTimer = setTimeout(() => {
            if (this.currentDemo === 'image') {
                this.animateImageDemo();
            }
        }, 4000);
        this.animationTimers.set('image-repeat', repeatTimer);
    }

    animateQRDemo() {
        const squares = document.querySelectorAll('#demo-qr .qr-square');
        
        // Animate QR code generation
        squares.forEach((square, index) => {
            const timer = setTimeout(() => {
                square.classList.toggle('active');
            }, index * 100);
            
            this.animationTimers.set(`qr-square-${index}`, timer);
        });

        // Repeat animation
        const repeatTimer = setTimeout(() => {
            if (this.currentDemo === 'qr') {
                this.animateQRDemo();
            }
        }, 3000);
        this.animationTimers.set('qr-repeat', repeatTimer);
    }

    animateAIDemo() {
        const textElement = document.querySelector('#demo-ai .generated-text');
        const wordCountElement = document.getElementById('word-count');
        const cursor = document.querySelector('.typing-cursor');
        
        const sampleText = "Subject: Project Completion Update\n\nDear Team,\n\nI'm pleased to inform you that our latest project has been successfully completed ahead of schedule. The deliverables have been thoroughly tested and are ready for deployment.";
        
        // Reset
        textElement.textContent = '';
        if (wordCountElement) wordCountElement.textContent = '0';
        
        // Show cursor
        if (cursor) cursor.style.display = 'inline';
        
        // Type text
        let charIndex = 0;
        const typeInterval = setInterval(() => {
            if (charIndex < sampleText.length) {
                textElement.textContent += sampleText[charIndex];
                charIndex++;
                
                // Update word count
                const wordCount = textElement.textContent.split(' ').length;
                if (wordCountElement) {
                    wordCountElement.textContent = wordCount;
                }
            } else {
                clearInterval(typeInterval);
                // Hide cursor
                if (cursor) cursor.style.display = 'none';
                
                // Repeat animation
                const repeatTimer = setTimeout(() => {
                    if (this.currentDemo === 'ai') {
                        this.animateAIDemo();
                    }
                }, 3000);
                this.animationTimers.set('ai-repeat', repeatTimer);
            }
        }, 50);
        
        this.animationTimers.set('ai-typing', typeInterval);
    }

    animateValue(element, start, end, suffix = '', duration = 1000) {
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const current = Math.floor(start + (end - start) * easeOutQuart);
            
            element.textContent = current + suffix;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }

    clearDemoAnimations() {
        // Clear all existing timers
        this.animationTimers.forEach((timer, key) => {
            clearTimeout(timer);
            clearInterval(timer);
        });
        this.animationTimers.clear();
    }

    setupStatsCounter() {
        const stats = document.querySelectorAll('.stat-number[data-target]');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const target = parseInt(entry.target.dataset.target);
                    this.animateValue(entry.target, 0, target, target >= 1000 ? '+' : '', 2000);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        stats.forEach(stat => observer.observe(stat));
    }

    setupScrollEffects() {
        // Parallax effect for floating shapes
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const shapes = document.querySelectorAll('.shape');
            
            shapes.forEach((shape, index) => {
                const speed = 0.1 + (index * 0.05);
                shape.style.transform = `translateY(${scrolled * speed}px) rotate(${scrolled * 0.1}deg)`;
            });
        });

        // Intersection Observer for animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        // Observe animated elements
        document.querySelectorAll('.tool-card, .feature-card').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(50px)';
            el.style.transition = 'all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            observer.observe(el);
        });
    }

    setupResponsiveHandling() {
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                this.handleResize();
            }, 250);
        });
    }

    handleResize() {
        // Restart current demo animation for responsive adjustments
        this.clearDemoAnimations();
        setTimeout(() => {
            this.startDemoAnimation(this.currentDemo);
        }, 100);
    }

    destroy() {
        this.clearDemoAnimations();
        window.removeEventListener('scroll', this.scrollHandler);
        window.removeEventListener('resize', this.resizeHandler);
    }
}

// Enhanced Performance Optimizations
class PerformanceOptimizer {
    constructor() {
        this.init();
    }

    init() {
        this.optimizeAnimations();
        this.setupIntersectionObserver();
        this.enableHardwareAcceleration();
    }

    optimizeAnimations() {
        // Use CSS transforms instead of changing layout properties
        const style = document.createElement('style');
        style.textContent = `
            .hero-interactive-demo * {
                will-change: auto;
            }
            
            .demo-container,
            .floating-shapes .shape,
            .tool-card {
                will-change: transform;
            }
            
            .progress-bar {
                will-change: width;
            }
            
            .typing-cursor {
                will-change: opacity;
            }
        `;
        document.head.appendChild(style);
    }

    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const element = entry.target;
                if (entry.isIntersecting) {
                    element.classList.add('in-viewport');
                } else {
                    element.classList.remove('in-viewport');
                }
            });
        }, {
            rootMargin: '100px'
        });

        document.querySelectorAll('.shape, .tool-card').forEach(el => {
            observer.observe(el);
        });
    }

    enableHardwareAcceleration() {
        const acceleratedElements = document.querySelectorAll(
            '.demo-container, .floating-shapes, .hero-content, .tool-card'
        );
        
        acceleratedElements.forEach(el => {
            el.style.transform = 'translateZ(0)';
            el.style.backfaceVisibility = 'hidden';
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize demo system
    const heroDemo = new HeroInteractiveDemo();
    
    // Initialize performance optimizations
    const optimizer = new PerformanceOptimizer();
    
    // Global functions for external access
    window.initializeHeroDemo = () => heroDemo;
    window.animateStats = () => heroDemo.setupStatsCounter();
    window.setupDemoTabs = () => heroDemo.setupDemoTabs();
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        heroDemo.destroy();
    });
    
    console.log('🚀 Advanced Hero Interactive Demo initialized');
});

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { HeroInteractiveDemo, PerformanceOptimizer };
}
