"""
Complete PDF Toolkit Routes - 25 Professional Tools
"""
from flask import Blueprint, render_template, request, send_file, jsonify, flash, redirect, url_for
from werkzeug.utils import secure_filename
import os
from utils.pdf_tools import *

pdf_bp = Blueprint('pdf_tools', __name__)

# 1. PDF Merger
@pdf_bp.route('/pdf-merger', methods=['GET', 'POST'])
def merge_tool():
    if request.method == 'POST':
        try:
            files = request.files.getlist('pdfs')
            if len(files) < 2:
                flash('Please select at least 2 PDF files', 'error')
                return render_template('pdf_tools/merge.html')
            
            result = merge_pdfs(files)
            return send_file(result, download_name='merged.pdf', as_attachment=True)
        except Exception as e:
            flash(f'Error: {str(e)}', 'error')
    
    return render_template('pdf_tools/merge.html')

# 2. PDF Splitter
@pdf_bp.route('/pdf-splitter', methods=['GET', 'POST'])
def split_tool():
    if request.method == 'POST':
        try:
            file = request.files['pdf']
            split_type = request.form['split_type']
            
            if split_type == 'pages':
                pages = request.form['pages']
                result = split_pdf_by_pages(file, pages)
            elif split_type == 'range':
                start = int(request.form['start_page'])
                end = int(request.form['end_page'])
                result = split_pdf_by_range(file, start, end)
            else:  # every n pages
                n = int(request.form['every_n'])
                result = split_pdf_every_n(file, n)
            
            return send_file(result, download_name='split.pdf', as_attachment=True)
        except Exception as e:
            flash(f'Error: {str(e)}', 'error')
    
    return render_template('pdf_tools/split.html')

# 3. PDF Compressor
@pdf_bp.route('/pdf-compressor', methods=['GET', 'POST'])
def compress_tool():
    if request.method == 'POST':
        try:
            file = request.files['pdf']
            level = request.form.get('level', 'medium')
            
            result = compress_pdf(file, level)
            return send_file(result, download_name='compressed.pdf', as_attachment=True)
        except Exception as e:
            flash(f'Error: {str(e)}', 'error')
    
    return render_template('pdf_tools/compress.html')

# 4. PDF to Word
@pdf_bp.route('/pdf-to-word', methods=['GET', 'POST'])
def pdf_to_word_tool():
    if request.method == 'POST':
        try:
            file = request.files['pdf']
            result = pdf_to_word(file)
            return send_file(result, download_name='document.docx', as_attachment=True)
        except Exception as e:
            flash(f'Error: {str(e)}', 'error')
    
    return render_template('pdf_tools/pdf_to_word.html')

# 5. PDF to Excel
@pdf_bp.route('/pdf-to-excel', methods=['GET', 'POST'])
def pdf_to_excel_tool():
    if request.method == 'POST':
        try:
            file = request.files['pdf']
            result = pdf_to_excel(file)
            return send_file(result, download_name='spreadsheet.xlsx', as_attachment=True)
        except Exception as e:
            flash(f'Error: {str(e)}', 'error')
    
    return render_template('pdf_tools/pdf_to_excel.html')

# 6. PDF to Image
@pdf_bp.route('/pdf-to-image', methods=['GET', 'POST'])
def pdf_to_image_tool():
    if request.method == 'POST':
        try:
            file = request.files['pdf']
            format = request.form.get('format', 'png')
            dpi = int(request.form.get('dpi', 300))
            
            result = pdf_to_images(file, format, dpi)
            return send_file(result, download_name=f'pages.{format}', as_attachment=True)
        except Exception as e:
            flash(f'Error: {str(e)}', 'error')
    
    return render_template('pdf_tools/pdf_to_image.html')

# 7. Word to PDF
@pdf_bp.route('/word-to-pdf', methods=['GET', 'POST'])
def word_to_pdf_tool():
    if request.method == 'POST':
        try:
            file = request.files['word']
            result = word_to_pdf(file)
            return send_file(result, download_name='document.pdf', as_attachment=True)
        except Exception as e:
            flash(f'Error: {str(e)}', 'error')
    
    return render_template('pdf_tools/word_to_pdf.html')

# 8. Excel to PDF
@pdf_bp.route('/excel-to-pdf', methods=['GET', 'POST'])
def excel_to_pdf_tool():
    if request.method == 'POST':
        try:
            file = request.files['excel']
            result = excel_to_pdf(file)
            return send_file(result, download_name='spreadsheet.pdf', as_attachment=True)
        except Exception as e:
            flash(f'Error: {str(e)}', 'error')
    
    return render_template('pdf_tools/excel_to_pdf.html')

