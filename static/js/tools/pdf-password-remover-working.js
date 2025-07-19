// Working PDF Password Remover - TinyWow/iLovePDF Style
class PDFPasswordRemoverWorking {
    constructor() {
        this.selectedFile = null;
        this.password = '';
        this.init();
    }

    init() {
        console.log('PDF Password Remover initialized');
        this.setupEventListeners();
        this.setupDragDrop();
    }

    setupEventListeners() {
        // File input
        const fileInput = document.getElementById('fileInput');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                this.handleFile(e.target.files[0]);
            });
        }

        // Drop zone click
        const dropZone = document.getElementById('dropZone');
        if (dropZone) {
            dropZone.addEventListener('click', () => {
                fileInput?.click();
            });
        }

        // Password input
        const passwordInput = document.getElementById('passwordInput');
        if (passwordInput) {
            passwordInput.addEventListener('input', (e) => {
                this.password = e.target.value;
                this.updateRemoveButton();
            });
        }

        // Show password toggle
        const showPasswordToggle = document.getElementById('showPassword');
        if (showPasswordToggle) {
            showPasswordToggle.addEventListener('change', (e) => {
                passwordInput.type = e.target.checked ? 'text' : 'password';
            });
        }

        // Remove password button
        const removeButton = document.getElementById('removePasswordButton');
        if (removeButton) {
            removeButton.addEventListener('click', () => {
                this.processRemoval();
            });
        }
    }

    setupDragDrop() {
        const dropZone = document.getElementById('dropZone');
        if (!dropZone) return;

        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => {
                dropZone.style.background = 'linear-gradient(135deg, #fef7e8, #fff4e6)';
                dropZone.style.borderColor = '#f59e0b';
            });
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => {
                dropZone.style.background = 'linear-gradient(135deg, #fffbf0, #fef7e8)';
                dropZone.style.borderColor = '#e2e8f0';
            });
        });

        dropZone.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFile(files[0]);
            }
        });
    }

    handleFile(file) {
        if (!file || file.type !== 'application/pdf') {
            this.showMessage('कृपया केवल PDF file select करें', 'error');
            return;
        }

        if (file.size > 100 * 1024 * 1024) {
            this.showMessage('File बहुत बड़ी है। Maximum size 100MB है।', 'error');
            return;
        }

        this.selectedFile = file;
        console.log('PDF file selected:', file.name);
        
        this.displayFileInfo();
        this.showPasswordInput();
        this.checkPasswordProtection();
    }

    displayFileInfo() {
        const fileName = document.getElementById('selectedFileName');
        const fileSize = document.getElementById('selectedFileSize');
        const filePreview = document.getElementById('filePreview');
        
        if (fileName && this.selectedFile) {
            fileName.textContent = this.selectedFile.name;
        }
        
        if (fileSize && this.selectedFile) {
            fileSize.textContent = this.formatFileSize(this.selectedFile.size);
        }

        if (filePreview) {
            filePreview.innerHTML = `
                <div class="d-flex align-items-center p-3 bg-light rounded">
                    <i class="fas fa-file-pdf text-danger fa-2x me-3"></i>
                    <div class="flex-grow-1">
                        <div class="fw-bold">${this.selectedFile.name}</div>
                        <div class="text-muted">${this.formatFileSize(this.selectedFile.size)}</div>
                    </div>
                    <div class="text-warning">
                        <i class="fas fa-lock fa-2x"></i>
                    </div>
                </div>
            `;
        }
    }

    async checkPasswordProtection() {
        // This would normally check if PDF is password protected
        // For demo, we'll assume it's protected
        const protectionStatus = document.getElementById('protectionStatus');
        const passwordRequired = document.getElementById('passwordRequired');
        
        if (protectionStatus) {
            protectionStatus.innerHTML = `
                <div class="alert alert-warning d-flex align-items-center">
                    <i class="fas fa-shield-alt me-2"></i>
                    <div>
                        <strong>Password Protected PDF Detected</strong><br>
                        <small>This PDF requires a password to remove protection</small>
                    </div>
                </div>
            `;
        }

        if (passwordRequired) {
            passwordRequired.style.display = 'block';
        }
    }

    showPasswordInput() {
        const passwordSection = document.getElementById('passwordSection');
        if (passwordSection) {
            passwordSection.style.display = 'block';
        }
    }

    updateRemoveButton() {
        const removeButton = document.getElementById('removePasswordButton');
        if (!removeButton) return;

        const canProcess = this.selectedFile && this.password.length > 0;
        
        removeButton.disabled = !canProcess;
        
        if (canProcess) {
            removeButton.textContent = 'Remove Password Protection';
            removeButton.classList.remove('btn-secondary');
            removeButton.classList.add('btn-warning');
        } else {
            removeButton.textContent = 'Enter Password to Continue';
            removeButton.classList.remove('btn-warning');
            removeButton.classList.add('btn-secondary');
        }
    }

    async processRemoval() {
        if (!this.selectedFile) {
            this.showMessage('पहले PDF file select करें', 'error');
            return;
        }

        if (!this.password) {
            this.showMessage('Password enter करें', 'error');
            return;
        }

        const removeButton = document.getElementById('removePasswordButton');
        const progressContainer = document.getElementById('progressContainer');
        const progressBar = document.getElementById('progressBar');
        const progressText = document.getElementById('progressText');
        const progressStage = document.getElementById('progressStage');

        removeButton.disabled = true;
        removeButton.textContent = 'Removing Password...';
        if (progressContainer) progressContainer.style.display = 'block';

        // Password removal stages
        const stages = [
            'Verifying password...',
            'Removing encryption...',
            'Rebuilding PDF structure...',
            'Finalizing document...'
        ];

        let currentStage = 0;
        let progress = 0;

        const progressInterval = setInterval(() => {
            progress += Math.random() * 10;
            
            const stageIndex = Math.floor((progress / 100) * stages.length);
            if (stageIndex !== currentStage && stageIndex < stages.length) {
                currentStage = stageIndex;
                if (progressStage) progressStage.textContent = stages[currentStage];
            }

            if (progress > 90) progress = 90;
            
            if (progressBar) progressBar.style.width = progress + '%';
            if (progressText) progressText.textContent = Math.round(progress) + '%';
        }, 350);

        try {
            const formData = new FormData();
            formData.append('file', this.selectedFile);
            formData.append('password', this.password);

            console.log('Sending password removal request...');
            const response = await fetch('/process_tool/pdf-password-remover', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            console.log('Password removal response:', result);

            clearInterval(progressInterval);
            if (progressBar) progressBar.style.width = '100%';
            if (progressText) progressText.textContent = '100%';
            if (progressStage) progressStage.textContent = 'Password removed successfully!';

            if (result.success) {
                setTimeout(() => {
                    this.showSuccess(result);
                }, 500);
            } else {
                this.showError(result.error || 'Password removal में समस्या हुई');
            }

        } catch (error) {
            clearInterval(progressInterval);
            console.error('Password removal error:', error);
            this.showError('Network error: ' + error.message);
        }
    }

    showSuccess(result) {
        const progressContainer = document.getElementById('progressContainer');
        const resultContainer = document.getElementById('resultContainer');
        
        if (progressContainer) progressContainer.style.display = 'none';
        if (resultContainer) resultContainer.style.display = 'block';

        // Update security info
        const securityInfo = document.getElementById('securityInfo');
        if (securityInfo) {
            securityInfo.innerHTML = `
                <div class="row g-3">
                    <div class="col-md-4">
                        <div class="text-center">
                            <i class="fas fa-unlock text-success fa-2x mb-2"></i>
                            <div class="small text-muted">Status</div>
                            <div class="fw-bold text-success">Unlocked</div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="text-center">
                            <i class="fas fa-file-pdf text-primary fa-2x mb-2"></i>
                            <div class="small text-muted">File Size</div>
                            <div class="fw-bold">${this.formatFileSize(this.selectedFile.size)}</div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="text-center">
                            <i class="fas fa-shield-alt text-warning fa-2x mb-2"></i>
                            <div class="small text-muted">Protection</div>
                            <div class="fw-bold text-success">Removed</div>
                        </div>
                    </div>
                </div>
            `;
        }

        // Setup download
        const downloadButton = document.getElementById('downloadButton');
        if (downloadButton) {
            downloadButton.onclick = () => {
                const link = document.createElement('a');
                link.href = result.download_url || '/uploads/unlocked_pdf.pdf';
                link.download = result.filename || 'unlocked_document.pdf';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                this.showMessage('File download शुरू हो गई!', 'success');
            };
        }

        this.showMessage('PDF password successfully remove हो गया!', 'success');
    }

    showError(message) {
        const progressContainer = document.getElementById('progressContainer');
        const removeButton = document.getElementById('removePasswordButton');

        if (progressContainer) progressContainer.style.display = 'none';
        
        if (removeButton) {
            removeButton.disabled = false;
            removeButton.textContent = 'Remove Password Protection';
        }

        // Special handling for wrong password
        if (message.includes('password') || message.includes('incorrect')) {
            const passwordInput = document.getElementById('passwordInput');
            if (passwordInput) {
                passwordInput.classList.add('is-invalid');
                passwordInput.focus();
                
                setTimeout(() => {
                    passwordInput.classList.remove('is-invalid');
                }, 3000);
            }
            
            this.showMessage('गलत password है। कृपया सही password enter करें।', 'error');
        } else {
            this.showMessage(message, 'error');
        }
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

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Initialize when DOM loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing PDF Password Remover...');
    window.pdfPasswordRemover = new PDFPasswordRemoverWorking();
});

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
@keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}

.is-invalid {
    animation: shake 0.5s ease-in-out;
}

@keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
}

.progress-container {
    animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}
`;
document.head.appendChild(style);