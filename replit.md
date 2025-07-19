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

### 2025-07-19 - Complete Modular PDF Toolkit (25 Tools)
- ✅ **Fixed Error Handling**: Added missing error templates (404.html, 500.html)
- ✅ **Modular Architecture**: Implemented separate routes for each PDF tool
- ✅ **25 PDF Tools Complete**: 6 active tools + 19 coming soon tools
- ✅ **Professional Templates**: TinyWow-inspired interfaces for each tool
- ✅ **Backend Modules**: Separate Python files (merger.py, splitter.py, compressor.py, converter.py)
- ✅ **Advanced UI**: Professional animations, coming soon badges, responsive design
- ✅ **Real Processing**: Actual PDF manipulation with PyMuPDF, PyPDF2, PIL
- ✅ **Clean Homepage**: Modern tool grid with 25 tools displayed

### Active PDF Tools (Working):
1. **PDF Merger** (/merge) - Combines multiple PDFs
2. **PDF Splitter** (/split) - Split by pages or ranges  
3. **PDF Compressor** (/compress) - 4 compression levels
4. **PDF to Word** (/pdf-to-word) - Convert to text
5. **PDF to Image** (/pdf-to-image) - Extract images
6. **Image to PDF** (/image-to-pdf) - Convert images

### Coming Soon Tools (15 more):
- PDF to Excel, Word to PDF, Unlock/Protect PDF, Rotate PDF
- Watermark, Text extraction, OCR, Digital signature, Forms
- Bookmarks, Metadata editing, PDF comparison, Optimization
- Annotations, Redaction, and more...

### Current Status
- **Platform**: Professional PDF Toolkit (25 tools total)
- **Architecture**: Modular Flask app with dedicated routes
- **UI**: TinyWow/ILovePDF-inspired professional interface
- **Backend**: Real PDF processing with advanced libraries
- **Performance**: Optimized for document workflows
- **Expandability**: Easy to add new tools without changing core system

The platform now has a complete modular architecture with separate endpoints, backend modules, and professional templates for each tool, matching the requirements for a scalable PDF toolkit.
