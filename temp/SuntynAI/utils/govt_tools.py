"""
Government Document processing utilities
"""
import re
import io
import os
from PIL import Image, ImageDraw, ImageFont
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
import random
from datetime import datetime

def validate_pan(pan_number):
    """Validate PAN number format"""
    if not pan_number:
        return False, "PAN number is required"
    
    # PAN format: AAAAA9999A
    pan_pattern = re.compile(r'^[A-Z]{5}[0-9]{4}[A-Z]{1}$')
    
    if not pan_pattern.match(pan_number):
        return False, "Invalid PAN format. Format should be: AAAAA9999A"
    
    # Additional validation rules
    if pan_number[3] != 'P':  # 4th character should be P for individual
        return True, "Valid PAN format (Company/Trust PAN)"
    
    return True, "Valid PAN number format"

def mask_aadhaar(aadhaar_number):
    """Mask Aadhaar number for privacy"""
    # Remove spaces and hyphens
    clean_aadhaar = re.sub(r'[\s-]', '', aadhaar_number)
    
    if len(clean_aadhaar) != 12:
        raise ValueError("Invalid Aadhaar number length")
    
    # Mask first 8 digits
    masked = 'XXXX-XXXX-' + clean_aadhaar[-4:]
    return masked

def extract_voter_info(file):
    """Extract information from voter ID (mock implementation)"""
    # In real implementation, use OCR libraries like pytesseract
    mock_data = {
        'name': 'SAMPLE NAME',
        'father_name': 'SAMPLE FATHER NAME',
        'address': 'SAMPLE ADDRESS',
        'voter_id': 'ABC1234567',
        'age': '25',
        'gender': 'Male'
    }
    return mock_data

def generate_income_cert(form_data):
    """Generate income certificate PDF"""
    output = io.BytesIO()
    doc = SimpleDocTemplate(output, pagesize=A4)
    styles = getSampleStyleSheet()
    story = []
    
    # Title
    title = Paragraph("<b>INCOME CERTIFICATE</b>", styles['Title'])
    story.append(title)
    story.append(Spacer(1, 12))
    
    # Certificate content
    content = f"""
    <b>Certificate No:</b> IC-{random.randint(10000, 99999)}<br/><br/>
    
    This is to certify that <b>{form_data['name']}</b>, 
    Son/Daughter of <b>{form_data['father_name']}</b>, 
    resident of <b>{form_data['address']}</b>, 
    has an annual income of Rs. <b>{form_data['income']}</b>.<br/><br/>
    
    This certificate is issued for <b>{form_data['purpose']}</b>.<br/><br/>
    
    Date: {datetime.now().strftime('%d/%m/%Y')}<br/>
    Place: Municipal Office<br/><br/>
    
    <b>Authorized Officer</b><br/>
    Municipal Corporation
    """
    
    cert_para = Paragraph(content, styles['Normal'])
    story.append(cert_para)
    
    doc.build(story)
    output.seek(0)
    return output

def fill_caste_cert(file, form_data):
    """Fill caste certificate form (mock implementation)"""
    # In real implementation, use libraries like pdfrw or PyPDF2 to fill forms
    output = io.BytesIO()
    doc = SimpleDocTemplate(output, pagesize=A4)
    styles = getSampleStyleSheet()
    story = []
    
    title = Paragraph("<b>CASTE CERTIFICATE</b>", styles['Title'])
    story.append(title)
    story.append(Spacer(1, 12))
    
    content = f"""
    <b>Certificate No:</b> CC-{random.randint(10000, 99999)}<br/><br/>
    
    This is to certify that <b>{form_data['name']}</b>, 
    Son/Daughter of <b>{form_data['father_name']}</b>, 
    resident of <b>{form_data['address']}</b>, 
    belongs to <b>{form_data['caste']}</b> caste.<br/><br/>
    
    Date: {datetime.now().strftime('%d/%m/%Y')}<br/>
    Place: District Collectorate<br/><br/>
    
    <b>District Collector</b>
    """
    
    cert_para = Paragraph(content, styles['Normal'])
    story.append(cert_para)
    
    doc.build(story)
    output.seek(0)
    return output

def check_ration_status(ration_number, state):
    """Check ration card status (mock implementation)"""
    statuses = ['Active', 'Inactive', 'Pending', 'Cancelled']
    mock_status = {
        'ration_number': ration_number,
        'state': state,
        'status': random.choice(statuses),
        'holder_name': 'SAMPLE HOLDER',
        'family_members': random.randint(2, 8),
        'card_type': random.choice(['APL', 'BPL', 'AAY'])
    }
    return mock_status

