// PDF Merger Tool - JavaScript
// Handles PDF merging functionality with real-time collaboration

class PDFMerger {
    constructor() {
        this.files = [];
        this.isProcessing = false;
        this.sortableInstance = null;
        this.collaborationRoom = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeSortable();
        this.setupCollaboration();
        console.log('📄 PDF Merger initialized');
    }

    setupEventListeners() {
        const form = document.getElementById('pdf-merger-form');
        const fileInput = document.getElementById('file-input');
        const dropZone = document.getElementById('drop-zone');

        // Form submission
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleMerge();
            });
        }

        // File input change
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                this.handleFileSelection(e.target.files);
            });
        }

        // Drop zone events
        if (dropZone) {
            dropZone.addEventListener('dragover', (e) => {
                e.preventDefault();
                dropZone.classList.add('dragover');
            });

            dropZone.addEventListener('dragleave', (e) => {
                e.preventDefault();
                dropZone.classList.remove('dragover');
            });

            dropZone.addEventListener('drop', (e) => {
                e.preventDefault();
                dropZone.classList.remove('dragover');
                this.handleFileSelection(e.dataTransfer.files);
            });
        }

        // Collaboration events
        document.addEventListener('collaborationUpdate', (e) => {
            this.handleCollaborationUpdate(e.detail);
        });
    }

    initializeSortable() {
        const filesList = document.getElementById('files-list');
        if (filesList && typeof Sortable !== 'undefined') {
            this.sortableInstance = Sortable.create(filesList, {
                animation: 150,
                ghostClass: 'sortable-ghost',
                onEnd: (evt) => {
                    this.handleFileReorder(evt.oldIndex, evt.newIndex);
                }
            });
        }
    }

    setupCollaboration() {
        // Setup collaboration room
        this.collaborationRoom = `pdf-merger-${Date.now()}`;
        
        // Join collaboration room if WebSocket is available
        if (window.wsClient && window.wsClient.isConnected()) {
            window.wsClient.joinRoom(this.collaborationRoom, 'pdf-merger');
        }
    }

    handleFileSelection(fileList) {
        const files = Array.from(fileList);
        const pdfFiles = files.filter(file => file.type === 'application/pdf');
        
        if (pdfFiles.length !== files.length) {
            this.showError('Please select only PDF files');
            return;
        }

        if (pdfFiles.length === 0) {
            this.showError('Please select at least one PDF file');
            return;
        }

        this.files = [...this.files, ...pdfFiles];
        this.updateFilesList();
        this.updateMergeButton();
        this.broadcastFileUpdate();
    }

    updateFilesList() {
        const filesList = document.getElementById('files-list');
        const selectedFiles = document.getElementById('selected-files');
        const mergeOptions = document.querySelector('.merge-options');
        
        if (!filesList) return;

        filesList.innerHTML = '';
        
        if (this.files.length === 0) {
            selectedFiles.style.display = 'none';
            mergeOptions.style.display = 'none';
            return;
        }

        selectedFiles.style.display = 'block';
        mergeOptions.style.display = 'block';

        this.files.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item d-flex align-items-center justify-content-between p-3 bg-white border rounded mb-2';
            fileItem.innerHTML = `
                <div class="d-flex align-items-center">
                    <div class="drag-handle me-3 text-muted cursor-move">
                        <i class="ti ti-grip-vertical"></i>
                    </div>
                    <div class="file-icon me-3">
                        <i class="ti ti-file-type-pdf text-danger fs-4"></i>
                    </div>
                    <div class="file-info">
                        <div class="file-name fw-medium">${file.name}</div>
                        <div class="file-size text-muted small">${this.formatFileSize(file.size)}</div>
                    </div>
                </div>
                <div class="file-actions">
                    <span class="badge bg-primary me-2">Page ${index + 1}</span>
                    <button type="button" class="btn btn-sm btn-outline-danger" onclick="pdfMerger.removeFile(${index})">
                        <i class="ti ti-x"></i>
                    </button>
                </div>
            `;
            filesList.appendChild(fileItem);
        });
    }

    removeFile(index) {
        this.files.splice(index, 1);
        this.updateFilesList();
        this.updateMergeButton();
        this.broadcastFileUpdate();
    }

    handleFileReorder(oldIndex, newIndex) {
        const file = this.files.splice(oldIndex, 1)[0];
        this.files.splice(newIndex, 0, file);
        this.updateFilesList();
        this.broadcastFileUpdate();
    }

    updateMergeButton() {
        const mergeBtn = document.getElementById('merge-btn');
        if (mergeBtn) {
            mergeBtn.disabled = this.files.length < 2 || this.isProcessing;
        }
    }

    async handleMerge() {
        if (this.files.length < 2) {
            this.showError('Please select at least 2 PDF files to merge');
            return;
        }

        this.isProcessing = true;
        this.updateMergeButton();
        this.showProgress('Preparing PDFs for merge...', 0);

        try {
            const formData = new FormData();
            
            // Add files in order
            this.files.forEach((file, index) => {
                formData.append('files', file);
            });

            // Add options
            const addBookmarks = document.getElementById('add-bookmarks').checked;
            const optimizeSize = document.getElementById('optimize-size').checked;
            
            formData.append('add-bookmarks', addBookmarks);
            formData.append('optimize-size', optimizeSize);

            // Show progress updates
            this.showProgress('Merging PDFs...', 50);

            const response = await fetch('/api/tools/pdf-merger', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                this.showProgress('Merge completed!', 100);
                this.showSuccess(result);
                this.broadcastMergeComplete(result);
            } else {
                this.showError(result.error || 'Failed to merge PDFs');
            }
        } catch (error) {
            console.error('Merge error:', error);
            this.showError('Network error occurred while merging PDFs');
        } finally {
            this.isProcessing = false;
            this.updateMergeButton();
            this.hideProgress();
        }
    }

    showProgress(message, percentage) {
        const progressCard = document.getElementById('progress-card');
        const progressBar = progressCard?.querySelector('.progress-bar');
        const progressText = progressCard?.querySelector('#progress-text');
        
        if (progressCard) {
            progressCard.style.display = 'block';
            if (progressBar) progressBar.style.width = percentage + '%';
            if (progressText) progressText.textContent = message;
        }

        // Broadcast progress to collaborators
        if (window.wsClient) {
            window.wsClient.sendProgress(percentage, message);
        }
    }

    hideProgress() {
        const progressCard = document.getElementById('progress-card');
        if (progressCard) {
            progressCard.style.display = 'none';
        }
    }

    showSuccess(result) {
        const resultCard = document.getElementById('result-card');
        const successResult = document.getElementById('success-result');
        const successMessage = document.getElementById('success-message');
        const downloadBtn = document.getElementById('download-btn');
        
        if (resultCard && successResult) {
            resultCard.style.display = 'block';
            successResult.style.display = 'block';
            
            if (successMessage) {
                successMessage.textContent = result.message || 'PDFs merged successfully!';
            }
            
            if (downloadBtn && result.download_url) {
                downloadBtn.href = result.download_url;
                downloadBtn.onclick = () => this.downloadFile(result.download_url, result.output_file);
            }
        }
    }

    showError(message) {
        const resultCard = document.getElementById('result-card');
        const errorResult = document.getElementById('error-result');
        const errorMessage = document.getElementById('error-message');
        
        if (resultCard && errorResult) {
            resultCard.style.display = 'block';
            errorResult.style.display = 'block';
            
            if (errorMessage) {
                errorMessage.textContent = message;
            }
        }
        
        if (window.app) {
            window.app.showNotification(message, 'error');
        }
    }

    downloadFile(url, filename) {
        const a = document.createElement('a');
        a.href = url;
        a.download = filename || 'merged-document.pdf';
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Collaboration methods
    broadcastFileUpdate() {
        if (window.wsClient && window.wsClient.isConnected()) {
            window.wsClient.sendUpdate({
                type: 'files-update',
                files: this.files.map(f => ({ name: f.name, size: f.size }))
            });
        }
    }

    broadcastMergeComplete(result) {
        if (window.wsClient && window.wsClient.isConnected()) {
            window.wsClient.sendUpdate({
                type: 'merge-complete',
                result: result
            });
        }
    }

    handleCollaborationUpdate(data) {
        switch (data.type) {
            case 'files-update':
                this.handleRemoteFileUpdate(data.files);
                break;
            case 'merge-complete':
                this.handleRemoteMergeComplete(data.result);
                break;
        }
    }

    handleRemoteFileUpdate(files) {
        // Show notification about collaborator's file changes
        if (window.app) {
            window.app.showNotification(`${data.username} updated the file list`, 'info');
        }
    }

    handleRemoteMergeComplete(result) {
        // Show notification about collaborator's merge completion
        if (window.app) {
            window.app.showNotification(`${data.username} completed PDF merge`, 'success');
        }
    }

    // Public API
    reset() {
        this.files = [];
        this.updateFilesList();
        this.updateMergeButton();
        
        // Hide result cards
        const resultCard = document.getElementById('result-card');
        if (resultCard) {
            resultCard.style.display = 'none';
        }
    }

    getFiles() {
        return this.files;
    }

    addFiles(files) {
        this.handleFileSelection(files);
    }

    isReady() {
        return this.files.length >= 2 && !this.isProcessing;
    }
}

// Initialize PDF merger
const pdfMerger = new PDFMerger();

// Export for global access
window.PDFMerger = PDFMerger;
window.pdfMerger = pdfMerger;
