class EMICalculator {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupSliders();
    }

    setupEventListeners() {
        const form = document.getElementById('emi-calculator-form');
        const inputs = ['loan-amount', 'interest-rate', 'loan-tenure'];
        
        if (form) {
            form.addEventListener('submit', (e) => this.handleSubmit(e));
        }

        inputs.forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('input', () => this.calculateEMI());
            }
        });

        // Real-time calculation on input change
        const sliders = ['amount-slider', 'rate-slider', 'tenure-slider'];
        sliders.forEach(id => {
            const slider = document.getElementById(id);
            if (slider) {
                slider.addEventListener('input', () => this.updateFromSlider(id));
            }
        });
    }

    setupSliders() {
        this.updateSliderValues();
    }

    updateFromSlider(sliderId) {
        const slider = document.getElementById(sliderId);
        if (!slider) return;

        const value = slider.value;
        
        switch(sliderId) {
            case 'amount-slider':
                document.getElementById('loan-amount').value = value;
                document.getElementById('amount-display').textContent = this.formatCurrency(value);
                break;
            case 'rate-slider':
                document.getElementById('interest-rate').value = value;
                document.getElementById('rate-display').textContent = value + '%';
                break;
            case 'tenure-slider':
                document.getElementById('loan-tenure').value = value;
                document.getElementById('tenure-display').textContent = value + ' years';
                break;
        }
        
        this.calculateEMI();
    }

    updateSliderValues() {
        const loanAmount = document.getElementById('loan-amount')?.value || 500000;
        const interestRate = document.getElementById('interest-rate')?.value || 8.5;
        const loanTenure = document.getElementById('loan-tenure')?.value || 20;

        const amountSlider = document.getElementById('amount-slider');
        const rateSlider = document.getElementById('rate-slider');
        const tenureSlider = document.getElementById('tenure-slider');

        if (amountSlider) amountSlider.value = loanAmount;
        if (rateSlider) rateSlider.value = interestRate;
        if (tenureSlider) tenureSlider.value = loanTenure;
        
        // Update displays
        document.getElementById('amount-display').textContent = this.formatCurrency(loanAmount);
        document.getElementById('rate-display').textContent = interestRate + '%';
        document.getElementById('tenure-display').textContent = loanTenure + ' years';
    }

    calculateEMI() {
        const principal = parseFloat(document.getElementById('loan-amount')?.value || 0);
        const rate = parseFloat(document.getElementById('interest-rate')?.value || 0);
        const tenure = parseFloat(document.getElementById('loan-tenure')?.value || 0);
        
        if (principal <= 0 || rate <= 0 || tenure <= 0) return;
        
        const monthlyRate = rate / (12 * 100);
        const tenureMonths = tenure * 12;
        
        let emi;
        if (monthlyRate === 0) {
            emi = principal / tenureMonths;
        } else {
            emi = principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths) / 
                  (Math.pow(1 + monthlyRate, tenureMonths) - 1);
        }
        
        const totalAmount = emi * tenureMonths;
        const totalInterest = totalAmount - principal;
        
        this.displayResults(emi, totalAmount, totalInterest, principal, rate, tenureMonths);
        this.generateSchedule(principal, emi, monthlyRate, tenureMonths);
    }

    displayResults(emi, totalAmount, totalInterest, principal, rate, tenureMonths) {
        const resultsCard = document.getElementById('results-card');
        const emiAmount = document.getElementById('emi-amount');
        const totalAmountEl = document.getElementById('total-amount');
        const totalInterestEl = document.getElementById('total-interest');
        
        if (resultsCard) resultsCard.style.display = 'block';
        if (emiAmount) emiAmount.textContent = this.formatCurrency(emi);
        if (totalAmountEl) totalAmountEl.textContent = this.formatCurrency(totalAmount);
        if (totalInterestEl) totalInterestEl.textContent = this.formatCurrency(totalInterest);
        
        this.createChart(principal, totalInterest);
    }

    createChart(principal, totalInterest) {
        const ctx = document.getElementById('emi-chart');
        if (!ctx) return;
        
        if (this.chart) {
            this.chart.destroy();
        }
        
        this.chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Principal', 'Interest'],
                datasets: [{
                    data: [principal, totalInterest],
                    backgroundColor: ['#198754', '#dc3545'],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    generateSchedule(principal, emi, monthlyRate, tenureMonths) {
        const scheduleCard = document.getElementById('schedule-card');
        const scheduleBody = document.getElementById('schedule-body');
        
        if (!scheduleCard || !scheduleBody) return;
        
        let remainingBalance = principal;
        let html = '';
        
        for (let month = 1; month <= Math.min(12, tenureMonths); month++) {
            const interestPayment = remainingBalance * monthlyRate;
            const principalPayment = emi - interestPayment;
            remainingBalance -= principalPayment;
            
            html += `
                <tr>
                    <td>${month}</td>
                    <td>${this.formatCurrency(emi)}</td>
                    <td>${this.formatCurrency(principalPayment)}</td>
                    <td>${this.formatCurrency(interestPayment)}</td>
                    <td>${this.formatCurrency(Math.max(0, remainingBalance))}</td>
                </tr>
            `;
        }
        
        scheduleBody.innerHTML = html;
        scheduleCard.style.display = 'block';
    }

    async handleSubmit(e) {
        e.preventDefault();
        this.calculateEMI();
    }

    formatCurrency(amount) {
        return '₹' + new Intl.NumberFormat('en-IN').format(Math.round(amount));
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new EMICalculator();
});

        // Update displays
        const amountDisplay = document.getElementById('amount-display');
        const rateDisplay = document.getElementById('rate-display');
        const tenureDisplay = document.getElementById('tenure-display');

        if (amountDisplay) amountDisplay.textContent = this.formatCurrency(loanAmount);
        if (rateDisplay) rateDisplay.textContent = interestRate + '%';
        if (tenureDisplay) tenureDisplay.textContent = loanTenure + ' years';
    }

    calculateEMI() {
        const loanAmount = parseFloat(document.getElementById('loan-amount')?.value || 0);
        const annualRate = parseFloat(document.getElementById('interest-rate')?.value || 0);
        const tenureYears = parseFloat(document.getElementById('loan-tenure')?.value || 0);

        if (loanAmount <= 0 || annualRate <= 0 || tenureYears <= 0) {
            this.clearResults();
            return;
        }

        // Calculate EMI
        const monthlyRate = annualRate / 12 / 100;
        const tenureMonths = tenureYears * 12;
        
        const emi = loanAmount * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths) / 
                   (Math.pow(1 + monthlyRate, tenureMonths) - 1);

        const totalAmount = emi * tenureMonths;
        const totalInterest = totalAmount - loanAmount;

        this.updateResults({
            emi: emi,
            totalAmount: totalAmount,
            totalInterest: totalInterest,
            principal: loanAmount,
            tenureMonths: tenureMonths
        });

        this.updateChart({
            principal: loanAmount,
            interest: totalInterest
        });
    }

    updateResults(results) {
        const elements = {
            'emi-amount': this.formatCurrency(results.emi),
            'total-amount': this.formatCurrency(results.totalAmount),
            'total-interest': this.formatCurrency(results.totalInterest),
            'monthly-breakdown': `₹${Math.round(results.emi)} per month for ${results.tenureMonths} months`
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });

        // Show results
        const resultsCard = document.getElementById('results-card');
        if (resultsCard) {
            resultsCard.style.display = 'block';
            resultsCard.classList.add('animate__animated', 'animate__fadeInUp');
        }

        // Generate amortization schedule
        this.generateAmortizationSchedule(results);
    }

    generateAmortizationSchedule(results) {
        const scheduleBody = document.getElementById('schedule-body');
        if (!scheduleBody) return;

        const loanAmount = results.principal;
        const monthlyRate = parseFloat(document.getElementById('interest-rate').value) / 12 / 100;
        const emi = results.emi;
        
        let balance = loanAmount;
        let scheduleHTML = '';

        // Show first 12 months
        for (let month = 1; month <= Math.min(12, results.tenureMonths); month++) {
            const interestPayment = balance * monthlyRate;
            const principalPayment = emi - interestPayment;
            balance -= principalPayment;

            scheduleHTML += `
                <tr>
                    <td>${month}</td>
                    <td>₹${Math.round(emi).toLocaleString()}</td>
                    <td>₹${Math.round(principalPayment).toLocaleString()}</td>
                    <td>₹${Math.round(interestPayment).toLocaleString()}</td>
                    <td>₹${Math.round(Math.max(0, balance)).toLocaleString()}</td>
                </tr>
            `;
        }

        scheduleBody.innerHTML = scheduleHTML;
    }

    updateChart(data) {
        const chartCanvas = document.getElementById('emi-chart');
        if (!chartCanvas) return;

        const ctx = chartCanvas.getContext('2d');
        
        // Destroy existing chart
        if (this.chart) {
            this.chart.destroy();
        }

        this.chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Principal Amount', 'Interest Amount'],
                datasets: [{
                    data: [data.principal, data.interest],
                    backgroundColor: ['#3b82f6', '#ef4444'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    clearResults() {
        const resultsCard = document.getElementById('results-card');
        if (resultsCard) {
            resultsCard.style.display = 'none';
        }
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append('loan_amount', document.getElementById('loan-amount').value);
        formData.append('interest_rate', document.getElementById('interest-rate').value);
        formData.append('loan_tenure', document.getElementById('loan-tenure').value);

        try {
            const response = await fetch('/api/tools/emi-calculator', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            
            if (result.success) {
                // Results already calculated on frontend, just log the API call
                console.log('EMI calculation saved to history');
            }
        } catch (error) {
            console.error('Error saving calculation:', error);
        }
    }

    formatCurrency(amount) {
        return '₹' + Math.round(amount).toLocaleString('en-IN');
    }
}

// Initialize EMI Calculator
const emiCalculator = new EMICalculator();

// Load Chart.js if not already loaded
if (typeof Chart === 'undefined') {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
    script.onload = () => {
        if (typeof emiCalculator !== 'undefined') {
            emiCalculator.calculateEMI();
        }
    };
    document.head.appendChild(script);
}