def create_rent_agreement(agreement_data):
    """Create rent agreement PDF"""
    output = io.BytesIO()
    doc = SimpleDocTemplate(output, pagesize=A4)
    styles = getSampleStyleSheet()
    story = []
    
    title = Paragraph("<b>RENT AGREEMENT</b>", styles['Title'])
    story.append(title)
    story.append(Spacer(1, 12))
    
    content = f"""
    This Rent Agreement is made on {datetime.now().strftime('%d/%m/%Y')} between:<br/><br/>
    
    <b>LANDLORD:</b> {agreement_data['landlord_name']}<br/>
    <b>TENANT:</b> {agreement_data['tenant_name']}<br/><br/>
    
    <b>PROPERTY ADDRESS:</b><br/>
    {agreement_data['property_address']}<br/><br/>
    
    <b>TERMS:</b><br/>
    1. Monthly Rent: Rs. {agreement_data['rent_amount']}<br/>
    2. Duration: {agreement_data['duration']} months<br/>
    3. Start Date: {agreement_data['start_date']}<br/>
    4. Security Deposit: Rs. {int(agreement_data['rent_amount']) * 2}<br/><br/>
    
    Both parties agree to the above terms and conditions.<br/><br/>
    
    <b>Landlord Signature:</b> ____________________<br/>
    <b>Tenant Signature:</b> ____________________<br/>
    """
    
    agreement_para = Paragraph(content, styles['Normal'])
    story.append(agreement_para)
    
    doc.build(story)
    output.seek(0)
    return output

def generate_birth_cert(birth_data):
    """Generate birth certificate PDF"""
    output = io.BytesIO()
    doc = SimpleDocTemplate(output, pagesize=A4)
    styles = getSampleStyleSheet()
    story = []
    
    title = Paragraph("<b>BIRTH CERTIFICATE</b>", styles['Title'])
    story.append(title)
    story.append(Spacer(1, 12))
    
    content = f"""
    <b>Registration No:</b> BC-{random.randint(100000, 999999)}<br/><br/>
    
    This is to certify that <b>{birth_data['child_name']}</b> was born on 
    <b>{birth_data['birth_date']}</b> at <b>{birth_data['birth_place']}</b>.<br/><br/>
    
    <b>Father's Name:</b> {birth_data['father_name']}<br/>
    <b>Mother's Name:</b> {birth_data['mother_name']}<br/><br/>
    
    Date of Registration: {datetime.now().strftime('%d/%m/%Y')}<br/>
    Place: Registrar Office<br/><br/>
    
    <b>Registrar of Births & Deaths</b>
    """
    
    cert_para = Paragraph(content, styles['Normal'])
    story.append(cert_para)
    
    doc.build(story)
    output.seek(0)
    return output

def generate_death_cert(death_data):
    """Generate death certificate PDF"""
    output = io.BytesIO()
    doc = SimpleDocTemplate(output, pagesize=A4)
    styles = getSampleStyleSheet()
    story = []
    
    title = Paragraph("<b>DEATH CERTIFICATE</b>", styles['Title'])
    story.append(title)
    story.append(Spacer(1, 12))
    
    content = f"""
    <b>Registration No:</b> DC-{random.randint(100000, 999999)}<br/><br/>
    
    This is to certify that <b>{death_data['deceased_name']}</b>, 
    Son/Daughter of <b>{death_data['father_name']}</b>, 
    died on <b>{death_data['death_date']}</b> at <b>{death_data['death_place']}</b>.<br/><br/>
    
    <b>Cause of Death:</b> {death_data['cause']}<br/><br/>
    
    Date of Registration: {datetime.now().strftime('%d/%m/%Y')}<br/>
    Place: Registrar Office<br/><br/>
    
    <b>Registrar of Births & Deaths</b>
    """
    
    cert_para = Paragraph(content, styles['Normal'])
    story.append(cert_para)
    
    doc.build(story)
    output.seek(0)
    return output

def extract_form16(file):
    """Extract data from Form-16 (mock implementation)"""
    mock_data = {
        'employee_name': 'SAMPLE EMPLOYEE',
        'pan': 'ABCDE1234F',
        'employer': 'SAMPLE COMPANY',
        'financial_year': '2023-24',
        'gross_salary': '500000',
        'tax_deducted': '25000',
        'net_salary': '475000'
    }
    return mock_data

