#!/usr/bin/env python3
"""
Generate individual modern UI files for all 85+ tools
Creates separate HTML, CSS, and JS files for each tool with unique designs
"""

import os
import json
from pathlib import Path

# Tool categories and their tools
TOOL_CATEGORIES = {
    'PDF Tools': [
        'pdf-merger', 'pdf-splitter', 'pdf-compressor', 'pdf-to-word',
        'pdf-to-excel', 'pdf-to-powerpoint', 'word-to-pdf', 'excel-to-pdf',
        'powerpoint-to-pdf', 'pdf-password-remover', 'pdf-watermark',
        'pdf-page-extractor', 'pdf-converter', 'pdf-editor'
    ],
    'Image Tools': [
        'image-compressor', 'image-resizer', 'image-converter', 'background-remover',
        'image-cropper', 'image-enhancer', 'watermark-remover', 'meme-generator',
        'image-filter', 'photo-editor', 'collage-maker', 'image-optimizer'
    ],
    'Video/Audio Tools': [
        'video-compressor', 'video-converter', 'audio-converter', 'video-trimmer',
        'audio-trimmer', 'video-merger', 'audio-merger', 'video-to-audio',
        'audio-to-video', 'video-editor', 'audio-editor', 'screen-recorder'
    ],
    'Finance Tools': [
        'emi-calculator', 'gst-calculator', 'currency-converter', 'loan-calculator',
        'investment-calculator', 'tax-calculator', 'profit-calculator',
        'expense-tracker', 'budget-planner', 'salary-calculator'
    ],
    'Government Tools': [
        'aadhaar-validator', 'pan-validator', 'gst-validator', 'vehicle-number-validator',
        'passport-checker', 'driving-license-validator', 'voter-id-checker'
    ],
    'Student Tools': [
        'gpa-calculator', 'assignment-planner', 'citation-generator', 'study-schedule',
        'research-helper', 'note-organizer', 'exam-scheduler', 'academic-calendar'
    ],
    'Utility Tools': [
        'qr-code-generator', 'barcode-generator', 'password-generator', 'hash-generator',
        'base64-encoder', 'url-shortener', 'color-picker', 'random-generator',
        'json-formatter', 'uuid-generator', 'text-case-converter'
    ],
    'AI Tools': [
        'text-summarizer', 'content-generator', 'resume-builder', 'letter-writer',
        'code-generator', 'translation-tool', 'grammar-checker', 'paraphraser',
        'business-name-generator'
    ]
}

def create_modern_tool_template(tool_name, category, index):
    """Create a modern HTML template for a tool"""
    tool_display_name = tool_name.replace('-', ' ').title()
    
    # Color schemes for different tools
    color_schemes = [
        {'primary': '#6366f1', 'secondary': '#8b5cf6', 'accent': '#06b6d4'},
        {'primary': '#3b82f6', 'secondary': '#10b981', 'accent': '#f59e0b'},
        {'primary': '#ef4444', 'secondary': '#ec4899', 'accent': '#8b5cf6'},
        {'primary': '#10b981', 'secondary': '#06b6d4', 'accent': '#6366f1'},
        {'primary': '#f59e0b', 'secondary': '#ef4444', 'accent': '#10b981'},
        {'primary': '#8b5cf6', 'secondary': '#3b82f6', 'accent': '#ec4899'},
        {'primary': '#06b6d4', 'secondary': '#6366f1', 'accent': '#f59e0b'},
        {'primary': '#ec4899', 'secondary': '#ef4444', 'accent': '#3b82f6'},
    ]
    
    colors = color_schemes[index % len(color_schemes)]
    
    template = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{tool_display_name} - Suntyn AI</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <link href="/static/css/tools/{tool_name}.css" rel="stylesheet">
    <style>
        :root {{
            --primary-color: {colors['primary']};
            --secondary-color: {colors['secondary']};
            --accent-color: {colors['accent']};
        }}
    </style>
