"""
Government Document Toolkit Routes - 15 Professional Tools
"""
from flask import Blueprint, render_template, request, send_file, jsonify, flash, redirect, url_for
from werkzeug.utils import secure_filename
import os
import re
from utils.govt_tools import (
    validate_pan, mask_aadhaar, extract_voter_info, generate_income_cert,
    fill_caste_cert, check_ration_status, create_rent_agreement,
    generate_birth_cert, generate_death_cert, extract_form16,
    crop_passport_photo, create_affidavit, generate_police_verify,
    format_gazette, extract_signature
)

govt_bp = Blueprint('govt_tools', __name__)

# 1. PAN Validator
@govt_bp.route('/pan-validator', methods=['GET', 'POST'])
def pan_validator():
    if request.method == 'POST':
        try:
            pan_number = request.form['pan_number'].upper().strip()
            is_valid, message = validate_pan(pan_number)
            return jsonify({'valid': is_valid, 'message': message})
        except Exception as e:
            flash(f'Error: {str(e)}', 'error')
    
    return render_template('govt_tools/pan_validator.html')

# 2. Aadhaar Masker
@govt_bp.route('/aadhaar-mask', methods=['GET', 'POST'])
def aadhaar_mask():
    if request.method == 'POST':
        try:
            aadhaar_number = request.form['aadhaar_number'].strip()
            masked_number = mask_aadhaar(aadhaar_number)
            return jsonify({'masked': masked_number})
        except Exception as e:
            flash(f'Error: {str(e)}', 'error')
    
    return render_template('govt_tools/aadhaar_mask.html')

# 3. Voter ID Extractor
@govt_bp.route('/voter-id-extract', methods=['GET', 'POST'])
def voter_id_extract():
    if request.method == 'POST':
        try:
            file = request.files['voter_id']
            extracted_info = extract_voter_info(file)
            return jsonify(extracted_info)
        except Exception as e:
            flash(f'Error: {str(e)}', 'error')
    
    return render_template('govt_tools/voter_id_extract.html')

# 4. Income Certificate Generator
@govt_bp.route('/income-cert', methods=['GET', 'POST'])
def income_cert():
    if request.method == 'POST':
        try:
            form_data = {
                'name': request.form['name'],
                'father_name': request.form['father_name'],
                'address': request.form['address'],
                'income': request.form['income'],
                'purpose': request.form['purpose']
            }
            result = generate_income_cert(form_data)
            return send_file(result, download_name='income_certificate.pdf', as_attachment=True)
        except Exception as e:
            flash(f'Error: {str(e)}', 'error')
    
    return render_template('govt_tools/income_cert.html')

# 5. Caste Certificate Form Filler
@govt_bp.route('/caste-cert-fill', methods=['GET', 'POST'])
def caste_cert_fill():
    if request.method == 'POST':
        try:
            file = request.files['form']
            form_data = {
                'name': request.form['name'],
                'caste': request.form['caste'],
                'father_name': request.form['father_name'],
                'address': request.form['address']
            }
            result = fill_caste_cert(file, form_data)
            return send_file(result, download_name='filled_caste_certificate.pdf', as_attachment=True)
        except Exception as e:
            flash(f'Error: {str(e)}', 'error')
    
    return render_template('govt_tools/caste_cert_fill.html')

# 6. Ration Card Status Checker
@govt_bp.route('/ration-status', methods=['GET', 'POST'])
def ration_status():
    if request.method == 'POST':
        try:
            ration_number = request.form['ration_number']
            state = request.form['state']
            status_info = check_ration_status(ration_number, state)
            return jsonify(status_info)
        except Exception as e:
            flash(f'Error: {str(e)}', 'error')
    
    return render_template('govt_tools/ration_status.html')

# 7. Rent Agreement Creator
@govt_bp.route('/rent-agreement', methods=['GET', 'POST'])
def rent_agreement():
    if request.method == 'POST':
        try:
            agreement_data = {
                'landlord_name': request.form['landlord_name'],
                'tenant_name': request.form['tenant_name'],
                'property_address': request.form['property_address'],
                'rent_amount': request.form['rent_amount'],
                'duration': request.form['duration'],
                'start_date': request.form['start_date']
            }
            result = create_rent_agreement(agreement_data)
            return send_file(result, download_name='rent_agreement.pdf', as_attachment=True)
        except Exception as e:
            flash(f'Error: {str(e)}', 'error')
    
    return render_template('govt_tools/rent_agreement.html')