def crop_passport_photo(file):
    """Crop image to passport photo size"""
    img = Image.open(file)
    
    # Passport photo size: 35mm x 45mm (approximately 138x177 pixels at 100 DPI)
    passport_size = (138, 177)
    
    # Get the center of the image
    img_width, img_height = img.size
    center_x, center_y = img_width // 2, img_height // 2
    
    # Calculate crop box
    left = center_x - passport_size[0] // 2
    top = center_y - passport_size[1] // 2
    right = left + passport_size[0]
    bottom = top + passport_size[1]
    
    # Crop and resize
    cropped = img.crop((left, top, right, bottom))
    cropped = cropped.resize(passport_size, Image.Resampling.LANCZOS)
    
    output = io.BytesIO()
    cropped.save(output, format='JPEG', quality=95)
    output.seek(0)
    return output

def create_affidavit(affidavit_data):
    """Create legal affidavit PDF"""
    output = io.BytesIO()
    doc = SimpleDocTemplate(output, pagesize=A4)
    styles = getSampleStyleSheet()
    story = []
    
    title = Paragraph("<b>AFFIDAVIT</b>", styles['Title'])
    story.append(title)
    story.append(Spacer(1, 12))
    
    content = f"""
    I, <b>{affidavit_data['deponent_name']}</b>, 
    Son/Daughter of <b>{affidavit_data['father_name']}</b>, 
    resident of <b>{affidavit_data['address']}</b>, 
    do hereby solemnly affirm and declare as under:<br/><br/>
    
    {affidavit_data['content']}<br/><br/>
    
    I further state that the above facts are true and correct to the best of my knowledge and belief.<br/><br/>
    
    Place: {affidavit_data['place']}<br/>
    Date: {datetime.now().strftime('%d/%m/%Y')}<br/><br/>
    
    <b>Deponent</b><br/>
    {affidavit_data['deponent_name']}
    """
    
    affidavit_para = Paragraph(content, styles['Normal'])
    story.append(affidavit_para)
    
    doc.build(story)
    output.seek(0)
    return output

def generate_police_verify(verify_data):
    """Generate police verification form PDF"""
    output = io.BytesIO()
    doc = SimpleDocTemplate(output, pagesize=A4)
    styles = getSampleStyleSheet()
    story = []
    
    title = Paragraph("<b>POLICE VERIFICATION FORM</b>", styles['Title'])
    story.append(title)
    story.append(Spacer(1, 12))
    
    content = f"""
    <b>Application No:</b> PV-{random.randint(10000, 99999)}<br/><br/>
    
    <b>Applicant Details:</b><br/>
    Name: {verify_data['applicant_name']}<br/>
    Father's Name: {verify_data['father_name']}<br/>
    Address: {verify_data['address']}<br/><br/>
    
    <b>Purpose:</b> {verify_data['purpose']}<br/>
    <b>Reference:</b> {verify_data['reference']}<br/><br/>
    
    <b>For Police Use:</b><br/>
    Character: ____________________<br/>
    Antecedents: ____________________<br/>
    Verification Officer: ____________________<br/>
    Date: ____________________<br/><br/>
    
    <b>Station House Officer</b><br/>
    Police Station
    """
    
    verify_para = Paragraph(content, styles['Normal'])
    story.append(verify_para)
    
    doc.build(story)
    output.seek(0)
    return output

def format_gazette(file):
    """Format gazette PDF (mock implementation)"""
    # In real implementation, use PDF processing libraries
    output = io.BytesIO()
    doc = SimpleDocTemplate(output, pagesize=A4)
    styles = getSampleStyleSheet()
    story = []
    
    title = Paragraph("<b>FORMATTED GAZETTE</b>", styles['Title'])
    story.append(title)
    story.append(Spacer(1, 12))
    
    content = """
    This is a formatted version of the uploaded gazette document.<br/><br/>
    
    <b>Processing Summary:</b><br/>
    - OCR text extraction completed<br/>
    - Formatting applied<br/>
    - Clean layout generated<br/><br/>
    
    <b>Note:</b> This is a mock implementation. 
    In production, actual gazette content would be processed and formatted.
    """
    
    gazette_para = Paragraph(content, styles['Normal'])
    story.append(gazette_para)
    
    doc.build(story)
    output.seek(0)
    return output

def extract_signature(file):
    """Extract signature from document (mock implementation)"""
    # Create a mock signature image
    img = Image.new('RGB', (200, 100), 'white')
    draw = ImageDraw.Draw(img)
    
    # Draw a simple signature-like curve
    draw.line([(20, 50), (50, 30), (80, 60), (120, 40), (150, 55), (180, 45)], 
              fill='black', width=3)
    
    output = io.BytesIO()
    img.save(output, format='PNG')
    output.seek(0)
    return output