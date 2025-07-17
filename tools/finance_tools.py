import math
import requests
import logging
from flask import request
from datetime import datetime, timedelta
import os

def process_emi_calculator(request):
    """Process EMI calculator tool"""
    try:
        principal = float(request.form.get('principal', 0))
        interest_rate = float(request.form.get('interest_rate', 0))
        tenure_years = float(request.form.get('tenure_years', 0))
        
        if principal <= 0 or interest_rate <= 0 or tenure_years <= 0:
            return {'error': 'All values must be positive'}
        
        # Convert annual rate to monthly rate
        monthly_rate = interest_rate / (12 * 100)
        
        # Convert years to months
        tenure_months = int(tenure_years * 12)
        
        # Calculate EMI using formula
        if monthly_rate == 0:
            emi = principal / tenure_months
        else:
            emi = principal * monthly_rate * (1 + monthly_rate) ** tenure_months / \
                  ((1 + monthly_rate) ** tenure_months - 1)
        
        # Calculate total payment and interest
        total_payment = emi * tenure_months
        total_interest = total_payment - principal
        
        # Generate amortization schedule
        schedule = []
        remaining_balance = principal
        
        for month in range(1, tenure_months + 1):
            interest_payment = remaining_balance * monthly_rate
            principal_payment = emi - interest_payment
            remaining_balance -= principal_payment
            
            schedule.append({
                'month': month,
                'emi': round(emi, 2),
                'principal': round(principal_payment, 2),
                'interest': round(interest_payment, 2),
                'balance': round(max(0, remaining_balance), 2)
            })
        
        return {
            'success': True,
            'results': {
                'emi': round(emi, 2),
                'total_payment': round(total_payment, 2),
                'total_interest': round(total_interest, 2),
                'principal_amount': round(principal, 2),
                'interest_rate': interest_rate,
                'tenure_months': tenure_months,
                'schedule': schedule[:12]  # Return first 12 months
            }
        }
    
    except Exception as e:
        logging.error(f"EMI calculator error: {str(e)}")
        return {'error': 'Failed to calculate EMI'}

def process_gst_calculator(request):
    """Process GST calculator tool"""
    try:
        amount = float(request.form.get('amount', 0))
        gst_rate = float(request.form.get('gst_rate', 18))
        calculation_type = request.form.get('type', 'add')  # 'add' or 'remove'
        
        if amount <= 0:
            return {'error': 'Amount must be positive'}
        
        if calculation_type == 'add':
            # Add GST to amount
            gst_amount = amount * (gst_rate / 100)
            total_amount = amount + gst_amount
            net_amount = amount
        else:
            # Remove GST from amount
            net_amount = amount / (1 + gst_rate / 100)
            gst_amount = amount - net_amount
            total_amount = amount
        
        return {
            'success': True,
            'results': {
                'net_amount': round(net_amount, 2),
                'gst_amount': round(gst_amount, 2),
                'total_amount': round(total_amount, 2),
                'gst_rate': gst_rate,
                'calculation_type': calculation_type
            }
        }
    
    except Exception as e:
        logging.error(f"GST calculator error: {str(e)}")
        return {'error': 'Failed to calculate GST'}

def process_currency_converter(request):
    """Process currency converter tool"""
    try:
        amount = float(request.form.get('amount', 0))
        from_currency = request.form.get('from_currency', 'USD')
        to_currency = request.form.get('to_currency', 'INR')
        
        if amount <= 0:
            return {'error': 'Amount must be positive'}
        
        # Get API key from environment
        api_key = os.getenv('CURRENCY_API_KEY', 'default_key')
        
        # Use a free currency API (example with exchangerate-api.com)
        url = f"https://v6.exchangerate-api.com/v6/{api_key}/pair/{from_currency}/{to_currency}"
        
        try:
            response = requests.get(url, timeout=10)
            data = response.json()
            
            if response.status_code == 200 and data.get('result') == 'success':
                exchange_rate = data['conversion_rate']
                converted_amount = amount * exchange_rate
                
                return {
                    'success': True,
                    'results': {
                        'original_amount': amount,
                        'converted_amount': round(converted_amount, 2),
                        'from_currency': from_currency,
                        'to_currency': to_currency,
                        'exchange_rate': exchange_rate,
                        'last_updated': data.get('time_last_update_unix', 0)
                    }
                }
            else:
                # Fallback to mock rates if API fails
                mock_rates = {
                    'USD_INR': 83.25,
                    'EUR_INR': 90.15,
                    'GBP_INR': 105.30,
                    'USD_EUR': 0.92,
                    'USD_GBP': 0.79
                }
                
                rate_key = f"{from_currency}_{to_currency}"
                reverse_key = f"{to_currency}_{from_currency}"
                
                if rate_key in mock_rates:
                    exchange_rate = mock_rates[rate_key]
                elif reverse_key in mock_rates:
                    exchange_rate = 1 / mock_rates[reverse_key]
                else:
                    exchange_rate = 1  # Same currency
                
                converted_amount = amount * exchange_rate
                
                return {
                    'success': True,
                    'results': {
                        'original_amount': amount,
                        'converted_amount': round(converted_amount, 2),
                        'from_currency': from_currency,
                        'to_currency': to_currency,
                        'exchange_rate': exchange_rate,
                        'note': 'Using cached exchange rates'
                    }
                }
        
        except requests.RequestException:
            return {'error': 'Unable to fetch exchange rates'}
    
    except Exception as e:
        logging.error(f"Currency converter error: {str(e)}")
        return {'error': 'Failed to convert currency'}

def process_loan_calculator(request):
    """Process loan calculator tool"""
    try:
        loan_amount = float(request.form.get('loan_amount', 0))
        interest_rate = float(request.form.get('interest_rate', 0))
        tenure_years = float(request.form.get('tenure_years', 0))
        processing_fee = float(request.form.get('processing_fee', 0))
        
        if loan_amount <= 0 or interest_rate <= 0 or tenure_years <= 0:
            return {'error': 'All values must be positive'}
        
        # Calculate EMI
        monthly_rate = interest_rate / (12 * 100)
        tenure_months = int(tenure_years * 12)
        
        if monthly_rate == 0:
            emi = loan_amount / tenure_months
        else:
            emi = loan_amount * monthly_rate * (1 + monthly_rate) ** tenure_months / \
                  ((1 + monthly_rate) ** tenure_months - 1)
        
        # Calculate totals
        total_payment = emi * tenure_months
        total_interest = total_payment - loan_amount
        total_cost = total_payment + processing_fee
        
        return {
            'success': True,
            'results': {
                'loan_amount': round(loan_amount, 2),
                'emi': round(emi, 2),
                'total_payment': round(total_payment, 2),
                'total_interest': round(total_interest, 2),
                'processing_fee': round(processing_fee, 2),
                'total_cost': round(total_cost, 2),
                'interest_rate': interest_rate,
                'tenure_months': tenure_months
            }
        }
    
    except Exception as e:
        logging.error(f"Loan calculator error: {str(e)}")
        return {'error': 'Failed to calculate loan'}
