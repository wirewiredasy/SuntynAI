"""
Government Tools Implementation - Indian Government Document Tools
High-priority implementation for Indian users
"""
import re
import logging
from datetime import datetime
import random

logger = logging.getLogger(__name__)

class GovernmentTools:
    """Complete government document tool implementations"""
    
    def __init__(self):
        pass
    
    def aadhaar_validator(self, files, form_data):
        """Validate Aadhaar card number format"""
        try:
            aadhaar_number = form_data.get('aadhaar_number', '').strip()
            
            if not aadhaar_number:
                return {
                    'success': False,
                    'error': 'Aadhaar number is required'
                }
            
            # Remove spaces and special characters
            aadhaar_clean = re.sub(r'[^\d]', '', aadhaar_number)
            
            # Validation checks
            validation_results = {
                'length_check': len(aadhaar_clean) == 12,
                'digit_check': aadhaar_clean.isdigit(),
                'not_all_same': len(set(aadhaar_clean)) > 1,
                'not_sequential': not self._is_sequential(aadhaar_clean),
                'checksum_valid': self._validate_aadhaar_checksum(aadhaar_clean)
            }
            
            is_valid = all(validation_results.values())
            
            # Format for display
            formatted_aadhaar = f"{aadhaar_clean[:4]} {aadhaar_clean[4:8]} {aadhaar_clean[8:]}"
            
            # Generate detailed report
            validation_details = []
            validation_details.append({
                'check': 'Length Validation',
                'status': 'Pass' if validation_results['length_check'] else 'Fail',
                'description': '12 digits required' if validation_results['length_check'] else 'Must be exactly 12 digits'
            })
            
            validation_details.append({
                'check': 'Format Validation',
                'status': 'Pass' if validation_results['digit_check'] else 'Fail',
                'description': 'Contains only digits' if validation_results['digit_check'] else 'Must contain only numbers'
            })
            
            validation_details.append({
                'check': 'Pattern Validation',
                'status': 'Pass' if validation_results['not_all_same'] else 'Fail',
                'description': 'Valid digit pattern' if validation_results['not_all_same'] else 'Cannot have all same digits'
            })
            
            validation_details.append({
                'check': 'Sequence Validation',
                'status': 'Pass' if validation_results['not_sequential'] else 'Fail',
                'description': 'Not sequential pattern' if validation_results['not_sequential'] else 'Cannot be sequential digits'
            })
            
            validation_details.append({
                'check': 'Checksum Validation',
                'status': 'Pass' if validation_results['checksum_valid'] else 'Fail',
                'description': 'Valid Verhoeff checksum' if validation_results['checksum_valid'] else 'Invalid checksum'
            })
            
            return {
                'success': True,
                'is_valid': is_valid,
                'formatted_number': formatted_aadhaar if is_valid else 'Invalid Format',
                'validation_details': validation_details,
                'overall_status': 'Valid Aadhaar Number' if is_valid else 'Invalid Aadhaar Number',
                'message': f'Aadhaar validation {"passed" if is_valid else "failed"}'
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': f'Aadhaar validation failed: {str(e)}'
            }
    
    def pan_validator(self, files, form_data):
        """Validate PAN card number format"""
        try:
            pan_number = form_data.get('pan_number', '').strip().upper()
            
            if not pan_number:
                return {
                    'success': False,
                    'error': 'PAN number is required'
                }
            
            # PAN pattern: 5 letters + 4 digits + 1 letter
            pan_pattern = r'^[A-Z]{5}[0-9]{4}[A-Z]{1}$'
            
            validation_results = {
                'length_check': len(pan_number) == 10,
                'format_check': bool(re.match(pan_pattern, pan_number)),
                'first_five_letters': pan_number[:5].isalpha() if len(pan_number) >= 5 else False,
                'middle_four_digits': pan_number[5:9].isdigit() if len(pan_number) >= 9 else False,
                'last_letter': pan_number[-1].isalpha() if len(pan_number) >= 10 else False
            }
            
            is_valid = all(validation_results.values())
            
            # Extract information from PAN
            pan_info = {}
            if is_valid:
                # Fourth character indicates status
                status_codes = {
                    'P': 'Individual',
                    'C': 'Company',
                    'H': 'HUF (Hindu Undivided Family)',
                    'F': 'Firm/LLP',
                    'A': 'Association of Persons',
                    'T': 'Trust',
                    'B': 'Body of Individuals',
                    'L': 'Local Authority',
                    'J': 'Artificial Juridical Person',
                    'G': 'Government'
                }
                
                fourth_char = pan_number[3]
                pan_info = {
                    'holder_type': status_codes.get(fourth_char, 'Unknown'),
                    'area_code': pan_number[:3],
                    'holder_status': fourth_char,
                    'series_number': pan_number[4:9],
                    'check_digit': pan_number[9]
                }
            
            # Generate validation report
            validation_details = []
            validation_details.append({
                'check': 'Length Check',
                'status': 'Pass' if validation_results['length_check'] else 'Fail',
                'description': '10 characters' if validation_results['length_check'] else 'Must be exactly 10 characters'
            })
            
            validation_details.append({
                'check': 'Format Check',
                'status': 'Pass' if validation_results['format_check'] else 'Fail',
                'description': 'Valid PAN format' if validation_results['format_check'] else 'Must follow AAAAA9999A pattern'
            })
            
            validation_details.append({
                'check': 'Alphabetic Check',
                'status': 'Pass' if validation_results['first_five_letters'] and validation_results['last_letter'] else 'Fail',
                'description': 'Letters in correct positions' if validation_results['first_five_letters'] and validation_results['last_letter'] else 'First 5 and last characters must be letters'
            })
            
            validation_details.append({
                'check': 'Numeric Check',
                'status': 'Pass' if validation_results['middle_four_digits'] else 'Fail',
                'description': 'Digits in correct positions' if validation_results['middle_four_digits'] else 'Characters 6-9 must be digits'
            })
            
            return {
                'success': True,
                'is_valid': is_valid,
                'pan_number': pan_number if is_valid else 'Invalid Format',
                'pan_info': pan_info,
                'validation_details': validation_details,
                'overall_status': 'Valid PAN Number' if is_valid else 'Invalid PAN Number',
                'message': f'PAN validation {"passed" if is_valid else "failed"}'
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': f'PAN validation failed: {str(e)}'
            }
    
    def gst_validator(self, files, form_data):
        """Validate GST number format"""
        try:
            gst_number = form_data.get('gst_number', '').strip().upper()
            
            if not gst_number:
                return {
                    'success': False,
                    'error': 'GST number is required'
                }
            
            # GST pattern: 2 digits (state) + 10 char PAN + 1 digit (entity) + 1 char (Z) + 1 check digit
            gst_pattern = r'^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$'
            
            validation_results = {
                'length_check': len(gst_number) == 15,
                'format_check': bool(re.match(gst_pattern, gst_number)),
                'state_code_valid': self._validate_state_code(gst_number[:2]) if len(gst_number) >= 2 else False,
                'pan_valid': self._validate_pan_in_gst(gst_number[2:12]) if len(gst_number) >= 12 else False,
                'z_position': gst_number[13] == 'Z' if len(gst_number) >= 14 else False
            }
            
            is_valid = all(validation_results.values())
            
            # Extract GST information
            gst_info = {}
            if len(gst_number) >= 15:
                state_code = gst_number[:2]
                pan_part = gst_number[2:12]
                entity_code = gst_number[12]
                z_char = gst_number[13]
                check_digit = gst_number[14]
                
                state_names = {
                    '01': 'Jammu and Kashmir', '02': 'Himachal Pradesh', '03': 'Punjab',
                    '04': 'Chandigarh', '05': 'Uttarakhand', '06': 'Haryana',
                    '07': 'Delhi', '08': 'Rajasthan', '09': 'Uttar Pradesh',
                    '10': 'Bihar', '11': 'Sikkim', '12': 'Arunachal Pradesh',
                    '13': 'Nagaland', '14': 'Manipur', '15': 'Mizoram',
                    '16': 'Tripura', '17': 'Meghalaya', '18': 'Assam',
                    '19': 'West Bengal', '20': 'Jharkhand', '21': 'Odisha',
                    '22': 'Chhattisgarh', '23': 'Madhya Pradesh', '24': 'Gujarat',
                    '25': 'Daman and Diu', '26': 'Dadra and Nagar Haveli', '27': 'Maharashtra',
                    '28': 'Andhra Pradesh', '29': 'Karnataka', '30': 'Goa',
                    '31': 'Lakshadweep', '32': 'Kerala', '33': 'Tamil Nadu',
                    '34': 'Puducherry', '35': 'Andaman and Nicobar Islands', '36': 'Telangana',
                    '37': 'Andhra Pradesh', '38': 'Ladakh'
                }
                
                gst_info = {
                    'state_code': state_code,
                    'state_name': state_names.get(state_code, 'Unknown State'),
                    'pan_number': pan_part,
                    'entity_number': entity_code,
                    'z_identifier': z_char,
                    'check_digit': check_digit
                }
            
            # Validation details
            validation_details = []
            validation_details.append({
                'check': 'Length Validation',
                'status': 'Pass' if validation_results['length_check'] else 'Fail',
                'description': '15 characters' if validation_results['length_check'] else 'Must be exactly 15 characters'
            })
            
            validation_details.append({
                'check': 'Format Validation',
                'status': 'Pass' if validation_results['format_check'] else 'Fail',
                'description': 'Valid GST format' if validation_results['format_check'] else 'Must follow 99AAAAA9999A9Z9 pattern'
            })
            
            validation_details.append({
                'check': 'State Code',
                'status': 'Pass' if validation_results['state_code_valid'] else 'Fail',
                'description': 'Valid state code' if validation_results['state_code_valid'] else 'Invalid state code'
            })
            
            validation_details.append({
                'check': 'PAN Validation',
                'status': 'Pass' if validation_results['pan_valid'] else 'Fail',
                'description': 'Valid PAN in GST' if validation_results['pan_valid'] else 'Invalid PAN portion'
            })
            
            validation_details.append({
                'check': 'Z Position',
                'status': 'Pass' if validation_results['z_position'] else 'Fail',
                'description': 'Z in correct position' if validation_results['z_position'] else '14th character must be Z'
            })
            
            return {
                'success': True,
                'is_valid': is_valid,
                'gst_number': gst_number if is_valid else 'Invalid Format',
                'gst_info': gst_info,
                'validation_details': validation_details,
                'overall_status': 'Valid GST Number' if is_valid else 'Invalid GST Number',
                'message': f'GST validation {"passed" if is_valid else "failed"}'
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': f'GST validation failed: {str(e)}'
            }
    
    def vehicle_number_validator(self, files, form_data):
        """Validate Indian vehicle registration number"""
        try:
            vehicle_number = form_data.get('vehicle_number', '').strip().upper()
            
            if not vehicle_number:
                return {
                    'success': False,
                    'error': 'Vehicle number is required'
                }
            
            # Remove spaces for validation
            vehicle_clean = re.sub(r'\s+', '', vehicle_number)
            
            # Indian vehicle number patterns
            patterns = {
                'new_format': r'^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$',  # XX99XX9999
                'old_format': r'^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{1,4}$'  # XX99X999 or XX99XX999
            }
            
            format_type = None
            if re.match(patterns['new_format'], vehicle_clean):
                format_type = 'New Format (Post 2019)'
            elif re.match(patterns['old_format'], vehicle_clean):
                format_type = 'Old Format (Pre 2019)'
            
            is_valid = format_type is not None
            
            # Extract vehicle information
            vehicle_info = {}
            if is_valid:
                state_code = vehicle_clean[:2]
                district_code = vehicle_clean[2:4]
                
                # State codes mapping (sample)
                state_codes = {
                    'AP': 'Andhra Pradesh', 'AR': 'Arunachal Pradesh', 'AS': 'Assam',
                    'BR': 'Bihar', 'CH': 'Chandigarh', 'CG': 'Chhattisgarh',
                    'DN': 'Dadra and Nagar Haveli', 'DD': 'Daman and Diu', 'DL': 'Delhi',
                    'GA': 'Goa', 'GJ': 'Gujarat', 'HR': 'Haryana', 'HP': 'Himachal Pradesh',
                    'JK': 'Jammu and Kashmir', 'JH': 'Jharkhand', 'KA': 'Karnataka',
                    'KL': 'Kerala', 'LD': 'Lakshadweep', 'MP': 'Madhya Pradesh',
                    'MH': 'Maharashtra', 'MN': 'Manipur', 'ML': 'Meghalaya',
                    'MZ': 'Mizoram', 'NL': 'Nagaland', 'OR': 'Odisha', 'PY': 'Puducherry',
                    'PB': 'Punjab', 'RJ': 'Rajasthan', 'SK': 'Sikkim', 'TN': 'Tamil Nadu',
                    'TS': 'Telangana', 'TR': 'Tripura', 'UP': 'Uttar Pradesh',
                    'UK': 'Uttarakhand', 'WB': 'West Bengal'
                }
                
                if format_type == 'New Format (Post 2019)':
                    series_letters = vehicle_clean[4:6]
                    serial_number = vehicle_clean[6:10]
                    formatted = f"{state_code} {district_code} {series_letters} {serial_number}"
                else:
                    series_letters = vehicle_clean[4:-4] if len(vehicle_clean) > 8 else vehicle_clean[4:-3]
                    serial_number = vehicle_clean[-4:] if len(vehicle_clean) > 8 else vehicle_clean[-3:]
                    formatted = f"{state_code} {district_code} {series_letters} {serial_number}"
                
                vehicle_info = {
                    'state_code': state_code,
                    'state_name': state_codes.get(state_code, 'Unknown State'),
                    'district_code': district_code,
                    'series_letters': series_letters,
                    'serial_number': serial_number,
                    'formatted_number': formatted,
                    'format_type': format_type
                }
            
            return {
                'success': True,
                'is_valid': is_valid,
                'vehicle_number': vehicle_number,
                'vehicle_info': vehicle_info,
                'validation_status': 'Valid Vehicle Number' if is_valid else 'Invalid Vehicle Number',
                'format_type': format_type,
                'message': f'Vehicle number validation {"passed" if is_valid else "failed"}'
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': f'Vehicle number validation failed: {str(e)}'
            }
    
    # Helper methods
    def _is_sequential(self, number_str):
        """Check if digits are in sequential order"""
        for i in range(len(number_str) - 1):
            if int(number_str[i+1]) != int(number_str[i]) + 1:
                return False
        return True
    
    def _validate_aadhaar_checksum(self, aadhaar):
        """Validate Aadhaar using Verhoeff algorithm"""
        if len(aadhaar) != 12:
            return False
            
        # Verhoeff algorithm implementation (simplified)
        d = [
            [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
            [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
            [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
            [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
            [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
            [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
            [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
            [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
            [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
            [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
        ]
        
        p = [
            [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
            [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
            [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
            [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
            [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
            [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
            [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
            [7, 0, 4, 6, 9, 1, 3, 2, 5, 8]
        ]
        
        c = 0
        for i, digit in enumerate(reversed(aadhaar)):
            c = d[c][p[i % 8][int(digit)]]
        
        return c == 0
    
    def _validate_state_code(self, state_code):
        """Validate GST state code"""
        valid_codes = [f"{i:02d}" for i in range(1, 39)]
        return state_code in valid_codes
    
    def _validate_pan_in_gst(self, pan_part):
        """Validate PAN portion in GST number"""
        pan_pattern = r'^[A-Z]{5}[0-9]{4}[A-Z]{1}$'
        return bool(re.match(pan_pattern, pan_part))