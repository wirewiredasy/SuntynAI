// Image Compressor Tool - JavaScript
// Handles image compression with real-time preview and collaboration

class ImageCompressor {
    constructor() {
        this.originalImage = null;
        this.compressedImage = null;
        this.canvas = null;
        this.ctx = null;
        this.isProcessing = false;
        this.currentSettings = {
            quality: 85,
            format: 'JPEG',
            optimize: true,
            progressive: false
        };
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupCanvas();
        this.setupCollaboration();
        console.log('🖼️ Image Compressor initialized');
    }

    setupEventListeners() {
        const form = document.getElementById('image-compressor-form');
        const fileInput = document.getElementById('file-input');
        const dropZone = document.getElementById('drop-zone');
        const qualitySlider = document.getElementById('quality');
        const formatSelect = document.getElementById('format');
        const optimizeCheck = document.getElementById('optimize');
        const progressiveCheck = document.getElementById('progressive');

        // Form submission
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleCompression();
            });
        }

        // File input change
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                this.handleFileSelection(e.target.files[0]);
            });
        }

        // Drop zone events
        if (dropZone) {
            dropZone.addEventListener('dragover', (e) => {
                e.preventDefault();
                dropZone.classList.add('dragover');
            });

            dropZone.addEventListener('dragleave', (e) => {
                e.preventDefault();
                dropZone.classList.remove('dragover');
            });

            dropZone.addEventListener('drop', (e) => {
                e.preventDefault();
                dropZone.classList.remove('dragover');
                if (e.dataTransfer.files.length > 0) {
                    this.handleFileSelection(e.dataTransfer.files[0]);
                }
            });
        }

        // Settings changes
        if (qualitySlider) {
            qualitySlider.addEventListener('input', (e) => {
                this.updateQuality(e.target.value);
            });
        }

        if (formatSelect) {
            formatSelect.addEventListener('change', (e) => {
                this.updateFormat(e.target.value);
            });
        }

        if (optimizeCheck) {
            optimizeCheck.addEventListener('change', (e) => {
                this.updateOptimize(e.target.checked);
            });
        }

        if (progressiveCheck) {
            progressiveCheck.addEventListener('change', (e) => {
                this.updateProgressive(e.target.checked);
            });
        }

        // Collaboration events
        document.addEventListener('collaborationUpdate', (e) => {
            this.handleCollaborationUpdate(e.detail);
        });
    }

    setupCanvas() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
    }

    setupCollaboration() {
        // Setup collaboration room
        this.collaborationRoom = `image-compressor-${Date.now()}`;
        
        // Join collaboration room if WebSocket is available
        if (window.wsClient && window.wsClient.isConnected()) {
            window.wsClient.joinRoom(this.collaborationRoom, 'image-compressor');
        }
    }

    handleFileSelection(file) {
        if (!file) return;

        if (!this.isValidImageFile(file)) {
            this.showError('Please select a valid image file (JPG, PNG, WebP, BMP)');
            return;
        }

        this.loadImage(file);
    }

    isValidImageFile(file) {
        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/bmp'];
        return validTypes.includes(file.type);
    }

    loadImage(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.originalImage = {
                    file: file,
                    element: img,
                    size: file.size,
                    width: img.width,
                    height: img.height
                };
                this.displayOriginalImage();
                this.enableCompression();
                this.generatePreview();
                this.broadcastImageUpdate();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    displayOriginalImage() {
        const originalImageEl = document.getElementById('original-image');
        const originalSize = document.getElementById('original-size');
        const originalDimensions = document.getElementById('original-dimensions');
        const imagePreview = document.getElementById('image-preview');
        
        if (originalImageEl && this.originalImage) {
            originalImageEl.src = this.originalImage.element.src;
            originalImageEl.style.display = 'block';
            
            if (originalSize) {
                originalSize.textContent = this.formatFileSize(this.originalImage.size);
            }
            
            if (originalDimensions) {
                originalDimensions.textContent = `${this.originalImage.width}x${this.originalImage.height}`;
            }
            
            if (imagePreview) {
                imagePreview.style.display = 'block';
            }
        }
    }

    enableCompression() {
        const compressBtn = document.getElementById('compress-btn');
        const compressionOptions = document.querySelector('.compression-options');
        
        if (compressBtn) {
            compressBtn.disabled = false;
        }
        
        if (compressionOptions) {
            compressionOptions.style.display = 'block';
        }
    }

    updateQuality(value) {
        this.currentSettings.quality = parseInt(value);
        document.getElementById('quality-value').textContent = value;
        this.generatePreview();
        this.broadcastSettingsUpdate();
    }

    updateFormat(value) {
        this.currentSettings.format = value;
        this.generatePreview();
        this.broadcastSettingsUpdate();
    }

    updateOptimize(value) {
        this.currentSettings.optimize = value;
        this.generatePreview();
        this.broadcastSettingsUpdate();
    }

    updateProgressive(value) {
        this.currentSettings.progressive = value;
        this.generatePreview();
        this.broadcastSettingsUpdate();
    }

    generatePreview() {
        if (!this.originalImage) return;

        const img = this.originalImage.element;
        this.canvas.width = img.width;
        this.canvas.height = img.height;
        
        this.ctx.drawImage(img, 0, 0);
        
        const format = this.currentSettings.format === 'JPEG' ? 'image/jpeg' : 
                      this.currentSettings.format === 'PNG' ? 'image/png' : 'image/webp';
        
        const quality = this.currentSettings.quality / 100;
        const compressedDataUrl = this.canvas.toDataURL(format, quality);
        
        this.displayCompressedPreview(compressedDataUrl);
    }

    displayCompressedPreview(dataUrl) {
        const compressedImage = document.getElementById('compressed-image');
        const placeholder = document.querySelector('.placeholder-preview');
        
        if (compressedImage && placeholder) {
            compressedImage.src = dataUrl;
            compressedImage.style.display = 'block';
            placeholder.style.display = 'none';
            
            // Calculate compressed size (approximate)
            const compressedSize = this.calculateDataUrlSize(dataUrl);
            this.updateCompressionStats(compressedSize);
        }
    }

    calculateDataUrlSize(dataUrl) {
        // Remove data URL prefix and calculate base64 size
        const base64Data = dataUrl.split(',')[1];
        return Math.round(base64Data.length * 0.75);
    }

    updateCompressionStats(compressedSize) {
        const compressedSizeEl = document.getElementById('compressed-size');
        const sizeReduction = document.getElementById('size-reduction');
        
        if (compressedSizeEl) {
            compressedSizeEl.textContent = this.formatFileSize(compressedSize);
        }
        
        if (sizeReduction && this.originalImage) {
            const reduction = ((this.originalImage.size - compressedSize) / this.originalImage.size) * 100;
            sizeReduction.textContent = `${reduction.toFixed(1)}%`;
        }
    }

    async handleCompression() {
        if (!this.originalImage) {
            this.showError('Please select an image first');
            return;
        }

        this.isProcessing = true;
        this.showProgress('Compressing image...', 0);

        try {
            const formData = new FormData();
            formData.append('file', this.originalImage.file);
            formData.append('quality', this.currentSettings.quality);
            formData.append('format', this.currentSettings.format);
            formData.append('optimize', this.currentSettings.optimize);
            formData.append('progressive', this.currentSettings.progressive);

            this.showProgress('Processing...', 50);

            const response = await fetch('/api/tools/image-compressor', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                this.showProgress('Compression completed!', 100);
                this.showSuccess(result);
                this.broadcastCompressionComplete(result);
            } else {
                this.showError(result.error || 'Failed to compress image');
            }
        } catch (error) {
            console.error('Compression error:', error);
            this.showError('Network error occurred while compressing image');
        } finally {
            this.isProcessing = false;
            this.hideProgress();
        }
    }

    showProgress(message, percentage) {
        const progressCard = document.getElementById('progress-card');
        const progressBar = progressCard?.querySelector('.progress-bar');
        const progressText = progressCard?.querySelector('#progress-text');
        
        if (progressCard) {
            progressCard.style.display = 'block';
            if (progressBar) progressBar.style.width = percentage + '%';
            if (progressText) progressText.textContent = message;
        }

        // Broadcast progress to collaborators
        if (window.wsClient) {
            window.wsClient.sendProgress(percentage, message);
        }
    }

    hideProgress() {
        const progressCard = document.getElementById('progress-card');
        if (progressCard) {
            progressCard.style.display = 'none';
        }
    }

    showSuccess(result) {
        const resultCard = document.getElementById('result-card');
        const successResult = document.getElementById('success-result');
        const downloadBtn = document.getElementById('download-btn');
        
        // Update stats
        const finalSize = document.getElementById('final-size');
        const sizeSaved = document.getElementById('size-saved');
        const compressionRatio = document.getElementById('compression-ratio');
        
        if (resultCard && successResult) {
            resultCard.style.display = 'block';
            successResult.style.display = 'block';
            
            if (finalSize) {
                finalSize.textContent = this.formatFileSize(result.compressed_size);
            }
            
            if (sizeSaved && result.original_size) {
                const saved = result.original_size - result.compressed_size;
                sizeSaved.textContent = this.formatFileSize(saved);
            }
            
            if (compressionRatio) {
                compressionRatio.textContent = `${result.compression_ratio}%`;
            }
            
            if (downloadBtn && result.download_url) {
                downloadBtn.href = result.download_url;
                downloadBtn.onclick = () => this.downloadFile(result.download_url, result.output_file);
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

    downloadFile(url, filename) {
        const a = document.createElement('a');
        a.href = url;
        a.download = filename || 'compressed-image.jpg';
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Collaboration methods
    broadcastImageUpdate() {
        if (window.wsClient && window.wsClient.isConnected()) {
            window.wsClient.sendUpdate({
                type: 'image-update',
                image: {
                    name: this.originalImage.file.name,
                    size: this.originalImage.size,
                    dimensions: `${this.originalImage.width}x${this.originalImage.height}`
                }
            });
        }
    }

    broadcastSettingsUpdate() {
        if (window.wsClient && window.wsClient.isConnected()) {
            window.wsClient.sendUpdate({
                type: 'settings-update',
                settings: this.currentSettings
            });
        }
    }

    broadcastCompressionComplete(result) {
        if (window.wsClient && window.wsClient.isConnected()) {
            window.wsClient.sendUpdate({
                type: 'compression-complete',
                result: result
            });
        }
    }

    handleCollaborationUpdate(data) {
        switch (data.type) {
            case 'image-update':
                this.handleRemoteImageUpdate(data.image);
                break;
            case 'settings-update':
                this.handleRemoteSettingsUpdate(data.settings);
                break;
            case 'compression-complete':
                this.handleRemoteCompressionComplete(data.result);
                break;
        }
    }

    handleRemoteImageUpdate(image) {
        if (window.app) {
            window.app.showNotification(`${data.username} uploaded: ${image.name}`, 'info');
        }
    }

    handleRemoteSettingsUpdate(settings) {
        // Update UI to reflect collaborator's settings
        const qualitySlider = document.getElementById('quality');
        const formatSelect = document.getElementById('format');
        
        if (qualitySlider && settings.quality) {
            qualitySlider.value = settings.quality;
            document.getElementById('quality-value').textContent = settings.quality;
        }
        
        if (formatSelect && settings.format) {
            formatSelect.value = settings.format;
        }
    }

    handleRemoteCompressionComplete(result) {
        if (window.app) {
            window.app.showNotification(`${data.username} completed compression`, 'success');
        }
    }

    // Public API
    reset() {
        this.originalImage = null;
        this.compressedImage = null;
        
        // Reset UI
        const imagePreview = document.getElementById('image-preview');
        const compressionOptions = document.querySelector('.compression-options');
        const resultCard = document.getElementById('result-card');
        
        if (imagePreview) imagePreview.style.display = 'none';
        if (compressionOptions) compressionOptions.style.display = 'none';
        if (resultCard) resultCard.style.display = 'none';
        
        // Reset settings
        this.currentSettings = {
            quality: 85,
            format: 'JPEG',
            optimize: true,
            progressive: false
        };
    }

    getSettings() {
        return this.currentSettings;
    }

    hasImage() {
        return this.originalImage !== null;
    }

    isReady() {
        return this.hasImage() && !this.isProcessing;
    }
}

// Initialize image compressor
const imageCompressor = new ImageCompressor();

// Export for global access
window.ImageCompressor = ImageCompressor;
window.imageCompressor = imageCompressor;
