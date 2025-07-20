# PDF Toolkit - Professional PDF Processing Platform

## Overview

PDF Toolkit is a professional web-based platform offering 25+ advanced PDF processing tools, inspired by TinyWow and ILovePDF. The platform provides a clean, modern interface with powerful backend processing capabilities for document manipulation, conversion, optimization, and security operations.

## User Preferences

Preferred communication style: Simple, everyday language focused on PDF processing needs.

## System Architecture

### Frontend Architecture
- **Core Technologies**: Modern HTML5, CSS3, JavaScript (ES6+)
- **UI Framework**: Bootstrap 5.3.0 with custom PDF-focused styling  
- **Icons**: Tabler Icons for consistent PDF tool interfaces
- **Design**: TinyWow/ILovePDF-inspired modern aesthetic with glassmorphism
- **Responsive**: Mobile-first approach with professional animations
- **Interactions**: Drag-drop file upload, step-by-step tool workflows

### Backend Architecture
- **Framework**: Flask with modular PDF-specific architecture
- **Database**: SQLAlchemy ORM with PostgreSQL (Supabase)
- **Authentication**: Flask-Login for user sessions
- **File Processing**: Dedicated PDFToolkit class with specialized processors
- **Route Structure**: Blueprint-based organization (`routes/pdf_routes.py`)
- **Security**: Input validation, file type checking, secure processing

### PDF Processing Libraries
- **PyMuPDF (fitz)**: Advanced PDF manipulation and compression
- **pdf2docx**: PDF to Word conversion with layout preservation
- **camelot-py**: Table extraction from PDFs to Excel
- **pikepdf**: PDF encryption/decryption and security operations
- **reportlab**: PDF generation and watermarking
- **pdfplumber**: Text extraction and analysis
- **pytesseract**: OCR capabilities for scanned PDFs

## Key Components

### PDF Tool Categories
1. **Merge & Split**: PDF Merger, PDF Splitter, Page Extractor
2. **Convert**: PDF to Word, PDF to Excel, Text to PDF, Image to PDF
3. **Optimize**: PDF Compressor with multiple compression levels
4. **Security**: Password protection, password removal, watermarking
5. **Extract**: Text extraction, image extraction, metadata viewing

### Professional Features
- **Step-by-step Interfaces**: Guided workflows for each tool
- **Real-time Processing**: Progress indicators and status updates
- **Multiple File Support**: Batch processing capabilities
- **Quality Options**: Customizable compression and conversion settings
- **Secure Processing**: Local processing with automatic cleanup

## Data Flow

1. **File Upload**: Drag-drop interface with validation
2. **Option Selection**: Tool-specific configuration options
3. **Processing**: Server-side PDF manipulation with progress tracking
4. **Result Delivery**: Secure download links with automatic expiration
5. **Cleanup**: Temporary file removal for security

## Tool Specifications

### PDF Merger
- Multi-file drag-drop upload
- Reorderable file list
- Custom output naming
- Size optimization options

### PDF Compressor  
- 4 compression levels (Light 20%, Medium 45%, Heavy 65%, Maximum 80%)
- File size preview
- Quality preservation settings
- Batch compression support

### PDF Splitter
- Page range selection (e.g., 1-5,6-10)
- Every N pages splitting
- Multiple output files
- Custom naming patterns

### PDF to Word
- Layout preservation
- OCR support for scanned PDFs
- Multiple output formats (DOCX, DOC, RTF)
- Image and table retention

## Deployment Strategy

### Production Configuration
- **Hosting**: Replit with Gunicorn server
- **Database**: Supabase PostgreSQL with connection pooling
- **File Storage**: Local temporary processing with secure cleanup
- **Performance**: Optimized libraries and compression
- **Security**: HTTPS, secure file handling, input validation

### Performance Optimization
- **Library Loading**: Lazy loading of heavy PDF libraries
- **Memory Management**: Efficient file processing and cleanup
- **Caching**: Static asset optimization
- **Error Handling**: Comprehensive exception management

## Recent Changes

### 2025-07-20 - Government Document Toolkit Implementation
- ✅ **Government Routes Created**: Complete govt_routes.py with 15 professional tools
- ✅ **Government Tools Utilities**: Built govt_tools.py with PDF generation and validation
- ✅ **Professional Templates**: Created PAN Validator, Aadhaar Masker, Income Certificate templates  
- ✅ **Homepage Integration**: Added Government Tools tab with 15 tools organized in 4 categories
- ✅ **Visual Design**: Government toolkit with amber/orange branding and modern UI
- ✅ **Route Registration**: All government routes registered and working properly
- ✅ **Total Tools Count**: Now 60 tools (25 PDF + 20 Image + 15 Government)

