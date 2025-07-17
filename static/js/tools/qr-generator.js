// QR Code Generator Tool - JavaScript
// Handles QR code generation with customization options and collaboration

class QRGenerator {
    constructor() {
        this.currentQRCode = null;
        this.qrSettings = {
            type: 'text',
            size: 10,
            border: 4,
            fillColor: '#000000',
            backColor: '#ffffff'
        };
        this.isGenerating = false;
        this.collaborationRoom = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupCollaboration();
        this.initializeFormFields();
        console.log('📱 QR Generator initialized');
    }

    setupEventListeners() {
        const form = document.getElementById('qr-generator-form');
        const typeSelect = document.getElementById('qr-type');
        const sizeSlider = document.getElementById('size');
        const borderSlider = document.getElementById('border');
        const fillColorInput = document.getElementById('fill-color');
        const backColorInput = document.getElementById('back-color');

        // Form submission
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.generateQR();
            });
        }

        // QR type change
        if (typeSelect) {
            typeSelect.addEventListener('change', (e) => {
                this.handleTypeChange(e.target.value);
            });
        }

        // Settings changes
        if (sizeSlider) {
            sizeSlider.addEventListener('input', (e) => {
                this.updateSize(e.target.value);
            });
        }

        if (borderSlider) {
            borderSlider.addEventListener('input', (e) => {
                this.updateBorder(e.target.value);
            });
        }

        if (fillColorInput) {
            fillColorInput.addEventListener('change', (e) => {
                this.updateFillColor(e.target.value);
            });
        }

        if (backColorInput) {
            backColorInput.addEventListener('change', (e) => {
                this.updateBackColor(e.target.value);
            });
        }

        // Real-time content updates
        this.setupContentListeners();

        // Collaboration events
        document.addEventListener('collaborationUpdate', (e) => {
            this.handleCollaborationUpdate(e.detail);
        });
    }

    setupContentListeners() {
        const contentInputs = document.querySelectorAll('#content-fields input, #content-fields textarea, #content-fields select');
        
        contentInputs.forEach(input => {
            input.addEventListener('input', () => {
                this.debouncedPreview();
            });
        });
    }

    setupCollaboration() {
        // Setup collaboration room
        this.collaborationRoom = `qr-generator-${Date.now()}`;
        
        // Join collaboration room if WebSocket is available
        if (window.wsClient && window.wsClient.isConnected()) {
            window.wsClient.joinRoom(this.collaborationRoom, 'qr-generator');
        }
    }

    initializeFormFields() {
        // Initialize sliders
        const sizeSlider = document.getElementById('size');
        const borderSlider = document.getElementById('border');
        
        if (sizeSlider) {
            document.getElementById('size-value').textContent = sizeSlider.value;
        }
        
        if (borderSlider) {
            document.getElementById('border-value').textContent = borderSlider.value;
        }

        // Show default content field
        this.handleTypeChange('text');
    }

    handleTypeChange(type) {
        this.qrSettings.type = type;
        
        // Hide all content fields
        document.querySelectorAll('.content-field').forEach(field => {
            field.style.display = 'none';
        });
        
        // Show selected content field
        const selectedField = document.getElementById(`${type}-field`);
        if (selectedField) {
            selectedField.style.display = 'block';
        }
        
        this.broadcastSettingsUpdate();
    }

    updateSize(value) {
        this.qrSettings.size = parseInt(value);
        document.getElementById('size-value').textContent = value;
        this.broadcastSettingsUpdate();
    }

    updateBorder(value) {
        this.qrSettings.border = parseInt(value);
        document.getElementById('border-value').textContent = value;
        this.broadcastSettingsUpdate();
    }

    updateFillColor(color) {
        this.qrSettings.fillColor = color;
        this.broadcastSettingsUpdate();
    }

    updateBackColor(color) {
        this.qrSettings.backColor = color;
        this.broadcastSettingsUpdate();
    }

    // Debounced preview generation
    debouncedPreview = this.debounce(() => {
        const content = this.getContentFromForm();
        if (content) {
            this.generatePreview(content);
        }
    }, 500);

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    getContentFromForm() {
        const type = this.qrSettings.type;
        let content = '';

        switch (type) {
            case 'text':
                content = document.getElementById('text-content')?.value || '';
                break;
            case 'url':
                content = document.getElementById('url-content')?.value || '';
                break;
            case 'email':
                const email = document.getElementById('email-content')?.value || '';
                const subject = document.getElementById('email-subject')?.value || '';
                content = `mailto:${email}${subject ? `?subject=${encodeURIComponent(subject)}` : ''}`;
                break;
            case 'phone':
                const phone = document.getElementById('phone-content')?.value || '';
                content = `tel:${phone}`;
                break;
            case 'sms':
                const smsPhone = document.getElementById('sms-phone')?.value || '';
                const smsMessage = document.getElementById('sms-message')?.value || '';
                content = `sms:${smsPhone}${smsMessage ? `?body=${encodeURIComponent(smsMessage)}` : ''}`;
                break;
            case 'wifi':
                const ssid = document.getElementById('wifi-ssid')?.value || '';
                const password = document.getElementById('wifi-password')?.value || '';
                const security = document.getElementById('wifi-security')?.value || 'WPA';
                content = `WIFI:T:${security};S:${ssid};P:${password};;`;
                break;
            case 'vcard':
                const name = document.getElementById('vcard-name')?.value || '';
                const vcardPhone = document.getElementById('vcard-phone')?.value || '';
                const vcardEmail = document.getElementById('vcard-email')?.value || '';
                const org = document.getElementById('vcard-org')?.value || '';
                content = `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nTEL:${vcardPhone}\nEMAIL:${vcardEmail}\nORG:${org}\nEND:VCARD`;
                break;
        }

        return content;
    }

    generatePreview(content) {
        if (!content) return;

        // Simple preview generation (would normally use a QR library)
        const previewContainer = document.getElementById('qr-preview-container');
        if (previewContainer) {
            previewContainer.innerHTML = `
                <div class="qr-preview-placeholder">
                    <div class="border" style="width: ${this.qrSettings.size * 20}px; height: ${this.qrSettings.size * 20}px; background: ${this.qrSettings.backColor}; border: ${this.qrSettings.border * 2}px solid ${this.qrSettings.backColor}; display: flex; align-items: center; justify-content: center;">
                        <div style="width: 80%; height: 80%; background: ${this.qrSettings.fillColor}; display: flex; align-items: center; justify-content: center; color: ${this.qrSettings.backColor};">
                            <i class="ti ti-qrcode fs-4"></i>
                        </div>
                    </div>
                    <small class="text-muted mt-2 d-block">Preview: ${type} QR Code</small>
                </div>
            `;
        }
    }

    async generateQR() {
        if (this.isGenerating) return;

        const content = this.getContentFromForm();
        if (!content) {
            this.showError('Please enter content for the QR code');
            return;
        }

        this.isGenerating = true;
        this.updateGenerateButton();

        try {
            const formData = new FormData();
            formData.append('text', content);
            formData.append('size', this.qrSettings.size);
            formData.append('border', this.qrSettings.border);
            formData.append('fill_color', this.qrSettings.fillColor);
            formData.append('back_color', this.qrSettings.backColor);

            const response = await fetch('/api/tools/qr-generator', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                this.showSuccess(result.results);
                this.broadcastGenerationComplete(result.results);
            } else {
                this.showError(result.error || 'Failed to generate QR code');
            }
        } catch (error) {
            console.error('QR generation error:', error);
            this.showError('Network error occurred while generating QR code');
        } finally {
            this.isGenerating = false;
            this.updateGenerateButton();
        }
    }

    updateGenerateButton() {
        const generateBtn = document.querySelector('button[type="submit"]');
        if (generateBtn) {
            generateBtn.disabled = this.isGenerating;
            generateBtn.innerHTML = this.isGenerating ? 
                '<div class="loading-spinner me-2"></div> Generating...' : 
                '<i class="ti ti-qrcode"></i> Generate QR Code';
        }
    }

    showSuccess(results) {
        const resultCard = document.getElementById('result-card');
        const successResult = document.getElementById('success-result');
        const generatedQR = document.getElementById('generated-qr');
        const qrTypeDisplay = document.getElementById('qr-type-display');
        const qrSizeDisplay = document.getElementById('qr-size-display');

        if (resultCard && successResult) {
            resultCard.style.display = 'block';
            successResult.style.display = 'block';

            if (generatedQR && results.qr_code) {
                generatedQR.src = results.qr_code;
                this.currentQRCode = results.qr_code;
            }

            if (qrTypeDisplay) {
                qrTypeDisplay.textContent = this.qrSettings.type.toUpperCase();
            }

            if (qrSizeDisplay) {
                qrSizeDisplay.textContent = `${this.qrSettings.size}x${this.qrSettings.size}`;
            }
        }
    }

    showError(message) {
        const resultCard = document.getElementById('result-card');
        const errorResult = document.getElementById('error-result');
        const errorMessage = document.getElementById('error-message');

        if (resultCard && errorResult) {
            resultCard.style.display = 'block';
            errorResult.style.display = 'block';

            if (errorMessage) {
                errorMessage.textContent = message;
            }
        }

        if (window.app) {
            window.app.showNotification(message, 'error');
        }
    }

    // Export functions
    downloadQR() {
        if (!this.currentQRCode) {
            this.showError('No QR code to download');
            return;
        }

        const link = document.createElement('a');
        link.href = this.currentQRCode;
        link.download = `qr-code-${this.qrSettings.type}-${Date.now()}.png`;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    async copyQRToClipboard() {
        if (!this.currentQRCode) {
            this.showError('No QR code to copy');
            return;
        }

        try {
            // Convert data URL to blob
            const response = await fetch(this.currentQRCode);
            const blob = await response.blob();

            // Copy to clipboard
            await navigator.clipboard.write([
                new ClipboardItem({
                    [blob.type]: blob
                })
            ]);

            if (window.app) {
                window.app.showNotification('QR code copied to clipboard!', 'success');
            }
        } catch (error) {
            console.error('Copy to clipboard failed:', error);
            if (window.app) {
                window.app.showNotification('Failed to copy QR code', 'error');
            }
        }
    }

    // Collaboration methods
    broadcastSettingsUpdate() {
        if (window.wsClient && window.wsClient.isConnected()) {
            window.wsClient.sendUpdate({
                type: 'settings-update',
                settings: this.qrSettings
            });
        }
    }

    broadcastGenerationComplete(results) {
        if (window.wsClient && window.wsClient.isConnected()) {
            window.wsClient.sendUpdate({
                type: 'generation-complete',
                results: results
            });
        }
    }

    handleCollaborationUpdate(data) {
        switch (data.type) {
            case 'settings-update':
                this.handleRemoteSettingsUpdate(data.settings);
                break;
            case 'generation-complete':
                this.handleRemoteGenerationComplete(data.results);
                break;
        }
    }

    handleRemoteSettingsUpdate(settings) {
        // Update UI to reflect collaborator's settings
        const sizeSlider = document.getElementById('size');
        const borderSlider = document.getElementById('border');
        const fillColorInput = document.getElementById('fill-color');
        const backColorInput = document.getElementById('back-color');

        if (sizeSlider && settings.size) {
            sizeSlider.value = settings.size;
            document.getElementById('size-value').textContent = settings.size;
        }

        if (borderSlider && settings.border) {
            borderSlider.value = settings.border;
            document.getElementById('border-value').textContent = settings.border;
        }

        if (fillColorInput && settings.fillColor) {
            fillColorInput.value = settings.fillColor;
        }

        if (backColorInput && settings.backColor) {
            backColorInput.value = settings.backColor;
        }
    }

    handleRemoteGenerationComplete(results) {
        if (window.app) {
            window.app.showNotification(`${data.username} generated a QR code`, 'success');
        }
    }

    // Public API
    reset() {
        this.currentQRCode = null;
        
        // Reset form
        const form = document.getElementById('qr-generator-form');
        if (form) {
            form.reset();
        }

        // Reset settings
        this.qrSettings = {
            type: 'text',
            size: 10,
            border: 4,
            fillColor: '#000000',
            backColor: '#ffffff'
        };

        // Hide result cards
        const resultCard = document.getElementById('result-card');
        if (resultCard) {
            resultCard.style.display = 'none';
        }

        // Reset preview
        const previewContainer = document.getElementById('qr-preview-container');
        if (previewContainer) {
            previewContainer.innerHTML = `
                <div class="text-muted">
                    <i class="ti ti-qrcode fs-1"></i>
                    <p>QR Code preview will appear here</p>
                </div>
            `;
        }

        this.initializeFormFields();
    }

    getSettings() {
        return this.qrSettings;
    }

    getCurrentQRCode() {
        return this.currentQRCode;
    }

    isReady() {
        return !this.isGenerating;
    }
}

// Global functions for UI interactions
function downloadQR() {
    if (window.qrGenerator) {
        window.qrGenerator.downloadQR();
    }
}

function copyQRToClipboard() {
    if (window.qrGenerator) {
        window.qrGenerator.copyQRToClipboard();
    }
}

// Initialize QR generator
const qrGenerator = new QRGenerator();

// Export for global access
window.QRGenerator = QRGenerator;
window.qrGenerator = qrGenerator;
