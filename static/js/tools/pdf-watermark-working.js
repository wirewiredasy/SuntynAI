// Working PDF Watermark - TinyWow/iLovePDF Style
class PDFWatermarkWorking {
    constructor() {
        this.selectedFile = null;
        this.watermarkImage = null;
        this.watermarkType = 'text';
        this.settings = {
            text: 'CONFIDENTIAL',
            opacity: 50,
            position: 'center',
            rotation: -45,
            fontSize: 36,
            color: '#ff6b6b'
        };
        this.init();
    }

    init() {
        console.log('PDF Watermark initialized');
        this.setupEventListeners();
        this.setupDragDrop();
    }

    setupEventListeners() {
        // PDF file input
        const pdfInput = document.getElementById('pdfInput');
        if (pdfInput) {
            pdfInput.addEventListener('change', (e) => {
                this.handlePDFFile(e.target.files[0]);
            });
        }

        // Watermark image input
        const watermarkInput = document.getElementById('watermarkInput');
        if (watermarkInput) {
            watermarkInput.addEventListener('change', (e) => {
                this.handleWatermarkImage(e.target.files[0]);
            });
        }

        // Drop zones
        const pdfDropZone = document.getElementById('pdfDropZone');
        if (pdfDropZone) {
            pdfDropZone.addEventListener('click', () => pdfInput?.click());
        }

        const watermarkDropZone = document.getElementById('watermarkDropZone');
        if (watermarkDropZone) {
            watermarkDropZone.addEventListener('click', () => watermarkInput?.click());
        }

        // Watermark type selection
        const typeOptions = document.querySelectorAll('.type-option');
        typeOptions.forEach(option => {
            option.addEventListener('click', () => {
                this.selectWatermarkType(option.dataset.type);
            });
        });

        // Position selection
        const positionOptions = document.querySelectorAll('.position-option');
        positionOptions.forEach(option => {
            option.addEventListener('click', () => {
                this.selectPosition(option.dataset.position);
            });
        });

        // Text controls
        const watermarkText = document.getElementById('watermarkText');
        if (watermarkText) {
            watermarkText.addEventListener('input', (e) => {
                this.settings.text = e.target.value;
                this.updatePreview();
            });
        }

        const fontSize = document.getElementById('fontSize');
        if (fontSize) {
            fontSize.addEventListener('input', (e) => {
                this.settings.fontSize = parseInt(e.target.value);
                document.getElementById('fontSizeValue').textContent = e.target.value;
                this.updatePreview();
            });
        }

        const textColor = document.getElementById('textColor');
        if (textColor) {
            textColor.addEventListener('input', (e) => {
                this.settings.color = e.target.value;
                this.updatePreview();
            });
        }

        const opacitySlider = document.getElementById('opacitySlider');
        if (opacitySlider) {
            opacitySlider.addEventListener('input', (e) => {
                this.settings.opacity = parseInt(e.target.value);
                document.getElementById('opacityValue').textContent = e.target.value;
                this.updatePreview();
            });
        }

        const rotationSlider = document.getElementById('rotationSlider');
        if (rotationSlider) {
            rotationSlider.addEventListener('input', (e) => {
                this.settings.rotation = parseInt(e.target.value);
                document.getElementById('rotationValue').textContent = e.target.value;
                this.updatePreview();
            });
        }

        // Add watermark button
        const addWatermarkButton = document.getElementById('addWatermarkButton');
        if (addWatermarkButton) {
            addWatermarkButton.addEventListener('click', () => {
                this.processWatermark();
            });
        }
    }

    setupDragDrop() {
        // PDF drop zone
        const pdfDropZone = document.getElementById('pdfDropZone');
        if (pdfDropZone) {
            this.setupDropZone(pdfDropZone, (files) => {
                const pdfFiles = files.filter(file => file.type === 'application/pdf');
                if (pdfFiles.length > 0) {
                    this.handlePDFFile(pdfFiles[0]);
                }
            });
        }

        // Watermark drop zone
        const watermarkDropZone = document.getElementById('watermarkDropZone');
        if (watermarkDropZone) {
            this.setupDropZone(watermarkDropZone, (files) => {
                const imageFiles = files.filter(file => file.type.startsWith('image/'));
                if (imageFiles.length > 0) {
                    this.handleWatermarkImage(imageFiles[0]);
                }
            });
        }
    }

