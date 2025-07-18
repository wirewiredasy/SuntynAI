
/**
 * Performance Optimization Utilities
 * Handles caching, compression, and resource optimization
 */

class PerformanceOptimizer {
    constructor() {
        this.cache = new Map();
        this.compressionSupported = this.checkCompressionSupport();
        this.isLowEndDevice = this.detectLowEndDevice();
        this.init();
    }

    init() {
        // Prioritize critical optimizations
        this.setupImageLazyLoading();
        this.optimizeScrollPerformance();
        this.setupResourceCaching();
        this.optimizeAnimations();
        this.setupMemoryCleanup();
        this.optimizeJavaScriptExecution();
    }

    detectLowEndDevice() {
        return (
            navigator.hardwareConcurrency <= 2 ||
            navigator.deviceMemory <= 2 ||
            /Android.*(SM-|SAMSUNG-|GT-|SCH-)/i.test(navigator.userAgent)
        );
    }

    optimizeScrollPerformance() {
        // Passive event listeners for better scroll performance
        let ticking = false;
        
        const optimizedScrollHandler = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    // Throttled scroll operations
                    this.updateScrollElements();
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', optimizedScrollHandler, { passive: true });
        
        // Optimize scroll for low-end devices
        if (this.isLowEndDevice) {
            document.documentElement.style.scrollBehavior = 'auto';
        }
    }

    updateScrollElements() {
        // Update scroll-dependent elements efficiently
        const scrollTop = window.pageYOffset;
        const scrollToTopBtn = document.querySelector('.scroll-to-top-btn');
        
        if (scrollToTopBtn) {
            if (scrollTop > 300) {
                scrollToTopBtn.style.opacity = '1';
                scrollToTopBtn.style.pointerEvents = 'auto';
            } else {
                scrollToTopBtn.style.opacity = '0';
                scrollToTopBtn.style.pointerEvents = 'none';
            }
        }
    }

    optimizeJavaScriptExecution() {
        // Defer non-critical JavaScript
        const deferredTasks = [];
        
        window.addDeferredTask = (task) => {
            deferredTasks.push(task);
        };

        // Execute deferred tasks when browser is idle
        const executeDeferredTasks = () => {
            if (deferredTasks.length > 0) {
                const task = deferredTasks.shift();
                try {
                    task();
                } catch (error) {
                    console.warn('Deferred task failed:', error);
                }
                
                if (deferredTasks.length > 0) {
                    requestIdleCallback(executeDeferredTasks);
                }
            }
        };

        requestIdleCallback(executeDeferredTasks);
    }

    setupImageLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.classList.remove('lazy');
                            img.classList.add('loaded');
                            imageObserver.unobserve(img);
                        }
                    }
                });
            }, {
                rootMargin: '50px 0px'
            });

            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    }

    setupResourceCaching() {
        // Cache frequently used resources
        const cachableResources = [
            '/static/css/main.css',
            '/static/js/main.js',
            '/static/js/theme.js'
        ];

        if ('caches' in window) {
            caches.open('suntyn-ai-resources').then(cache => {
                cache.addAll(cachableResources).catch(err => {
                    console.warn('Cache preload failed:', err);
                });
            });
        }
    }

    optimizeAnimations() {
        // Reduce animations on low-end devices
        if (navigator.hardwareConcurrency <= 2) {
            document.documentElement.style.setProperty('--animation-duration', '0.2s');
            document.documentElement.classList.add('reduced-motion');
        }

        // Pause animations when page is not visible
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAnimations();
            } else {
                this.resumeAnimations();
            }
        });
    }

    pauseAnimations() {
        document.querySelectorAll('*').forEach(el => {
            const computedStyle = getComputedStyle(el);
            if (computedStyle.animationName !== 'none') {
                el.style.animationPlayState = 'paused';
            }
        });
    }

    resumeAnimations() {
        document.querySelectorAll('*').forEach(el => {
            el.style.animationPlayState = 'running';
        });
    }

    setupMemoryCleanup() {
        // Clean up unused resources periodically
        setInterval(() => {
            this.cleanupMemory();
        }, 30000); // Every 30 seconds

        // Clean up on page unload
        window.addEventListener('beforeunload', () => {
            this.cleanupMemory();
        });
    }

    cleanupMemory() {
        // Remove expired cache entries
        const now = Date.now();
        for (const [key, value] of this.cache.entries()) {
            if (value.expires && value.expires < now) {
                this.cache.delete(key);
            }
        }

        // Trigger garbage collection if available
        if (window.gc) {
            window.gc();
        }
    }

    checkCompressionSupport() {
        const testString = 'test';
        try {
            return 'CompressionStream' in window;
        } catch {
            return false;
        }
    }

    // Image optimization
    optimizeImages() {
        document.querySelectorAll('img').forEach(img => {
            // Add loading="lazy" to images below the fold
            const rect = img.getBoundingClientRect();
            if (rect.top > window.innerHeight) {
                img.loading = 'lazy';
            }

            // Add appropriate sizes attribute
            if (!img.sizes && img.srcset) {
                img.sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw';
            }
        });
    }

    // Prefetch important resources
    prefetchResources(urls) {
        urls.forEach(url => {
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = url;
            document.head.appendChild(link);
        });
    }

    // Measure and log performance metrics
    measurePerformance() {
        if ('performance' in window && 'getEntriesByType' in performance) {
            try {
                const navigation = performance.getEntriesByType('navigation')[0];
                const paint = performance.getEntriesByType('paint');

                if (!navigation) {
                    console.warn('Navigation timing not available');
                    return;
                }

                // Safely calculate metrics with fallbacks
                const metrics = {
                    'DNS Lookup': Math.round(Math.max(0, navigation.domainLookupEnd - navigation.domainLookupStart)) || 0,
                    'TCP Connection': Math.round(Math.max(0, navigation.connectEnd - navigation.connectStart)) || 0,
                    'Server Response': Math.round(Math.max(0, navigation.responseEnd - navigation.responseStart)) || 0,
                    'DOM Processing': Math.round(Math.max(0, navigation.domContentLoadedEventEnd - navigation.responseEnd)) || 0,
                    'Resource Loading': Math.round(Math.max(0, navigation.loadEventEnd - navigation.domContentLoadedEventEnd)) || 0,
                    'Total Load Time': Math.round(Math.max(0, navigation.loadEventEnd - navigation.fetchStart)) || 0
                };

                if (paint && paint.length > 0) {
                    paint.forEach(entry => {
                        if (entry && entry.name && typeof entry.startTime === 'number') {
                            metrics[entry.name] = Math.round(entry.startTime);
                        }
                    });
                }

                console.table(metrics);
                
                // Show performance indicator
                this.showPerformanceIndicator(metrics['Total Load Time']);
                
                // Report slow performance
                if (metrics['Total Load Time'] > 3000) {
                    console.warn('🐌 Slow page load detected:', metrics['Total Load Time'], 'ms');
                    this.reportSlowPerformance(metrics);
                }

                // Suggest optimizations
                if (metrics['Total Load Time'] > 5000) {
                    console.log('💡 Performance suggestions:', [
                        'Enable browser caching',
                        'Optimize images',
                        'Minify CSS/JS',
                        'Use a CDN'
                    ]);
                }
            } catch (error) {
                console.warn('Performance measurement failed:', error);
            }
        }
    }

    showPerformanceIndicator(loadTime) {
        const indicator = document.createElement('div');
        indicator.className = 'performance-indicator';
        indicator.textContent = `Load: ${loadTime}ms`;
        
        if (loadTime > 3000) {
            indicator.style.backgroundColor = '#dc3545';
        } else if (loadTime > 1000) {
            indicator.style.backgroundColor = '#ffc107';
        } else {
            indicator.style.backgroundColor = '#28a745';
        }
        
        document.body.appendChild(indicator);
        indicator.classList.add('show');
        
        setTimeout(() => {
            indicator.classList.remove('show');
            setTimeout(() => indicator.remove(), 300);
        }, 3000);
    }

    reportSlowPerformance(metrics) {
        // Report to analytics service if available
        if (typeof gtag !== 'undefined') {
            gtag('event', 'page_load_slow', {
                'load_time': metrics['Total Load Time'],
                'connection_type': navigator.connection?.effectiveType || 'unknown'
            });
        }
    }
}

// Initialize performance optimizer
window.addEventListener('DOMContentLoaded', () => {
    window.performanceOptimizer = new PerformanceOptimizer();
    
    // Measure performance after page load
    window.addEventListener('load', () => {
        setTimeout(() => {
            window.performanceOptimizer.measurePerformance();
        }, 1000);
    });
});

export default PerformanceOptimizer;
