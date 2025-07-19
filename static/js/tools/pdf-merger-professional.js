class PDFMergerPro {
    constructor() {
        this.files = [];
        this.currentDragIndex = null;
        this.socket = io();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupDragAndDrop();
        this.setupSortable();
    }

    setupEventListeners() {
        const fileInput = document.getElementById('fileInput');
        const dropZone = document.getElementById('dropZone');
        const mergeButton = document.getElementById('mergeButton');

        fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        dropZone.addEventListener('click', () => fileInput.click());
        mergeButton.addEventListener('click', () => this.mergePDFs());

        // Socket events
        this.socket.on('merge_progress', (data) => this.updateProgress(data.progress));
        this.socket.on('merge_complete', (data) => this.showResult(data));
        this.socket.on('merge_error', (data) => this.showError(data.error));
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

    setupSortable() {
        const fileList = document.getElementById('fileList');
        
        // Enable drag and drop reordering
        fileList.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('file-item')) {
                this.currentDragIndex = Array.from(fileList.children).indexOf(e.target);
                e.target.classList.add('dragging');
            }
        });

        fileList.addEventListener('dragend', (e) => {
            if (e.target.classList.contains('file-item')) {
                e.target.classList.remove('dragging');
                this.currentDragIndex = null;
            }
        });

        fileList.addEventListener('dragover', (e) => {
            e.preventDefault();
            const draggingItem = fileList.querySelector('.dragging');
            const siblings = [...fileList.querySelectorAll('.file-item:not(.dragging)')];
            
            const nextSibling = siblings.find(sibling => {
                return e.clientY <= sibling.offsetTop + sibling.offsetHeight / 2;
            });

            fileList.insertBefore(draggingItem, nextSibling);
        });

        fileList.addEventListener('drop', (e) => {
            e.preventDefault();
            this.reorderFiles();
        });
    }

    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    handleDrop(e) {
        const dt = e.dataTransfer;
        const files = Array.from(dt.files).filter(file => file.type === 'application/pdf');
        this.addFiles(files);
    }

    handleFileSelect(e) {
        const files = Array.from(e.target.files).filter(file => file.type === 'application/pdf');
        this.addFiles(files);
    }

    addFiles(newFiles) {
        newFiles.forEach(file => {
            if (file.size > 50 * 1024 * 1024) { // 50MB limit
                this.showNotification('File too large: ' + file.name, 'error');
                return;
            }
            
            this.files.push({
                file: file,
                id: Date.now() + Math.random(),
                name: file.name,
                size: file.size
            });
        });

        this.updateFileList();
        this.updateUI();
    }

    updateFileList() {
        const fileList = document.getElementById('fileList');
        fileList.innerHTML = '';

        this.files.forEach((fileObj, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.draggable = true;
            fileItem.innerHTML = `
                <div class="drag-handle">
                    <i class="fas fa-grip-vertical"></i>
                </div>
                <div class="file-info">
                    <div class="file-name">${fileObj.name}</div>
                    <div class="file-size">${this.formatFileSize(fileObj.size)}</div>
                </div>
                <button type="button" class="remove-file" onclick="pdfMerger.removeFile(${index})">
                    <i class="fas fa-times"></i>
                </button>
            `;
            fileList.appendChild(fileItem);
        });
    }

    removeFile(index) {
        this.files.splice(index, 1);
        this.updateFileList();
        this.updateUI();
    }

    reorderFiles() {
        const fileList = document.getElementById('fileList');
        const items = Array.from(fileList.children);
        const newOrder = [];

        items.forEach(item => {
            const fileName = item.querySelector('.file-name').textContent;
            const fileObj = this.files.find(f => f.name === fileName);
            if (fileObj) newOrder.push(fileObj);
        });

        this.files = newOrder;
        this.updateUI();
    }

    updateUI() {
        const fileCounter = document.getElementById('fileCounter');
        const mergeButton = document.getElementById('mergeButton');

        fileCounter.textContent = `${this.files.length} files selected`;
        mergeButton.disabled = this.files.length < 2;

        if (this.files.length > 0) {
            fileCounter.style.background = 'linear-gradient(45deg, #48bb78, #38a169)';
        } else {
            fileCounter.style.background = 'linear-gradient(45deg, #667eea, #764ba2)';
        }
    }

    async mergePDFs() {
        if (this.files.length < 2) {
            this.showNotification('Please select at least 2 PDF files', 'error');
            return;
        }

        const mergeButton = document.getElementById('mergeButton');
        const progressContainer = document.getElementById('progressContainer');

        mergeButton.disabled = true;
        progressContainer.style.display = 'block';

        const formData = new FormData();
        this.files.forEach((fileObj, index) => {
            formData.append('files', fileObj.file);
            formData.append('order', index);
        });

        try {
            const response = await fetch('/process_tool/pdf-merger', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                this.showResult(result);
            } else {
                this.showError(result.error || 'Merge failed');
            }
        } catch (error) {
            this.showError('Network error: ' + error.message);
        }
    }

    updateProgress(progress) {
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');

        progressFill.style.width = progress + '%';
        progressText.textContent = progress + '%';
    }

    showResult(data) {
        const progressContainer = document.getElementById('progressContainer');
        const resultContainer = document.getElementById('resultContainer');
        const downloadButton = document.getElementById('downloadButton');

        progressContainer.style.display = 'none';
        resultContainer.style.display = 'block';

        downloadButton.onclick = () => {
            const link = document.createElement('a');
            link.href = data.download_url;
            link.download = data.filename || 'merged_pdf.pdf';
            link.click();
        };

        this.showNotification('PDFs merged successfully!', 'success');
    }

    showError(message) {
        const progressContainer = document.getElementById('progressContainer');
        const mergeButton = document.getElementById('mergeButton');

        progressContainer.style.display = 'none';
        mergeButton.disabled = false;

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

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.pdfMerger = new PDFMergerPro();
});