    setupDropZone(dropZone, callback) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => {
                dropZone.classList.add('drag-over');
            });
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => {
                dropZone.classList.remove('drag-over');
            });
        });

        dropZone.addEventListener('drop', (e) => {
            const files = Array.from(e.dataTransfer.files);
            callback(files);
        });
    }

    handlePDFFile(file) {
        if (!file || file.type !== 'application/pdf') {
            this.showMessage('कृपया केवल PDF file select करें', 'error');
            return;
        }

        if (file.size > 50 * 1024 * 1024) {
            this.showMessage('PDF file बहुत बड़ी है। Maximum size 50MB है।', 'error');
            return;
        }

        this.selectedFile = file;
        console.log('PDF file selected:', file.name);
        
        this.showWatermarkOptions();
        this.updateWatermarkButton();
    }

    handleWatermarkImage(file) {
        if (!file || !file.type.startsWith('image/')) {
            this.showMessage('कृपया केवल image file select करें', 'error');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            this.showMessage('Image file बहुत बड़ी है। Maximum size 10MB है।', 'error');
            return;
        }

        this.watermarkImage = file;
        console.log('Watermark image selected:', file.name);
        
        // Show image preview
        const reader = new FileReader();
        reader.onload = (e) => {
            this.displayImagePreview(e.target.result);
        };
        reader.readAsDataURL(file);
        
        this.updateWatermarkButton();
    }

    selectWatermarkType(type) {
        document.querySelectorAll('.type-option').forEach(opt => {
            opt.classList.remove('active');
        });

        const selectedOption = document.querySelector(`[data-type="${type}"]`);
        if (selectedOption) {
            selectedOption.classList.add('active');
        }

        this.watermarkType = type;

        // Show/hide controls based on type
        const textControls = document.getElementById('textControls');
        const imageControls = document.getElementById('imageControls');
        const watermarkDropZone = document.getElementById('watermarkDropZone');

        if (type === 'text') {
            if (textControls) textControls.style.display = 'block';
            if (imageControls) imageControls.style.display = 'none';
            if (watermarkDropZone) watermarkDropZone.style.display = 'none';
        } else {
            if (textControls) textControls.style.display = 'none';
            if (imageControls) imageControls.style.display = 'block';
            if (watermarkDropZone) watermarkDropZone.style.display = 'block';
        }

        this.updatePreview();
        this.updateWatermarkButton();
    }

    selectPosition(position) {
        document.querySelectorAll('.position-option').forEach(opt => {
            opt.classList.remove('active');
        });

        const selectedOption = document.querySelector(`[data-position="${position}"]`);
        if (selectedOption) {
            selectedOption.classList.add('active');
        }

        this.settings.position = position;
        this.updatePreview();
    }

    updatePreview() {
        const preview = document.getElementById('watermarkPreview');
        if (!preview) return;

        if (this.watermarkType === 'text') {
            preview.className = 'watermark-preview text-preview';
            preview.textContent = this.settings.text;
            preview.style.fontSize = this.settings.fontSize + 'px';
            preview.style.color = this.settings.color;
        } else if (this.watermarkImage) {
            preview.className = 'watermark-preview image-preview';
            preview.innerHTML = `<img src="${URL.createObjectURL(this.watermarkImage)}" style="max-width: 100px; max-height: 100px;">`;
        }

        preview.style.opacity = this.settings.opacity / 100;
        preview.style.transform = `rotate(${this.settings.rotation}deg)`;
    }

    displayImagePreview(imageSrc) {
        const preview = document.getElementById('watermarkPreview');
        if (this.watermarkType === 'image' && preview) {
            preview.innerHTML = `<img src="${imageSrc}" style="max-width: 100px; max-height: 100px;">`;
            this.updatePreview();
        }
    }

    showWatermarkOptions() {
        const watermarkOptions = document.getElementById('watermarkOptions');
        if (watermarkOptions) {
            watermarkOptions.style.display = 'block';
        }
    }

    updateWatermarkButton() {
        const addButton = document.getElementById('addWatermarkButton');
        if (!addButton) return;

        const canProcess = this.selectedFile && (
            this.watermarkType === 'text' || 
            (this.watermarkType === 'image' && this.watermarkImage)
        );
        
        addButton.disabled = !canProcess;
        
        if (canProcess) {
            addButton.textContent = 'Watermark Add करें';
            addButton.classList.remove('btn-secondary');
            addButton.classList.add('btn-primary');
        } else {
            addButton.textContent = 'PDF और Watermark Select करें';
            addButton.classList.remove('btn-primary');
            addButton.classList.add('btn-secondary');
        }
    }

    async processWatermark() {
        if (!this.selectedFile) {
            this.showMessage('पहले PDF file select करें', 'error');
            return;
        }

        if (this.watermarkType === 'image' && !this.watermarkImage) {
            this.showMessage('Watermark image select करें', 'error');
            return;
        }

        const addButton = document.getElementById('addWatermarkButton');
        const progressContainer = document.getElementById('progressContainer');
        const progressBar = document.getElementById('progressBar');
        const progressText = document.getElementById('progressText');

        addButton.disabled = true;
        addButton.textContent = 'Processing...';
        if (progressContainer) progressContainer.style.display = 'block';

        // Simulate progress
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += Math.random() * 10;
            if (progress > 90) progress = 90;
            
            if (progressBar) progressBar.style.width = progress + '%';
            if (progressText) progressText.textContent = Math.round(progress) + '%';
        }, 400);

        try {
            const formData = new FormData();
            formData.append('file', this.selectedFile);
            formData.append('watermark_type', this.watermarkType);

            if (this.watermarkType === 'text') {
                formData.append('watermark_text', this.settings.text);
                formData.append('font_size', this.settings.fontSize);
                formData.append('text_color', this.settings.color);
            } else {
                formData.append('watermark_image', this.watermarkImage);
            }

            formData.append('opacity', this.settings.opacity);
            formData.append('position', this.settings.position);
            formData.append('rotation', this.settings.rotation);

            console.log('Sending watermark request...');
            const response = await fetch('/process_tool/pdf-watermark', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            console.log('Watermark response:', result);

            clearInterval(progressInterval);
            if (progressBar) progressBar.style.width = '100%';
            if (progressText) progressText.textContent = '100%';

            if (result.success) {
                setTimeout(() => {
                    this.showSuccess(result);
                }, 500);
            } else {
                this.showError(result.error || 'Watermark में समस्या हुई');
            }

        } catch (error) {
            clearInterval(progressInterval);
            console.error('Watermark error:', error);
            this.showError('Network error: ' + error.message);
        }
    }

    showSuccess(result) {
        const progressContainer = document.getElementById('progressContainer');
        const resultContainer = document.getElementById('resultContainer');
        
        if (progressContainer) progressContainer.style.display = 'none';
        if (resultContainer) resultContainer.style.display = 'block';

        const downloadButton = document.getElementById('downloadButton');
        if (downloadButton) {
            downloadButton.onclick = () => {
                const link = document.createElement('a');
                link.href = result.download_url || '/uploads/watermarked_pdf.pdf';
                link.download = result.filename || 'watermarked_document.pdf';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                this.showMessage('File download शुरू हो गई!', 'success');
            };
        }

        this.showMessage('PDF में watermark successfully add हो गया!', 'success');
    }

    showError(message) {
        const progressContainer = document.getElementById('progressContainer');
        const addButton = document.getElementById('addWatermarkButton');

        if (progressContainer) progressContainer.style.display = 'none';
        
        if (addButton) {
            addButton.disabled = false;
            addButton.textContent = 'Watermark Add करें';
        }

        this.showMessage(message, 'error');
    }

    showMessage(message, type = 'info') {
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
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 5000);
    }
}

// Initialize when DOM loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing PDF Watermark...');
    window.pdfWatermark = new PDFWatermarkWorking();
});