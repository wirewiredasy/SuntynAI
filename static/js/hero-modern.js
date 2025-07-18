/**
 * Ultra-Modern AI Hero Section JavaScript
 * Advanced animations and interactive features
 */

class ModernHeroSystem {
    constructor() {
        this.isInitialized = false;
        this.animations = new Map();
        this.neuralNetwork = null;
        this.chartInstance = null;
        this.typingTexts = [
            "PDF Processing made simple...",
            "Image editing with AI power...", 
            "Financial calculations in seconds...",
            "Student tools for success...",
            "Government document validation...",
            "Video & audio processing..."
        ];
        this.currentTextIndex = 0;
        this.init();
    }

    async init() {
        try {
            console.log('🚀 Initializing Modern Hero System...');
            
            // Wait for DOM
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.initializeComponents());
            } else {
                this.initializeComponents();
            }
            
        } catch (error) {
            console.error('❌ Hero initialization failed:', error);
        }
    }

    initializeComponents() {
        try {
            // Initialize neural background
            this.initNeuralBackground();
            
            // Initialize text animations
            this.initTextAnimations();
            
            // Initialize interactive demos
            this.initInteractiveDemo();
            
            // Initialize stats counter
            this.initStatsCounter();
            
            // Initialize button interactions
            this.initButtonInteractions();
            
            // Initialize mini chart
            this.initMiniChart();
            
            this.isInitialized = true;
            console.log('✅ Modern Hero System initialized successfully');
            
        } catch (error) {
            console.error('❌ Component initialization failed:', error);
        }
    }

    initNeuralBackground() {
        const canvas = document.getElementById('neural-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let animationId;
        
        // Set canvas size
        const resizeCanvas = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        };
        
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Neural network points
        const points = [];
        const numPoints = 50;
        
        // Initialize points
        for (let i = 0; i < numPoints; i++) {
            points.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                connections: []
            });
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Update points
            points.forEach(point => {
                point.x += point.vx;
                point.y += point.vy;
                
                // Bounce off edges
                if (point.x <= 0 || point.x >= canvas.width) point.vx *= -1;
                if (point.y <= 0 || point.y >= canvas.height) point.vy *= -1;
                
                // Keep within bounds
                point.x = Math.max(0, Math.min(canvas.width, point.x));
                point.y = Math.max(0, Math.min(canvas.height, point.y));
            });

            // Draw connections
            ctx.strokeStyle = 'rgba(102, 126, 234, 0.3)';
            ctx.lineWidth = 1;
            
            for (let i = 0; i < points.length; i++) {
                for (let j = i + 1; j < points.length; j++) {
                    const dx = points[i].x - points[j].x;
                    const dy = points[i].y - points[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < 100) {
                        const opacity = (100 - distance) / 100 * 0.3;
                        ctx.strokeStyle = `rgba(102, 126, 234, ${opacity})`;
                        ctx.beginPath();
                        ctx.moveTo(points[i].x, points[i].y);
                        ctx.lineTo(points[j].x, points[j].y);
                        ctx.stroke();
                    }
                }
            }

            // Draw points
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            points.forEach(point => {
                ctx.beginPath();
                ctx.arc(point.x, point.y, 2, 0, Math.PI * 2);
                ctx.fill();
            });

            animationId = requestAnimationFrame(animate);
        };

        animate();
        
        this.neuralNetwork = { canvas, ctx, points, animationId };
    }

    initTextAnimations() {
        // Animate word reveals
        const wordElements = document.querySelectorAll('.word-animate');
        wordElements.forEach((word, index) => {
            const delay = parseInt(word.dataset.delay) || 0;
            setTimeout(() => {
                word.style.animationDelay = '0s';
                word.classList.add('animate');
            }, delay);
        });

        // Typing animation
        this.initTypingAnimation();
    }

    initTypingAnimation() {
        const typedTextElement = document.querySelector('.typed-text');
        const cursorElement = document.querySelector('.typing-cursor');
        
        if (!typedTextElement) return;

        let currentIndex = 0;
        let currentChar = 0;
        let isDeleting = false;

        const type = () => {
            const currentText = this.typingTexts[currentIndex];
            
            if (isDeleting) {
                typedTextElement.textContent = currentText.substring(0, currentChar - 1);
                currentChar--;
                
                if (currentChar === 0) {
                    isDeleting = false;
                    currentIndex = (currentIndex + 1) % this.typingTexts.length;
                    setTimeout(type, 500);
                    return;
                }
            } else {
                typedTextElement.textContent = currentText.substring(0, currentChar + 1);
                currentChar++;
                
                if (currentChar === currentText.length) {
                    setTimeout(() => {
                        isDeleting = true;
                        type();
                    }, 2000);
                    return;
                }
            }
            
            setTimeout(type, isDeleting ? 50 : 100);
        };

        setTimeout(type, 1000);
    }

    initInteractiveDemo() {
        // Tool tab switching
        const toolTabs = document.querySelectorAll('.tool-tab');
        const toolDemos = document.querySelectorAll('.tool-demo');

        toolTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetTool = tab.dataset.tool;
                
                // Remove active class from all tabs and demos
                toolTabs.forEach(t => t.classList.remove('active'));
                toolDemos.forEach(d => d.classList.remove('active'));
                
                // Add active class to clicked tab and corresponding demo
                tab.classList.add('active');
                const targetDemo = document.getElementById(`demo-${targetTool}`);
                if (targetDemo) {
                    targetDemo.classList.add('active');
                }

                // Trigger specific demo animations
                this.triggerDemoAnimation(targetTool);
            });
        });

        // Start initial demo animations
        this.startDemoAnimations();
    }

    triggerDemoAnimation(toolType) {
        switch (toolType) {
            case 'pdf':
                this.animatePDFDemo();
                break;
            case 'image':
                this.animateImageDemo();
                break;
            case 'finance':
                this.animateFinanceDemo();
                break;
            case 'ai':
                this.animateAIDemo();
                break;
        }
    }

    animatePDFDemo() {
        const progressBars = document.querySelectorAll('#demo-pdf .progress-bar');
        const actionBtn = document.querySelector('#demo-pdf .action-btn');
        const outputFile = document.querySelector('#demo-pdf .output-file');

        // Reset animations
        progressBars.forEach(bar => {
            bar.style.animation = 'none';
            bar.offsetHeight; // Trigger reflow
            bar.style.animation = 'progress 3s ease-in-out';
        });

        // Show processing state
        if (actionBtn) {
            actionBtn.style.opacity = '1';
            setTimeout(() => {
                actionBtn.style.opacity = '0.7';
                if (outputFile) {
                    outputFile.style.animation = 'text-reveal 0.5s ease-out';
                }
            }, 3000);
        }
    }

    animateImageDemo() {
        const beforeImg = document.querySelector('#demo-image .image-before img');
        const afterImg = document.querySelector('#demo-image .image-after img');
        const arrow = document.querySelector('#demo-image .transform-arrow');

        if (beforeImg && afterImg && arrow) {
            // Reset
            afterImg.style.opacity = '0';
            arrow.style.transform = 'scale(1)';
            
            // Animate
            setTimeout(() => {
                arrow.style.transform = 'scale(1.2)';
                arrow.style.color = '#00ff88';
            }, 500);
            
            setTimeout(() => {
                afterImg.style.opacity = '1';
                afterImg.style.animation = 'text-reveal 0.5s ease-out';
            }, 1000);
        }
    }

    animateFinanceDemo() {
        const emiAmount = document.querySelector('#demo-finance .emi-amount');
        if (emiAmount) {
            const targetAmount = 9567;
            let currentAmount = 0;
            const increment = targetAmount / 50;
            
            const countUp = () => {
                currentAmount += increment;
                if (currentAmount >= targetAmount) {
                    emiAmount.textContent = `₹${targetAmount.toLocaleString()}`;
                    return;
                }
                emiAmount.textContent = `₹${Math.floor(currentAmount).toLocaleString()}`;
                requestAnimationFrame(countUp);
            };
            
            countUp();
        }
    }

    animateAIDemo() {
        const typingText = document.querySelector('#demo-ai .typing-animation span');
        const aiDots = document.querySelectorAll('#demo-ai .ai-dots span');
        const generatedText = document.querySelector('#demo-ai .generated-text');

        if (typingText && generatedText) {
            // Reset
            generatedText.style.opacity = '0';
            
            // Show typing
            aiDots.forEach((dot, index) => {
                dot.style.animationDelay = `${index * 0.16}s`;
            });
            
            // Show result after delay
            setTimeout(() => {
                generatedText.style.opacity = '1';
                generatedText.style.animation = 'text-reveal 1s ease-out';
            }, 2000);
        }
    }

    startDemoAnimations() {
        // Start with PDF demo
        setTimeout(() => this.animatePDFDemo(), 1000);
        
        // Cycle through demos
        setInterval(() => {
            const tabs = document.querySelectorAll('.tool-tab');
            const activeTab = document.querySelector('.tool-tab.active');
            const currentIndex = Array.from(tabs).indexOf(activeTab);
            const nextIndex = (currentIndex + 1) % tabs.length;
            
            tabs[nextIndex].click();
        }, 8000);
    }

    initStatsCounter() {
        const statNumbers = document.querySelectorAll('.stat-number');
        
        const observerOptions = {
            threshold: 0.5,
            rootMargin: '0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const target = parseInt(entry.target.dataset.target);
                    this.animateCounter(entry.target, target);
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        statNumbers.forEach(stat => observer.observe(stat));
    }

    animateCounter(element, target) {
        let current = 0;
        const increment = target / 100;
        const duration = 2000;
        const stepTime = duration / 100;

        const counter = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = target >= 1000 ? `${Math.floor(target/1000)}K+` : `${target}+`;
                clearInterval(counter);
            } else {
                const display = current >= 1000 ? `${Math.floor(current/1000)}K+` : Math.floor(current);
                element.textContent = display;
            }
        }, stepTime);
    }

    initButtonInteractions() {
        // Ripple effect for primary button
        const primaryBtn = document.querySelector('.btn-ai-primary');
        if (primaryBtn) {
            primaryBtn.addEventListener('click', (e) => {
                const ripple = primaryBtn.querySelector('.btn-ripple');
                const rect = primaryBtn.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                
                ripple.style.width = ripple.style.height = size + 'px';
                ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
                ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
                
                ripple.style.animation = 'none';
                ripple.offsetHeight; // Trigger reflow
                ripple.style.animation = 'ripple-effect 0.6s ease-out';
            });
        }

        // Demo button interactions
        const demoBtn = document.querySelector('[data-demo="start"]');
        if (demoBtn) {
            demoBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.startFullDemo();
            });
        }
    }

    initMiniChart() {
        const canvas = document.getElementById('mini-chart');
        if (!canvas) return;

        try {
            const ctx = canvas.getContext('2d');
            
            // Simple chart without Chart.js dependency
            this.drawMiniChart(ctx, canvas);
            
        } catch (error) {
            console.warn('Chart initialization skipped:', error.message);
        }
    }

    drawMiniChart(ctx, canvas) {
        const width = canvas.width;
        const height = canvas.height;
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Sample data for EMI breakdown
        const data = [30, 45, 35, 50, 40, 55, 45];
        const maxValue = Math.max(...data);
        
        // Draw bars
        const barWidth = width / data.length - 2;
        ctx.fillStyle = 'rgba(102, 126, 234, 0.8)';
        
        data.forEach((value, index) => {
            const barHeight = (value / maxValue) * height * 0.8;
            const x = index * (barWidth + 2);
            const y = height - barHeight - 10;
            
            ctx.fillRect(x, y, barWidth, barHeight);
        });
        
        // Draw line overlay
        ctx.strokeStyle = '#00ff88';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        data.forEach((value, index) => {
            const x = index * (barWidth + 2) + barWidth / 2;
            const y = height - (value / maxValue) * height * 0.8 - 10;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();
    }

    startFullDemo() {
        // Cycle through all demos quickly
        const tabs = document.querySelectorAll('.tool-tab');
        let currentIndex = 0;
        
        const cycleDemos = () => {
            if (currentIndex < tabs.length) {
                tabs[currentIndex].click();
                currentIndex++;
                setTimeout(cycleDemos, 2000);
            } else {
                // Return to first demo
                tabs[0].click();
            }
        };
        
        cycleDemos();
    }

    // Cleanup method
    destroy() {
        if (this.neuralNetwork && this.neuralNetwork.animationId) {
            cancelAnimationFrame(this.neuralNetwork.animationId);
        }
        
        if (this.chartInstance) {
            this.chartInstance.destroy();
        }
        
        this.animations.clear();
        console.log('🧹 Modern Hero System cleaned up');
    }
}

// CSS for additional animations
const additionalStyles = `
@keyframes ripple-effect {
    0% {
        transform: translate(-50%, -50%) scale(0);
        opacity: 1;
    }
    100% {
        transform: translate(-50%, -50%) scale(4);
        opacity: 0;
    }
}

.word-animate.animate {
    animation: word-reveal 0.8s ease-out forwards;
}

.btn-ai-primary:active .btn-bg {
    transform: scale(0.95);
}

.tool-tab:hover {
    transform: translateY(-2px);
}

.demo-window:hover .floating-tools .tool-icon {
    animation-play-state: paused;
}
`;

// Inject additional styles
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// Initialize when DOM is ready
let modernHeroSystem;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        modernHeroSystem = new ModernHeroSystem();
    });
} else {
    modernHeroSystem = new ModernHeroSystem();
}

// Handle page unload
window.addEventListener('beforeunload', () => {
    if (modernHeroSystem) {
        modernHeroSystem.destroy();
    }
});

// Export for global access
window.ModernHeroSystem = ModernHeroSystem;