### 2025-07-20 - Professional AI-Powered Hero Section & Migration Complete
- ✅ **Complete Migration Success**: Successfully migrated from Replit Agent to full environment  
- ✅ **Professional Hero Redesign**: Created AI-powered hero section with modern animations
- ✅ **Interactive Demo Window**: Live file processing demo with real-time animations
- ✅ **Enhanced Visual Design**: Gradient backgrounds, floating elements, and smooth transitions
- ✅ **Error Resolution**: Fixed all Jinja template and JavaScript syntax errors
- ✅ **Dependency Management**: Added proper error handling for optional dependencies
- ✅ **Performance Optimization**: Streamlined animations and responsive design

### 2025-07-19 - Comprehensive Toolkit Migration & Expansion (45 Tools Total)
- ✅ **Successful Replit Migration**: Migrated project from agent to full Replit environment
- ✅ **Complete PDF Toolkit**: All 25 PDF tools implemented with dedicated routes
- ✅ **Full Image Toolkit**: 20 professional image processing tools added
- ✅ **Modular Blueprint Architecture**: Separate route blueprints (pdf_tools, image_tools)
- ✅ **Professional Backend**: Comprehensive utility modules for all processing
- ✅ **Advanced Dependencies**: Installed all required libraries (PyMuPDF, OpenCV, rembg, etc.)
- ✅ **Error Resolution**: Fixed blueprint conflicts and dependency issues
- ✅ **Professional Templates**: Created modern UI templates for tool interfaces

### Complete Tool Suite (45 Total):

#### PDF Tools (25 Active):
1. **PDF Merger** (/pdf-merger) - Combine multiple PDFs
2. **PDF Splitter** (/pdf-splitter) - Split by pages/ranges
3. **PDF Compressor** (/pdf-compressor) - 4 compression levels
4. **PDF to Word** (/pdf-to-word) - Convert with layout preservation
5. **PDF to Excel** (/pdf-to-excel) - Extract tables to spreadsheets
6. **PDF to Image** (/pdf-to-image) - Convert pages to images
7. **Word to PDF** (/word-to-pdf) - Convert documents
8. **Excel to PDF** (/excel-to-pdf) - Convert spreadsheets
9. **Image to PDF** (/image-to-pdf) - Convert images
10. **Text to PDF** (/text-to-pdf) - Convert text
11. **PDF Protect** (/pdf-protect) - Add password protection
12. **PDF Unlock** (/pdf-unlock) - Remove passwords
13. **PDF Watermark** (/pdf-watermark) - Add watermarks
14. **PDF Rotate** (/pdf-rotate) - Rotate pages
15. **Text Extractor** (/pdf-text-extractor) - Extract text
16. **PDF OCR** (/pdf-ocr) - Scan text from images
17. **Digital Signature** (/pdf-signature) - Sign PDFs
18. **Fill Forms** (/pdf-forms) - Fill PDF forms
19. **Bookmarks** (/pdf-bookmarks) - Extract bookmarks
20. **Metadata Editor** (/pdf-metadata) - Edit properties
21. **PDF Compare** (/pdf-compare) - Compare documents
22. **PDF Optimizer** (/pdf-optimizer) - Optimize for web
23. **Annotations** (/pdf-annotations) - Add/extract annotations
24. **PDF Redaction** (/pdf-redaction) - Redact sensitive info
25. **Page Counter** (/pdf-page-counter) - Count pages & size

#### Image Tools (20 Active):
1. **Image Resizer** (/image-resizer) - Resize to any dimension
2. **Image Compressor** (/image-compressor) - Reduce file size
3. **Convert to WebP** (/convert-to-webp) - Modern format conversion
4. **Convert to JPG** (/convert-to-jpg) - JPEG conversion
5. **Convert to PNG** (/convert-to-png) - PNG conversion
6. **Background Remover** (/background-remover) - AI-powered removal
7. **Image Cropper** (/image-cropper) - Crop to size
8. **Image Rotator** (/image-rotator) - Rotate by angle
9. **Add Watermark** (/add-watermark) - Text watermarks
10. **Grayscale** (/grayscale-converter) - Convert to B&W
11. **Image Blur** (/image-blur) - Apply blur effects
12. **Image Enhancer** (/image-enhancer) - Adjust brightness/contrast
13. **Flip Image** (/flip-image) - Horizontal/vertical flip
14. **Invert Colors** (/invert-colors) - Color inversion
15. **Add Border** (/add-border) - Add borders
16. **Image Metadata** (/image-metadata) - View properties
17. **Images to PDF** (/images-to-pdf) - Convert to PDF
18. **Face Pixelator** (/face-pixelator) - Privacy protection
19. **Meme Generator** (/meme-generator) - Create memes
20. **Color Palette** (/color-palette) - Extract colors

### Migration Status
- **Platform**: Complete 45-tool professional toolkit (25 PDF + 20 Image)
- **Architecture**: Fully modular Flask app with blueprint separation
- **Backend**: Professional processing utilities with advanced libraries
- **UI**: Modern, responsive templates with professional styling
- **Performance**: Optimized for both PDF and image workflows
- **Security**: Secure file handling with automatic cleanup
- **Replit Compatibility**: Fully adapted for Replit environment with proper dependencies

The platform is now a comprehensive toolkit matching professional standards with complete functionality for both PDF and image processing needs.
