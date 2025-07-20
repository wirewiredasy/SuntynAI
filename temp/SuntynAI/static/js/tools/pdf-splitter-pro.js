// Professional PDF Splitter - TinyWow/iLovePDF Style
class PDFSplitterPro {
    constructor() {
        this.selectedFile = null;
        this.maxFileSize = 50 * 1024 * 1024; // 50MB
        this.initializeElements();
        this.bindEvents();
    }

    initializeElements() {
        this.uploadZone = document.getElementById('uploadZone');
        this.fileInput = document.getElementById('fileInput');
        this.splitOptions = document.getElementById('splitOptions');
        this.splitButton = document.getElementById('splitButton');
        this.progressSection = document.getElementById('progressSection');
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');
        this.resultSection = document.getElementById('resultSection');
        this.filesGrid = document.getElementById('filesGrid');
        this.downloadAllButton = document.getElementById('downloadAllButton');
        this.resultMessage = document.getElementById('resultMessage');
        
        // Split option elements
        this.rangeInputs = document.getElementById('rangeInputs');
        this.everyInputs = document.getElementById('everyInputs');
    }

    bindEvents() {
        // Upload zone events
        this.uploadZone.addEventListener('click', () => this.fileInput.click());
        this.uploadZone.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.uploadZone.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        this.uploadZone.addEventListener('drop', (e) => this.handleDrop(e));
        
        // File input change
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        
        // Split options
        document.querySelectorAll('input[name="splitType"]').forEach(radio => {
            radio.addEventListener('change', () => this.handleSplitTypeChange());
        });
        
        // Split button
        this.splitButton.addEventListener('click', () => this.splitPDF());
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
        this.updateUploadZone();
        this.splitOptions.style.display = 'block';
        this.resultSection.style.display = 'none';
    }

    updateUploadZone() {
        if (this.selectedFile) {
            this.uploadZone.innerHTML = `
                <div class="upload-icon">✅</div>
                <div class="upload-text">${this.selectedFile.name}</div>
                <div class="upload-subtext">${this.formatFileSize(this.selectedFile.size)} • Click to change file</div>
            `;
        }
    }

    handleSplitTypeChange() {
        const selectedType = document.querySelector('input[name="splitType"]:checked').value;
        
        // Hide all input groups
        this.rangeInputs.classList.remove('active');
        this.everyInputs.classList.remove('active');
        
        // Show relevant input group
        if (selectedType === 'range') {
            this.rangeInputs.classList.add('active');
        } else if (selectedType === 'every') {
            this.everyInputs.classList.add('active');
        }
    }

    async splitPDF() {
        if (!this.selectedFile) {
            this.showToast('Please select a PDF file first', 'error');
            return;
        }

        const splitType = document.querySelector('input[name="splitType"]:checked').value;
        
        // Show progress
        this.splitButton.disabled = true;
        this.progressSection.style.display = 'block';
        this.splitOptions.style.display = 'none';
        
        try {
            // Create FormData
            const formData = new FormData();
            formData.append('file', this.selectedFile);
            formData.append('split_type', splitType);
            
            if (splitType === 'range') {
                const startPage = document.getElementById('startPage').value;
                const endPage = document.getElementById('endPage').value;
                formData.append('start_page', startPage);
                formData.append('end_page', endPage);
            } else if (splitType === 'every') {
                const everyN = document.getElementById('everyN').value;
                formData.append('every_n', everyN);
            }

            // Simulate progress
            this.updateProgress(10, 'Uploading file...');
            
            // Send request
            const response = await fetch('/process_tool', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Tool-Name': 'pdf-splitter'
                }
            });

            this.updateProgress(50, 'Splitting PDF...');

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
            console.error('Split error:', error);
            this.showToast('Failed to split PDF: ' + error.message, 'error');
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
        
        // Update result message
        if (result.output_files) {
            const fileCount = result.output_files.length;
            this.resultMessage.textContent = `Your PDF has been split into ${fileCount} file${fileCount !== 1 ? 's' : ''}`;
            
            // Create file grid
            this.filesGrid.innerHTML = '';
            result.output_files.forEach(file => {
                const fileElement = document.createElement('div');
                fileElement.className = 'result-file';
                fileElement.innerHTML = `
                    <div class="result-file-icon">📄</div>
                    <div class="result-file-name">${file.filename}</div>
                    <button class="download-individual" onclick="downloadFile('${file.download_url}', '${file.filename}')">
                        📥 Download
                    </button>
                `;
                this.filesGrid.appendChild(fileElement);
            });
        }
        
        this.showToast('PDF split successfully!', 'success');
        
        // Auto-download first file after 2 seconds if only one file
        if (result.output_files && result.output_files.length === 1) {
            setTimeout(() => {
                const file = result.output_files[0];
                const link = document.createElement('a');
                link.href = file.download_url;
                link.download = file.filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }, 2000);
        }
    }
    
}

// Global function for downloading files
function downloadFile(url, filename) {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

    resetUI() {
        this.splitButton.disabled = false;
        this.progressSection.style.display = 'none';
        this.splitOptions.style.display = 'block';
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

// Initialize PDF Splitter
let pdfSplitter;
document.addEventListener('DOMContentLoaded', () => {
    pdfSplitter = new PDFSplitterPro();
});