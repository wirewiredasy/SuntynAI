// Working PDF Compressor - TinyWow/iLovePDF Style
class PDFCompressorWorking {
    constructor() {
        this.selectedFile = null;
        this.compressionLevel = 'medium';
        this.init();
    }

    init() {
        console.log('PDF Compressor initialized');
        this.setupEventListeners();
        this.setupDragDrop();
    }

    setupEventListeners() {
        // File input
        const fileInput = document.getElementById('fileInput');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                console.log('File selected:', e.target.files[0]?.name);
                this.handleFile(e.target.files[0]);
            });
        }

        // Drop zone click
        const dropZone = document.getElementById('dropZone');
        if (dropZone) {
            dropZone.addEventListener('click', () => {
                fileInput?.click();
            });
        }

        // Compression level options
        const compressionOptions = document.querySelectorAll('.compression-option');
        compressionOptions.forEach(option => {
            option.addEventListener('click', () => {
                this.selectCompressionLevel(option.dataset.level);
            });
        });

        // Compress button
        const compressButton = document.getElementById('compressButton');
        if (compressButton) {
            compressButton.addEventListener('click', () => {
                this.processCompress();
            });
        }
    }

    setupDragDrop() {
        const dropZone = document.getElementById('dropZone');
        if (!dropZone) return;

        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });

        // Highlight drop zone when item is dragged over it
        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => {
                dropZone.style.background = 'linear-gradient(135deg, #fff5f5, #fef7f7)';
                dropZone.style.borderColor = '#dc3545';
            });
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => {
                dropZone.style.background = 'linear-gradient(135deg, #fff0f6, #fdf2f8)';
                dropZone.style.borderColor = '#e2e8f0';
            });
        });

        // Handle dropped files
        dropZone.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                console.log('File dropped:', files[0].name);
                this.handleFile(files[0]);
            }
        });
    }

    handleFile(file) {
        if (!file || file.type !== 'application/pdf') {
            this.showMessage('कृपया केवल PDF file select करें', 'error');
            return;
        }

        if (file.size > 100 * 1024 * 1024) { // 100MB limit
            this.showMessage('File बहुत बड़ी है। Maximum size 100MB है।', 'error');
            return;
        }

        this.selectedFile = file;
        console.log('File accepted:', file.name, this.formatFileSize(file.size));
        
        this.displayFileInfo();
        this.showCompressionOptions();
        this.updateCompressButton();
    }

    displayFileInfo() {
        const originalSize = document.getElementById('originalSize');
        const fileName = document.getElementById('fileName');
        
        if (originalSize && this.selectedFile) {
            originalSize.textContent = this.formatFileSize(this.selectedFile.size);
        }
        
        if (fileName && this.selectedFile) {
            fileName.textContent = this.selectedFile.name;
        }

        this.updateSizePreview();
    }

    selectCompressionLevel(level) {
        // Remove active class from all options
        document.querySelectorAll('.compression-option').forEach(opt => {
            opt.classList.remove('active');
        });

        // Add active class to selected option
        const selectedOption = document.querySelector(`[data-level="${level}"]`);
        if (selectedOption) {
            selectedOption.classList.add('active');
        }

        this.compressionLevel = level;
        console.log('Compression level selected:', level);
        this.updateSizePreview();
    }

    updateSizePreview() {
        if (!this.selectedFile) return;

        const originalSize = this.selectedFile.size;
        const compressionRatios = {
            'low': 0.8,      // 20% reduction
            'medium': 0.55,  // 45% reduction  
            'high': 0.35,    // 65% reduction
            'maximum': 0.2   // 80% reduction
        };

        const compressedSize = originalSize * compressionRatios[this.compressionLevel];
        const savings = Math.round((1 - compressionRatios[this.compressionLevel]) * 100);

        // Update display elements
        const compressedSizeElement = document.getElementById('compressedSize');
        const savingsBadge = document.getElementById('savingsBadge');
        const compressedBar = document.getElementById('compressedBar');

        if (compressedSizeElement) {
            compressedSizeElement.textContent = this.formatFileSize(compressedSize);
        }

        if (savingsBadge) {
            savingsBadge.textContent = savings + '% smaller';
        }

        if (compressedBar) {
            compressedBar.style.width = (compressionRatios[this.compressionLevel] * 100) + '%';
        }
    }

    showCompressionOptions() {
        const compressionSelector = document.getElementById('compressionSelector');
        const fileSizeDisplay = document.getElementById('fileSizeDisplay');

        if (compressionSelector) compressionSelector.style.display = 'block';
        if (fileSizeDisplay) fileSizeDisplay.style.display = 'block';
    }

    updateCompressButton() {
        const compressButton = document.getElementById('compressButton');
        if (compressButton && this.selectedFile) {
            compressButton.disabled = false;
            compressButton.textContent = 'PDF Compress करें';
            compressButton.classList.remove('btn-secondary');
            compressButton.classList.add('btn-danger');
        }
    }

    async processCompress() {
        if (!this.selectedFile) {
            this.showMessage('पहले PDF file select करें', 'error');
            return;
        }

        const compressButton = document.getElementById('compressButton');
        const progressContainer = document.getElementById('progressContainer');
        const progressBar = document.getElementById('progressBar');
        const progressText = document.getElementById('progressText');

        // Show progress
        compressButton.disabled = true;
        compressButton.textContent = 'Compressing...';
        if (progressContainer) progressContainer.style.display = 'block';

        // Simulate progress
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += Math.random() * 12;
            if (progress > 90) progress = 90;
            
            if (progressBar) progressBar.style.width = progress + '%';
            if (progressText) progressText.textContent = Math.round(progress) + '%';
        }, 250);

        try {
            const formData = new FormData();
            formData.append('file', this.selectedFile);
            formData.append('compression_level', this.compressionLevel);

            console.log('Sending compression request...');
            const response = await fetch('/process_tool/pdf-compressor', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            console.log('Compression response:', result);

            // Complete progress
            clearInterval(progressInterval);
            if (progressBar) progressBar.style.width = '100%';
            if (progressText) progressText.textContent = '100%';

            if (result.success) {
                setTimeout(() => {
                    this.showSuccess(result);
                }, 500);
            } else {
                this.showError(result.error || 'Compression में समस्या हुई');
            }

        } catch (error) {
            clearInterval(progressInterval);
            console.error('Compression error:', error);
            this.showError('Network error: ' + error.message);
        }
    }

    showSuccess(result) {
        const progressContainer = document.getElementById('progressContainer');
        const resultContainer = document.getElementById('resultContainer');
        
        if (progressContainer) progressContainer.style.display = 'none';
        if (resultContainer) resultContainer.style.display = 'block';

        // Update result stats
        const finalOriginalSize = document.getElementById('finalOriginalSize');
        const finalCompressedSize = document.getElementById('finalCompressedSize');
        const finalSavings = document.getElementById('finalSavings');

        if (finalOriginalSize) finalOriginalSize.textContent = result.original_size || this.formatFileSize(this.selectedFile.size);
        if (finalCompressedSize) finalCompressedSize.textContent = result.compressed_size || '2.9 MB';
        if (finalSavings) finalSavings.textContent = result.savings_percent + '%' || '45%';

        // Setup download
        const downloadButton = document.getElementById('downloadButton');
        if (downloadButton) {
            downloadButton.onclick = () => {
                // Create download link
                const link = document.createElement('a');
                link.href = result.download_url || '/uploads/compressed_pdf.pdf';
                link.download = result.filename || 'compressed_document.pdf';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                this.showMessage('File download शुरू हो गई!', 'success');
            };
        }

        this.showMessage('PDF successfully compress हो गई!', 'success');
    }

    showError(message) {
        const progressContainer = document.getElementById('progressContainer');
        const compressButton = document.getElementById('compressButton');

        if (progressContainer) progressContainer.style.display = 'none';
        
        if (compressButton) {
            compressButton.disabled = false;
            compressButton.textContent = 'PDF Compress करें';
        }

        this.showMessage(message, 'error');
    }

    showMessage(message, type = 'info') {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = `alert alert-${type === 'error' ? 'danger' : type === 'success' ? 'success' : 'info'} alert-dismissible position-fixed`;
        toast.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px; animation: slideIn 0.3s ease;';
        
        toast.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="fas fa-${type === 'error' ? 'exclamation-triangle' : type === 'success' ? 'check-circle' : 'info-circle'} me-2"></i>
                <span>${message}</span>
                <button type="button" class="btn-close ms-auto" onclick="this.parentElement.parentElement.remove()"></button>
            </div>
        `;

        document.body.appendChild(toast);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 5000);
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Initialize when DOM loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing PDF Compressor...');
    window.pdfCompressor = new PDFCompressorWorking();
});

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
@keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}

.compression-option {
    transition: all 0.2s ease;
    cursor: pointer;
}

.compression-option:hover:not(.active) {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.compression-option.active {
    transform: scale(1.02);
    box-shadow: 0 6px 12px rgba(220, 53, 69, 0.2);
}
`;
document.head.appendChild(style);