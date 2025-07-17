// EMI Calculator Tool - JavaScript
// Handles EMI calculations with real-time updates and visualization

class EMICalculator {
    constructor() {
        this.chart = null;
        this.currentResults = null;
        this.isCalculating = false;
        this.amortizationSchedule = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupCharts();
        this.setupCollaboration();
        console.log('💰 EMI Calculator initialized');
    }

    setupEventListeners() {
        const form = document.getElementById('emi-calculator-form');
        const inputs = form?.querySelectorAll('input[type="number"]');

        // Form submission
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.calculateEMI();
            });
        }

        // Real-time calculation on input change
        if (inputs) {
            inputs.forEach(input => {
                input.addEventListener('input', () => {
                    this.debouncedCalculate();
                });
            });
        }

        // Export buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('[onclick*="exportToPDF"]')) {
                e.preventDefault();
                this.exportToPDF();
            }
            if (e.target.matches('[onclick*="exportToExcel"]')) {
                e.preventDefault();
                this.exportToExcel();
            }
            if (e.target.matches('[onclick*="printResults"]')) {
                e.preventDefault();
                this.printResults();
            }
        });

        // Collaboration events
        document.addEventListener('collaborationUpdate', (e) => {
            this.handleCollaborationUpdate(e.detail);
        });
    }

    setupCharts() {
        const chartCanvas = document.getElementById('emi-chart');
        if (chartCanvas && typeof Chart !== 'undefined') {
            this.chart = new Chart(chartCanvas, {
                type: 'doughnut',
                data: {
                    labels: ['Principal', 'Interest'],
                    datasets: [{
                        data: [0, 0],
                        backgroundColor: [
                            '#10b981',
                            '#f59e0b'
                        ],
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
    }

    setupCollaboration() {
        // Setup collaboration room
        this.collaborationRoom = `emi-calculator-${Date.now()}`;
        
        // Join collaboration room if WebSocket is available
        if (window.wsClient && window.wsClient.isConnected()) {
            window.wsClient.joinRoom(this.collaborationRoom, 'emi-calculator');
        }
    }

    // Debounced calculation for real-time updates
    debouncedCalculate = this.debounce(() => {
        if (this.isFormValid()) {
            this.calculateEMI();
        }
    }, 500);

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    isFormValid() {
        const principal = this.getInputValue('principal');
        const interestRate = this.getInputValue('interest_rate');
        const tenureYears = this.getInputValue('tenure_years');
        
        return principal > 0 && interestRate > 0 && tenureYears > 0;
    }

    getInputValue(id) {
        const input = document.getElementById(id);
        return input ? parseFloat(input.value) || 0 : 0;
    }

    async calculateEMI() {
        if (this.isCalculating) return;
        
        this.isCalculating = true;
        
        try {
            const principal = this.getInputValue('principal');
            const interestRate = this.getInputValue('interest_rate');
            const tenureYears = this.getInputValue('tenure_years');
            const processingFee = this.getInputValue('processing_fee');

            if (!this.isFormValid()) {
                this.showError('Please fill in all required fields with valid values');
                return;
            }

            const formData = new FormData();
            formData.append('principal', principal);
            formData.append('interest_rate', interestRate);
            formData.append('tenure_years', tenureYears);
            formData.append('processing_fee', processingFee);

            const response = await fetch('/api/tools/emi-calculator', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                this.currentResults = result.results;
                this.displayResults(result.results);
                this.updateChart(result.results);
                this.generateAmortizationSchedule(result.results);
                this.broadcastCalculationUpdate(result.results);
            } else {
                this.showError(result.error || 'Failed to calculate EMI');
            }
        } catch (error) {
            console.error('EMI calculation error:', error);
            this.showError('Network error occurred while calculating EMI');
        } finally {
            this.isCalculating = false;
        }
    }

    displayResults(results) {
        const resultCard = document.getElementById('results-card');
        if (resultCard) {
            resultCard.style.display = 'block';
        }

        // Update key result values
        this.updateElement('emi-amount', this.formatCurrency(results.emi));
        this.updateElement('total-amount', this.formatCurrency(results.total_payment));
        this.updateElement('total-interest', this.formatCurrency(results.total_interest));
        this.updateElement('total-cost', this.formatCurrency(results.total_payment + (results.processing_fee || 0)));

        // Update breakdown
        this.updateElement('principal-display', this.formatCurrency(results.principal_amount));
        this.updateElement('interest-display', this.formatCurrency(results.total_interest));
        this.updateElement('fee-display', this.formatCurrency(results.processing_fee || 0));
        this.updateElement('total-cost-display', this.formatCurrency(results.total_payment + (results.processing_fee || 0)));
    }

    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    updateChart(results) {
        if (this.chart) {
            this.chart.data.datasets[0].data = [
                results.principal_amount,
                results.total_interest
            ];
            this.chart.update();
        }
    }

    generateAmortizationSchedule(results) {
        const scheduleTable = document.getElementById('schedule-table');
        if (!scheduleTable || !results.schedule) return;

        scheduleTable.innerHTML = '';
        
        results.schedule.forEach(payment => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${payment.month}</td>
                <td>${this.formatCurrency(payment.emi)}</td>
                <td>${this.formatCurrency(payment.principal)}</td>
                <td>${this.formatCurrency(payment.interest)}</td>
                <td>${this.formatCurrency(payment.balance)}</td>
            `;
            scheduleTable.appendChild(row);
        });
        
        this.amortizationSchedule = results.schedule;
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    }

    showError(message) {
        if (window.app) {
            window.app.showNotification(message, 'error');
        }
    }

    // Export functions
    exportToPDF() {
        if (!this.currentResults) {
            this.showError('No calculation results to export');
            return;
        }

        // Create PDF content
        const content = this.generatePDFContent();
        
        // Using browser's print function for PDF generation
        const printWindow = window.open('', '', 'height=600,width=800');
        printWindow.document.write(`
            <html>
                <head>
                    <title>EMI Calculator Results</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        .header { text-align: center; margin-bottom: 30px; }
                        .result-section { margin-bottom: 20px; }
                        .result-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
                        .result-item { padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #f2f2f2; }
                        @media print { .no-print { display: none; } }
                    </style>
                </head>
                <body>
                    ${content}
                    <div class="no-print" style="text-align: center; margin-top: 20px;">
                        <button onclick="window.print()">Print / Save as PDF</button>
                        <button onclick="window.close()">Close</button>
                    </div>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
    }

    exportToExcel() {
        if (!this.currentResults) {
            this.showError('No calculation results to export');
            return;
        }

        // Create CSV content
        const csvContent = this.generateCSVContent();
        
        // Download CSV file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'emi_calculation_results.csv';
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    printResults() {
        if (!this.currentResults) {
            this.showError('No calculation results to print');
            return;
        }

        const printContent = this.generatePrintContent();
        
        const printWindow = window.open('', '', 'height=600,width=800');
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    }

    generatePDFContent() {
        const results = this.currentResults;
        return `
            <div class="header">
                <h1>EMI Calculator Results</h1>
                <p>Generated on ${new Date().toLocaleDateString()}</p>
            </div>
            
            <div class="result-section">
                <h2>Loan Details</h2>
                <div class="result-grid">
                    <div class="result-item">
                        <strong>Principal Amount:</strong> ${this.formatCurrency(results.principal_amount)}
                    </div>
                    <div class="result-item">
                        <strong>Interest Rate:</strong> ${results.interest_rate}% per annum
                    </div>
                    <div class="result-item">
                        <strong>Tenure:</strong> ${results.tenure_months} months
                    </div>
                    <div class="result-item">
                        <strong>Monthly EMI:</strong> ${this.formatCurrency(results.emi)}
                    </div>
                </div>
            </div>
            
            <div class="result-section">
                <h2>Payment Summary</h2>
                <div class="result-grid">
                    <div class="result-item">
                        <strong>Total Payment:</strong> ${this.formatCurrency(results.total_payment)}
                    </div>
                    <div class="result-item">
                        <strong>Total Interest:</strong> ${this.formatCurrency(results.total_interest)}
                    </div>
                </div>
            </div>
            
            ${this.generateScheduleTable()}
        `;
    }

    generateCSVContent() {
        const results = this.currentResults;
        let csv = 'EMI Calculator Results\n\n';
        csv += 'Principal Amount,' + results.principal_amount + '\n';
        csv += 'Interest Rate,' + results.interest_rate + '%\n';
        csv += 'Tenure,' + results.tenure_months + ' months\n';
        csv += 'Monthly EMI,' + results.emi + '\n';
        csv += 'Total Payment,' + results.total_payment + '\n';
        csv += 'Total Interest,' + results.total_interest + '\n\n';
        
        csv += 'Amortization Schedule\n';
        csv += 'Month,EMI,Principal,Interest,Balance\n';
        
        this.amortizationSchedule.forEach(payment => {
            csv += `${payment.month},${payment.emi},${payment.principal},${payment.interest},${payment.balance}\n`;
        });
        
        return csv;
    }

    generatePrintContent() {
        return `
            <html>
                <head>
                    <title>EMI Calculator Results</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        .header { text-align: center; margin-bottom: 30px; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #f2f2f2; }
                    </style>
                </head>
                <body>
                    ${this.generatePDFContent()}
                </body>
            </html>
        `;
    }

    generateScheduleTable() {
        let table = '<table><thead><tr><th>Month</th><th>EMI</th><th>Principal</th><th>Interest</th><th>Balance</th></tr></thead><tbody>';
        
        this.amortizationSchedule.forEach(payment => {
            table += `<tr>
                <td>${payment.month}</td>
                <td>${this.formatCurrency(payment.emi)}</td>
                <td>${this.formatCurrency(payment.principal)}</td>
                <td>${this.formatCurrency(payment.interest)}</td>
                <td>${this.formatCurrency(payment.balance)}</td>
            </tr>`;
        });
        
        table += '</tbody></table>';
        return table;
    }

    // Collaboration methods
    broadcastCalculationUpdate(results) {
        if (window.wsClient && window.wsClient.isConnected()) {
            window.wsClient.sendUpdate({
                type: 'calculation-update',
                results: {
                    emi: results.emi,
                    principal: results.principal_amount,
                    interest: results.total_interest,
                    totalPayment: results.total_payment
                }
            });
        }
    }

    handleCollaborationUpdate(data) {
        switch (data.type) {
            case 'calculation-update':
                this.handleRemoteCalculationUpdate(data.results);
                break;
        }
    }

    handleRemoteCalculationUpdate(results) {
        if (window.app) {
            window.app.showNotification(`${data.username} updated calculation: EMI ${this.formatCurrency(results.emi)}`, 'info');
        }
    }

    // Public API
    reset() {
        this.currentResults = null;
        this.amortizationSchedule = [];
        
        // Clear form
        const form = document.getElementById('emi-calculator-form');
        if (form) {
            form.reset();
        }
        
        // Hide results
        const resultCard = document.getElementById('results-card');
        if (resultCard) {
            resultCard.style.display = 'none';
        }
        
        // Reset chart
        if (this.chart) {
            this.chart.data.datasets[0].data = [0, 0];
            this.chart.update();
        }
    }

    getResults() {
        return this.currentResults;
    }

    hasResults() {
        return this.currentResults !== null;
    }
}

// Global functions for export buttons
function exportToPDF() {
    if (window.emiCalculator) {
        window.emiCalculator.exportToPDF();
    }
}

function exportToExcel() {
    if (window.emiCalculator) {
        window.emiCalculator.exportToExcel();
    }
}

function printResults() {
    if (window.emiCalculator) {
        window.emiCalculator.printResults();
    }
}

function toggleFullSchedule() {
    // This would expand the schedule table to show all months
    if (window.app) {
        window.app.showNotification('Full schedule view not implemented yet', 'info');
    }
}

// Initialize EMI calculator
const emiCalculator = new EMICalculator();

// Export for global access
window.EMICalculator = EMICalculator;
window.emiCalculator = emiCalculator;
