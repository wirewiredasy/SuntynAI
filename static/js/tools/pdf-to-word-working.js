// Working PDF to Word Converter - TinyWow/iLovePDF Style
class PDFToWordWorking {
    constructor() {
        this.selectedFile = null;
        this.conversionFormat = 'docx';
        this.ocrEnabled = false;
        this.init();
    }

    init() {
        console.log('PDF to Word Converter initialized');
        this.setupEventListeners();
        this.setupDragDrop();
    }

    setupEventListeners() {
        // File input
        const fileInput = document.getElementById('fileInput');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
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

        // Format selection
        const formatOptions = document.querySelectorAll('.format-option');
        formatOptions.forEach(option => {
            option.addEventListener('click', () => {
                this.selectFormat(option.dataset.format);
            });
        });

        // OCR toggle
        const ocrToggle = document.getElementById('ocrToggle');
        if (ocrToggle) {
            ocrToggle.addEventListener('change', (e) => {
                this.ocrEnabled = e.target.checked;
                console.log('OCR enabled:', this.ocrEnabled);
            });
        }

        // Convert button
        const convertButton = document.getElementById('convertButton');
        if (convertButton) {
            convertButton.addEventListener('click', () => {
                this.processConversion();
            });
        }
    }

    setupDragDrop() {
        const dropZone = document.getElementById('dropZone');
        if (!dropZone) return;

        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => {
                dropZone.style.background = 'linear-gradient(135deg, #e8f4fd, #f0f8ff)';
                dropZone.style.borderColor = '#007bff';
            });
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => {
                dropZone.style.background = 'linear-gradient(135deg, #f8f9ff, #fff8f0)';
                dropZone.style.borderColor = '#e2e8f0';
            });
        });

        dropZone.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFile(files[0]);
            }
        });
    }

    handleFile(file) {
        if (!file || file.type !== 'application/pdf') {
            this.showMessage('कृपया केवल PDF file select करें', 'error');
            return;
        }

        if (file.size > 50 * 1024 * 1024) {
            this.showMessage('File बहुत बड़ी है। Maximum size 50MB है।', 'error');
            return;
        }

        this.selectedFile = file;
        console.log('PDF file selected:', file.name);
        
        this.displayFileInfo();
        this.showConversionOptions();
        this.updateConvertButton();
    }

    displayFileInfo() {
        const fileName = document.getElementById('selectedFileName');
        const fileSize = document.getElementById('selectedFileSize');
        const filePreview = document.getElementById('filePreview');
        
        if (fileName && this.selectedFile) {
            fileName.textContent = this.selectedFile.name;
        }
        
        if (fileSize && this.selectedFile) {
            fileSize.textContent = this.formatFileSize(this.selectedFile.size);
        }

        if (filePreview) {
            filePreview.innerHTML = `
                <div class="d-flex align-items-center p-3 bg-light rounded">
                    <i class="fas fa-file-pdf text-danger fa-2x me-3"></i>
                    <div>
                        <div class="fw-bold">${this.selectedFile.name}</div>
                        <div class="text-muted">${this.formatFileSize(this.selectedFile.size)}</div>
                    </div>
                </div>
            `;
        }
    }

    selectFormat(format) {
        document.querySelectorAll('.format-option').forEach(opt => {
            opt.classList.remove('active');
        });

        const selectedOption = document.querySelector(`[data-format="${format}"]`);
        if (selectedOption) {
            selectedOption.classList.add('active');
        }

        this.conversionFormat = format;
        console.log('Format selected:', format);
        this.updateFormatInfo(format);
    }

    updateFormatInfo(format) {
        const formatInfo = document.getElementById('formatInfo');
        if (!formatInfo) return;

        const info = {
            'docx': {
                name: 'Microsoft Word (.docx)',
                description: 'Best compatibility with Microsoft Word and Google Docs',
                features: ['Editable text', 'Preserved formatting', 'Images included']
            },
            'doc': {
                name: 'Microsoft Word Legacy (.doc)', 
                description: 'Compatible with older versions of Microsoft Word',
                features: ['Editable text', 'Basic formatting', 'Wide compatibility']
            },
            'rtf': {
                name: 'Rich Text Format (.rtf)',
                description: 'Universal format supported by most word processors',
                features: ['Cross-platform', 'Text formatting', 'Lightweight']
            },
            'txt': {
                name: 'Plain Text (.txt)',
                description: 'Simple text without formatting - smallest file size',
                features: ['Pure text', 'No formatting', 'Universal compatibility']
            }
        };

        const selectedInfo = info[format] || info['docx'];
        formatInfo.innerHTML = `
            <div class="card border-0 bg-light">
                <div class="card-body">
                    <h6 class="card-title text-primary">${selectedInfo.name}</h6>
                    <p class="card-text text-muted small mb-2">${selectedInfo.description}</p>
                    <div class="features">
                        ${selectedInfo.features.map(feature => 
                            `<span class="badge bg-secondary me-1 mb-1">${feature}</span>`
                        ).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    showConversionOptions() {
        const conversionOptions = document.getElementById('conversionOptions');
        if (conversionOptions) {
            conversionOptions.style.display = 'block';
        }
    }

    updateConvertButton() {
        const convertButton = document.getElementById('convertButton');
        if (convertButton && this.selectedFile) {
            convertButton.disabled = false;
            convertButton.textContent = `Convert to ${this.conversionFormat.toUpperCase()}`;
            convertButton.classList.remove('btn-secondary');
            convertButton.classList.add('btn-primary');
        }
    }

    async processConversion() {
        if (!this.selectedFile) {
            this.showMessage('पहले PDF file select करें', 'error');
            return;
        }

        const convertButton = document.getElementById('convertButton');
        const progressContainer = document.getElementById('progressContainer');
        const progressBar = document.getElementById('progressBar');
        const progressText = document.getElementById('progressText');
        const progressStage = document.getElementById('progressStage');

        convertButton.disabled = true;
        convertButton.textContent = 'Converting...';
        if (progressContainer) progressContainer.style.display = 'block';

        // Conversion stages
        const stages = [
            'PDF analysis...',
            'Text extraction...',
            'Format conversion...',
            'File optimization...'
        ];

        let currentStage = 0;
        let progress = 0;

        const progressInterval = setInterval(() => {
            progress += Math.random() * 8;
            
            // Update stage based on progress
            const stageIndex = Math.floor((progress / 100) * stages.length);
            if (stageIndex !== currentStage && stageIndex < stages.length) {
                currentStage = stageIndex;
                if (progressStage) progressStage.textContent = stages[currentStage];
            }

            if (progress > 90) progress = 90;
            
            if (progressBar) progressBar.style.width = progress + '%';
            if (progressText) progressText.textContent = Math.round(progress) + '%';
        }, 400);

        try {
            const formData = new FormData();
            formData.append('file', this.selectedFile);
            formData.append('output_format', this.conversionFormat);
            formData.append('ocr_enabled', this.ocrEnabled);

            console.log('Sending conversion request...');
            const response = await fetch('/process_tool/pdf-to-word', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            console.log('Conversion response:', result);

            clearInterval(progressInterval);
            if (progressBar) progressBar.style.width = '100%';
            if (progressText) progressText.textContent = '100%';
            if (progressStage) progressStage.textContent = 'Conversion complete!';

            if (result.success) {
                setTimeout(() => {
                    this.showSuccess(result);
                }, 500);
            } else {
                this.showError(result.error || 'Conversion में समस्या हुई');
            }

        } catch (error) {
            clearInterval(progressInterval);
            console.error('Conversion error:', error);
            this.showError('Network error: ' + error.message);
        }
    }

    showSuccess(result) {
        const progressContainer = document.getElementById('progressContainer');
        const resultContainer = document.getElementById('resultContainer');
        
        if (progressContainer) progressContainer.style.display = 'none';
        if (resultContainer) resultContainer.style.display = 'block';

        // Update conversion stats
        const originalFormat = document.getElementById('originalFormat');
        const convertedFormat = document.getElementById('convertedFormat');
        const conversionTime = document.getElementById('conversionTime');

        if (originalFormat) originalFormat.textContent = 'PDF';
        if (convertedFormat) convertedFormat.textContent = this.conversionFormat.toUpperCase();
        if (conversionTime) conversionTime.textContent = result.processing_time || '2.3 seconds';

        // Setup download
        const downloadButton = document.getElementById('downloadButton');
        if (downloadButton) {
            downloadButton.onclick = () => {
                const link = document.createElement('a');
                link.href = result.download_url || '/uploads/converted_document.' + this.conversionFormat;
                link.download = result.filename || 'converted_document.' + this.conversionFormat;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                this.showMessage('File download शुरू हो गई!', 'success');
            };
        }

        this.showMessage(`PDF successfully ${this.conversionFormat.toUpperCase()} में convert हो गई!`, 'success');
    }

    showError(message) {
        const progressContainer = document.getElementById('progressContainer');
        const convertButton = document.getElementById('convertButton');

        if (progressContainer) progressContainer.style.display = 'none';
        
        if (convertButton) {
            convertButton.disabled = false;
            convertButton.textContent = `Convert to ${this.conversionFormat.toUpperCase()}`;
        }

        this.showMessage(message, 'error');
    }

    showMessage(message, type = 'info') {
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
    console.log('Initializing PDF to Word Converter...');
    window.pdfToWord = new PDFToWordWorking();
});

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
@keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}

.format-option {
    transition: all 0.2s ease;
    cursor: pointer;
}

.format-option:hover:not(.active) {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.format-option.active {
    transform: scale(1.02);
    box-shadow: 0 6px 12px rgba(0, 123, 255, 0.2);
}

.progress-container {
    animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}
`;
document.head.appendChild(style);