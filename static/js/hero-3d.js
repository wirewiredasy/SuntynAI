
// Advanced 3D Hero Section Controller
class Hero3D {
    constructor() {
        this.canvas = document.getElementById('hero-canvas');
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
        this.particles = [];
        this.toolCubes = [];
        this.mouse = { x: 0, y: 0 };
        this.animationId = null;
        
        this.init();
    }

    init() {
        if (!this.canvas) return;
        
        this.setupCanvas();
        this.createParticles();
        this.setupToolInteractions();
        this.setupMouseTracking();
        this.animate();
        this.setupIntersectionObserver();
    }

    setupCanvas() {
        const updateCanvasSize = () => {
            const rect = this.canvas.getBoundingClientRect();
            this.canvas.width = rect.width * window.devicePixelRatio;
            this.canvas.height = rect.height * window.devicePixelRatio;
            this.canvas.style.width = rect.width + 'px';
            this.canvas.style.height = rect.height + 'px';
            this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        };

        updateCanvasSize();
        window.addEventListener('resize', updateCanvasSize);
    }

    createParticles() {
        const particleCount = window.innerWidth < 768 ? 50 : 100;
        
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                radius: Math.random() * 2 + 1,
                opacity: Math.random() * 0.5 + 0.2,
                hue: Math.random() * 60 + 180, // Blue to cyan range
                connections: []
            });
        }
    }

    setupToolInteractions() {
        this.toolCubes = document.querySelectorAll('.tool-cube');
        const infoPanel = document.getElementById('tool-info');

        this.toolCubes.forEach(cube => {
            const toolName = cube.getAttribute('data-tool');
            
            cube.addEventListener('mouseenter', () => {
                this.showToolInfo(toolName, infoPanel);
                this.highlightConnections(cube);
                cube.style.animationPlayState = 'paused';
            });

            cube.addEventListener('mouseleave', () => {
                this.hideToolInfo(infoPanel);
                this.removeHighlights();
                cube.style.animationPlayState = 'running';
            });

            cube.addEventListener('click', () => {
                this.triggerToolEffect(cube);
            });
        });
    }

    showToolInfo(toolName, panel) {
        if (!panel) return;

        const toolDescriptions = {
            'PDF Tools': {
                description: 'Merge, split, compress and convert PDF documents with AI-powered processing.',
                features: ['Smart Merge', 'Auto Compress', 'OCR Extract']
            },
            'Image Editor': {
                description: 'Advanced image editing with AI enhancement and batch processing.',
                features: ['AI Enhance', 'Batch Process', 'Smart Crop']
            },
            'Financial Tools': {
                description: 'Comprehensive financial calculators and analysis tools.',
                features: ['EMI Calculator', 'Investment Analysis', 'Tax Planner']
            },
            'AI Content': {
                description: 'Generate and optimize content using advanced AI models.',
                features: ['Text Generation', 'Content Optimization', 'Translation']
            },
            'Utilities': {
                description: 'Essential productivity tools for everyday tasks.',
                features: ['QR Generator', 'URL Shortener', 'Password Gen']
            },
            'Converters': {
                description: 'Convert between various file formats and data types.',
                features: ['Multi-format', 'Batch Convert', 'Quality Preserve']
            }
        };

        const info = toolDescriptions[toolName];
        if (info) {
            panel.querySelector('.panel-title').textContent = toolName;
            panel.querySelector('.panel-description').textContent = info.description;
            
            const featuresContainer = panel.querySelector('.panel-features');
            featuresContainer.innerHTML = '';
            info.features.forEach(feature => {
                const tag = document.createElement('span');
                tag.className = 'feature-tag';
                tag.textContent = feature;
                featuresContainer.appendChild(tag);
            });
            
            panel.classList.add('active');
        }
    }

    hideToolInfo(panel) {
        if (panel) {
            panel.classList.remove('active');
        }
    }

    highlightConnections(cube) {
        const energyPaths = document.querySelectorAll('.energy-path');
        energyPaths.forEach(path => {
            path.style.stroke = '#4ecdc4';
            path.style.strokeWidth = '3';
            path.style.opacity = '1';
            path.style.filter = 'drop-shadow(0 0 10px #4ecdc4)';
        });

        const coreInner = document.querySelector('.core-inner');
        if (coreInner) {
            coreInner.style.boxShadow = '0 0 80px rgba(78, 205, 196, 1), inset 0 0 30px rgba(255, 255, 255, 0.3)';
        }
    }

    removeHighlights() {
        const energyPaths = document.querySelectorAll('.energy-path');
        energyPaths.forEach(path => {
            path.style.stroke = 'url(#energyGradient)';
            path.style.strokeWidth = '2';
            path.style.opacity = '0.6';
            path.style.filter = 'none';
        });

        const coreInner = document.querySelector('.core-inner');
        if (coreInner) {
            coreInner.style.boxShadow = '0 0 50px rgba(78, 205, 196, 0.8), inset 0 0 30px rgba(255, 255, 255, 0.2)';
        }
    }

    triggerToolEffect(cube) {
        // Create ripple effect
        const ripple = document.createElement('div');
        ripple.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            width: 0;
            height: 0;
            background: radial-gradient(circle, rgba(78, 205, 196, 0.6) 0%, transparent 70%);
            border-radius: 50%;
            transform: translate(-50%, -50%);
            pointer-events: none;
            z-index: 1000;
        `;
        
        cube.appendChild(ripple);

        // Animate ripple
        ripple.animate([
            { width: '0px', height: '0px', opacity: 1 },
            { width: '200px', height: '200px', opacity: 0 }
        ], {
            duration: 600,
            easing: 'ease-out'
        }).onfinish = () => ripple.remove();

        // Pulse effect
        cube.animate([
            { transform: 'scale(1)' },
            { transform: 'scale(1.3)' },
            { transform: 'scale(1)' }
        ], {
            duration: 400,
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
        });
    }

    setupMouseTracking() {
        document.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
        });
    }

    animate() {
        if (!this.ctx) return;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update and draw particles
        this.particles.forEach((particle, i) => {
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;

            // Bounce off edges
            if (particle.x < 0 || particle.x > this.canvas.width) particle.vx *= -1;
            if (particle.y < 0 || particle.y > this.canvas.height) particle.vy *= -1;

            // Mouse interaction
            const dx = this.mouse.x - particle.x;
            const dy = this.mouse.y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 100) {
                const force = (100 - distance) / 100;
                particle.vx += dx * force * 0.001;
                particle.vy += dy * force * 0.001;
            }

            // Draw particle
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = `hsla(${particle.hue}, 70%, 60%, ${particle.opacity})`;
            this.ctx.fill();

            // Draw connections
            this.particles.slice(i + 1).forEach(otherParticle => {
                const dx = particle.x - otherParticle.x;
                const dy = particle.y - otherParticle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 150) {
                    const opacity = (150 - distance) / 150 * 0.3;
                    this.ctx.beginPath();
                    this.ctx.moveTo(particle.x, particle.y);
                    this.ctx.lineTo(otherParticle.x, otherParticle.y);
                    this.ctx.strokeStyle = `hsla(${particle.hue}, 70%, 60%, ${opacity})`;
                    this.ctx.lineWidth = 1;
                    this.ctx.stroke();
                }
            });
        });

        this.animationId = requestAnimationFrame(() => this.animate());
    }

    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.startAnimations();
                } else {
                    this.pauseAnimations();
                }
            });
        }, { threshold: 0.1 });

        const heroContainer = document.querySelector('.hero-3d-container');
        if (heroContainer) {
            observer.observe(heroContainer);
        }
    }

    startAnimations() {
        if (!this.animationId) {
            this.animate();
        }
        
        // Resume CSS animations
        this.toolCubes.forEach(cube => {
            cube.style.animationPlayState = 'running';
        });
    }

    pauseAnimations() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        // Pause CSS animations for performance
        this.toolCubes.forEach(cube => {
            cube.style.animationPlayState = 'paused';
        });
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        // Clean up event listeners
        this.toolCubes.forEach(cube => {
            cube.replaceWith(cube.cloneNode(true));
        });
    }
}

// Enhanced Title Animation
class TitleAnimator {
    constructor() {
        this.init();
    }

    init() {
        const titleWords = document.querySelectorAll('.title-word');
        if (titleWords.length === 0) return;

        this.setupTypewriterEffect(titleWords);
        this.setupGlitchEffect();
    }

    setupTypewriterEffect(words) {
        words.forEach((word, index) => {
            const text = word.textContent;
            word.textContent = '';
            
            setTimeout(() => {
                this.typeText(word, text, 100);
            }, index * 500);
        });
    }

    typeText(element, text, speed) {
        let i = 0;
        const timer = setInterval(() => {
            element.textContent += text.charAt(i);
            i++;
            if (i >= text.length) {
                clearInterval(timer);
                this.addTextEffects(element);
            }
        }, speed);
    }

    addTextEffects(element) {
        // Add glow effect on completion
        element.style.textShadow = '0 0 20px rgba(78, 205, 196, 0.8)';
        
        setTimeout(() => {
            element.style.textShadow = '';
        }, 1000);
    }

    setupGlitchEffect() {
        const highlightWords = document.querySelectorAll('.highlight-3d');
        
        highlightWords.forEach(word => {
            setInterval(() => {
                if (Math.random() < 0.1) { // 10% chance
                    this.glitchWord(word);
                }
            }, 2000);
        });
    }

    glitchWord(element) {
        const originalText = element.textContent;
        const glitchChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
        
        // Create glitch effect
        let glitchText = '';
        for (let i = 0; i < originalText.length; i++) {
            if (Math.random() < 0.3) {
                glitchText += glitchChars[Math.floor(Math.random() * glitchChars.length)];
            } else {
                glitchText += originalText[i];
            }
        }
        
        element.textContent = glitchText;
        element.style.color = '#ff6b6b';
        
        setTimeout(() => {
            element.textContent = originalText;
            element.style.color = '';
        }, 100);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on the homepage with 3D hero
    if (document.querySelector('.hero-3d-container')) {
        new Hero3D();
        new TitleAnimator();
        
        // Add performance monitoring
        const hero3DContainer = document.querySelector('.hero-3d-container');
        if (hero3DContainer) {
            const perfObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    if (entry.duration > 16.67) { // More than 60fps
                        console.warn('Hero3D performance warning:', entry);
                    }
                });
            });
            
            if ('observe' in perfObserver) {
                perfObserver.observe({ entryTypes: ['measure'] });
            }
        }
    }
});

// Export for potential external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Hero3D, TitleAnimator };
}
