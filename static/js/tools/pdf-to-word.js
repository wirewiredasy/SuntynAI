class PDFToWordPro {
    constructor() {
        this.pdfFile = null;
        this.settings = {
            ocrEnabled: true,
            language: 'eng',
            preserveLayout: true,
            extractImages: true
        };
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupDragAndDrop();
    }

    setupEventListeners() {
        const fileInput = document.getElementById('fileInput');
        const dropZone = document.getElementById('dropZone');
        const convertButton = document.getElementById('convertButton');
        const languageOptions = document.querySelectorAll('.language-option');
        
        fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        dropZone.addEventListener('click', () => fileInput.click());
        convertButton.addEventListener('click', () => this.convertToWord());

        // Language selection
        languageOptions.forEach(option => {
            option.addEventListener('click', () => this.selectLanguage(option.dataset.lang));
        });

        // Toggle switches
        document.getElementById('ocrToggle').addEventListener('change', (e) => {
            this.settings.ocrEnabled = e.target.checked;
            this.updateLanguageVisibility();
            this.updateQuality();
        });

        document.getElementById('layoutToggle').addEventListener('change', (e) => {
            this.settings.preserveLayout = e.target.checked;
            this.updateQuality();
        });

        document.getElementById('imagesToggle').addEventListener('change', (e) => {
            this.settings.extractImages = e.target.checked;
            this.updateQuality();
        });
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
        if (file.size > 50 * 1024 * 1024) { // 50MB limit
            this.showNotification('File too large. Maximum size is 50MB.', 'error');
            return;
        }

        this.pdfFile = file;
        this.showConversionOptions();
        this.updateQuality();
    }

    showConversionOptions() {
        const conversionOptions = document.getElementById('conversionOptions');
        const convertButton = document.getElementById('convertButton');

        conversionOptions.style.display = 'block';
        convertButton.disabled = false;
    }

    selectLanguage(lang) {
        const options = document.querySelectorAll('.language-option');
        options.forEach(opt => opt.classList.remove('active'));
        
        const selectedOption = document.querySelector(`[data-lang="${lang}"]`);
        selectedOption.classList.add('active');
        
        this.settings.language = lang;
    }

    updateLanguageVisibility() {
        const languageSelection = document.getElementById('languageSelection');
        languageSelection.style.display = this.settings.ocrEnabled ? 'block' : 'none';
    }

    updateQuality() {
        const qualityFill = document.getElementById('qualityFill');
        const qualityText = document.getElementById('qualityText');
        
        let quality = 70; // Base quality
        
        if (this.settings.ocrEnabled) quality += 10;
        if (this.settings.preserveLayout) quality += 10;
        if (this.settings.extractImages) quality += 5;
        
        quality = Math.min(quality, 100);
        
        qualityFill.style.width = quality + '%';
        
        if (quality >= 90) {
            qualityText.textContent = 'Excellent';
            qualityFill.style.background = '#059669';
        } else if (quality >= 75) {
            qualityText.textContent = 'Very Good';
            qualityFill.style.background = '#10b981';
        } else if (quality >= 60) {
            qualityText.textContent = 'Good';
            qualityFill.style.background = '#f59e0b';
        } else {
            qualityText.textContent = 'Fair';
            qualityFill.style.background = '#ef4444';
        }
    }

    async convertToWord() {
        if (!this.pdfFile) {
            this.showNotification('Please select a PDF file first', 'error');
            return;
        }

        const convertButton = document.getElementById('convertButton');
        const progressContainer = document.getElementById('progressContainer');
        const progressMessage = document.getElementById('progressMessage');

        convertButton.disabled = true;
        progressContainer.style.display = 'block';

        const formData = new FormData();
        formData.append('file', this.pdfFile);
        formData.append('ocr_enabled', this.settings.ocrEnabled);
        formData.append('language', this.settings.language);
        formData.append('preserve_layout', this.settings.preserveLayout);
        formData.append('extract_images', this.settings.extractImages);

        try {
            // Simulate conversion progress
            this.simulateProgress(progressMessage);

            const response = await fetch('/process_tool/pdf-to-word', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                this.showResult(result);
            } else {
                this.showError(result.error || 'Conversion failed');
            }
        } catch (error) {
            this.showError('Network error: ' + error.message);
        }
    }

    simulateProgress(messageElement) {
        const messages = [
            'Analyzing PDF structure...',
            'Extracting text content...',
            'Processing images...',
            'Converting to Word format...',
            'Finalizing document...'
        ];

        let index = 0;
        const interval = setInterval(() => {
            if (index < messages.length) {
                messageElement.textContent = messages[index];
                this.updateProgress((index + 1) * 20);
                index++;
            } else {
                clearInterval(interval);
            }
        }, 800);
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

        // Update conversion stats
        document.getElementById('pagesConverted').textContent = data.pages_converted || 8;
        document.getElementById('textExtracted').textContent = data.text_extracted || 'Yes';
        document.getElementById('imagesIncluded').textContent = data.images_included || 3;

        downloadButton.onclick = () => {
            const link = document.createElement('a');
            link.href = data.download_url;
            link.download = data.filename || 'converted_document.docx';
            link.click();
        };

        this.showNotification('PDF converted to Word successfully!', 'success');
    }

    showError(message) {
        const progressContainer = document.getElementById('progressContainer');
        const convertButton = document.getElementById('convertButton');

        progressContainer.style.display = 'none';
        convertButton.disabled = false;

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
    window.pdfToWord = new PDFToWordPro();
});