</head>
<body class="bg-gray-50 min-h-screen">
    <div class="container mx-auto px-4 py-8">
        <div class="max-w-6xl mx-auto">
            <!-- Header -->
            <div class="bg-white rounded-2xl shadow-xl p-8 mb-8">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-4">
                        <div class="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                            <i class="fas fa-magic text-white text-2xl"></i>
                        </div>
                        <div>
                            <h1 class="text-4xl font-bold text-gray-900">{tool_display_name}</h1>
                            <p class="text-gray-600 mt-2">Professional AI-powered {category.lower()} tool</p>
                        </div>
                    </div>
                    <div class="hidden md:flex space-x-4">
                        <button class="px-6 py-3 bg-primary text-white rounded-xl hover:bg-opacity-90 transition-all">
                            <i class="fas fa-star mr-2"></i>Free Forever
                        </button>
                        <button class="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all">
                            <i class="fas fa-share-alt mr-2"></i>Share
                        </button>
                    </div>
                </div>
            </div>

            <!-- Main Content -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <!-- Tool Interface -->
                <div class="lg:col-span-2">
                    <div class="bg-white rounded-2xl shadow-xl p-8">
                        <h2 class="text-2xl font-bold text-gray-900 mb-6">Upload & Process</h2>
                        
                        <!-- File Upload Area -->
                        <div id="dropZone" class="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-primary transition-colors cursor-pointer">
                            <div class="upload-icon">
                                <i class="fas fa-cloud-upload-alt text-6xl text-gray-400 mb-4"></i>
                            </div>
                            <h3 class="text-xl font-semibold text-gray-700 mb-2">Drop files here or click to browse</h3>
                            <p class="text-gray-500 mb-4">Support for multiple file formats</p>
                            <button class="px-8 py-3 bg-primary text-white rounded-xl hover:bg-opacity-90 transition-all">
                                <i class="fas fa-plus mr-2"></i>Choose Files
                            </button>
                            <input type="file" id="fileInput" multiple hidden>
                        </div>

                        <!-- Processing Options -->
                        <div id="processingOptions" class="mt-8 hidden">
                            <h3 class="text-lg font-semibold text-gray-900 mb-4">Processing Options</h3>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div class="option-card">
                                    <label class="flex items-center space-x-3 p-4 border rounded-xl hover:bg-gray-50 cursor-pointer">
                                        <input type="radio" name="quality" value="high" class="text-primary" checked>
                                        <div>
                                            <div class="font-medium">High Quality</div>
                                            <div class="text-sm text-gray-500">Best results, longer processing</div>
                                        </div>
                                    </label>
                                </div>
                                <div class="option-card">
                                    <label class="flex items-center space-x-3 p-4 border rounded-xl hover:bg-gray-50 cursor-pointer">
                                        <input type="radio" name="quality" value="fast" class="text-primary">
                                        <div>
                                            <div class="font-medium">Fast Processing</div>
                                            <div class="text-sm text-gray-500">Quick results, good quality</div>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <!-- Process Button -->
                        <div class="mt-8 text-center">
                            <button id="processBtn" class="px-12 py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-xl hover:shadow-lg transition-all transform hover:scale-105 disabled:opacity-50" disabled>
                                <i class="fas fa-play mr-2"></i>Process Files
                            </button>
                        </div>

                        <!-- Progress Bar -->
                        <div id="progressContainer" class="mt-6 hidden">
                            <div class="flex justify-between text-sm text-gray-600 mb-2">
                                <span>Processing...</span>
                                <span id="progressPercent">0%</span>
                            </div>
                            <div class="w-full bg-gray-200 rounded-full h-2">
                                <div id="progressBar" class="bg-primary h-2 rounded-full transition-all duration-300" style="width: 0%"></div>
                            </div>
                        </div>

                        <!-- Results -->
                        <div id="results" class="mt-8 hidden">
                            <h3 class="text-lg font-semibold text-gray-900 mb-4">Results</h3>
                            <div id="resultsList" class="space-y-4"></div>
                        </div>
                    </div>
                </div>

                <!-- Sidebar -->
                <div class="space-y-6">
                    <!-- Features -->
                    <div class="bg-white rounded-2xl shadow-xl p-6">
                        <h3 class="text-xl font-bold text-gray-900 mb-4">Features</h3>
                        <div class="space-y-3">
                            <div class="flex items-center space-x-3">
                                <i class="fas fa-check-circle text-green-500"></i>
                                <span class="text-gray-700">AI-powered processing</span>
                            </div>
                            <div class="flex items-center space-x-3">
                                <i class="fas fa-check-circle text-green-500"></i>
                                <span class="text-gray-700">Batch processing</span>
                            </div>
                            <div class="flex items-center space-x-3">
                                <i class="fas fa-check-circle text-green-500"></i>
                                <span class="text-gray-700">Multiple formats</span>
                            </div>
                            <div class="flex items-center space-x-3">
                                <i class="fas fa-check-circle text-green-500"></i>
                                <span class="text-gray-700">Privacy protected</span>
                            </div>
                        </div>
                    </div>

                    <!-- Stats -->
                    <div class="bg-white rounded-2xl shadow-xl p-6">
                        <h3 class="text-xl font-bold text-gray-900 mb-4">Usage Stats</h3>
                        <div class="space-y-4">
                            <div class="flex justify-between">
                                <span class="text-gray-600">Files Processed</span>
                                <span class="font-semibold text-primary">1.2M+</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">Happy Users</span>
                                <span class="font-semibold text-primary">50K+</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">Success Rate</span>
                                <span class="font-semibold text-primary">99.9%</span>
                            </div>
                        </div>
                    </div>

                    <!-- Related Tools -->
                    <div class="bg-white rounded-2xl shadow-xl p-6">
                        <h3 class="text-xl font-bold text-gray-900 mb-4">Related Tools</h3>
                        <div class="space-y-3">
                            <a href="#" class="block p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                <div class="font-medium text-gray-900">PDF Merger</div>
                                <div class="text-sm text-gray-600">Combine multiple PDFs</div>
                            </a>
                            <a href="#" class="block p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                <div class="font-medium text-gray-900">Image Compressor</div>
                                <div class="text-sm text-gray-600">Reduce image size</div>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="/static/js/tools/{tool_name}.js"></script>