# 9. Image to PDF
@pdf_bp.route('/image-to-pdf', methods=['GET', 'POST'])
def image_to_pdf_tool():
    if request.method == 'POST':
        try:
            files = request.files.getlist('images')
            if not files:
                flash('Please select images', 'error')
                return render_template('pdf_tools/image_to_pdf.html')
            
            result = images_to_pdf(files)
            return send_file(result, download_name='images.pdf', as_attachment=True)
        except Exception as e:
            flash(f'Error: {str(e)}', 'error')
    
    return render_template('pdf_tools/image_to_pdf.html')

# 10. Text to PDF
@pdf_bp.route('/text-to-pdf', methods=['GET', 'POST'])
def text_to_pdf_tool():
    if request.method == 'POST':
        try:
            text = request.form['text']
            font_size = int(request.form.get('font_size', 12))
            
            result = text_to_pdf(text, font_size)
            return send_file(result, download_name='text.pdf', as_attachment=True)
        except Exception as e:
            flash(f'Error: {str(e)}', 'error')
    
    return render_template('pdf_tools/text_to_pdf.html')

# 11. PDF Password Protector
@pdf_bp.route('/pdf-protect', methods=['GET', 'POST'])
def protect_tool():
    if request.method == 'POST':
        try:
            file = request.files['pdf']
            password = request.form['password']
            
            result = protect_pdf(file, password)
            return send_file(result, download_name='protected.pdf', as_attachment=True)
        except Exception as e:
            flash(f'Error: {str(e)}', 'error')
    
    return render_template('pdf_tools/protect.html')

# 12. PDF Password Remover
@pdf_bp.route('/pdf-unlock', methods=['GET', 'POST'])
def unlock_tool():
    if request.method == 'POST':
        try:
            file = request.files['pdf']
            password = request.form['password']
            
            result = unlock_pdf(file, password)
            return send_file(result, download_name='unlocked.pdf', as_attachment=True)
        except Exception as e:
            flash(f'Error: {str(e)}', 'error')
    
    return render_template('pdf_tools/unlock.html')

# 13. PDF Watermark
@pdf_bp.route('/pdf-watermark', methods=['GET', 'POST'])
def watermark_tool():
    if request.method == 'POST':
        try:
            file = request.files['pdf']
            text = request.form['watermark_text']
            opacity = float(request.form.get('opacity', 0.5))
            
            result = add_pdf_watermark(file, text, opacity)
            return send_file(result, download_name='watermarked.pdf', as_attachment=True)
        except Exception as e:
            flash(f'Error: {str(e)}', 'error')
    
    return render_template('pdf_tools/watermark.html')

# 14. PDF Rotate
@pdf_bp.route('/pdf-rotate', methods=['GET', 'POST'])
def rotate_tool():
    if request.method == 'POST':
        try:
            file = request.files['pdf']
            angle = int(request.form['angle'])
            pages = request.form.get('pages', 'all')
            
            result = rotate_pdf(file, angle, pages)
            return send_file(result, download_name='rotated.pdf', as_attachment=True)
        except Exception as e:
            flash(f'Error: {str(e)}', 'error')
    
    return render_template('pdf_tools/rotate.html')

# 15. PDF Text Extractor
@pdf_bp.route('/pdf-text-extractor', methods=['GET', 'POST'])
def text_extract_tool():
    if request.method == 'POST':
        try:
            file = request.files['pdf']
            text = extract_pdf_text(file)
            return render_template('pdf_tools/text_extract.html', extracted_text=text, show_result=True)
        except Exception as e:
            flash(f'Error: {str(e)}', 'error')
    
    return render_template('pdf_tools/text_extract.html')

# 16. PDF OCR
@pdf_bp.route('/pdf-ocr', methods=['GET', 'POST'])
def ocr_tool():
    if request.method == 'POST':
        try:
            file = request.files['pdf']
            result = ocr_pdf(file)
            return send_file(result, download_name='ocr_text.pdf', as_attachment=True)
        except Exception as e:
            flash(f'Error: {str(e)}', 'error')
    
    return render_template('pdf_tools/ocr.html')

# 17. PDF Digital Signature
@pdf_bp.route('/pdf-signature', methods=['GET', 'POST'])
def signature_tool():
    if request.method == 'POST':
        try:
            file = request.files['pdf']
            signature_text = request.form['signature']
            position = request.form.get('position', 'bottom-right')
            
            result = add_digital_signature(file, signature_text, position)
            return send_file(result, download_name='signed.pdf', as_attachment=True)
        except Exception as e:
            flash(f'Error: {str(e)}', 'error')
    
    return render_template('pdf_tools/signature.html')

