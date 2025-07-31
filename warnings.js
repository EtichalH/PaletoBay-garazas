// Warnings Management System
document.addEventListener('DOMContentLoaded', function() {
    let warnings = JSON.parse(localStorage.getItem('warnings')) || {};
    
    // Initialize the system
    initWarningsSystem();
    
    // Event listeners
    document.getElementById('addWarningBtn').addEventListener('click', addWarning);
    document.getElementById('refreshWarningsBtn').addEventListener('click', refreshWarnings);
    
    // Also refresh when the manual tab is shown
    document.getElementById('manual-tab').addEventListener('shown.bs.tab', refreshEmployeeDropdown);
    
    // Initialize the warning system
    function initWarningsSystem() {
        // Try to populate immediately
        refreshEmployeeDropdown();
        
        // If still empty, set a timeout to try again after a delay
        if (document.getElementById('warningEmployeeSelect').options.length <= 1) {
            setTimeout(refreshEmployeeDropdown, 1000);
        }
        
        refreshWarningsTable();
    }
    
    // Refresh the employee dropdown
function refreshEmployeeDropdown() {
    const select = document.getElementById('warningEmployeeSelect');
    select.innerHTML = '<option value="" selected disabled>Pasirinkite darbuotoją</option>';
    
    // Get employee names from the results table
    const employeeRows = document.querySelectorAll('#resultsTable tr:not(.total-row)');
    const employees = new Set();
    
    employeeRows.forEach(row => {
        // Skip if it's the "no data" row
        if (row.cells.length === 1) return;
        
        // Get the name from the second cell (index 1)
        const nameCell = row.cells[1];
        if (nameCell) {
            employees.add(nameCell.textContent.trim());
        }
    });
    
    // Add options to dropdown
    employees.forEach(employee => {
        const option = document.createElement('option');
        option.value = employee;
        option.textContent = employee;
        select.appendChild(option);
    });
}
    
    // Add a warning to an employee
    function addWarning() {
        const employeeSelect = document.getElementById('warningEmployeeSelect');
        const reasonInput = document.getElementById('warningReason');
        
        const employee = employeeSelect.value;
        const reason = reasonInput.value.trim();
        
        if (!employee) {
            alert('Pasirinkite darbuotoją!');
            return;
        }
        
        if (!reason) {
            alert('Įveskite įspėjimo priežastį!');
            return;
        }
        
        // Initialize employee warnings if not exists
        if (!warnings[employee]) {
            warnings[employee] = {
                count: 0,
                history: []
            };
        }
        
        // Check if max warnings reached
        if (warnings[employee].count >= 3) {
            alert('Šis darbuotojas jau turi maksimalų įspėjimų skaičių (3)!');
            return;
        }
        
        // Add warning
        warnings[employee].count++;
        warnings[employee].history.push({
            date: new Date().toLocaleString('lt-LT'),
            reason: reason
        });
        
        // Save to localStorage
        localStorage.setItem('warnings', JSON.stringify(warnings));
        
        // Refresh UI
        refreshWarningsTable();
        reasonInput.value = '';
        
        // Show success message
        alert(`Įspėjimas sėkmingai pridėtas ${employee}.`);
    }
    
    // Remove a warning from an employee
    function removeWarning(employee, index) {
        if (!warnings[employee] || !warnings[employee].history[index]) return;
        
        // Remove the warning
        warnings[employee].history.splice(index, 1);
        warnings[employee].count--;
        
        // If no warnings left, remove the employee entry
        if (warnings[employee].count <= 0) {
            delete warnings[employee];
        }
        
        // Save to localStorage
        localStorage.setItem('warnings', JSON.stringify(warnings));
        
        // Refresh UI
        refreshWarningsTable();
    }
    
    // Refresh the warnings table
    function refreshWarningsTable() {
        const tableBody = document.getElementById('warningsTable');
        
        if (Object.keys(warnings).length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4">Įrašų nėra</td></tr>';
            return;
        }
        
        tableBody.innerHTML = '';
        let counter = 1;
        
        for (const [employee, data] of Object.entries(warnings)) {
            const row = document.createElement('tr');
            
            // Add warning level class based on count
            let warningClass = '';
            if (data.count === 1) warningClass = 'table-info';
            else if (data.count === 2) warningClass = 'table-warning';
            else if (data.count >= 3) warningClass = 'table-danger';
            
            row.className = warningClass;
            
            // Get the latest warning
            const latestWarning = data.history[data.history.length - 1];
            
            row.innerHTML = `
                <td>${counter++}</td>
                <td>${employee}</td>
                <td>
                    <span class="badge bg-${data.count >= 3 ? 'danger' : 'warning'}">${data.count}/3</span>
                </td>
                <td>${latestWarning.date}</td>
                <td>${latestWarning.reason}</td>
                <td>
                    <button class="btn btn-sm btn-outline-danger remove-warning-btn" 
                            data-employee="${employee}" 
                            data-index="${data.history.length - 1}">
                        <i class="bi bi-trash"></i> Pašalinti
                    </button>
                </td>
            `;
            
            tableBody.appendChild(row);
        }
        
        // Add event listeners to remove buttons
        document.querySelectorAll('.remove-warning-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const employee = this.getAttribute('data-employee');
                const index = parseInt(this.getAttribute('data-index'));
                removeWarning(employee, index);
            });
        });
    }
    
    // Refresh all warnings data
    function refreshWarnings() {
        refreshEmployeeDropdown();
        refreshWarningsTable();
    }
    
    // Listen for employee data processing to refresh dropdown
    document.getElementById('processData').addEventListener('click', function() {
        setTimeout(refreshEmployeeDropdown, 1000); // Increased delay to ensure table is populated
    });
});