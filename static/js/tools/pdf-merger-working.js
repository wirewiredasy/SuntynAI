// Working PDF Merger - TinyWow/iLovePDF Style
class PDFMergerWorking {
    constructor() {
        this.selectedFiles = [];
        this.init();
    }

    init() {
        console.log('PDF Merger initialized');
        this.setupEventListeners();
        this.setupDragDrop();
    }

    setupEventListeners() {
        // File input
        const fileInput = document.getElementById('fileInput');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                console.log('Files selected:', e.target.files.length);
                this.handleFiles(e.target.files);
            });
        }

        // Drop zone click
        const dropZone = document.getElementById('dropZone');
        if (dropZone) {
            dropZone.addEventListener('click', () => {
                fileInput?.click();
            });
        }

        // Merge button
        const mergeButton = document.getElementById('mergeButton');
        if (mergeButton) {
            mergeButton.addEventListener('click', () => {
                this.processMerge();
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
                dropZone.style.background = 'linear-gradient(135deg, #e3f2fd, #f3e5f5)';
                dropZone.style.borderColor = '#667eea';
            });
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => {
                dropZone.style.background = 'linear-gradient(135deg, #f8f9ff, #fff0f5)';
                dropZone.style.borderColor = '#e2e8f0';
            });
        });

        // Handle dropped files
        dropZone.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            console.log('Files dropped:', files.length);
            this.handleFiles(files);
        });
    }

    handleFiles(fileList) {
        const files = Array.from(fileList);
        const pdfFiles = files.filter(file => file.type === 'application/pdf');
        
        if (pdfFiles.length === 0) {
            this.showMessage('कृपया केवल PDF files select करें', 'error');
            return;
        }

        // Add to selected files
        this.selectedFiles = [...this.selectedFiles, ...pdfFiles];
        
        console.log('Total PDF files:', this.selectedFiles.length);
        this.displaySelectedFiles();
        this.updateMergeButton();
    }

    displaySelectedFiles() {
        const fileList = document.getElementById('fileList');
        if (!fileList) return;

        fileList.innerHTML = '';
        fileList.style.display = this.selectedFiles.length > 0 ? 'block' : 'none';

        this.selectedFiles.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item d-flex align-items-center p-3 mb-2 bg-white rounded shadow-sm';
            fileItem.draggable = true;
            
            fileItem.innerHTML = `
                <div class="drag-handle me-3">
                    <i class="fas fa-grip-vertical text-muted"></i>
                </div>
                <div class="file-icon me-3">
                    <i class="fas fa-file-pdf text-danger" style="font-size: 1.5rem;"></i>
                </div>
                <div class="file-info flex-grow-1">
                    <div class="file-name fw-bold">${file.name}</div>
                    <div class="file-size text-muted">${this.formatFileSize(file.size)}</div>
                </div>
                <button class="btn btn-outline-danger btn-sm remove-file" onclick="pdfMerger.removeFile(${index})">
                    <i class="fas fa-times"></i>
                </button>
            `;

            fileList.appendChild(fileItem);
        });

        // Show file list container
        const fileListContainer = document.getElementById('fileListContainer');
        if (fileListContainer) {
            fileListContainer.style.display = 'block';
        }
    }

    removeFile(index) {
        this.selectedFiles.splice(index, 1);
        this.displaySelectedFiles();
        this.updateMergeButton();
        
        if (this.selectedFiles.length === 0) {
            const fileListContainer = document.getElementById('fileListContainer');
            if (fileListContainer) {
                fileListContainer.style.display = 'none';
            }
        }
    }

    updateMergeButton() {
        const mergeButton = document.getElementById('mergeButton');
        if (mergeButton) {
            mergeButton.disabled = this.selectedFiles.length < 2;
            
            if (this.selectedFiles.length >= 2) {
                mergeButton.textContent = `${this.selectedFiles.length} PDFs Merge करें`;
                mergeButton.classList.remove('btn-secondary');
                mergeButton.classList.add('btn-primary');
            } else {
                mergeButton.textContent = 'कम से कम 2 PDF Files Select करें';
                mergeButton.classList.remove('btn-primary');
                mergeButton.classList.add('btn-secondary');
            }
        }
    }

    async processMerge() {
        if (this.selectedFiles.length < 2) {
            this.showMessage('कम से कम 2 PDF files की जरूरत है', 'error');
            return;
        }

        const mergeButton = document.getElementById('mergeButton');
        const progressContainer = document.getElementById('progressContainer');
        const progressBar = document.getElementById('progressFill') || document.getElementById('progressBar');
        const progressText = document.getElementById('progressText');

        // Show progress
        mergeButton.disabled = true;
        mergeButton.textContent = 'Processing...';
        if (progressContainer) progressContainer.style.display = 'block';

        // Simulate progress
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress > 90) progress = 90;
            
            if (progressBar) progressBar.style.width = progress + '%';
            if (progressText) progressText.textContent = Math.round(progress) + '%';
        }, 200);

        try {
            const formData = new FormData();
            this.selectedFiles.forEach((file, index) => {
                formData.append('files', file);
                console.log(`Adding file ${index + 1}: ${file.name}`);
            });

            console.log('Sending merge request...');
            const response = await fetch('/process_tool/pdf-merger', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            console.log('Merge response:', result);

            // Complete progress
            clearInterval(progressInterval);
            if (progressBar) progressBar.style.width = '100%';
            if (progressText) progressText.textContent = '100%';

            if (result.success) {
                setTimeout(() => {
                    this.showSuccess(result);
                }, 500);
            } else {
                this.showError(result.error || 'Merge में समस्या हुई');
            }

        } catch (error) {
            clearInterval(progressInterval);
            console.error('Merge error:', error);
            this.showError('Network error: ' + error.message);
        }
    }

    showSuccess(result) {
        const progressContainer = document.getElementById('progressContainer');
        const resultContainer = document.getElementById('resultContainer');
        
        if (progressContainer) progressContainer.style.display = 'none';
        if (resultContainer) resultContainer.style.display = 'block';

        // Update result info
        const fileCount = document.getElementById('mergedFileCount');
        if (fileCount) fileCount.textContent = this.selectedFiles.length;

        // Setup download
        const downloadButton = document.getElementById('downloadButton');
        if (downloadButton) {
            downloadButton.onclick = () => {
                // Create download link
                const link = document.createElement('a');
                link.href = result.download_url || '/uploads/merged_pdf.pdf';
                link.download = result.filename || 'merged_document.pdf';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                this.showMessage('File download शुरू हो गई!', 'success');
            };
        }

        this.showMessage('PDF files successfully merge हो गईं!', 'success');
    }

    showError(message) {
        const progressContainer = document.getElementById('progressContainer');
        const mergeButton = document.getElementById('mergeButton');

        if (progressContainer) progressContainer.style.display = 'none';
        
        if (mergeButton) {
            mergeButton.disabled = false;
            mergeButton.textContent = `${this.selectedFiles.length} PDFs Merge करें`;
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
    console.log('Initializing PDF Merger...');
    window.pdfMerger = new PDFMergerWorking();
});

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
@keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}

.file-item {
    transition: all 0.2s ease;
}

.file-item:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.1) !important;
}

.drag-handle {
    cursor: move;
}

.drag-handle:hover {
    color: #667eea !important;
}
`;
document.head.appendChild(style);