# 18. PDF Form Filler
@pdf_bp.route('/pdf-forms', methods=['GET', 'POST'])
def forms_tool():
    if request.method == 'POST':
        try:
            file = request.files['pdf']
            form_data = request.form.to_dict()
            
            result = fill_pdf_forms(file, form_data)
            return send_file(result, download_name='filled_form.pdf', as_attachment=True)
        except Exception as e:
            flash(f'Error: {str(e)}', 'error')
    
    return render_template('pdf_tools/forms.html')

# 19. PDF Bookmarks
@pdf_bp.route('/pdf-bookmarks', methods=['GET', 'POST'])
def bookmarks_tool():
    if request.method == 'POST':
        try:
            file = request.files['pdf']
            bookmarks = extract_pdf_bookmarks(file)
            return render_template('pdf_tools/bookmarks.html', bookmarks=bookmarks, show_result=True)
        except Exception as e:
            flash(f'Error: {str(e)}', 'error')
    
    return render_template('pdf_tools/bookmarks.html')

# 20. PDF Metadata Editor
@pdf_bp.route('/pdf-metadata', methods=['GET', 'POST'])
def metadata_tool():
    if request.method == 'POST':
        try:
            file = request.files['pdf']
            if request.form.get('action') == 'view':
                metadata = get_pdf_metadata(file)
                return render_template('pdf_tools/metadata.html', metadata=metadata, show_result=True)
            else:  # edit
                new_metadata = {
                    'title': request.form.get('title', ''),
                    'author': request.form.get('author', ''),
                    'subject': request.form.get('subject', ''),
                    'creator': request.form.get('creator', '')
                }
                result = edit_pdf_metadata(file, new_metadata)
                return send_file(result, download_name='updated_metadata.pdf', as_attachment=True)
        except Exception as e:
            flash(f'Error: {str(e)}', 'error')
    
    return render_template('pdf_tools/metadata.html')

# 21. PDF Comparison
@pdf_bp.route('/pdf-compare', methods=['GET', 'POST'])
def compare_tool():
    if request.method == 'POST':
        try:
            file1 = request.files['pdf1']
            file2 = request.files['pdf2']
            
            differences = compare_pdfs(file1, file2)
            return render_template('pdf_tools/compare.html', differences=differences, show_result=True)
        except Exception as e:
            flash(f'Error: {str(e)}', 'error')
    
    return render_template('pdf_tools/compare.html')

# 22. PDF Optimizer
@pdf_bp.route('/pdf-optimizer', methods=['GET', 'POST'])
def optimizer_tool():
    if request.method == 'POST':
        try:
            file = request.files['pdf']
            optimization_level = request.form.get('level', 'standard')
            
            result = optimize_pdf(file, optimization_level)
            return send_file(result, download_name='optimized.pdf', as_attachment=True)
        except Exception as e:
            flash(f'Error: {str(e)}', 'error')
    
    return render_template('pdf_tools/optimizer.html')

# 23. PDF Annotations
@pdf_bp.route('/pdf-annotations', methods=['GET', 'POST'])
def annotations_tool():
    if request.method == 'POST':
        try:
            file = request.files['pdf']
            if request.form.get('action') == 'extract':
                annotations = extract_pdf_annotations(file)
                return render_template('pdf_tools/annotations.html', annotations=annotations, show_result=True)
            else:  # add
                annotation_text = request.form['annotation']
                page_num = int(request.form['page'])
                result = add_pdf_annotation(file, annotation_text, page_num)
                return send_file(result, download_name='annotated.pdf', as_attachment=True)
        except Exception as e:
            flash(f'Error: {str(e)}', 'error')
    
    return render_template('pdf_tools/annotations.html')

# 24. PDF Redaction
@pdf_bp.route('/pdf-redaction', methods=['GET', 'POST'])
def redaction_tool():
    if request.method == 'POST':
        try:
            file = request.files['pdf']
            text_to_redact = request.form['redact_text']
            
            result = redact_pdf_text(file, text_to_redact)
            return send_file(result, download_name='redacted.pdf', as_attachment=True)
        except Exception as e:
            flash(f'Error: {str(e)}', 'error')
    
    return render_template('pdf_tools/redaction.html')

# 25. PDF Page Counter
@pdf_bp.route('/pdf-page-counter', methods=['GET', 'POST'])
def page_counter_tool():
    if request.method == 'POST':
        try:
            file = request.files['pdf']
            page_count = get_pdf_page_count(file)
            file_size = get_pdf_file_size(file)
            
            info = {
                'pages': page_count,
                'size': file_size,
                'filename': file.filename
            }
            return render_template('pdf_tools/page_counter.html', info=info, show_result=True)
        except Exception as e:
            flash(f'Error: {str(e)}', 'error')
    
    return render_template('pdf_tools/page_counter.html')