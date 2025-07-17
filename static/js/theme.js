// Suntyn AI - Theme Management
// Handles dark/light mode switching and theme persistence

class ThemeManager {
    constructor() {
        this.currentTheme = 'light';
        this.themeKey = 'suntyn-theme';
        this.systemPreference = 'light';
        this.observers = [];
        this.init();
    }

    init() {
        this.detectSystemPreference();
        this.loadSavedTheme();
        this.setupThemeToggle();
        this.setupSystemPreferenceWatcher();
        this.applyTheme(this.currentTheme);
        console.log('🎨 Theme manager initialized');
    }

    detectSystemPreference() {
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            this.systemPreference = mediaQuery.matches ? 'dark' : 'light';
        }
    }

    loadSavedTheme() {
        const savedTheme = localStorage.getItem(this.themeKey);
        if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'auto')) {
            this.currentTheme = savedTheme;
        } else {
            this.currentTheme = 'auto';
        }
    }

    setupThemeToggle() {
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }

        // Setup theme dropdown if available
        const themeDropdown = document.querySelector('.theme-dropdown');
        if (themeDropdown) {
            themeDropdown.addEventListener('click', (e) => {
                const themeOption = e.target.closest('[data-theme]');
                if (themeOption) {
                    this.setTheme(themeOption.dataset.theme);
                }
            });
        }
    }

    setupSystemPreferenceWatcher() {
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            mediaQuery.addEventListener('change', (e) => {
                this.systemPreference = e.matches ? 'dark' : 'light';
                if (this.currentTheme === 'auto') {
                    this.applyTheme('auto');
                }
            });
        }
    }

    toggleTheme() {
        const themes = ['light', 'dark', 'auto'];
        const currentIndex = themes.indexOf(this.currentTheme);
        const nextTheme = themes[(currentIndex + 1) % themes.length];
        this.setTheme(nextTheme);
    }

    setTheme(theme) {
        if (theme === this.currentTheme) return;
        
        this.currentTheme = theme;
        this.saveTheme();
        this.applyTheme(theme);
        this.notifyObservers(theme);
        
        // Show theme change notification
        if (window.app) {
            const themeLabel = this.getThemeLabel(theme);
            window.app.showNotification(`Theme changed to ${themeLabel}`, 'info', 2000);
        }
    }

    applyTheme(theme) {
        const html = document.documentElement;
        const body = document.body;
        
        // Remove existing theme classes
        html.classList.remove('theme-light', 'theme-dark');
        body.classList.remove('theme-light', 'theme-dark');
        
        // Determine actual theme to apply
        let actualTheme = theme;
        if (theme === 'auto') {
            actualTheme = this.systemPreference;
        }
        
        // Apply theme
        html.dataset.theme = actualTheme;
        html.classList.add(`theme-${actualTheme}`);
        body.classList.add(`theme-${actualTheme}`);
        
        // Update theme toggle icon
        this.updateThemeToggleIcon(theme);
        
        // Update meta theme-color
        this.updateMetaThemeColor(actualTheme);
        
        // Apply theme to charts and visualizations
        this.applyThemeToCharts(actualTheme);
        
        // Trigger theme change event
        const event = new CustomEvent('themeChange', {
            detail: { theme: actualTheme, userTheme: theme }
        });
        document.dispatchEvent(event);
    }

    updateThemeToggleIcon(theme) {
        const themeIcon = document.getElementById('theme-icon');
        if (!themeIcon) return;
        
        const icons = {
            light: 'ti-sun',
            dark: 'ti-moon',
            auto: 'ti-device-desktop'
        };
        
        // Remove all theme icons
        Object.values(icons).forEach(iconClass => {
            themeIcon.classList.remove(iconClass);
        });
        
        // Add current theme icon
        themeIcon.classList.add(icons[theme] || icons.auto);
    }

    updateMetaThemeColor(theme) {
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            const colors = {
                light: '#3b82f6',
                dark: '#1e40af'
            };
            metaThemeColor.setAttribute('content', colors[theme] || colors.light);
        }
    }

    applyThemeToCharts(theme) {
        // Apply theme to Chart.js charts
        if (typeof Chart !== 'undefined') {
            const isDark = theme === 'dark';
            Chart.defaults.color = isDark ? '#f1f5f9' : '#1f2937';
            Chart.defaults.borderColor = isDark ? '#475569' : '#e5e7eb';
            Chart.defaults.backgroundColor = isDark ? '#334155' : '#f8fafc';
            
            // Update existing charts
            Chart.instances.forEach(chart => {
                chart.update();
            });
        }
        
        // Apply theme to other visualization libraries
        this.applyThemeToCustomCharts(theme);
    }

    applyThemeToCustomCharts(theme) {
        const isDark = theme === 'dark';
        const chartElements = document.querySelectorAll('.chart-container');
        
        chartElements.forEach(element => {
            if (isDark) {
                element.classList.add('chart-dark');
                element.classList.remove('chart-light');
            } else {
                element.classList.add('chart-light');
                element.classList.remove('chart-dark');
            }
        });
    }

    saveTheme() {
        localStorage.setItem(this.themeKey, this.currentTheme);
    }

    getThemeLabel(theme) {
        const labels = {
            light: 'Light',
            dark: 'Dark',
            auto: 'Auto'
        };
        return labels[theme] || 'Auto';
    }

    getCurrentTheme() {
        return this.currentTheme;
    }

    getActualTheme() {
        return this.currentTheme === 'auto' ? this.systemPreference : this.currentTheme;
    }

    isDarkMode() {
        return this.getActualTheme() === 'dark';
    }

    isLightMode() {
        return this.getActualTheme() === 'light';
    }

    // Observer pattern for theme changes
    subscribe(callback) {
        this.observers.push(callback);
        return () => {
            this.observers = this.observers.filter(obs => obs !== callback);
        };
    }

    notifyObservers(theme) {
        this.observers.forEach(callback => {
            try {
                callback(theme);
            } catch (error) {
                console.error('Error in theme observer:', error);
            }
        });
    }

    // Utility methods
    getThemeColors() {
        const isDark = this.isDarkMode();
        return {
            primary: isDark ? '#60a5fa' : '#3b82f6',
            secondary: isDark ? '#1e40af' : '#1e40af',
            success: isDark ? '#34d399' : '#10b981',
            warning: isDark ? '#fbbf24' : '#f59e0b',
            danger: isDark ? '#f87171' : '#ef4444',
            info: isDark ? '#60a5fa' : '#3b82f6',
            light: isDark ? '#f8fafc' : '#f8fafc',
            dark: isDark ? '#1f2937' : '#1f2937',
            background: isDark ? '#0f172a' : '#ffffff',
            surface: isDark ? '#1e293b' : '#f8fafc',
            text: isDark ? '#f1f5f9' : '#1f2937',
            textSecondary: isDark ? '#cbd5e1' : '#6b7280',
            border: isDark ? '#475569' : '#e5e7eb'
        };
    }

    getCSSVariables() {
        const colors = this.getThemeColors();
        const cssVars = {};
        
        for (const [key, value] of Object.entries(colors)) {
            cssVars[`--color-${key}`] = value;
        }
        
        return cssVars;
    }

    applyCSSVariables() {
        const variables = this.getCSSVariables();
        const root = document.documentElement;
        
        for (const [property, value] of Object.entries(variables)) {
            root.style.setProperty(property, value);
        }
    }

    // Animation for theme transitions
    enableTransitions() {
        const style = document.createElement('style');
        style.textContent = `
            * {
                transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease !important;
            }
            
            .theme-transition-disabled * {
                transition: none !important;
            }
        `;
        document.head.appendChild(style);
    }

    disableTransitions() {
        document.body.classList.add('theme-transition-disabled');
        setTimeout(() => {
            document.body.classList.remove('theme-transition-disabled');
        }, 100);
    }

    // Accessibility improvements
    updateAccessibility() {
        const isDark = this.isDarkMode();
        
        // Update focus indicators
        const focusStyle = document.getElementById('focus-styles') || document.createElement('style');
        focusStyle.id = 'focus-styles';
        focusStyle.textContent = `
            :focus {
                outline: 2px solid ${isDark ? '#60a5fa' : '#3b82f6'};
                outline-offset: 2px;
            }
        `;
        
        if (!document.head.contains(focusStyle)) {
            document.head.appendChild(focusStyle);
        }
    }

    // Print styles
    updatePrintStyles() {
        const printStyle = document.getElementById('print-styles') || document.createElement('style');
        printStyle.id = 'print-styles';
        printStyle.textContent = `
            @media print {
                * {
                    color: black !important;
                    background: white !important;
                    box-shadow: none !important;
                }
                
                .navbar,
                .footer,
                .btn,
                .alert {
                    display: none !important;
                }
            }
        `;
        
        if (!document.head.contains(printStyle)) {
            document.head.appendChild(printStyle);
        }
    }
}

// Initialize theme manager
const themeManager = new ThemeManager();

// Export for global access
window.ThemeManager = ThemeManager;
window.themeManager = themeManager;
