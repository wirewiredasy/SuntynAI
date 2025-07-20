// Professional PDF Merger - TinyWow/iLovePDF Style
class PDFMergerPro {
    constructor() {
        this.files = [];
        this.maxFileSize = 50 * 1024 * 1024; // 50MB
        this.initializeElements();
        this.bindEvents();
    }

    initializeElements() {
        this.uploadZone = document.getElementById('uploadZone');
        this.fileInput = document.getElementById('fileInput');
        this.filesList = document.getElementById('filesList');
        this.filesContainer = document.getElementById('filesContainer');
        this.fileCount = document.getElementById('fileCount');
        this.mergeSection = document.getElementById('mergeSection');
        this.mergeButton = document.getElementById('mergeButton');
        this.progressSection = document.getElementById('progressSection');
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');
        this.resultSection = document.getElementById('resultSection');
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
        
        // Merge button
        this.mergeButton.addEventListener('click', () => this.mergePDFs());
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
        this.processFiles(files);
    }

    handleFileSelect(e) {
        const files = Array.from(e.target.files);
        this.processFiles(files);
    }

    processFiles(newFiles) {
        const validFiles = newFiles.filter(file => {
            if (file.type !== 'application/pdf') {
                this.showToast('Only PDF files are allowed', 'error');
                return false;
            }
            if (file.size > this.maxFileSize) {
                this.showToast(`File ${file.name} is too large. Maximum size is 50MB`, 'error');
                return false;
            }
            return true;
        });

        // Add new files to existing list
        validFiles.forEach(file => {
            if (!this.files.find(f => f.name === file.name && f.size === file.size)) {
                this.files.push(file);
            }
        });

        this.updateFilesList();
        this.updateUI();
    }

    updateFilesList() {
        this.filesContainer.innerHTML = '';
        
        this.files.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.innerHTML = `
                <div class="file-icon">PDF</div>
                <div class="file-info">
                    <div class="file-name">${file.name}</div>
                    <div class="file-size">${this.formatFileSize(file.size)}</div>
                </div>
                <button class="file-remove" onclick="pdfMerger.removeFile(${index})">
                    ✕
                </button>
            `;
            this.filesContainer.appendChild(fileItem);
        });
    }

    removeFile(index) {
        this.files.splice(index, 1);
        this.updateFilesList();
        this.updateUI();
    }

    updateUI() {
        const fileCount = this.files.length;
        this.fileCount.textContent = `${fileCount} file${fileCount !== 1 ? 's' : ''} selected`;
        
        if (fileCount > 0) {
            this.filesList.style.display = 'block';
            this.mergeSection.style.display = fileCount >= 2 ? 'block' : 'none';
        } else {
            this.filesList.style.display = 'none';
            this.mergeSection.style.display = 'none';
        }
        
        this.progressSection.style.display = 'none';
        this.resultSection.style.display = 'none';
    }

    async mergePDFs() {
        if (this.files.length < 2) {
            this.showToast('Please select at least 2 PDF files', 'error');
            return;
        }

        // Show progress
        this.mergeButton.disabled = true;
        this.progressSection.style.display = 'block';
        this.mergeSection.style.display = 'none';
        
        try {
            // Create FormData
            const formData = new FormData();
            this.files.forEach(file => {
                formData.append('files', file);
            });

            // Simulate progress
            this.updateProgress(10, 'Uploading files...');
            
            // Send request
            const response = await fetch('/process_tool', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Tool-Name': 'pdf-merger'
                }
            });

            this.updateProgress(50, 'Processing files...');

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
            console.error('Merge error:', error);
            this.showToast('Failed to merge PDFs: ' + error.message, 'error');
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
        
        if (result.download_url) {
            this.downloadButton.href = result.download_url;
            this.downloadButton.download = result.filename || 'merged_document.pdf';
            
            // Also create enhanced result display
            const resultContainer = document.querySelector('.result-section .result-content');
            if (resultContainer) {
                resultContainer.innerHTML = `
                    <div class="result-success">
                        <i class="fas fa-check-circle"></i>
                        <h3>PDF Merged Successfully!</h3>
                        <p>Your PDFs have been merged into a single document.</p>
                        <div class="file-info mb-3">
                            <p><strong>Files merged:</strong> ${result.file_count || this.files.length}</p>
                            <p><strong>Output file:</strong> ${result.filename}</p>
                        </div>
                        <div class="download-buttons">
                            <a href="${result.download_url}" class="download-btn" download="${result.filename}">
                                <i class="fas fa-download"></i>
                                Download Merged PDF
                            </a>
                            <button onclick="window.open('${result.download_url}', '_blank')" class="btn btn-outline-primary">
                                <i class="fas fa-external-link-alt"></i> Open in New Tab
                            </button>
                        </div>
                    </div>
                `;
            }
            
            // Auto-download after 2 seconds
            setTimeout(() => {
                const link = document.createElement('a');
                link.href = result.download_url;
                link.download = result.filename || 'merged_document.pdf';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }, 2000);
        }
        
        this.showToast('PDFs merged successfully!', 'success');
    }

    resetUI() {
        this.mergeButton.disabled = false;
        this.progressSection.style.display = 'none';
        this.mergeSection.style.display = 'block';
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
        
        // Add animation styles
        const style = document.createElement('style');
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

// Initialize PDF Merger
let pdfMerger;
document.addEventListener('DOMContentLoaded', () => {
    pdfMerger = new PDFMergerPro();
});