// Text Summarizer Tool - JavaScript
// Handles text summarization with AI processing and collaboration

class TextSummarizer {
    constructor() {
        this.originalText = '';
        this.summaryResult = null;
        this.isProcessing = false;
        this.settings = {
            summaryLength: 3,
            summaryType: 'extractive',
            focusArea: 'general',
            includeKeywords: true,
            includeSentiment: false,
            preserveStructure: false
        };
        this.collaborationRoom = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupCollaboration();
        this.initializeSettings();
        console.log('📝 Text Summarizer initialized');
    }

    setupEventListeners() {
        const form = document.getElementById('text-summarizer-form');
        const textInput = document.getElementById('text-input');
        const fileUpload = document.getElementById('file-upload');
        const summaryLengthSlider = document.getElementById('summary-length');
        const summaryTypeSelect = document.getElementById('summary-type');
        const focusAreaSelect = document.getElementById('focus-area');
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');

        // Form submission
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.processSummarization();
            });
        }

        // Text input changes
        if (textInput) {
            textInput.addEventListener('input', () => {
                this.updateTextStats();
                this.updateSummarizeButton();
            });
        }

        // File upload
        if (fileUpload) {
            fileUpload.addEventListener('change', (e) => {
                this.handleFileUpload(e.target.files[0]);
            });
        }

        // Settings changes
        if (summaryLengthSlider) {
            summaryLengthSlider.addEventListener('input', (e) => {
                this.updateSummaryLength(e.target.value);
            });
        }

        if (summaryTypeSelect) {
            summaryTypeSelect.addEventListener('change', (e) => {
                this.updateSummaryType(e.target.value);
            });
        }

        if (focusAreaSelect) {
            focusAreaSelect.addEventListener('change', (e) => {
                this.updateFocusArea(e.target.value);
            });
        }

        // Checkboxes
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                this.updateSetting(e.target.id, e.target.checked);
            });
        });

        // Collaboration events
        document.addEventListener('collaborationUpdate', (e) => {
            this.handleCollaborationUpdate(e.detail);
        });
    }

    setupCollaboration() {
        // Setup collaboration room
        this.collaborationRoom = `text-summarizer-${Date.now()}`;
        
        // Join collaboration room if WebSocket is available
        if (window.wsClient && window.wsClient.isConnected()) {
            window.wsClient.joinRoom(this.collaborationRoom, 'text-summarizer');
        }
    }

    initializeSettings() {
        const lengthSlider = document.getElementById('summary-length');
        if (lengthSlider) {
            document.getElementById('length-value').textContent = lengthSlider.value;
        }

        this.updateTextStats();
        this.updateSummarizeButton();
    }

    updateTextStats() {
        const textInput = document.getElementById('text-input');
        const charCount = document.getElementById('char-count');
        const wordCount = document.getElementById('word-count');
        const summarizeBtn = document.getElementById('summarize-btn');

        if (textInput) {
            const text = textInput.value;
            const chars = text.length;
            const words = text.trim() ? text.trim().split(/\s+/).length : 0;

            if (charCount) charCount.textContent = chars;
            if (wordCount) wordCount.textContent = words;

            this.originalText = text;
            
            // Update button state
            this.updateSummarizeButton();
        }
    }

    updateSummarizeButton() {
        const summarizeBtn = document.getElementById('summarize-btn');
        const wordCount = this.getWordCount();
        
        if (summarizeBtn) {
            summarizeBtn.disabled = wordCount < 100 || this.isProcessing;
        }
    }

    getWordCount() {
        const text = this.originalText.trim();
        return text ? text.split(/\s+/).length : 0;
    }

    updateSummaryLength(value) {
        this.settings.summaryLength = parseInt(value);
        document.getElementById('length-value').textContent = value;
        this.broadcastSettingsUpdate();
    }

    updateSummaryType(value) {
        this.settings.summaryType = value;
        this.broadcastSettingsUpdate();
    }

    updateFocusArea(value) {
        this.settings.focusArea = value;
        this.broadcastSettingsUpdate();
    }

    updateSetting(settingKey, value) {
        this.settings[settingKey.replace('-', '_')] = value;
        this.broadcastSettingsUpdate();
    }

    async handleFileUpload(file) {
        if (!file) return;

        const validTypes = ['text/plain', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        
        if (!validTypes.includes(file.type)) {
            this.showError('Please upload a valid document file (TXT, PDF, DOC, DOCX)');
            return;
        }

        try {
            let text = '';
            
            if (file.type === 'text/plain') {
                text = await this.readTextFile(file);
            } else {
                // For other file types, we would need server-side processing
                this.showError('PDF and Word document processing requires server-side support');
                return;
            }

            const textInput = document.getElementById('text-input');
            if (textInput) {
                textInput.value = text;
                this.originalText = text;
                this.updateTextStats();
            }

            if (window.app) {
                window.app.showNotification('File uploaded successfully', 'success');
            }
        } catch (error) {
            console.error('File upload error:', error);
            this.showError('Failed to read file');
        }
    }

    readTextFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsText(file);
        });
    }

    async processSummarization() {
        if (this.isProcessing) return;

        const wordCount = this.getWordCount();
        if (wordCount < 100) {
            this.showError('Text must contain at least 100 words for summarization');
            return;
        }

        this.isProcessing = true;
        this.updateSummarizeButton();
        this.showProgress('Analyzing text...', 0);

        try {
            const formData = new FormData();
            formData.append('text', this.originalText);
            formData.append('summary_length', this.settings.summaryLength);
            formData.append('summary_type', this.settings.summaryType);
            formData.append('focus_area', this.settings.focusArea);
            formData.append('include_keywords', this.settings.includeKeywords);
            formData.append('include_sentiment', this.settings.includeSentiment);
            formData.append('preserve_structure', this.settings.preserveStructure);

            this.showProgress('Extracting key insights...', 30);

            const response = await fetch('/api/tools/text-summarizer', {
                method: 'POST',
                body: formData
            });

            this.showProgress('Generating summary...', 60);

            const result = await response.json();

            if (result.success) {
                this.showProgress('Summary completed!', 100);
                this.summaryResult = result.results;
                this.displayResults(result.results);
                this.broadcastSummarizationComplete(result.results);
            } else {
                this.showError(result.error || 'Failed to summarize text');
            }
        } catch (error) {
            console.error('Summarization error:', error);
            this.showError('Network error occurred while summarizing text');
        } finally {
            this.isProcessing = false;
            this.updateSummarizeButton();
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

    displayResults(results) {
        const resultsCard = document.getElementById('results-card');
        const errorCard = document.getElementById('error-card');

        // Hide error card and show results
        if (errorCard) errorCard.style.display = 'none';
        if (resultsCard) resultsCard.style.display = 'block';

        // Update stats
        this.updateElement('original-words', results.original_length);
        this.updateElement('summary-words', results.summary_length);
        this.updateElement('compression-ratio', results.compression_ratio + '%');
        this.updateElement('key-points-count', results.key_points ? results.key_points.length : 0);

        // Update summary content
        const summaryResult = document.getElementById('summary-result');
        if (summaryResult) {
            summaryResult.innerHTML = this.formatSummary(results.summary);
        }

        // Update key points
        this.displayKeyPoints(results.key_points);

        // Update keywords if available
        if (results.keywords && this.settings.includeKeywords) {
            this.displayKeywords(results.keywords);
        }

        // Update sentiment if available
        if (results.sentiment && this.settings.includeSentiment) {
            this.displaySentiment(results.sentiment);
        }
    }

    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    formatSummary(summary) {
        // Format summary text with proper paragraphs
        return summary.split('\n\n').map(paragraph => 
            `<p class="mb-3">${paragraph}</p>`
        ).join('');
    }

    displayKeyPoints(keyPoints) {
        const keyPointsList = document.getElementById('key-points-list');
        if (!keyPointsList || !keyPoints) return;

        keyPointsList.innerHTML = '';
        
        keyPoints.forEach((point, index) => {
            const pointItem = document.createElement('div');
            pointItem.className = 'list-group-item';
            pointItem.innerHTML = `
                <div class="d-flex align-items-start">
                    <span class="badge bg-primary me-2">${index + 1}</span>
                    <span>${point}</span>
                </div>
            `;
            keyPointsList.appendChild(pointItem);
        });
    }

    displayKeywords(keywords) {
        const keywordsSection = document.getElementById('keywords-section');
        const keywordsList = document.getElementById('keywords-list');
        
        if (!keywordsList || !keywords) return;

        keywordsSection.style.display = 'block';
        keywordsList.innerHTML = '';

        keywords.forEach(keyword => {
            const keywordBadge = document.createElement('span');
            keywordBadge.className = 'badge bg-secondary';
            keywordBadge.textContent = keyword;
            keywordsList.appendChild(keywordBadge);
        });
    }

    displaySentiment(sentiment) {
        const sentimentSection = document.getElementById('sentiment-section');
        const sentimentResult = document.getElementById('sentiment-result');
        
        if (!sentimentResult || !sentiment) return;

        sentimentSection.style.display = 'block';
        
        const sentimentColor = sentiment.polarity > 0 ? 'success' : 
                              sentiment.polarity < 0 ? 'danger' : 'secondary';
        
        sentimentResult.innerHTML = `
            <div class="d-flex align-items-center">
                <span class="badge bg-${sentimentColor} me-2">${sentiment.label}</span>
                <span>Confidence: ${(sentiment.confidence * 100).toFixed(1)}%</span>
            </div>
        `;
    }

    showError(message) {
        const resultsCard = document.getElementById('results-card');
        const errorCard = document.getElementById('error-card');
        const errorMessage = document.getElementById('error-message');

        if (resultsCard) resultsCard.style.display = 'none';
        if (errorCard) errorCard.style.display = 'block';
        if (errorMessage) errorMessage.textContent = message;

        if (window.app) {
            window.app.showNotification(message, 'error');
        }
    }

    // Export functions
    copyResults() {
        if (!this.summaryResult) {
            this.showError('No summary to copy');
            return;
        }

        const textToCopy = `
SUMMARY:
${this.summaryResult.summary}

KEY POINTS:
${this.summaryResult.key_points ? this.summaryResult.key_points.map((point, index) => `${index + 1}. ${point}`).join('\n') : 'None'}

STATISTICS:
- Original words: ${this.summaryResult.original_length}
- Summary words: ${this.summaryResult.summary_length}
- Compression: ${this.summaryResult.compression_ratio}%
        `.trim();

        navigator.clipboard.writeText(textToCopy).then(() => {
            if (window.app) {
                window.app.showNotification('Summary copied to clipboard!', 'success');
            }
        }).catch(err => {
            console.error('Copy failed:', err);
            if (window.app) {
                window.app.showNotification('Failed to copy summary', 'error');
            }
        });
    }

    exportResults() {
        if (!this.summaryResult) {
            this.showError('No summary to export');
            return;
        }

        const content = this.generateExportContent();
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `text-summary-${Date.now()}.txt`;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    generateExportContent() {
        const results = this.summaryResult;
        const timestamp = new Date().toLocaleString();
        
        return `
TEXT SUMMARY REPORT
Generated: ${timestamp}

ORIGINAL TEXT (${results.original_length} words):
${this.originalText}

SUMMARY (${results.summary_length} words):
${results.summary}

KEY POINTS:
${results.key_points ? results.key_points.map((point, index) => `${index + 1}. ${point}`).join('\n') : 'None'}

${results.keywords ? `KEYWORDS:\n${results.keywords.join(', ')}\n` : ''}

STATISTICS:
- Compression ratio: ${results.compression_ratio}%
- Summary type: ${this.settings.summaryType}
- Focus area: ${this.settings.focusArea}
- Summary length: ${this.settings.summaryLength} sentences

Generated by Suntyn AI Text Summarizer
        `.trim();
    }

    // Collaboration methods
    broadcastSettingsUpdate() {
        if (window.wsClient && window.wsClient.isConnected()) {
            window.wsClient.sendUpdate({
                type: 'settings-update',
                settings: this.settings
            });
        }
    }

    broadcastSummarizationComplete(results) {
        if (window.wsClient && window.wsClient.isConnected()) {
            window.wsClient.sendUpdate({
                type: 'summarization-complete',
                results: {
                    summary_length: results.summary_length,
                    compression_ratio: results.compression_ratio,
                    key_points_count: results.key_points ? results.key_points.length : 0
                }
            });
        }
    }

    handleCollaborationUpdate(data) {
        switch (data.type) {
            case 'settings-update':
                this.handleRemoteSettingsUpdate(data.settings);
                break;
            case 'summarization-complete':
                this.handleRemoteSummarizationComplete(data.results);
                break;
        }
    }

    handleRemoteSettingsUpdate(settings) {
        // Update UI to reflect collaborator's settings
        const lengthSlider = document.getElementById('summary-length');
        const typeSelect = document.getElementById('summary-type');
        const focusSelect = document.getElementById('focus-area');

        if (lengthSlider && settings.summaryLength) {
            lengthSlider.value = settings.summaryLength;
            document.getElementById('length-value').textContent = settings.summaryLength;
        }

        if (typeSelect && settings.summaryType) {
            typeSelect.value = settings.summaryType;
        }

        if (focusSelect && settings.focusArea) {
            focusSelect.value = settings.focusArea;
        }
    }

    handleRemoteSummarizationComplete(results) {
        if (window.app) {
            window.app.showNotification(`${data.username} completed summarization: ${results.summary_length} words`, 'success');
        }
    }

    // Public API
    reset() {
        this.originalText = '';
        this.summaryResult = null;
        
        // Reset form
        const form = document.getElementById('text-summarizer-form');
        if (form) {
            form.reset();
        }

        // Reset settings
        this.settings = {
            summaryLength: 3,
            summaryType: 'extractive',
            focusArea: 'general',
            includeKeywords: true,
            includeSentiment: false,
            preserveStructure: false
        };

        // Hide result cards
        const resultsCard = document.getElementById('results-card');
        const errorCard = document.getElementById('error-card');
        if (resultsCard) resultsCard.style.display = 'none';
        if (errorCard) errorCard.style.display = 'none';

        this.initializeSettings();
    }

    getText() {
        return this.originalText;
    }

    getResults() {
        return this.summaryResult;
    }

    getSettings() {
        return this.settings;
    }

    isReady() {
        return this.getWordCount() >= 100 && !this.isProcessing;
    }
}

// Global functions for UI interactions
function copyResults() {
    if (window.textSummarizer) {
        window.textSummarizer.copyResults();
    }
}

function exportResults() {
    if (window.textSummarizer) {
        window.textSummarizer.exportResults();
    }
}

// Initialize text summarizer
const textSummarizer = new TextSummarizer();

// Export for global access
window.TextSummarizer = TextSummarizer;
window.textSummarizer = textSummarizer;
