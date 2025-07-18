# Tool Design Mapping System for Unique Interfaces
# This maps each of the 85 tools to a specific design style based on competitors

TOOL_DESIGN_MAPPING = {
    # PDF Tools - PDF Candy/Smallpdf Style
    'pdf-merger': 'pdf_candy_style',
    'pdf-splitter': 'pdf_candy_style',
    'pdf-compressor': 'smallpdf_style',
    'pdf-converter': 'pdf_candy_style',
    'pdf-password-remover': 'smallpdf_style',
    'pdf-watermark': 'pdf_candy_style',
    'pdf-rotate': 'smallpdf_style',
    'pdf-crop': 'pdf_candy_style',
    'pdf-extract-pages': 'smallpdf_style',
    'pdf-add-page-numbers': 'pdf_candy_style',
    'pdf-ocr': 'smallpdf_style',
    'pdf-editor': 'pdf_candy_style',
    'pdf-sign': 'smallpdf_style',
    'pdf-unlock': 'pdf_candy_style',
    'pdf-protect': 'smallpdf_style',
    
    # Image Tools - Pixlr Style
    'image-compressor': 'pixlr_style',
    'image-resizer': 'pixlr_style',
    'image-converter': 'pixlr_style',
    'image-editor': 'pixlr_style',
    'background-remover': 'pixlr_style',
    'image-cropper': 'pixlr_style',
    'image-filter': 'pixlr_style',
    'image-enhancer': 'pixlr_style',
    'watermark-remover': 'pixlr_style',
    'image-upscaler': 'pixlr_style',
    'photo-collage': 'pixlr_style',
    'image-optimizer': 'pixlr_style',
    'color-palette-generator': 'pixlr_style',
    'image-metadata-viewer': 'pixlr_style',
    'photo-frame-editor': 'pixlr_style',
    
    # Video/Audio Tools - Clideo Style
    'video-compressor': 'clideo_style',
    'video-converter': 'clideo_style',
    'video-trimmer': 'clideo_style',
    'video-merger': 'clideo_style',
    'audio-converter': 'clideo_style',
    'audio-compressor': 'clideo_style',
    'audio-merger': 'clideo_style',
    'video-resizer': 'clideo_style',
    'video-rotator': 'clideo_style',
    'subtitle-generator': 'clideo_style',
    'video-watermark': 'clideo_style',
    'audio-trimmer': 'clideo_style',
    'video-speed-changer': 'clideo_style',
    'audio-normalizer': 'clideo_style',
    'video-to-gif': 'clideo_style',
    
    # Government Tools - Modern Professional Style
    'aadhaar-validator': 'government_style',
    'pan-validator': 'government_style',
    'gst-validator': 'government_style',
    'vehicle-number-validator': 'government_style',
    'passport-photo-maker': 'government_style',
    'driving-license-validator': 'government_style',
    'voter-id-validator': 'government_style',
    'bank-ifsc-finder': 'government_style',
    
    # Student Tools - Academic Style
    'gpa-calculator': 'student_style',
    'assignment-planner': 'student_style',
    'citation-generator': 'student_style',
    'study-schedule': 'student_style',
    'research-helper': 'student_style',
    'note-organizer': 'student_style',
    'flashcard-maker': 'student_style',
    'essay-analyzer': 'student_style',
    'bibliography-generator': 'student_style',
    'plagiarism-checker': 'student_style',
    
    # Finance Tools - Mint Style
    'emi-calculator': 'mint_style',
    'sip-calculator': 'mint_style',
    'loan-calculator': 'mint_style',
    'gst-calculator': 'mint_style',
    'tax-calculator': 'mint_style',
    'investment-calculator': 'mint_style',
    'retirement-planner': 'mint_style',
    'expense-tracker': 'mint_style',
    'currency-converter': 'mint_style',
    'compound-interest-calculator': 'mint_style',
    'fd-calculator': 'mint_style',
    'rd-calculator': 'mint_style',
    'ppf-calculator': 'mint_style',
    'home-loan-calculator': 'mint_style',
    'car-loan-calculator': 'mint_style',
    
    # Utility Tools - AllInOneTools Style
    'qr-code-generator': 'utility_style',
    'barcode-generator': 'utility_style',
    'password-generator': 'utility_style',
    'uuid-generator': 'utility_style',
    'url-shortener': 'utility_style',
    'hash-generator': 'utility_style',
    'base64-encoder': 'utility_style',
    'color-picker': 'utility_style',
    'text-counter': 'utility_style',
    'timestamp-converter': 'utility_style',
    'json-formatter': 'utility_style',
    'regex-tester': 'utility_style',
    'md5-generator': 'utility_style',
    'random-number-generator': 'utility_style',
    'unit-converter': 'utility_style',
    
    # AI Tools - Modern AI Style
    'text-summarizer': 'ai_style',
    'content-generator': 'ai_style',
    'resume-builder': 'ai_style',
    'email-writer': 'ai_style',
    'blog-post-generator': 'ai_style',
    'social-media-captions': 'ai_style',
    'grammar-checker': 'ai_style',
    'paraphrasing-tool': 'ai_style',
    'keyword-extractor': 'ai_style',
    'sentiment-analyzer': 'ai_style'
}

def get_tool_design_style(tool_name):
    """Get the design style for a specific tool"""
    return TOOL_DESIGN_MAPPING.get(tool_name, 'default_style')

def get_tools_by_style(style_name):
    """Get all tools that use a specific design style"""
    return [tool for tool, style in TOOL_DESIGN_MAPPING.items() if style == style_name]

def get_all_styles():
    """Get all unique design styles"""
    return list(set(TOOL_DESIGN_MAPPING.values()))