# 8. Birth Certificate Generator
@govt_bp.route('/birth-cert', methods=['GET', 'POST'])
def birth_cert():
    if request.method == 'POST':
        try:
            birth_data = {
                'child_name': request.form['child_name'],
                'father_name': request.form['father_name'],
                'mother_name': request.form['mother_name'],
                'birth_date': request.form['birth_date'],
                'birth_place': request.form['birth_place']
            }
            result = generate_birth_cert(birth_data)
            return send_file(result, download_name='birth_certificate.pdf', as_attachment=True)
        except Exception as e:
            flash(f'Error: {str(e)}', 'error')
    
    return render_template('govt_tools/birth_cert.html')

# 9. Death Certificate Generator
@govt_bp.route('/death-cert', methods=['GET', 'POST'])
def death_cert():
    if request.method == 'POST':
        try:
            death_data = {
                'deceased_name': request.form['deceased_name'],
                'father_name': request.form['father_name'],
                'death_date': request.form['death_date'],
                'death_place': request.form['death_place'],
                'cause': request.form['cause']
            }
            result = generate_death_cert(death_data)
            return send_file(result, download_name='death_certificate.pdf', as_attachment=True)
        except Exception as e:
            flash(f'Error: {str(e)}', 'error')
    
    return render_template('govt_tools/death_cert.html')

# 10. Form-16 Extractor
@govt_bp.route('/form16-extract', methods=['GET', 'POST'])
def form16_extract():
    if request.method == 'POST':
        try:
            file = request.files['form16']
            extracted_data = extract_form16(file)
            return jsonify(extracted_data)
        except Exception as e:
            flash(f'Error: {str(e)}', 'error')
    
    return render_template('govt_tools/form16_extract.html')

# 11. Passport Photo Cropper
@govt_bp.route('/passport-photo', methods=['GET', 'POST'])
def passport_photo():
    if request.method == 'POST':
        try:
            file = request.files['photo']
            result = crop_passport_photo(file)
            return send_file(result, download_name='passport_photo.jpg', as_attachment=True)
        except Exception as e:
            flash(f'Error: {str(e)}', 'error')
    
    return render_template('govt_tools/passport_photo.html')

# 12. Legal Affidavit Creator
@govt_bp.route('/affidavit-creator', methods=['GET', 'POST'])
def affidavit_creator():
    if request.method == 'POST':
        try:
            affidavit_data = {
                'deponent_name': request.form['deponent_name'],
                'father_name': request.form['father_name'],
                'address': request.form['address'],
                'content': request.form['content'],
                'place': request.form['place']
            }
            result = create_affidavit(affidavit_data)
            return send_file(result, download_name='affidavit.pdf', as_attachment=True)
        except Exception as e:
            flash(f'Error: {str(e)}', 'error')
    
    return render_template('govt_tools/affidavit_creator.html')

# 13. Police Verification Form Generator
@govt_bp.route('/police-verify-form', methods=['GET', 'POST'])
def police_verify_form():
    if request.method == 'POST':
        try:
            verify_data = {
                'applicant_name': request.form['applicant_name'],
                'father_name': request.form['father_name'],
                'address': request.form['address'],
                'purpose': request.form['purpose'],
                'reference': request.form['reference']
            }
            result = generate_police_verify(verify_data)
            return send_file(result, download_name='police_verification_form.pdf', as_attachment=True)
        except Exception as e:
            flash(f'Error: {str(e)}', 'error')
    
    return render_template('govt_tools/police_verify_form.html')

# 14. Gazette PDF Formatter
@govt_bp.route('/gazette-cleaner', methods=['GET', 'POST'])
def gazette_cleaner():
    if request.method == 'POST':
        try:
            file = request.files['gazette']
            result = format_gazette(file)
            return send_file(result, download_name='formatted_gazette.pdf', as_attachment=True)
        except Exception as e:
            flash(f'Error: {str(e)}', 'error')
    
    return render_template('govt_tools/gazette_cleaner.html')

# 15. Signature Extractor
@govt_bp.route('/signature-extract', methods=['GET', 'POST'])
def signature_extract():
    if request.method == 'POST':
        try:
            file = request.files['document']
            result = extract_signature(file)
            return send_file(result, download_name='extracted_signature.png', as_attachment=True)
        except Exception as e:
            flash(f'Error: {str(e)}', 'error')
    
    return render_template('govt_tools/signature_extract.html')