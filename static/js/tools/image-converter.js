// Modern JavaScript for image-converter
class ImageconverterTool {
    constructor() {
        this.files = [];
        this.isProcessing = false;
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        const dropZone = document.getElementById('dropZone');
        const fileInput = document.getElementById('fileInput');
        const processBtn = document.getElementById('processBtn');

        // Drag and drop functionality
        dropZone.addEventListener('click', () => fileInput.click());
        dropZone.addEventListener('dragover', this.handleDragOver.bind(this));
        dropZone.addEventListener('dragleave', this.handleDragLeave.bind(this));
        dropZone.addEventListener('drop', this.handleDrop.bind(this));

        // File input change
        fileInput.addEventListener('change', this.handleFileSelect.bind(this));

        // Process button
        processBtn.addEventListener('click', this.processFiles.bind(this));
    }

    handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.classList.add('dragover');
    }

    handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.classList.remove('dragover');
    }

    handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.classList.remove('dragover');
        
        const files = Array.from(e.dataTransfer.files);
        this.addFiles(files);
    }

    handleFileSelect(e) {
        const files = Array.from(e.target.files);
        this.addFiles(files);
    }

    addFiles(files) {
        this.files = [...this.files, ...files];
        this.updateUI();
    }

    updateUI() {
        const processBtn = document.getElementById('processBtn');
        const processingOptions = document.getElementById('processingOptions');
        
        if (this.files.length > 0) {
            processBtn.disabled = false;
            processingOptions.classList.remove('hidden');
            this.displayFileList();
        } else {
            processBtn.disabled = true;
            processingOptions.classList.add('hidden');
        }
    }

    displayFileList() {
        const dropZone = document.getElementById('dropZone');
        const fileList = this.files.map(file => `
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div class="flex items-center space-x-3">
                    <i class="fas fa-file text-gray-400"></i>
                    <span class="text-sm font-medium">${file.name}</span>
                </div>
                <span class="text-xs text-gray-500">${this.formatFileSize(file.size)}</span>
            </div>
        `).join('');

        dropZone.innerHTML = `
            <div class="text-center">
                <i class="fas fa-check-circle text-green-500 text-4xl mb-4"></i>
                <h3 class="text-lg font-semibold text-gray-700 mb-2">${this.files.length} file(s) selected</h3>
                <button class="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                    <i class="fas fa-plus mr-2"></i>Add More Files
                </button>
            </div>
            <div class="mt-4 space-y-2">${fileList}</div>
        `;
    }

    async processFiles() {
        if (this.isProcessing) return;
        
        this.isProcessing = true;
        const processBtn = document.getElementById('processBtn');
        const progressContainer = document.getElementById('progressContainer');
        const progressBar = document.getElementById('progressBar');
        const progressPercent = document.getElementById('progressPercent');
        const results = document.getElementById('results');

        // Show progress
        processBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Processing...';
        processBtn.disabled = true;
        progressContainer.classList.remove('hidden');

        try {
            const formData = new FormData();
            formData.append('tool_name', 'image-converter');
            
            this.files.forEach((file, index) => {
                formData.append(`file_${index}`, file);
            });

            // Get processing options
            const quality = document.querySelector('input[name="quality"]:checked')?.value || 'high';
            formData.append('quality', quality);

            // Simulate progress
            let progress = 0;
            const progressInterval = setInterval(() => {
                progress += Math.random() * 15;
                if (progress > 95) progress = 95;
                progressBar.style.width = `${progress}%`;
                progressPercent.textContent = `${Math.round(progress)}%`;
            }, 200);

            // Make API call
            const response = await fetch('/process-tool', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            
            clearInterval(progressInterval);
            progressBar.style.width = '100%';
            progressPercent.textContent = '100%';

            // Show results
            setTimeout(() => {
                this.displayResults(result);
                progressContainer.classList.add('hidden');
                results.classList.remove('hidden');
            }, 500);

        } catch (error) {
            console.error('Processing error:', error);
            this.showError('Processing failed. Please try again.');
        } finally {
            this.isProcessing = false;
            processBtn.innerHTML = '<i class="fas fa-play mr-2"></i>Process Files';
            processBtn.disabled = false;
        }
    }

    displayResults(result) {
        const resultsList = document.getElementById('resultsList');
        
        if (result.success) {
            resultsList.innerHTML = `
                <div class="result-card">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-3">
                            <i class="fas fa-check-circle text-green-500 text-2xl success-checkmark"></i>
                            <div>
                                <h4 class="font-semibold text-gray-900">Processing Complete!</h4>
                                <p class="text-sm text-gray-600">Your files have been processed successfully</p>
                            </div>
                        </div>
                        <button class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                            <i class="fas fa-download mr-2"></i>Download
                        </button>
                    </div>
                    <div class="mt-4 p-3 bg-gray-50 rounded-lg">
                        <div class="text-sm text-gray-600">
                            <strong>Processing time:</strong> ${result.processing_time || '2.3s'}
                        </div>
                        <div class="text-sm text-gray-600">
                            <strong>Files processed:</strong> ${this.files.length}
                        </div>
                    </div>
                </div>
            `;
        } else {
            this.showError(result.error || 'Processing failed');
        }
    }

    showError(message) {
        const resultsList = document.getElementById('resultsList');
        const results = document.getElementById('results');
        
        resultsList.innerHTML = `
            <div class="result-card border-red-200 bg-red-50">
                <div class="flex items-center space-x-3">
                    <i class="fas fa-exclamation-triangle text-red-500 text-2xl"></i>
                    <div>
                        <h4 class="font-semibold text-red-900">Processing Failed</h4>
                        <p class="text-sm text-red-600">${message}</p>
                    </div>
                </div>
            </div>
        `;
        results.classList.remove('hidden');
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Initialize the tool when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    new ImageconverterTool();
});

// Add smooth scrolling and modern interactions
document.addEventListener('DOMContentLoaded', function() {
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Add loading animation to buttons
    document.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', function() {
            if (!this.disabled) {
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = 'scale(1)';
                }, 150);
            }
        });
    });
});
