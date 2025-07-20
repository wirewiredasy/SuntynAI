// Tool functionality JavaScript
class ToolProcessor {
    constructor() {
        this.currentFile = null;
        this.toolId = this.getToolId();
        this.initializeEventListeners();
        this.setupDragDrop();
    }

    getToolId() {
        // Extract tool ID from URL path
        const path = window.location.pathname;
        return path.split('/').pop();
    }

    initializeEventListeners() {
        // File input change
        const fileInput = document.getElementById('fileInput');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        }

        // Upload zone click
        const uploadZone = document.getElementById('uploadZone');
        if (uploadZone) {
            uploadZone.addEventListener('click', () => {
                if (!uploadZone.classList.contains('file-selected')) {
                    fileInput.click();
                }
            });
        }
    }

    setupDragDrop() {
        const uploadZone = document.getElementById('uploadZone');
        if (!uploadZone) return;

        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadZone.addEventListener(eventName, this.preventDefaults, false);
            document.body.addEventListener(eventName, this.preventDefaults, false);
        });

        // Highlight drop area when item is dragged over it
        ['dragenter', 'dragover'].forEach(eventName => {
            uploadZone.addEventListener(eventName, () => this.highlight(uploadZone), false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            uploadZone.addEventListener(eventName, () => this.unhighlight(uploadZone), false);
        });

        // Handle dropped files
        uploadZone.addEventListener('drop', (e) => this.handleDrop(e), false);
    }

    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    highlight(element) {
        element.classList.add('drag-over');
    }

    unhighlight(element) {
        element.classList.remove('drag-over');
    }

    handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length > 0) {
            this.handleFile(files[0]);
        }
    }

    handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            this.handleFile(file);
        }
    }

    handleFile(file) {
        this.currentFile = file;
        this.displayFileInfo(file);
        this.showNextStep();
    }

    displayFileInfo(file) {
        const uploadZone = document.getElementById('uploadZone');
        const fileInfo = document.getElementById('fileInfo');
        const fileName = document.getElementById('fileName');
        const fileSize = document.getElementById('fileSize');

        // Hide upload content and show file info
        uploadZone.querySelector('.upload-content').classList.add('d-none');
        fileInfo.classList.remove('d-none');
        uploadZone.classList.add('file-selected');

        // Set file details
        fileName.textContent = file.name;
        fileSize.textContent = this.formatFileSize(file.size);
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    showNextStep() {
        // Show configuration step
        const configStep = document.getElementById('configStep');
        const processStep = document.getElementById('processStep');
        
        if (configStep) {
            configStep.classList.remove('d-none');
            configStep.classList.add('animate-in');
            this.generateConfigOptions();
        }
        
        if (processStep) {
            processStep.classList.remove('d-none');
            processStep.classList.add('animate-in');
        }

        // Scroll to next step
        setTimeout(() => {
            configStep.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
    }

    generateConfigOptions() {
        const configOptions = document.getElementById('configOptions');
        if (!configOptions) return;

        // Generate options based on tool type
        const toolConfigs = this.getToolConfigs();
        configOptions.innerHTML = toolConfigs;
    }

    getToolConfigs() {
        const toolConfigs = {
            // PDF Tools
            'pdf-merger': `
                <div class="config-group">
                    <label for="mergeOrder">Merge Order</label>
                    <select class="form-select" id="mergeOrder">
                        <option value="filename">Sort by filename</option>
                        <option value="upload">Keep upload order</option>
                        <option value="size">Sort by file size</option>
                    </select>
                </div>
            `,
            'pdf-compressor': `
                <div class="config-group">
                    <label for="compressionLevel">Compression Level</label>
                    <select class="form-select" id="compressionLevel">
                        <option value="low">Low (Better quality)</option>
                        <option value="medium" selected>Medium (Balanced)</option>
                        <option value="high">High (Smaller size)</option>
                    </select>
                </div>
            `,
            'pdf-splitter': `
                <div class="config-group">
                    <label for="splitType">Split Type</label>
                    <select class="form-select" id="splitType">
                        <option value="pages">By page range</option>
                        <option value="size">By file size</option>
                        <option value="each">Each page separately</option>
                    </select>
                </div>
                <div class="config-group">
                    <label for="pageRange">Page Range (e.g., 1-5, 10-15)</label>
                    <input type="text" class="form-control" id="pageRange" placeholder="1-5">
                </div>
            `,
            // Image Tools
            'image-resize': `
                <div class="config-group">
                    <label for="width">Width (pixels)</label>
                    <input type="number" class="form-control" id="width" placeholder="800">
                </div>
                <div class="config-group">
                    <label for="height">Height (pixels)</label>
                    <input type="number" class="form-control" id="height" placeholder="600">
                </div>
                <div class="config-group">
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" id="maintainAspect" checked>
                        <label class="form-check-label" for="maintainAspect">
                            Maintain aspect ratio
                        </label>
                    </div>
                </div>
            `,
            'image-compress': `
                <div class="config-group">
                    <label for="quality">Quality Level</label>
                    <input type="range" class="form-range" id="quality" min="10" max="100" value="80">
                    <div class="d-flex justify-content-between">
                        <small>Lower size</small>
                        <small id="qualityValue">80%</small>
                        <small>Higher quality</small>
                    </div>
                </div>
            `,
            // Audio Tools
            'audio-trim': `
                <div class="config-group">
                    <label for="startTime">Start Time (seconds)</label>
                    <input type="number" class="form-control" id="startTime" placeholder="0" min="0">
                </div>
                <div class="config-group">
                    <label for="endTime">End Time (seconds)</label>
                    <input type="number" class="form-control" id="endTime" placeholder="30" min="1">
                </div>
            `,
            'audio-convert': `
                <div class="config-group">
                    <label for="outputFormat">Output Format</label>
                    <select class="form-select" id="outputFormat">
                        <option value="mp3">MP3</option>
                        <option value="wav">WAV</option>
                        <option value="ogg">OGG</option>
                        <option value="aac">AAC</option>
                    </select>
                </div>
                <div class="config-group">
                    <label for="bitrate">Audio Bitrate</label>
                    <select class="form-select" id="bitrate">
                        <option value="128">128 kbps</option>
                        <option value="192" selected>192 kbps</option>
                        <option value="256">256 kbps</option>
                        <option value="320">320 kbps</option>
                    </select>
                </div>
            `,
            // Government Tools
            'pan-validator': `
                <div class="config-group">
                    <label for="panNumber">PAN Number</label>
                    <input type="text" class="form-control" id="panNumber" placeholder="ABCDE1234F" maxlength="10">
                    <small class="form-text text-muted">Format: ABCDE1234F</small>
                </div>
            `,
            'aadhaar-mask': `
                <div class="config-group">
                    <label for="maskType">Masking Type</label>
                    <select class="form-select" id="maskType">
                        <option value="partial">Partial (show last 4 digits)</option>
                        <option value="full">Full masking</option>
                        <option value="center">Center masking</option>
                    </select>
                </div>
            `
        };

        return toolConfigs[this.toolId] || `
            <div class="config-group">
                <div class="alert alert-info">
                    <i class="fas fa-info-circle me-2"></i>
                    This tool uses default settings. Click process to continue.
                </div>
            </div>
        `;
    }

    removeFile() {
        this.currentFile = null;
        const uploadZone = document.getElementById('uploadZone');
        const fileInfo = document.getElementById('fileInfo');
        const configStep = document.getElementById('configStep');
        const processStep = document.getElementById('processStep');

        // Reset upload zone
        uploadZone.querySelector('.upload-content').classList.remove('d-none');
        fileInfo.classList.add('d-none');
        uploadZone.classList.remove('file-selected');

        // Hide next steps
        configStep.classList.add('d-none');
        processStep.classList.add('d-none');

        // Clear file input
        document.getElementById('fileInput').value = '';
    }

    async processFile() {
        if (!this.currentFile) {
            alert('Please select a file first.');
            return;
        }

        const progressSection = document.getElementById('progressSection');
        const progressBar = document.getElementById('progressBar');
        const progressText = document.getElementById('progressText');
        const resultSection = document.getElementById('resultSection');
        const processBtn = document.getElementById('processBtn');

        // Show progress
        progressSection.classList.remove('d-none');
        processBtn.disabled = true;
        processBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Processing...';

        try {
            // Create FormData with file and configuration
            const formData = new FormData();
            formData.append('file', this.currentFile);
            
            // Add configuration options
            this.addConfigToFormData(formData);

            // Start progress animation
            this.simulateProgress(progressBar, progressText);

            // Send request to backend
            const response = await fetch(`/process/${this.toolId}`, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                // Stop progress and show result
                setTimeout(() => {
                    progressSection.classList.add('d-none');
                    resultSection.classList.remove('d-none');
                    resultSection.classList.add('show');
                    
                    // Setup download button
                    const downloadBtn = document.getElementById('downloadBtn');
                    downloadBtn.onclick = () => this.downloadResult(result.download_url, result.filename);
                    
                    // Scroll to result
                    resultSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 1000);
            } else {
                throw new Error(result.error || 'Processing failed');
            }
        } catch (error) {
            progressSection.classList.add('d-none');
            processBtn.disabled = false;
            processBtn.innerHTML = '<i class="fas fa-cogs me-2"></i>Process ' + this.getToolName();
            
            this.showNotification('Error: ' + error.message, 'danger');
        }
    }

    async simulateProgress(progressBar, progressText) {
        const steps = [
            'Uploading file...',
            'Analyzing content...',
            'Processing with AI...',
            'Optimizing output...',
            'Finalizing...'
        ];

        for (let i = 0; i < steps.length; i++) {
            progressText.textContent = steps[i];
            const progress = ((i + 1) / steps.length) * 100;
            progressBar.style.width = progress + '%';
            await new Promise(resolve => setTimeout(resolve, 800));
        }
    }

    addConfigToFormData(formData) {
        // Add all form inputs to FormData
        const configInputs = document.querySelectorAll('#configOptions input, #configOptions select');
        configInputs.forEach(input => {
            if (input.type === 'checkbox') {
                if (input.checked) {
                    formData.append(input.name || input.id, 'on');
                }
            } else {
                formData.append(input.name || input.id, input.value);
            }
        });
    }

    downloadResult(downloadUrl, filename) {
        if (downloadUrl) {
            // Use the actual download URL from backend
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = filename || 'processed_file';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } else {
            // Fallback for demo
            const blob = new Blob(['Processed file content'], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `processed_${this.currentFile.name}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
        
        // Show success message
        this.showNotification('File downloaded successfully!', 'success');
    }

    resetTool() {
        this.removeFile();
        const resultSection = document.getElementById('resultSection');
        const processBtn = document.getElementById('processBtn');
        
        resultSection.classList.add('d-none');
        processBtn.disabled = false;
        processBtn.innerHTML = '<i class="fas fa-cogs me-2"></i>Process ' + this.getToolName();
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    getToolName() {
        const title = document.title;
        return title.split(' - ')[0];
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} position-fixed`;
        notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check' : 'info'}-circle me-2"></i>
            ${message}
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Global functions for template access
function removeFile() {
    if (window.toolProcessor) {
        window.toolProcessor.removeFile();
    }
}

function processFile() {
    if (window.toolProcessor) {
        window.toolProcessor.processFile();
    }
}

function resetTool() {
    if (window.toolProcessor) {
        window.toolProcessor.resetTool();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.toolProcessor = new ToolProcessor();
    
    // Quality slider update
    const qualitySlider = document.getElementById('quality');
    if (qualitySlider) {
        const qualityValue = document.getElementById('qualityValue');
        qualitySlider.addEventListener('input', function() {
            qualityValue.textContent = this.value + '%';
        });
    }
    
    // Maintain aspect ratio checkbox
    const maintainAspect = document.getElementById('maintainAspect');
    const widthInput = document.getElementById('width');
    const heightInput = document.getElementById('height');
    
    if (maintainAspect && widthInput && heightInput) {
        let aspectRatio = null;
        
        widthInput.addEventListener('input', function() {
            if (maintainAspect.checked && aspectRatio) {
                heightInput.value = Math.round(this.value / aspectRatio);
            }
        });
        
        heightInput.addEventListener('input', function() {
            if (maintainAspect.checked && aspectRatio) {
                widthInput.value = Math.round(this.value * aspectRatio);
            }
        });
        
        // Set initial aspect ratio when file is loaded
        if (window.toolProcessor && window.toolProcessor.currentFile) {
            // This would be set from image dimensions in a real implementation
            aspectRatio = 16/9; // Default aspect ratio
        }
    }
});