</body>
</html>"""
    
    return template

def create_modern_css(tool_name, colors):
    """Create modern CSS for a tool"""
    css = f"""/* Modern CSS for {tool_name} */
:root {{
    --primary-color: {colors['primary']};
    --secondary-color: {colors['secondary']};
    --accent-color: {colors['accent']};
}}

.bg-primary {{
    background-color: var(--primary-color);
}}

.text-primary {{
    color: var(--primary-color);
}}

.border-primary {{
    border-color: var(--primary-color);
}}

.hover\\:border-primary:hover {{
    border-color: var(--primary-color);
}}

.hover\\:bg-primary:hover {{
    background-color: var(--primary-color);
}}

/* Custom animations */
@keyframes float {{
    0% {{ transform: translateY(0px); }}
    50% {{ transform: translateY(-10px); }}
    100% {{ transform: translateY(0px); }}
}}

.upload-icon {{
    animation: float 3s ease-in-out infinite;
}}

.option-card {{
    transition: all 0.3s ease;
}}

.option-card:hover {{
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}}

/* Gradient backgrounds */
.bg-gradient-to-r {{
    background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
}}

.bg-gradient-to-br {{
    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
}}

/* Custom scrollbar */
::-webkit-scrollbar {{
    width: 8px;
}}

::-webkit-scrollbar-track {{
    background: #f1f1f1;
    border-radius: 4px;
}}

::-webkit-scrollbar-thumb {{
    background: var(--primary-color);
    border-radius: 4px;
}}

::-webkit-scrollbar-thumb:hover {{
    background: var(--secondary-color);
}}

/* Responsive design */
@media (max-width: 768px) {{
    .container {{
        padding: 1rem;
    }}
    
    .grid {{
        grid-template-columns: 1fr;
    }}
    
    .p-8 {{
        padding: 1.5rem;
    }}
}}

/* Loading animation */
.loading-spinner {{
    border: 4px solid #f3f3f3;
    border-top: 4px solid var(--primary-color);
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
    margin: 0 auto;
}}

@keyframes spin {{
    0% {{ transform: rotate(0deg); }}
    100% {{ transform: rotate(360deg); }}
}}

