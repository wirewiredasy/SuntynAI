
/**
 * Professional Lazy Loading System
 * Optimizes page performance by deferring heavy components
 */

class LazyLoader {
    constructor() {
        this.loadedComponents = new Set();
        this.observers = new Map();
        this.init();
    }

    init() {
        this.setupIntersectionObserver();
        this.setupIdleCallback();
        this.preloadCriticalResources();
    }

    setupIntersectionObserver() {
        if (!('IntersectionObserver' in window)) {
            return this.loadAllComponents();
        }

        const options = {
            rootMargin: '50px 0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const component = entry.target.dataset.lazyComponent;
                    if (component && !this.loadedComponents.has(component)) {
                        this.loadComponent(component, entry.target);
                        observer.unobserve(entry.target);
                    }
                }
            });
        }, options);

        // Observe lazy components
        document.querySelectorAll('[data-lazy-component]').forEach(el => {
            observer.observe(el);
        });

        this.observers.set('intersection', observer);
    }

    setupIdleCallback() {
        if ('requestIdleCallback' in window) {
            requestIdleCallback(() => {
                this.loadLowPriorityComponents();
            });
        } else {
            setTimeout(() => {
                this.loadLowPriorityComponents();
            }, 2000);
        }
    }

    preloadCriticalResources() {
        const criticalComponents = ['search', 'navigation', 'hero'];
        criticalComponents.forEach(component => {
            this.loadComponent(component);
        });
    }

    loadComponent(componentName, element = null) {
        if (this.loadedComponents.has(componentName)) {
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            switch (componentName) {
                case 'charts':
                    this.loadCharts().then(resolve).catch(reject);
                    break;
                case 'animations':
                    this.loadAnimations().then(resolve).catch(reject);
                    break;
                case 'hero-3d':
                    this.loadHero3D().then(resolve).catch(reject);
                    break;
                case 'tools':
                    this.loadToolComponents().then(resolve).catch(reject);
                    break;
                default:
                    resolve();
            }

            this.loadedComponents.add(componentName);
            
            if (element) {
                element.classList.add('lazy-loaded');
                element.style.opacity = '1';
            }
        });
    }

    async loadCharts() {
        try {
            if (typeof Chart === 'undefined') {
                console.log('📊 Loading Chart.js...');
                await this.loadScript('https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js');
            }
            
            // Initialize charts only when needed
            const chartElements = document.querySelectorAll('canvas[data-chart]');
            if (chartElements.length > 0) {
                if (typeof window.app !== 'undefined' && window.app.initializeCharts) {
                    window.app.initializeCharts();
                }
            }
            
            console.log('✅ Charts loaded');
        } catch (error) {
            console.warn('⚠️ Charts loading failed:', error);
        }
    }

    async loadAnimations() {
        try {
            console.log('✨ Loading animations...');
            
            if (typeof gsap === 'undefined') {
                await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');
                await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js');
            }
            
            // Initialize animations
            if (typeof window.app !== 'undefined' && window.app.initializeAnimations) {
                window.app.initializeAnimations();
            }
            
            console.log('✅ Animations loaded');
        } catch (error) {
            console.warn('⚠️ Animations loading failed:', error);
        }
    }

    async loadHero3D() {
        try {
            console.log('🎨 Loading 3D Hero...');
            
            // Load hero-modern.js if not loaded
            if (typeof ModernHeroSystem === 'undefined') {
                await this.loadScript('/static/js/hero-modern.js');
            }
            
            // Initialize hero system
            if (typeof ModernHeroSystem !== 'undefined') {
                new ModernHeroSystem();
            }
            
            console.log('✅ 3D Hero loaded');
        } catch (error) {
            console.warn('⚠️ 3D Hero loading failed:', error);
        }
    }

    async loadToolComponents() {
        try {
            console.log('🔧 Loading tool components...');
            
            const toolComponents = [
                '/static/js/tools/pdf-merger.js',
                '/static/js/tools/image-compressor.js',
                '/static/js/tools/qr-generator.js'
            ];
            
            await Promise.all(toolComponents.map(src => this.loadScript(src)));
            
            console.log('✅ Tool components loaded');
        } catch (error) {
            console.warn('⚠️ Tool components loading failed:', error);
        }
    }

    loadLowPriorityComponents() {
        const lowPriorityComponents = ['social-widgets', 'analytics', 'non-critical-animations'];
        lowPriorityComponents.forEach(component => {
            this.loadComponent(component);
        });
    }

    loadAllComponents() {
        console.log('🚀 Loading all components (fallback mode)');
        ['charts', 'animations', 'hero-3d', 'tools'].forEach(component => {
            this.loadComponent(component);
        });
    }

    loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            script.async = true;
            script.defer = true;
            document.head.appendChild(script);
        });
    }

    loadStylesheet(href) {
        return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            link.onload = resolve;
            link.onerror = reject;
            document.head.appendChild(link);
        });
    }

    // Performance optimization methods
    preloadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = resolve;
            img.onerror = reject;
            img.src = src;
        });
    }

    prefetchResource(url) {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = url;
        document.head.appendChild(link);
    }

    preconnectToOrigin(origin) {
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = origin;
        document.head.appendChild(link);
    }
}

// Initialize lazy loader
window.addEventListener('DOMContentLoaded', () => {
    window.lazyLoader = new LazyLoader();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LazyLoader;
}
