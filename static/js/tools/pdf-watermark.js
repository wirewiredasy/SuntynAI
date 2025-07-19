class PDFWatermarkPro {
    constructor() {
        this.pdfFile = null;
        this.watermarkImage = null;
        this.currentType = 'text';
        this.settings = {
            text: 'CONFIDENTIAL',
            opacity: 50,
            position: 'center',
            rotation: -45,
            fontSize: 36,
            color: '#ff6b6b',
            imageScale: 100
        };
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupDragAndDrop();
        this.updatePreview();
    }

    setupEventListeners() {
        const pdfInput = document.getElementById('pdfInput');
        const watermarkInput = document.getElementById('watermarkInput');
        const pdfDropZone = document.getElementById('pdfDropZone');
        const watermarkDropZone = document.getElementById('watermarkDropZone');
        const addWatermarkButton = document.getElementById('addWatermarkButton');
        const typeOptions = document.querySelectorAll('.type-option');
        const positionOptions = document.querySelectorAll('.position-option');

        // File inputs
        pdfInput.addEventListener('change', (e) => this.handlePDFSelect(e));
        watermarkInput.addEventListener('change', (e) => this.handleWatermarkSelect(e));
        
        // Drop zones
        pdfDropZone.addEventListener('click', () => pdfInput.click());
        watermarkDropZone.addEventListener('click', () => watermarkInput.click());
        
        // Watermark type selection
        typeOptions.forEach(option => {
            option.addEventListener('click', () => this.selectWatermarkType(option.dataset.type));
        });

        // Position selection
        positionOptions.forEach(option => {
            option.addEventListener('click', () => this.selectPosition(option.dataset.position));
        });

        // Control inputs
        document.getElementById('watermarkText').addEventListener('input', (e) => this.updateSetting('text', e.target.value));
        document.getElementById('fontSize').addEventListener('input', (e) => this.updateSetting('fontSize', parseInt(e.target.value)));
        document.getElementById('textColor').addEventListener('input', (e) => this.updateSetting('color', e.target.value));
        document.getElementById('opacitySlider').addEventListener('input', (e) => this.updateSetting('opacity', parseInt(e.target.value)));
        document.getElementById('rotationSlider').addEventListener('input', (e) => this.updateSetting('rotation', parseInt(e.target.value)));
        document.getElementById('imageScale').addEventListener('input', (e) => this.updateSetting('imageScale', parseInt(e.target.value)));

        // Process button
        addWatermarkButton.addEventListener('click', () => this.addWatermark());
    }

    setupDragAndDrop() {
        const pdfDropZone = document.getElementById('pdfDropZone');
        const watermarkDropZone = document.getElementById('watermarkDropZone');

        // PDF drop zone
        this.setupDropZone(pdfDropZone, (files) => {
            const pdfFiles = files.filter(file => file.type === 'application/pdf');
            if (pdfFiles.length > 0) {
                this.processPDFFile(pdfFiles[0]);
            }
        });

        // Watermark drop zone  
        this.setupDropZone(watermarkDropZone, (files) => {
            const imageFiles = files.filter(file => file.type.startsWith('image/'));
            if (imageFiles.length > 0) {
                this.processWatermarkFile(imageFiles[0]);
            }
        });
    }

    setupDropZone(dropZone, callback) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, this.preventDefaults, false);
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => dropZone.classList.add('drag-over'), false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => dropZone.classList.remove('drag-over'), false);
        });

        dropZone.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            const files = Array.from(dt.files);
            callback(files);
        }, false);
    }

    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    handlePDFSelect(e) {
        const files = Array.from(e.target.files).filter(file => file.type === 'application/pdf');
        if (files.length > 0) {
            this.processPDFFile(files[0]);
        }
    }

    handleWatermarkSelect(e) {
        const files = Array.from(e.target.files).filter(file => file.type.startsWith('image/'));
        if (files.length > 0) {
            this.processWatermarkFile(files[0]);
        }
    }

    processPDFFile(file) {
        if (file.size > 50 * 1024 * 1024) { // 50MB limit
            this.showNotification('PDF file too large. Maximum size is 50MB.', 'error');
            return;
        }

        this.pdfFile = file;
        this.showWatermarkOptions();
        this.updateAddButton();
    }

    processWatermarkFile(file) {
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
            this.showNotification('Image file too large. Maximum size is 10MB.', 'error');
            return;
        }

        this.watermarkImage = file;
        
        // Show image preview
        const reader = new FileReader();
        reader.onload = (e) => {
            this.updateImagePreview(e.target.result);
        };
        reader.readAsDataURL(file);
    }

    showWatermarkOptions() {
        const watermarkOptions = document.getElementById('watermarkOptions');
        const watermarkDropZone = document.getElementById('watermarkDropZone');
        
        watermarkOptions.style.display = 'block';
        
        if (this.currentType === 'image') {
            watermarkDropZone.style.display = 'block';
        }
    }

    selectWatermarkType(type) {
        const options = document.querySelectorAll('.type-option');
        const textControls = document.getElementById('textControls');
        const imageControls = document.getElementById('imageControls');
        const watermarkDropZone = document.getElementById('watermarkDropZone');

        options.forEach(opt => opt.classList.remove('active'));
        document.querySelector(`[data-type="${type}"]`).classList.add('active');

        this.currentType = type;

        if (type === 'text') {
            textControls.style.display = 'block';
            imageControls.style.display = 'none';
            watermarkDropZone.style.display = 'none';
        } else {
            textControls.style.display = 'none';
            imageControls.style.display = 'block';
            watermarkDropZone.style.display = 'block';
        }

        this.updatePreview();
        this.updateAddButton();
    }

    selectPosition(position) {
        const options = document.querySelectorAll('.position-option');
        options.forEach(opt => opt.classList.remove('active'));
        document.querySelector(`[data-position="${position}"]`).classList.add('active');

        this.settings.position = position;
        this.updatePreview();
    }

    updateSetting(key, value) {
        this.settings[key] = value;
        
        // Update display values
        if (key === 'fontSize') {
            document.getElementById('fontSizeValue').textContent = value;
        } else if (key === 'opacity') {
            document.getElementById('opacityValue').textContent = value;
        } else if (key === 'rotation') {
            document.getElementById('rotationValue').textContent = value;
        } else if (key === 'imageScale') {
            document.getElementById('imageScaleValue').textContent = value;
        }

        this.updatePreview();
    }

    updatePreview() {
        const preview = document.getElementById('watermarkPreview');
        
        if (this.currentType === 'text') {
            preview.className = 'watermark-preview text-watermark-preview';
            preview.textContent = this.settings.text;
            preview.style.fontSize = this.settings.fontSize + 'px';
            preview.style.color = this.settings.color;
        } else {
            preview.className = 'watermark-preview image-watermark-preview';
            if (this.watermarkImage) {
                preview.innerHTML = `<img src="${URL.createObjectURL(this.watermarkImage)}" 
                                   style="max-width: ${this.settings.imageScale}px; max-height: ${this.settings.imageScale}px;">`;
            }
        }

        // Apply common styles
        preview.style.opacity = this.settings.opacity / 100;
        preview.style.transform = `rotate(${this.settings.rotation}deg)`;
        
        // Position the preview
        this.positionPreview(preview);
    }

    positionPreview(preview) {
        const positions = {
            'top-left': { top: '10px', left: '10px' },
            'top-center': { top: '10px', left: '50%', transform: 'translateX(-50%)' },
            'top-right': { top: '10px', right: '10px' },
            'center-left': { top: '50%', left: '10px', transform: 'translateY(-50%)' },
            'center': { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
            'center-right': { top: '50%', right: '10px', transform: 'translateY(-50%)' },
            'bottom-left': { bottom: '10px', left: '10px' },
            'bottom-center': { bottom: '10px', left: '50%', transform: 'translateX(-50%)' },
            'bottom-right': { bottom: '10px', right: '10px' }
        };

        const pos = positions[this.settings.position] || positions.center;
        Object.assign(preview.style, pos);
    }

    updateImagePreview(imageSrc) {
        const preview = document.getElementById('watermarkPreview');
        if (this.currentType === 'image') {
            preview.innerHTML = `<img src="${imageSrc}" class="image-watermark-preview">`;
            this.updatePreview();
        }
    }

    updateAddButton() {
        const addButton = document.getElementById('addWatermarkButton');
        const canProcess = this.pdfFile && (
            this.currentType === 'text' || 
            (this.currentType === 'image' && this.watermarkImage)
        );
        
        addButton.disabled = !canProcess;
    }

    async addWatermark() {
        if (!this.pdfFile) {
            this.showNotification('Please select a PDF file first', 'error');
            return;
        }

        if (this.currentType === 'image' && !this.watermarkImage) {
            this.showNotification('Please select a watermark image', 'error');
            return;
        }

        const addButton = document.getElementById('addWatermarkButton');
        const progressContainer = document.getElementById('progressContainer');

        addButton.disabled = true;
        progressContainer.style.display = 'block';

        const formData = new FormData();
        formData.append('file', this.pdfFile);
        formData.append('watermark_type', this.currentType);

        if (this.currentType === 'text') {
            formData.append('watermark_text', this.settings.text);
            formData.append('font_size', this.settings.fontSize);
            formData.append('text_color', this.settings.color);
        } else {
            formData.append('watermark_image', this.watermarkImage);
            formData.append('image_scale', this.settings.imageScale);
        }

        formData.append('opacity', this.settings.opacity);
        formData.append('position', this.settings.position);
        formData.append('rotation', this.settings.rotation);

        try {
            const response = await fetch('/process_tool/pdf-watermark', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                this.showResult(result);
            } else {
                this.showError(result.error || 'Watermark failed');
            }
        } catch (error) {
            this.showError('Network error: ' + error.message);
        }
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
            link.download = data.filename || 'watermarked_pdf.pdf';
            link.click();
        };

        this.showNotification('Watermark added successfully!', 'success');
    }

    showError(message) {
        const progressContainer = document.getElementById('progressContainer');
        const addButton = document.getElementById('addWatermarkButton');

        progressContainer.style.display = 'none';
        addButton.disabled = false;

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
    window.pdfWatermark = new PDFWatermarkPro();
});