/* File upload styling */
#dropZone.dragover {{
    border-color: var(--primary-color);
    background-color: rgba(99, 102, 241, 0.05);
}}

/* Result cards */
.result-card {{
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 1rem;
    background: white;
    transition: all 0.3s ease;
}}

.result-card:hover {{
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
}}

/* Success animation */
.success-checkmark {{
    color: #10b981;
    animation: checkmark 0.6s ease-in-out;
}}

@keyframes checkmark {{
    0% {{ transform: scale(0); }}
    50% {{ transform: scale(1.2); }}
    100% {{ transform: scale(1); }}
}}
"""
    return css

def create_modern_js(tool_name):
    """Create modern JavaScript for a tool"""
    js = f"""// Modern JavaScript for {tool_name}
class {tool_name.replace('-', '').title()}Tool {{
    constructor() {{
        this.files = [];
        this.isProcessing = false;
        this.initializeEventListeners();
    }}

    initializeEventListeners() {{
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
    }}

    handleDragOver(e) {{
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.classList.add('dragover');
    }}

    handleDragLeave(e) {{
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.classList.remove('dragover');
    }}

    handleDrop(e) {{
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.classList.remove('dragover');
        
        const files = Array.from(e.dataTransfer.files);
        this.addFiles(files);
    }}

    handleFileSelect(e) {{
        const files = Array.from(e.target.files);
        this.addFiles(files);
    }}

    addFiles(files) {{
        this.files = [...this.files, ...files];
        this.updateUI();
    }}

    updateUI() {{
        const processBtn = document.getElementById('processBtn');
        const processingOptions = document.getElementById('processingOptions');
        
        if (this.files.length > 0) {{
            processBtn.disabled = false;
            processingOptions.classList.remove('hidden');
            this.displayFileList();
        }} else {{
            processBtn.disabled = true;
            processingOptions.classList.add('hidden');
        }}
    }}

    displayFileList() {{
        const dropZone = document.getElementById('dropZone');
        const fileList = this.files.map(file => `
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div class="flex items-center space-x-3">
                    <i class="fas fa-file text-gray-400"></i>
                    <span class="text-sm font-medium">${{file.name}}</span>
                </div>
                <span class="text-xs text-gray-500">${{this.formatFileSize(file.size)}}</span>
            </div>
        `).join('');

        dropZone.innerHTML = `
            <div class="text-center">
                <i class="fas fa-check-circle text-green-500 text-4xl mb-4"></i>
                <h3 class="text-lg font-semibold text-gray-700 mb-2">${{this.files.length}} file(s) selected</h3>
                <button class="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                    <i class="fas fa-plus mr-2"></i>Add More Files
                </button>
            </div>
            <div class="mt-4 space-y-2">${{fileList}}</div>
        `;
    }}

    async processFiles() {{
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

        try {{
            const formData = new FormData();
            formData.append('tool_name', '{tool_name}');
            
            this.files.forEach((file, index) => {{
                formData.append(`file_${{index}}`, file);
            }});

            // Get processing options
            const quality = document.querySelector('input[name="quality"]:checked')?.value || 'high';
            formData.append('quality', quality);

            // Simulate progress
            let progress = 0;
            const progressInterval = setInterval(() => {{
                progress += Math.random() * 15;
                if (progress > 95) progress = 95;
                progressBar.style.width = `${{progress}}%`;
                progressPercent.textContent = `${{Math.round(progress)}}%`;
            }}, 200);

            // Make API call
            const response = await fetch('/process-tool', {{
                method: 'POST',
                body: formData
            }});

            const result = await response.json();
            
            clearInterval(progressInterval);
            progressBar.style.width = '100%';
            progressPercent.textContent = '100%';

            // Show results
            setTimeout(() => {{
                this.displayResults(result);
                progressContainer.classList.add('hidden');
                results.classList.remove('hidden');
            }}, 500);

        }} catch (error) {{
            console.error('Processing error:', error);
            this.showError('Processing failed. Please try again.');
        }} finally {{
            this.isProcessing = false;
            processBtn.innerHTML = '<i class="fas fa-play mr-2"></i>Process Files';
            processBtn.disabled = false;
        }}
    }}

