// Working PDF Splitter - TinyWow/iLovePDF Style
class PDFSplitterWorking {
    constructor() {
        this.selectedFile = null;
        this.splitMethod = 'pages';
        this.splitOptions = {
            pages: '',
            every: 1,
            ranges: ''
        };
        this.init();
    }

    init() {
        console.log('PDF Splitter initialized');
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

        // Split method options
        const methodOptions = document.querySelectorAll('.method-option');
        methodOptions.forEach(option => {
            option.addEventListener('click', () => {
                this.selectSplitMethod(option.dataset.method);
            });
        });

        // Page input
        const pageInput = document.getElementById('pageInput');
        if (pageInput) {
            pageInput.addEventListener('input', (e) => {
                this.splitOptions.pages = e.target.value;
            });
        }

        // Every pages input
        const everyInput = document.getElementById('everyInput');
        if (everyInput) {
            everyInput.addEventListener('input', (e) => {
                this.splitOptions.every = parseInt(e.target.value) || 1;
            });
        }

        // Split button
        const splitButton = document.getElementById('splitButton');
        if (splitButton) {
            splitButton.addEventListener('click', () => {
                this.processSplit();
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
                dropZone.style.background = 'linear-gradient(135deg, #e8f5e8, #f0f8f0)';
                dropZone.style.borderColor = '#28a745';
            });
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => {
                dropZone.style.background = 'linear-gradient(135deg, #f0fff4, #f8fff8)';
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

        if (file.size > 100 * 1024 * 1024) {
            this.showMessage('File बहुत बड़ी है। Maximum size 100MB है।', 'error');
            return;
        }

        this.selectedFile = file;
        console.log('File accepted:', file.name);
        
        this.displayFileInfo();
        this.showSplitOptions();
        this.updateSplitButton();
    }

    displayFileInfo() {
        const fileName = document.getElementById('selectedFileName');
        const fileSize = document.getElementById('selectedFileSize');
        
        if (fileName && this.selectedFile) {
            fileName.textContent = this.selectedFile.name;
        }
        
        if (fileSize && this.selectedFile) {
            fileSize.textContent = this.formatFileSize(this.selectedFile.size);
        }
    }

    selectSplitMethod(method) {
        document.querySelectorAll('.method-option').forEach(opt => {
            opt.classList.remove('active');
        });

        const selectedOption = document.querySelector(`[data-method="${method}"]`);
        if (selectedOption) {
            selectedOption.classList.add('active');
        }

        this.splitMethod = method;
        this.showMethodOptions(method);
    }

    showMethodOptions(method) {
        // Hide all method controls first
        const allControls = document.querySelectorAll('.method-controls');
        allControls.forEach(control => {
            control.style.display = 'none';
        });

        // Show specific method controls
        const methodControl = document.getElementById(`${method}Controls`);
        if (methodControl) {
            methodControl.style.display = 'block';
        }
    }

    showSplitOptions() {
        const splitOptionsContainer = document.getElementById('splitOptions');
        if (splitOptionsContainer) {
            splitOptionsContainer.style.display = 'block';
        }
    }

    updateSplitButton() {
        const splitButton = document.getElementById('splitButton');
        if (splitButton && this.selectedFile) {
            splitButton.disabled = false;
            splitButton.textContent = 'PDF Split करें';
            splitButton.classList.remove('btn-secondary');
            splitButton.classList.add('btn-success');
        }
    }

    async processSplit() {
        if (!this.selectedFile) {
            this.showMessage('पहले PDF file select करें', 'error');
            return;
        }

        const splitButton = document.getElementById('splitButton');
        const progressContainer = document.getElementById('progressContainer');
        const progressBar = document.getElementById('progressBar');
        const progressText = document.getElementById('progressText');

        splitButton.disabled = true;
        splitButton.textContent = 'Splitting...';
        if (progressContainer) progressContainer.style.display = 'block';

        // Simulate progress
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress > 90) progress = 90;
            
            if (progressBar) progressBar.style.width = progress + '%';
            if (progressText) progressText.textContent = Math.round(progress) + '%';
        }, 300);

        try {
            const formData = new FormData();
            formData.append('file', this.selectedFile);
            formData.append('method', this.splitMethod);

            if (this.splitMethod === 'pages') {
                formData.append('pages', this.splitOptions.pages);
            } else if (this.splitMethod === 'every') {
                formData.append('every_n_pages', this.splitOptions.every);
            }

            console.log('Sending split request...');
            const response = await fetch('/process_tool/pdf-splitter', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            console.log('Split response:', result);

            clearInterval(progressInterval);
            if (progressBar) progressBar.style.width = '100%';
            if (progressText) progressText.textContent = '100%';

            if (result.success) {
                setTimeout(() => {
                    this.showSuccess(result);
                }, 500);
            } else {
                this.showError(result.error || 'Split में समस्या हुई');
            }

        } catch (error) {
            clearInterval(progressInterval);
            console.error('Split error:', error);
            this.showError('Network error: ' + error.message);
        }
    }

    showSuccess(result) {
        const progressContainer = document.getElementById('progressContainer');
        const resultContainer = document.getElementById('resultContainer');
        
        if (progressContainer) progressContainer.style.display = 'none';
        if (resultContainer) resultContainer.style.display = 'block';

        // Handle multiple files or single file
        if (result.files && result.files.length > 1) {
            this.showMultipleFiles(result.files);
        } else {
            this.showSingleFile(result);
        }

        this.showMessage('PDF successfully split हो गई!', 'success');
    }

    showMultipleFiles(files) {
        const downloadList = document.getElementById('downloadList');
        if (!downloadList) return;

        downloadList.innerHTML = '';
        files.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'download-item d-flex justify-content-between align-items-center p-3 mb-2 bg-light rounded';
            fileItem.innerHTML = `
                <div>
                    <i class="fas fa-file-pdf text-danger me-2"></i>
                    <strong>${file.filename}</strong>
                </div>
                <button class="btn btn-success btn-sm" onclick="window.pdfSplitter.downloadFile('${file.download_url}', '${file.filename}')">
                    <i class="fas fa-download me-1"></i>Download
                </button>
            `;
            downloadList.appendChild(fileItem);
        });

        // Show download all button
        const downloadAllButton = document.getElementById('downloadAllButton');
        if (downloadAllButton) {
            downloadAllButton.style.display = 'block';
            downloadAllButton.onclick = () => {
                files.forEach(file => {
                    this.downloadFile(file.download_url, file.filename);
                });
            };
        }
    }

    showSingleFile(result) {
        const downloadButton = document.getElementById('downloadButton');
        if (downloadButton) {
            downloadButton.onclick = () => {
                this.downloadFile(result.download_url, result.filename);
            };
        }
    }

    downloadFile(url, filename) {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.showMessage('File download शुरू हो गई!', 'success');
    }

    showError(message) {
        const progressContainer = document.getElementById('progressContainer');
        const splitButton = document.getElementById('splitButton');

        if (progressContainer) progressContainer.style.display = 'none';
        
        if (splitButton) {
            splitButton.disabled = false;
            splitButton.textContent = 'PDF Split करें';
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
    console.log('Initializing PDF Splitter...');
    window.pdfSplitter = new PDFSplitterWorking();
});