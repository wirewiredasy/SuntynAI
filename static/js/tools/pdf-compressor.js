class PDFCompressorPro {
    constructor() {
        this.pdfFile = null;
        this.selectedLevel = 'medium';
        this.socket = io();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupDragAndDrop();
    }

    setupEventListeners() {
        const fileInput = document.getElementById('fileInput');
        const dropZone = document.getElementById('dropZone');
        const compressButton = document.getElementById('compressButton');
        const compressionOptions = document.querySelectorAll('.compression-option');
        
        fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        dropZone.addEventListener('click', () => fileInput.click());
        compressButton.addEventListener('click', () => this.compressPDF());

        compressionOptions.forEach(option => {
            option.addEventListener('click', () => this.selectCompressionLevel(option.dataset.level));
        });

        // Socket events
        this.socket.on('compress_progress', (data) => this.updateProgress(data.progress));
        this.socket.on('compress_complete', (data) => this.showResult(data));
        this.socket.on('compress_error', (data) => this.showError(data.error));
    }

    setupDragAndDrop() {
        const dropZone = document.getElementById('dropZone');

        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, this.preventDefaults, false);
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => dropZone.classList.add('drag-over'), false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => dropZone.classList.remove('drag-over'), false);
        });

        dropZone.addEventListener('drop', (e) => this.handleDrop(e), false);
    }

    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    handleDrop(e) {
        const dt = e.dataTransfer;
        const files = Array.from(dt.files).filter(file => file.type === 'application/pdf');
        if (files.length > 0) {
            this.processFile(files[0]);
        }
    }

    handleFileSelect(e) {
        const files = Array.from(e.target.files).filter(file => file.type === 'application/pdf');
        if (files.length > 0) {
            this.processFile(files[0]);
        }
    }

    processFile(file) {
        if (file.size > 100 * 1024 * 1024) { // 100MB limit
            this.showNotification('File too large. Maximum size is 100MB.', 'error');
            return;
        }

        this.pdfFile = file;
        this.showCompressionOptions();
        this.updateFileSizeDisplay();
    }

    showCompressionOptions() {
        const compressionSelector = document.getElementById('compressionSelector');
        const fileSizeDisplay = document.getElementById('fileSizeDisplay');
        const compressButton = document.getElementById('compressButton');

        compressionSelector.style.display = 'block';
        fileSizeDisplay.style.display = 'block';
        compressButton.disabled = false;
    }

    selectCompressionLevel(level) {
        const options = document.querySelectorAll('.compression-option');
        options.forEach(opt => opt.classList.remove('active'));
        
        const selectedOption = document.querySelector(`[data-level="${level}"]`);
        selectedOption.classList.add('active');
        
        this.selectedLevel = level;
        this.updateFileSizeDisplay();
    }

    updateFileSizeDisplay() {
        if (!this.pdfFile) return;

        const originalSize = this.pdfFile.size;
        const originalSizeMB = (originalSize / (1024 * 1024)).toFixed(1);
        
        // Mock compression ratios
        const compressionRatios = {
            'low': 0.8,      // 20% reduction
            'medium': 0.55,  // 45% reduction  
            'high': 0.35,    // 65% reduction
            'maximum': 0.2   // 80% reduction
        };

        const compressedSize = originalSize * compressionRatios[this.selectedLevel];
        const compressedSizeMB = (compressedSize / (1024 * 1024)).toFixed(1);
        const savings = Math.round((1 - compressionRatios[this.selectedLevel]) * 100);

        document.getElementById('originalSize').textContent = originalSizeMB + ' MB';
        document.getElementById('compressedSize').textContent = compressedSizeMB + ' MB';
        document.getElementById('savingsBadge').textContent = savings + '% smaller';

        // Update compressed bar width
        const compressedBar = document.getElementById('compressedBar');
        if (compressedBar) {
            compressedBar.style.width = (compressionRatios[this.selectedLevel] * 100) + '%';
        }
    }

    async compressPDF() {
        if (!this.pdfFile) {
            this.showNotification('Please select a PDF file first', 'error');
            return;
        }

        const compressButton = document.getElementById('compressButton');
        const progressContainer = document.getElementById('progressContainer');

        compressButton.disabled = true;
        progressContainer.style.display = 'block';

        const formData = new FormData();
        formData.append('file', this.pdfFile);
        formData.append('compression_level', this.selectedLevel);

        try {
            const response = await fetch('/process_tool/pdf-compressor', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                this.showResult(result);
            } else {
                this.showError(result.error || 'Compression failed');
            }
        } catch (error) {
            this.showError('Network error: ' + error.message);
        }
    }

    updateProgress(progress) {
        const progressBar = document.getElementById('progressBar');
        const progressText = document.getElementById('progressText');

        progressBar.style.width = progress + '%';
        progressText.textContent = progress + '%';
    }

    showResult(data) {
        const progressContainer = document.getElementById('progressContainer');
        const resultContainer = document.getElementById('resultContainer');
        const downloadButton = document.getElementById('downloadButton');

        progressContainer.style.display = 'none';
        resultContainer.style.display = 'block';

        // Update final comparison
        document.getElementById('finalOriginalSize').textContent = data.original_size || '5.2 MB';
        document.getElementById('finalCompressedSize').textContent = data.compressed_size || '2.9 MB';
        document.getElementById('finalSavings').textContent = data.savings_percent + '%' || '45%';

        downloadButton.onclick = () => {
            const link = document.createElement('a');
            link.href = data.download_url;
            link.download = data.filename || 'compressed_pdf.pdf';
            link.click();
        };

        this.showNotification('PDF compressed successfully!', 'success');
    }

    showError(message) {
        const progressContainer = document.getElementById('progressContainer');
        const compressButton = document.getElementById('compressButton');

        progressContainer.style.display = 'none';
        compressButton.disabled = false;

        this.showNotification(message, 'error');
    }

    showNotification(message, type) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `alert alert-${type === 'error' ? 'danger' : 'success'} alert-dismissible fade show position-fixed`;
        notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; max-width: 300px;';
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.pdfCompressor = new PDFCompressorPro();
});