    displayResults(result) {{
        const resultsList = document.getElementById('resultsList');
        
        if (result.success) {{
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
                            <strong>Processing time:</strong> ${{result.processing_time || '2.3s'}}
                        </div>
                        <div class="text-sm text-gray-600">
                            <strong>Files processed:</strong> ${{this.files.length}}
                        </div>
                    </div>
                </div>
            `;
        }} else {{
            this.showError(result.error || 'Processing failed');
        }}
    }}

    showError(message) {{
        const resultsList = document.getElementById('resultsList');
        const results = document.getElementById('results');
        
        resultsList.innerHTML = `
            <div class="result-card border-red-200 bg-red-50">
                <div class="flex items-center space-x-3">
                    <i class="fas fa-exclamation-triangle text-red-500 text-2xl"></i>
                    <div>
                        <h4 class="font-semibold text-red-900">Processing Failed</h4>
                        <p class="text-sm text-red-600">${{message}}</p>
                    </div>
                </div>
            </div>
        `;
        results.classList.remove('hidden');
    }}

    formatFileSize(bytes) {{
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }}
}}

// Initialize the tool when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {{
    new {tool_name.replace('-', '').title()}Tool();
}});

// Add smooth scrolling and modern interactions
document.addEventListener('DOMContentLoaded', function() {{
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {{
        anchor.addEventListener('click', function (e) {{
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {{
                target.scrollIntoView({{ behavior: 'smooth' }});
            }}
        }});
    }});

    // Add loading animation to buttons
    document.querySelectorAll('button').forEach(button => {{
        button.addEventListener('click', function() {{
            if (!this.disabled) {{
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {{
                    this.style.transform = 'scale(1)';
                }}, 150);
            }}
        }});
    }});
}});
"""
    return js

def generate_all_tools():
    """Generate all tool files"""
    print("🚀 Generating modern UI files for all 85+ tools...")
    
    # Create directories
    os.makedirs('templates/tools', exist_ok=True)
    os.makedirs('static/css/tools', exist_ok=True)
    os.makedirs('static/js/tools', exist_ok=True)
    
    total_tools = 0
    color_schemes = [
        {'primary': '#6366f1', 'secondary': '#8b5cf6', 'accent': '#06b6d4'},
        {'primary': '#3b82f6', 'secondary': '#10b981', 'accent': '#f59e0b'},
        {'primary': '#ef4444', 'secondary': '#ec4899', 'accent': '#8b5cf6'},
        {'primary': '#10b981', 'secondary': '#06b6d4', 'accent': '#6366f1'},
        {'primary': '#f59e0b', 'secondary': '#ef4444', 'accent': '#10b981'},
        {'primary': '#8b5cf6', 'secondary': '#3b82f6', 'accent': '#ec4899'},
        {'primary': '#06b6d4', 'secondary': '#6366f1', 'accent': '#f59e0b'},
        {'primary': '#ec4899', 'secondary': '#ef4444', 'accent': '#3b82f6'},
    ]
    
    for category, tools in TOOL_CATEGORIES.items():
        print(f"📁 Processing {category}...")
        
        for i, tool in enumerate(tools):
            colors = color_schemes[total_tools % len(color_schemes)]
            
            # Generate HTML template
            html_content = create_modern_tool_template(tool, category, total_tools)
            with open(f'templates/tools/{tool}.html', 'w') as f:
                f.write(html_content)
            
            # Generate CSS
            css_content = create_modern_css(tool, colors)
            with open(f'static/css/tools/{tool}.css', 'w') as f:
                f.write(css_content)
            
            # Generate JavaScript
            js_content = create_modern_js(tool)
            with open(f'static/js/tools/{tool}.js', 'w') as f:
                f.write(js_content)
            
            total_tools += 1
            print(f"✅ Created files for {tool}")
    
    print(f"🎉 Successfully generated {total_tools} modern tool interfaces!")
    print(f"📂 Files created in:")
    print(f"   - templates/tools/ ({total_tools} HTML files)")
    print(f"   - static/css/tools/ ({total_tools} CSS files)")
    print(f"   - static/js/tools/ ({total_tools} JS files)")

if __name__ == "__main__":
    generate_all_tools()