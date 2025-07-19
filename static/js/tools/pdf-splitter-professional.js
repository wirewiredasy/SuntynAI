class PDFSplitterPro {
    constructor() {
        this.pdfFile = null;
        this.totalPages = 0;
        this.selectedMethod = 'pages';
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
        const splitButton = document.getElementById('splitButton');
        const splitOptions = document.querySelectorAll('.split-option');
        const startPage = document.getElementById('startPage');
        const endPage = document.getElementById('endPage');
        const startSlider = document.getElementById('startSlider');
        const endSlider = document.getElementById('endSlider');
        const everyNPages = document.getElementById('everyNPages');

        fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        dropZone.addEventListener('click', () => fileInput.click());
        splitButton.addEventListener('click', () => this.splitPDF());

        splitOptions.forEach(option => {
            option.addEventListener('click', () => this.selectSplitMethod(option.dataset.method));
        });

        // Page range inputs
        startPage.addEventListener('input', () => this.updatePageRange('start'));
        endPage.addEventListener('input', () => this.updatePageRange('end'));
        startSlider.addEventListener('input', () => this.updatePageRange('start'));
        endSlider.addEventListener('input', () => this.updatePageRange('end'));
        everyNPages.addEventListener('input', () => this.validateEveryPages());

        // Socket events
        this.socket.on('split_progress', (data) => this.updateProgress(data.progress));
        this.socket.on('split_complete', (data) => this.showResult(data));
        this.socket.on('split_error', (data) => this.showError(data.error));
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
        this.analyzePDF(file);
    }

    async analyzePDF(file) {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/analyze_pdf', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                this.totalPages = result.pages;
                this.setupPageControls();
                this.showSplitOptions();
            } else {
                this.showError(result.error || 'Failed to analyze PDF');
            }
        } catch (error) {
            this.showError('Network error: ' + error.message);
        }
    }

    setupPageControls() {
        const startPage = document.getElementById('startPage');
        const endPage = document.getElementById('endPage');
        const startSlider = document.getElementById('startSlider');
        const endSlider = document.getElementById('endSlider');

        // Set max values
        startPage.max = this.totalPages;
        endPage.max = this.totalPages;
        startSlider.max = this.totalPages;
        endSlider.max = this.totalPages;

        // Set default values
        startPage.value = 1;
        endPage.value = this.totalPages;
        startSlider.value = 1;
        endSlider.value = this.totalPages;

        this.updatePagePreview();
    }

    showSplitOptions() {
        const splitOptions = document.getElementById('splitOptions');
        splitOptions.style.display = 'block';
        this.selectSplitMethod('pages'); // Default selection
    }

    selectSplitMethod(method) {
        const options = document.querySelectorAll('.split-option');
        const pageRangeSelector = document.getElementById('pageRangeSelector');
        const everyPagesSelector = document.getElementById('everyPagesSelector');
        const splitButton = document.getElementById('splitButton');

        // Remove active class from all options
        options.forEach(opt => opt.classList.remove('active'));

        // Add active class to selected option
        const selectedOption = document.querySelector(`[data-method="${method}"]`);
        selectedOption.classList.add('active');

        this.selectedMethod = method;

        // Show/hide relevant controls
        pageRangeSelector.style.display = (method === 'pages' || method === 'range') ? 'block' : 'none';
        everyPagesSelector.style.display = method === 'every' ? 'block' : 'none';

        splitButton.disabled = false;
        this.updatePagePreview();
    }

    updatePageRange(type) {
        const startPage = document.getElementById('startPage');
        const endPage = document.getElementById('endPage');
        const startSlider = document.getElementById('startSlider');
        const endSlider = document.getElementById('endSlider');

        if (type === 'start') {
            const value = Math.max(1, Math.min(parseInt(startPage.value) || 1, this.totalPages));
            startPage.value = value;
            startSlider.value = value;

            // Ensure end page is not less than start page
            if (parseInt(endPage.value) < value) {
                endPage.value = value;
                endSlider.value = value;
            }
        } else {
            const value = Math.max(parseInt(startPage.value) || 1, Math.min(parseInt(endPage.value) || this.totalPages, this.totalPages));
            endPage.value = value;
            endSlider.value = value;
        }

        this.updatePagePreview();
    }

    updatePagePreview() {
        const pagePreview = document.getElementById('pagePreview');
        const startPage = parseInt(document.getElementById('startPage').value) || 1;
        const endPage = parseInt(document.getElementById('endPage').value) || this.totalPages;

        let previewHTML = '';

        if (this.selectedMethod === 'pages' || this.selectedMethod === 'range') {
            previewHTML = '<div class="mb-2">Pages to extract:</div>';
            for (let i = startPage; i <= Math.min(endPage, startPage + 10); i++) {
                previewHTML += `<div class="preview-page selected" data-page="${i}"></div>`;
            }
            if (endPage > startPage + 10) {
                previewHTML += `<span class="text-muted">... and ${endPage - startPage - 10} more pages</span>`;
            }
        } else if (this.selectedMethod === 'every') {
            const everyN = parseInt(document.getElementById('everyNPages').value) || 1;
            const numFiles = Math.ceil(this.totalPages / everyN);
            previewHTML = `<div class="mb-2">Will create ${numFiles} files:</div>`;
            for (let i = 0; i < Math.min(numFiles, 5); i++) {
                const startP = i * everyN + 1;
                const endP = Math.min((i + 1) * everyN, this.totalPages);
                previewHTML += `<div class="small border rounded p-2 m-1 d-inline-block">File ${i + 1}: Pages ${startP}-${endP}</div>`;
            }
            if (numFiles > 5) {
                previewHTML += `<div class="text-muted">... and ${numFiles - 5} more files</div>`;
            }
        }

        pagePreview.innerHTML = previewHTML;
    }

    validateEveryPages() {
        const everyNPages = document.getElementById('everyNPages');
        const value = Math.max(1, Math.min(parseInt(everyNPages.value) || 1, this.totalPages));
        everyNPages.value = value;
        this.updatePagePreview();
    }

    async splitPDF() {
        if (!this.pdfFile) {
            this.showNotification('Please select a PDF file first', 'error');
            return;
        }

        const splitButton = document.getElementById('splitButton');
        const progressContainer = document.getElementById('progressContainer');

        splitButton.disabled = true;
        progressContainer.style.display = 'block';

        const formData = new FormData();
        formData.append('file', this.pdfFile);
        formData.append('method', this.selectedMethod);

        if (this.selectedMethod === 'pages' || this.selectedMethod === 'range') {
            formData.append('start_page', document.getElementById('startPage').value);
            formData.append('end_page', document.getElementById('endPage').value);
        } else if (this.selectedMethod === 'every') {
            formData.append('every_n_pages', document.getElementById('everyNPages').value);
        }

        try {
            const response = await fetch('/process_tool/pdf-splitter', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                this.showResult(result);
            } else {
                this.showError(result.error || 'Split failed');
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
        const downloadLinks = document.getElementById('downloadLinks');

        progressContainer.style.display = 'none';
        resultContainer.style.display = 'block';

        // Create download links for each file
        let linksHTML = '';
        if (data.files && data.files.length > 0) {
            data.files.forEach((file, index) => {
                linksHTML += `
                    <div class="mb-2">
                        <button type="button" class="btn btn-success btn-lg w-100" onclick="window.open('${file.download_url}', '_blank')">
                            <i class="fas fa-download me-2"></i>Download ${file.filename}
                        </button>
                    </div>
                `;
            });
        } else {
            linksHTML = `
                <button type="button" class="btn btn-success btn-lg w-100" onclick="window.open('${data.download_url}', '_blank')">
                    <i class="fas fa-download me-2"></i>Download Split PDF
                </button>
            `;
        }

        downloadLinks.innerHTML = linksHTML;
        this.showNotification('PDF split successfully!', 'success');
    }

    showError(message) {
        const progressContainer = document.getElementById('progressContainer');
        const splitButton = document.getElementById('splitButton');

        progressContainer.style.display = 'none';
        splitButton.disabled = false;

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
    window.pdfSplitter = new PDFSplitterPro();
});