// Enhanced Dark Theme Manager with Real-time Features
class ThemeManager {
    constructor() {
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.init();
    }

    init() {
        this.applyTheme(this.currentTheme);
        this.setupToggle();
        this.setupAutoTheme();
        this.setupRealTimeSync();
        console.log('🎨 Enhanced theme manager initialized');
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        this.currentTheme = theme;

        // Update theme toggle state
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.setAttribute('data-theme', theme);
        }

        // Update meta theme-color
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', theme === 'dark' ? '#0f172a' : '#ffffff');
        }

        // Dispatch theme change event
        const event = new CustomEvent('themeChanged', { detail: { theme } });
        document.dispatchEvent(event);

        // Update charts and dynamic content
        this.updateDynamicContent(theme);
    }

    setupToggle() {
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
                this.applyTheme(newTheme);
                this.animateToggle(themeToggle);
            });
        }
    }

    setupAutoTheme() {
        // Auto theme based on system preference
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        if (!localStorage.getItem('theme')) {
            this.applyTheme(mediaQuery.matches ? 'dark' : 'light');
        }

        mediaQuery.addEventListener('change', (e) => {
            if (!localStorage.getItem('theme-manual')) {
                this.applyTheme(e.matches ? 'dark' : 'light');
            }
        });
    }

    setupRealTimeSync() {
        // Sync theme across tabs
        window.addEventListener('storage', (e) => {
            if (e.key === 'theme' && e.newValue !== this.currentTheme) {
                this.applyTheme(e.newValue);
            }
        });
    }

    animateToggle(toggle) {
        toggle.style.transform = 'scale(0.9)';
        setTimeout(() => {
            toggle.style.transform = 'scale(1)';
        }, 150);
    }

    updateDynamicContent(theme) {
        // Update charts if Chart.js is available
        if (window.Chart) {
            Chart.defaults.color = theme === 'dark' ? '#f1f5f9' : '#374151';
            Chart.defaults.borderColor = theme === 'dark' ? '#334155' : '#e5e7eb';
            Chart.defaults.backgroundColor = theme === 'dark' ? '#1e293b' : '#ffffff';

            // Update existing charts
            Object.values(Chart.instances).forEach(chart => {
                chart.update();
            });
        }

        // Update other dynamic elements
        this.updateCodeBlocks(theme);
        this.updateLoadingSpinners(theme);
        this.updateProgressBars(theme);
    }

    updateCodeBlocks(theme) {
        const codeBlocks = document.querySelectorAll('pre, code');
        codeBlocks.forEach(block => {
            if (theme === 'dark') {
                block.style.backgroundColor = '#1e293b';
                block.style.color = '#f1f5f9';
            } else {
                block.style.backgroundColor = '#f8fafc';
                block.style.color = '#374151';
            }
        });
    }

    updateLoadingSpinners(theme) {
        const spinners = document.querySelectorAll('.spinner-border');
        spinners.forEach(spinner => {
            if (theme === 'dark') {
                spinner.style.borderColor = '#334155';
                spinner.style.borderTopColor = '#6366f1';
            } else {
                spinner.style.borderColor = '#e5e7eb';
                spinner.style.borderTopColor = '#3b82f6';
            }
        });
    }

    updateProgressBars(theme) {
        const progressBars = document.querySelectorAll('.progress-bar');
        progressBars.forEach(bar => {
            const parentProgress = bar.closest('.progress');
            if (parentProgress) {
                if (theme === 'dark') {
                    parentProgress.style.backgroundColor = '#334155';
                } else {
                    parentProgress.style.backgroundColor = '#e5e7eb';
                }
            }
        });
    }

    getCurrentTheme() {
        return this.currentTheme;
    }

    isDarkMode() {
        return this.currentTheme === 'dark';
    }

    setTheme(theme) {
        if (theme === 'light' || theme === 'dark') {
            this.applyTheme(theme);
            localStorage.setItem('theme-manual', 'true');
        }
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    }
}

// Initialize theme manager
const themeManager = new ThemeManager();

// Export for global access
window.themeManager = themeManager;

// Global toggle function
function toggleTheme() {
    themeManager.toggleTheme();
}

// Initialize on DOM content loaded
document.addEventListener('DOMContentLoaded', function() {
    // Ensure theme is applied immediately
    themeManager.applyTheme(themeManager.getCurrentTheme());
});

// Real-time theme synchronization
document.addEventListener('DOMContentLoaded', function() {
    // Theme persistence for forms
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function() {
            // Preserve theme state during form submissions
            const themeInput = document.createElement('input');
            themeInput.type = 'hidden';
            themeInput.name = 'theme';
            themeInput.value = themeManager.getCurrentTheme();
            form.appendChild(themeInput);
        });
    });

    // Theme-aware notifications
    const originalAlert = window.alert;
    window.alert = function(message) {
        const theme = themeManager.getCurrentTheme();
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-info alert-dismissible fade show position-fixed`;
        alertDiv.style.cssText = `
            top: 20px; 
            right: 20px; 
            z-index: 9999; 
            max-width: 400px;
            ${theme === 'dark' ? 'background-color: #1e293b; color: #f1f5f9; border-color: #334155;' : ''}
        `;
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        document.body.appendChild(alertDiv);

        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    };

    // Theme-aware tooltips
    const tooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltips.forEach(tooltip => {
        tooltip.addEventListener('show.bs.tooltip', function() {
            const theme = themeManager.getCurrentTheme();
            if (theme === 'dark') {
                this.setAttribute('data-bs-custom-class', 'tooltip-dark');
            }
        });
    });
});

// CSS for dark theme tooltips
const darkTooltipStyles = `
    .tooltip-dark .tooltip-inner {
        background-color: #1e293b;
        color: #f1f5f9;
    }
    .tooltip-dark .tooltip-arrow::before {
        border-top-color: #1e293b;
    }
`;

// Add dark tooltip styles to head
const styleElement = document.createElement('style');
styleElement.textContent = darkTooltipStyles;
document.head.appendChild(styleElement);

// Theme transition effects
document.addEventListener('themeChanged', function(e) {
    const { theme } = e.detail;

    // Add smooth transition to all elements
    const elements = document.querySelectorAll('*');
    elements.forEach(element => {
        element.style.transition = 'background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease';
    });

    // Remove transitions after animation
    setTimeout(() => {
        elements.forEach(element => {
            element.style.transition = '';
        });
    }, 300);

    // Update real-time indicators
    const realtimeIndicators = document.querySelectorAll('.realtime-indicator');
    realtimeIndicators.forEach(indicator => {
        indicator.style.animation = 'pulse 0.5s ease-in-out';
    });
});

// Export theme utilities
window.themeUtils = {
    getCurrentTheme: () => themeManager.getCurrentTheme(),
    isDarkMode: () => themeManager.isDarkMode(),
    setTheme: (theme) => themeManager.setTheme(theme),
    toggleTheme: () => themeManager.toggleTheme()
};