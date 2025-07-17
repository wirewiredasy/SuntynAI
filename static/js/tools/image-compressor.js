class ImageCompressor {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupDragDrop();
    }

    setupEventListeners() {
        const fileInput = document.getElementById('file-input');
        const form = document.getElementById('image-compressor-form');
        const qualitySlider = document.getElementById('quality-slider');
        const qualityValue = document.getElementById('quality-value');
        
        if (fileInput) fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        if (form) form.addEventListener('submit', (e) => this.handleSubmit(e));
        if (qualitySlider) {
            qualitySlider.addEventListener('input', (e) => {
                qualityValue.textContent = e.target.value + '%';
            });
        }
    }

    setupDragDrop() {
        const dropZone = document.getElementById('drop-zone');
        if (!dropZone) return;
        
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('border-primary', 'bg-light');
        });

        dropZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            dropZone.classList.remove('border-primary', 'bg-light');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('border-primary', 'bg-light');
            
            const files = Array.from(e.dataTransfer.files).filter(file => 
                file.type.startsWith('image/')
            );
            
            if (files.length > 0) {
                this.handleFiles(files);
            }
        });
    }

    handleFileSelect(e) {
        const files = Array.from(e.target.files);
        this.handleFiles(files);
    }

    handleFiles(files) {
        const file = files[0]; // Single file for now
        if (!file) return;

        this.showPreview(file);
        this.updateUI();
    }

    showPreview(file) {
        const preview = document.getElementById('image-preview');
        
        if (!preview) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            preview.innerHTML = `
                <div class="text-center">
                    <img src="${e.target.result}" class="img-fluid mb-3" style="max-height: 200px;">
                    <p class="text-muted">File: ${file.name} (${this.formatFileSize(file.size)})</p>
                </div>
            `;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }

    updateUI() {
        const settingsDiv = document.getElementById('compression-settings');
        const compressBtn = document.getElementById('compress-btn');
        
        if (settingsDiv) settingsDiv.style.display = 'block';
        if (compressBtn) compressBtn.disabled = false;
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        const fileInput = document.getElementById('file-input');
        if (!fileInput.files.length) {
            alert('Please select an image file first');
            return;
        }
        
        await this.compressImage(fileInput.files[0]);
    }

    async compressImage(file) {
        const progressCard = document.getElementById('progress-card');
        const resultCard = document.getElementById('result-card');
        
        if (progressCard) progressCard.style.display = 'block';
        if (resultCard) resultCard.style.display = 'none';
        
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('quality', document.getElementById('quality-slider')?.value || 80);
            formData.append('output_format', document.getElementById('output-format')?.value || 'original');
            formData.append('max_width', document.getElementById('max-width')?.value || '');
            formData.append('max_height', document.getElementById('max-height')?.value || '');
            
            const response = await fetch('/api/tools/image-compressor', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (progressCard) progressCard.style.display = 'none';
            
            if (result.success) {
                this.showSuccess(result);
            } else {
                this.showError(result.error || 'Compression failed');
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
        const comparisonDiv = document.getElementById('compression-comparison');
        
        if (resultCard) resultCard.style.display = 'block';
        if (successDiv) successDiv.style.display = 'block';
        if (errorDiv) errorDiv.style.display = 'none';
        
        if (successMessage) {
            successMessage.textContent = result.message;
        }
        
        if (downloadBtn && result.download_url) {
            downloadBtn.href = result.download_url;
            downloadBtn.style.display = 'inline-block';
        }
        
        if (comparisonDiv && result.original_size && result.compressed_size) {
            comparisonDiv.innerHTML = `
                <div class="row text-center">
                    <div class="col-6">
                        <small class="text-muted">Original</small>
                        <div class="fw-medium">${this.formatFileSize(result.original_size)}</div>
                    </div>
                    <div class="col-6">
                        <small class="text-muted">Compressed</small>
                        <div class="fw-medium text-success">${this.formatFileSize(result.compressed_size)}</div>
                    </div>
                </div>
                <div class="text-center mt-2">
                    <span class="badge bg-success">${result.compression_ratio}% reduction</span>
                </div>
            `;
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

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ImageCompressor();
});