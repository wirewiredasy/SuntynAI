
/**
 * Performance Optimization Utilities
 * Handles caching, compression, and resource optimization
 */

class PerformanceOptimizer {
    constructor() {
        this.cache = new Map();
        this.compressionSupported = this.checkCompressionSupport();
        this.init();
    }

    init() {
        this.setupImageLazyLoading();
        this.setupResourceCaching();
        this.optimizeAnimations();
        this.setupMemoryCleanup();
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
            const navigation = performance.getEntriesByType('navigation')[0];
            const paint = performance.getEntriesByType('paint');

            const metrics = {
                'DNS Lookup': Math.round(navigation.domainLookupEnd - navigation.domainLookupStart),
                'TCP Connection': Math.round(navigation.connectEnd - navigation.connectStart),
                'Server Response': Math.round(navigation.responseEnd - navigation.responseStart),
                'DOM Processing': Math.round(navigation.domContentLoadedEventEnd - navigation.responseEnd),
                'Resource Loading': Math.round(navigation.loadEventEnd - navigation.domContentLoadedEventEnd),
                'Total Load Time': Math.round(navigation.loadEventEnd - navigation.fetchStart)
            };

            paint.forEach(entry => {
                metrics[entry.name] = Math.round(entry.startTime);
            });

            console.table(metrics);
            
            // Report slow performance
            if (metrics['Total Load Time'] > 3000) {
                console.warn('🐌 Slow page load detected:', metrics['Total Load Time'], 'ms');
                this.reportSlowPerformance(metrics);
            }
        }
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
