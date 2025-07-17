class TextSummarizer {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateWordCount();
    }

    setupEventListeners() {
        const form = document.getElementById('text-summarizer-form');
        const textInput = document.getElementById('input-text');
        const fileInput = document.getElementById('file-input');
        const lengthSlider = document.getElementById('summary-length');
        const lengthDisplay = document.getElementById('length-display');
        
        if (form) form.addEventListener('submit', (e) => this.handleSubmit(e));
        if (textInput) textInput.addEventListener('input', () => this.updateWordCount());
        if (fileInput) fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
        if (lengthSlider) {
            lengthSlider.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                const labels = ['Very Short', 'Short', 'Medium', 'Long', 'Very Long'];
                if (lengthDisplay) lengthDisplay.textContent = labels[value - 1] || 'Medium';
            });
        }
    }

    updateWordCount() {
        const textInput = document.getElementById('input-text');
        const charCount = document.getElementById('char-count');
        const wordCount = document.getElementById('word-count');
        const summarizeBtn = document.getElementById('summarize-btn');
        const lengthWarning = document.getElementById('length-warning');
        
        if (!textInput) return;
        
        const text = textInput.value;
        const chars = text.length;
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
        
        if (charCount) charCount.textContent = chars;
        if (wordCount) wordCount.textContent = words;
        
        // Enable/disable button based on minimum length
        if (summarizeBtn) {
            summarizeBtn.disabled = chars < 50;
        }
        
        // Show warning if text is too short
        if (lengthWarning) {
            if (chars > 0 && chars < 50) {
                lengthWarning.innerHTML = '<small class="text-warning">⚠️ Text is too short for summarization</small>';
                lengthWarning.style.display = 'block';
            } else {
                lengthWarning.style.display = 'none';
            }
        }
    }

    async handleFileUpload(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const fileInfo = document.getElementById('file-info');
        const fileLoading = document.getElementById('file-loading');
        
        if (fileLoading) fileLoading.style.display = 'block';
        
        try {
            const text = await this.readFileAsText(file);
            const textInput = document.getElementById('input-text');
            
            if (textInput) {
                textInput.value = text;
                this.updateWordCount();
            }
            
            if (fileInfo) {
                fileInfo.innerHTML = `<small class="text-success">✅ File loaded: ${file.name}</small>`;
                fileInfo.style.display = 'block';
            }
            
        } catch (error) {
            if (fileInfo) {
                fileInfo.innerHTML = `<small class="text-danger">❌ Error reading file: ${error.message}</small>`;
                fileInfo.style.display = 'block';
            }
        } finally {
            if (fileLoading) fileLoading.style.display = 'none';
        }
    }

    readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        const textInput = document.getElementById('input-text');
        const text = textInput?.value?.trim();
        
        if (!text || text.length < 50) {
            alert('Please enter at least 50 characters of text to summarize');
            return;
        }
        
        await this.summarizeText(text);
    }

    async summarizeText(text) {
        const progressCard = document.getElementById('progress-card');
        const resultCard = document.getElementById('result-card');
        const progressText = document.getElementById('progress-text');
        
        if (progressCard) progressCard.style.display = 'block';
        if (resultCard) resultCard.style.display = 'none';
        
        // Update progress messages
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += 20;
            if (progress <= 100 && progressText) {
                const messages = [
                    'Analyzing text...',
                    'Processing sentences...',
                    'Calculating importance scores...',
                    'Generating summary...',
                    'Finalizing results...'
                ];
                progressText.textContent = messages[Math.floor(progress / 20) - 1] || 'Processing...';
            }
        }, 300);
        
        try {
            const formData = new FormData();
            formData.append('text', text);
            formData.append('summary_length', document.getElementById('summary-length')?.value || 3);
            formData.append('summary_style', document.getElementById('summary-style')?.value || 'paragraph');
            formData.append('output_language', document.getElementById('output-language')?.value || 'en');
            
            const response = await fetch('/api/tools/text-summarizer', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            clearInterval(progressInterval);
            if (progressCard) progressCard.style.display = 'none';
            
            if (result.success) {
                this.showSuccess(result);
            } else {
                this.showError(result.error || 'Summarization failed');
            }
            
        } catch (error) {
            clearInterval(progressInterval);
            if (progressCard) progressCard.style.display = 'none';
            this.showError('Network error occurred');
        }
    }

    showSuccess(result) {
        const resultCard = document.getElementById('result-card');
        const successDiv = document.getElementById('success-result');
        const errorDiv = document.getElementById('error-result');
        const summaryOutput = document.getElementById('summary-output');
        const summaryStats = document.getElementById('summary-stats');
        const copyBtn = document.getElementById('copy-summary-btn');
        
        if (resultCard) resultCard.style.display = 'block';
        if (successDiv) successDiv.style.display = 'block';
        if (errorDiv) errorDiv.style.display = 'none';
        
        if (summaryOutput && result.summary) {
            summaryOutput.innerHTML = this.formatSummary(result.summary, result.key_points);
        }
        
        if (summaryStats && result.stats) {
            summaryStats.innerHTML = this.formatStats(result.stats);
        }
        
        if (copyBtn) {
            copyBtn.addEventListener('click', () => this.copySummary(result.summary));
        }
    }

    formatSummary(summary, keyPoints) {
        const summaryStyle = document.getElementById('summary-style')?.value || 'paragraph';
        
        switch (summaryStyle) {
            case 'bullet':
                const sentences = summary.split(/[.!?]+/).filter(s => s.trim());
                return sentences.map(s => `• ${s.trim()}`).join('<br>');
            case 'highlights':
                return keyPoints ? keyPoints.join('<br>') : summary;
            default:
                return summary;
        }
    }

    formatStats(stats) {
        return `
            <div class="row text-center small">
                <div class="col-6">
                    <div class="fw-medium">${stats.original_words}</div>
                    <small class="text-muted">Original Words</small>
                </div>
                <div class="col-6">
                    <div class="fw-medium">${stats.summary_words}</div>
                    <small class="text-muted">Summary Words</small>
                </div>
            </div>
            <div class="text-center mt-2">
                <span class="badge bg-success">${stats.compression_ratio}% compression</span>
            </div>
        `;
    }

    copySummary(summary) {
        navigator.clipboard.writeText(summary).then(() => {
            const copyBtn = document.getElementById('copy-summary-btn');
            if (copyBtn) {
                const originalText = copyBtn.innerHTML;
                copyBtn.innerHTML = '<i class="ti ti-check"></i> Copied!';
                copyBtn.classList.add('btn-success');
                copyBtn.classList.remove('btn-outline-primary');
                
                setTimeout(() => {
                    copyBtn.innerHTML = originalText;
                    copyBtn.classList.remove('btn-success');
                    copyBtn.classList.add('btn-outline-primary');
                }, 2000);
            }
        }).catch(() => {
            alert('Failed to copy to clipboard');
        });
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
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TextSummarizer();
});