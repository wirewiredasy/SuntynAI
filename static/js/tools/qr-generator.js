class QRGenerator {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateInputGroups();
    }

    setupEventListeners() {
        const form = document.getElementById('qr-generator-form');
        const qrType = document.getElementById('qr-type');
        const sizeSlider = document.getElementById('qr-size');
        const sizeDisplay = document.getElementById('size-display');
        
        if (form) form.addEventListener('submit', (e) => this.handleSubmit(e));
        if (qrType) qrType.addEventListener('change', () => this.updateInputGroups());
        if (sizeSlider) {
            sizeSlider.addEventListener('input', (e) => {
                if (sizeDisplay) sizeDisplay.textContent = e.target.value + 'px';
            });
        }

        // Real-time preview
        this.setupPreviewListeners();
    }

    setupPreviewListeners() {
        const inputs = ['qr-text', 'qr-url', 'qr-phone', 'qr-email', 'wifi-ssid'];
        inputs.forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('input', () => this.generatePreview());
            }
        });
    }

    updateInputGroups() {
        const qrType = document.getElementById('qr-type')?.value || 'text';
        const groups = ['text-input-group', 'url-input-group', 'phone-input-group', 'email-input-group', 'wifi-input-group'];
        
        // Hide all groups
        groups.forEach(id => {
            const group = document.getElementById(id);
            if (group) group.style.display = 'none';
        });
        
        // Show relevant group
        const groupMap = {
            'text': 'text-input-group',
            'url': 'url-input-group',
            'phone': 'phone-input-group',
            'email': 'email-input-group',
            'wifi': 'wifi-input-group'
        };
        
        const targetGroup = document.getElementById(groupMap[qrType]);
        if (targetGroup) targetGroup.style.display = 'block';
        
        this.generatePreview();
    }

    getQRContent() {
        const qrType = document.getElementById('qr-type')?.value || 'text';
        
        switch (qrType) {
            case 'text':
                return document.getElementById('qr-text')?.value || '';
            case 'url':
                return document.getElementById('qr-url')?.value || '';
            case 'phone':
                const phone = document.getElementById('qr-phone')?.value || '';
                return phone ? `tel:${phone}` : '';
            case 'email':
                const email = document.getElementById('qr-email')?.value || '';
                const subject = document.getElementById('email-subject')?.value || '';
                const body = document.getElementById('email-body')?.value || '';
                if (!email) return '';
                let mailto = `mailto:${email}`;
                const params = [];
                if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
                if (body) params.push(`body=${encodeURIComponent(body)}`);
                if (params.length) mailto += '?' + params.join('&');
                return mailto;
            case 'wifi':
                const ssid = document.getElementById('wifi-ssid')?.value || '';
                const password = document.getElementById('wifi-password')?.value || '';
                const security = document.getElementById('wifi-security')?.value || 'WPA';
                if (!ssid) return '';
                return `WIFI:T:${security};S:${ssid};P:${password};;`;
            default:
                return '';
        }
    }

    generatePreview() {
        const content = this.getQRContent();
        const previewSection = document.getElementById('preview-section');
        const qrPreview = document.getElementById('qr-preview');
        
        if (!content || !qrPreview) {
            if (previewSection) previewSection.style.display = 'none';
            return;
        }
        
        try {
            // Generate QR code using qrcode.js library
            QRCode.toCanvas(content, {
                width: 200,
                margin: 2,
                color: {
                    dark: document.getElementById('qr-color')?.value || '#000000',
                    light: document.getElementById('qr-bg-color')?.value || '#ffffff'
                }
            }, (error, canvas) => {
                if (error) {
                    console.error('QR preview error:', error);
                    return;
                }
                
                qrPreview.innerHTML = '';
                qrPreview.appendChild(canvas);
                if (previewSection) previewSection.style.display = 'block';
            });
        } catch (error) {
            console.error('QR preview error:', error);
        }
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        const content = this.getQRContent();
        if (!content) {
            alert('Please enter content for the QR code');
            return;
        }
        
        await this.generateQRCode(content);
    }

    async generateQRCode(content) {
        const progressCard = document.getElementById('progress-card');
        const resultCard = document.getElementById('result-card');
        
        if (progressCard) progressCard.style.display = 'block';
        if (resultCard) resultCard.style.display = 'none';
        
        try {
            const formData = new FormData();
            formData.append('content', content);
            formData.append('size', document.getElementById('qr-size')?.value || 200);
            formData.append('color', document.getElementById('qr-color')?.value || '#000000');
            formData.append('bg_color', document.getElementById('qr-bg-color')?.value || '#ffffff');
            formData.append('format', document.getElementById('output-format')?.value || 'PNG');
            
            const response = await fetch('/api/tools/qr-generator', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (progressCard) progressCard.style.display = 'none';
            
            if (result.success) {
                this.showSuccess(result);
            } else {
                this.showError(result.error || 'QR generation failed');
            }
            
        } catch (error) {
            if (progressCard) progressCard.style.display = 'none';
            this.showError('Network error occurred');
        }
    }

    showSuccess(result) {
        const resultCard = document.getElementById('result-card');
        const successDiv = document.getElementById('success-result');
        const errorDiv = document.getElementById('error-result');
        const successMessage = document.getElementById('success-message');
        const downloadBtn = document.getElementById('download-btn');
        const resultPreview = document.getElementById('result-preview');
        
        if (resultCard) resultCard.style.display = 'block';
        if (successDiv) successDiv.style.display = 'block';
        if (errorDiv) errorDiv.style.display = 'none';
        
        if (successMessage) {
            successMessage.textContent = result.message || 'QR code generated successfully!';
        }
        
        if (downloadBtn && result.download_url) {
            downloadBtn.href = result.download_url;
            downloadBtn.style.display = 'inline-block';
        }
        
        if (resultPreview && result.qr_image) {
            resultPreview.innerHTML = `<img src="${result.qr_image}" class="img-fluid" style="max-width: 200px;">`;
        }
    }

    showError(message) {
        const resultCard = document.getElementById('result-card');
        const successDiv = document.getElementById('success-result');
        const errorDiv = document.getElementById('error-result');
        const errorMessage = document.getElementById('error-message');
        
        if (resultCard) resultCard.style.display = 'block';
        if (successDiv) successDiv.style.display = 'none';
        if (errorDiv) errorDiv.style.display = 'block';
        
        if (errorMessage) {
            errorMessage.textContent = message;
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new QRGenerator();
});