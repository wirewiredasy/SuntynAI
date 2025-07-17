class PDFMerger {
    constructor() {
        this.selectedFiles = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupDragDrop();
        this.setupSortable();
    }

    setupEventListeners() {
        const fileInput = document.getElementById('file-input');
        const form = document.getElementById('pdf-merger-form');
        
        if (fileInput) fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        if (form) form.addEventListener('submit', (e) => this.handleSubmit(e));
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
                file.type === 'application/pdf'
            );
            
            if (files.length > 0) {
                this.addFiles(files);
            }
        });
    }

    setupSortable() {
        const sortableFiles = document.getElementById('sortable-files');
        if (!sortableFiles) return;
        
        // Initialize sortable functionality
        if (typeof Sortable !== 'undefined') {
            Sortable.create(sortableFiles, {
                animation: 150,
                ghostClass: 'sortable-ghost',
                onEnd: (evt) => {
                    // Update file order
                    const oldIndex = evt.oldIndex;
                    const newIndex = evt.newIndex;
                    
                    const file = this.selectedFiles.splice(oldIndex, 1)[0];
                    this.selectedFiles.splice(newIndex, 0, file);
                    
                    this.updateFileInfo();
                }
            });
        }
    }

    handleFileSelect(e) {
        const files = Array.from(e.target.files).filter(file => 
            file.type === 'application/pdf'
        );
        this.addFiles(files);
    }

    addFiles(files) {
        files.forEach(file => {
            if (!this.selectedFiles.find(f => f.name === file.name && f.size === file.size)) {
                this.selectedFiles.push(file);
            }
        });
        
        this.updateFileList();
        this.updateFileInfo();
        this.updateUI();
    }

    updateFileList() {
        const fileList = document.getElementById('file-list');
        const sortableFiles = document.getElementById('sortable-files');
        
        if (!fileList || !sortableFiles) return;
        
        if (this.selectedFiles.length === 0) {
            fileList.style.display = 'none';
            return;
        }
        
        fileList.style.display = 'block';
        
        sortableFiles.innerHTML = this.selectedFiles.map((file, index) => `
            <div class="list-group-item d-flex justify-content-between align-items-center" data-index="${index}">
                <div class="d-flex align-items-center">
                    <i class="ti ti-file-text text-danger me-2"></i>
                    <div>
                        <div class="fw-medium">${file.name}</div>
                        <small class="text-muted">${this.formatFileSize(file.size)}</small>
                    </div>
                </div>
                <div>
                    <i class="ti ti-grip-horizontal text-muted me-2" style="cursor: move;"></i>
                    <button type="button" class="btn btn-sm btn-outline-danger" onclick="pdfMerger.removeFile(${index})">
                        <i class="ti ti-x"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    removeFile(index) {
        this.selectedFiles.splice(index, 1);
        this.updateFileList();
        this.updateFileInfo();
        this.updateUI();
    }

    updateFileInfo() {
        const totalFiles = document.getElementById('total-files');
        const totalSize = document.getElementById('total-size');
        const infoCard = document.getElementById('info-card');
        
        if (totalFiles) totalFiles.textContent = this.selectedFiles.length;
        
        if (totalSize) {
            const size = this.selectedFiles.reduce((total, file) => total + file.size, 0);
            totalSize.textContent = this.formatFileSize(size);
        }
        
        if (infoCard) {
            infoCard.style.display = this.selectedFiles.length > 0 ? 'block' : 'none';
        }
    }

    updateUI() {
        const mergeOptions = document.getElementById('merge-options');
        const mergeBtn = document.getElementById('merge-btn');
        
        const hasFiles = this.selectedFiles.length >= 2;
        
        if (mergeOptions) mergeOptions.style.display = hasFiles ? 'block' : 'none';
        if (mergeBtn) mergeBtn.disabled = !hasFiles;
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        if (this.selectedFiles.length < 2) {
            alert('Please select at least 2 PDF files to merge');
            return;
        }
        
        await this.mergePDFs();
    }

    async mergePDFs() {
        const progressCard = document.getElementById('progress-card');
        const resultCard = document.getElementById('result-card');
        const progressText = document.getElementById('progress-text');
        
        if (progressCard) progressCard.style.display = 'block';
        if (resultCard) resultCard.style.display = 'none';
        
        try {
            const formData = new FormData();
            this.selectedFiles.forEach(file => {
                formData.append('files', file);
            });
            
            // Add options
            formData.append('output_filename', document.getElementById('output-filename')?.value || 'merged_document.pdf');
            formData.append('add_bookmarks', document.getElementById('add-bookmarks')?.checked || false);
            formData.append('optimize_size', document.getElementById('optimize-size')?.checked || false);
            
            const response = await fetch('/api/tools/pdf-merger', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (progressCard) progressCard.style.display = 'none';
            
            if (result.success) {
                this.showSuccess(result);
            } else {
                this.showError(result.error || 'PDF merge failed');
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
        
        if (resultCard) resultCard.style.display = 'block';
        if (successDiv) successDiv.style.display = 'block';
        if (errorDiv) errorDiv.style.display = 'none';
        
        if (successMessage) {
            successMessage.textContent = `Merged ${this.selectedFiles.length} PDFs successfully!`;
        }
        
        if (downloadBtn && result.download_url) {
            downloadBtn.href = result.download_url;
            downloadBtn.style.display = 'inline-block';
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
let pdfMerger;
document.addEventListener('DOMContentLoaded', () => {
    pdfMerger = new PDFMerger();
});