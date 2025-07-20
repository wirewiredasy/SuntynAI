// Professional PDF Compressor - TinyWow/iLovePDF Style
class PDFCompressorPro {
    constructor() {
        this.selectedFile = null;
        this.selectedLevel = 'medium';
        this.maxFileSize = 50 * 1024 * 1024; // 50MB
        this.initializeElements();
        this.bindEvents();
    }

    initializeElements() {
        this.uploadZone = document.getElementById('uploadZone');
        this.fileInput = document.getElementById('fileInput');
        this.filePreview = document.getElementById('filePreview');
        this.fileName = document.getElementById('fileName');
        this.fileSize = document.getElementById('fileSize');
        this.compressionOptions = document.getElementById('compressionOptions');
        this.compressionLevels = document.querySelectorAll('.compression-level');
        this.compressButton = document.getElementById('compressButton');
        this.progressSection = document.getElementById('progressSection');
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');
        this.resultSection = document.getElementById('resultSection');
        this.originalSizeValue = document.getElementById('originalSizeValue');
        this.compressedSizeValue = document.getElementById('compressedSizeValue');
        this.savingsPercent = document.getElementById('savingsPercent');
        this.downloadButton = document.getElementById('downloadButton');
    }

    bindEvents() {
        // Upload zone events
        this.uploadZone.addEventListener('click', () => this.fileInput.click());
        this.uploadZone.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.uploadZone.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        this.uploadZone.addEventListener('drop', (e) => this.handleDrop(e));
        
        // File input change
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        
        // Compression level selection
        this.compressionLevels.forEach(level => {
            level.addEventListener('click', () => this.selectCompressionLevel(level));
        });
        
        // Compress button
        this.compressButton.addEventListener('click', () => this.compressPDF());
    }

    handleDragOver(e) {
        e.preventDefault();
        this.uploadZone.classList.add('dragover');
    }

    handleDragLeave(e) {
        e.preventDefault();
        this.uploadZone.classList.remove('dragover');
    }

    handleDrop(e) {
        e.preventDefault();
        this.uploadZone.classList.remove('dragover');
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            this.processFile(files[0]);
        }
    }

    handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            this.processFile(file);
        }
    }

    processFile(file) {
        if (file.type !== 'application/pdf') {
            this.showToast('Only PDF files are allowed', 'error');
            return;
        }
        
        if (file.size > this.maxFileSize) {
            this.showToast('File too large. Maximum size is 50MB', 'error');
            return;
        }

        this.selectedFile = file;
        this.updateFilePreview();
        this.filePreview.style.display = 'block';
        this.compressionOptions.style.display = 'block';
        this.resultSection.style.display = 'none';
    }

    updateFilePreview() {
        if (this.selectedFile) {
            this.fileName.textContent = this.selectedFile.name;
            this.fileSize.textContent = this.formatFileSize(this.selectedFile.size);
            this.originalSizeValue.textContent = this.formatFileSize(this.selectedFile.size);
        }
    }

    selectCompressionLevel(selectedLevel) {
        // Remove selection from all levels
        this.compressionLevels.forEach(level => {
            level.classList.remove('selected');
        });
        
        // Add selection to clicked level
        selectedLevel.classList.add('selected');
        this.selectedLevel = selectedLevel.dataset.level;
    }

    async compressPDF() {
        if (!this.selectedFile) {
            this.showToast('Please select a PDF file first', 'error');
            return;
        }

        // Show progress
        this.compressButton.disabled = true;
        this.progressSection.style.display = 'block';
        this.compressionOptions.style.display = 'none';
        
        try {
            // Create FormData
            const formData = new FormData();
            formData.append('file', this.selectedFile);
            formData.append('compression_level', this.selectedLevel);

            // Simulate progress
            this.updateProgress(10, 'Uploading file...');
            
            // Send request
            const response = await fetch('/process_tool', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Tool-Name': 'pdf-compressor'
                }
            });

            this.updateProgress(50, 'Compressing PDF...');

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            this.updateProgress(80, 'Finalizing...');

            if (result.success) {
                this.updateProgress(100, 'Complete!');
                setTimeout(() => {
                    this.showResult(result);
                }, 500);
            } else {
                throw new Error(result.error || 'Processing failed');
            }

        } catch (error) {
            console.error('Compression error:', error);
            this.showToast('Failed to compress PDF: ' + error.message, 'error');
            this.resetUI();
        }
    }

    updateProgress(percent, text) {
        this.progressFill.style.width = `${percent}%`;
        this.progressText.textContent = text;
    }

    showResult(result) {
        this.progressSection.style.display = 'none';
        this.resultSection.style.display = 'block';
        
        // Calculate compression results
        if (result.original_size && result.compressed_size) {
            const originalSize = parseInt(result.original_size);
            const compressedSize = parseInt(result.compressed_size);
            const savings = Math.round(((originalSize - compressedSize) / originalSize) * 100);
            
            this.compressedSizeValue.textContent = this.formatFileSize(compressedSize);
            this.savingsPercent.textContent = `${savings}%`;
        }
        
        if (result.download_url) {
            this.downloadButton.href = result.download_url;
            this.downloadButton.download = result.filename || 'compressed_document.pdf';
            
            // Auto-download after 2 seconds
            setTimeout(() => {
                const link = document.createElement('a');
                link.href = result.download_url;
                link.download = result.filename || 'compressed_document.pdf';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }, 2000);
        }
        
        this.showToast('PDF compressed successfully!', 'success');
    }

    resetUI() {
        this.compressButton.disabled = false;
        this.progressSection.style.display = 'none';
        this.compressionOptions.style.display = 'block';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    showToast(message, type = 'info') {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            z-index: 10000;
            animation: slideIn 0.3s ease;
            background: ${type === 'error' ? '#e74c3c' : type === 'success' ? '#27ae60' : '#3498db'};
        `;
        toast.textContent = message;
        
        // Add animation styles if not already added
        if (!document.getElementById('toast-styles')) {
            const style = document.createElement('style');
            style.id = 'toast-styles';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(toast);
        
        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize PDF Compressor
let pdfCompressor;
document.addEventListener('DOMContentLoaded', () => {
    pdfCompressor = new PDFCompressorPro();
});