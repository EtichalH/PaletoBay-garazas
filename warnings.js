document.addEventListener('DOMContentLoaded', function() {
    let warnings = JSON.parse(localStorage.getItem('warnings')) || {};

    initWarningsSystem();
    

    document.getElementById('addWarningBtn').addEventListener('click', addWarning);
    document.getElementById('refreshWarningsBtn').addEventListener('click', refreshWarnings);
    document.getElementById('manual-tab').addEventListener('shown.bs.tab', refreshEmployeeDropdown);
    
    function initWarningsSystem() {
        refreshEmployeeDropdown();

        if (document.getElementById('warningEmployeeSelect').options.length <= 1) {
            setTimeout(refreshEmployeeDropdown, 1000);
        }
        
        refreshWarningsTable();
    }
    

function refreshEmployeeDropdown() {
    const select = document.getElementById('warningEmployeeSelect');
    select.innerHTML = '<option value="" selected disabled>Pasirinkite darbuotoją</option>';
    
    const employeeRows = document.querySelectorAll('#resultsTable tr:not(.total-row)');
    const employees = new Set();
    
    employeeRows.forEach(row => {
        if (row.cells.length === 1) return;
        
        const nameCell = row.cells[1];
        if (nameCell) {
            employees.add(nameCell.textContent.trim());
        }
    });

    employees.forEach(employee => {
        const option = document.createElement('option');
        option.value = employee;
        option.textContent = employee;
        select.appendChild(option);
    });
}
    
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
        
        if (!warnings[employee]) {
            warnings[employee] = {
                count: 0,
                history: []
            };
        }

        if (warnings[employee].count >= 3) {
            alert('Šis darbuotojas jau turi maksimalų įspėjimų skaičių (3)!');
            return;
        }
        
        warnings[employee].count++;
        warnings[employee].history.push({
            date: new Date().toLocaleString('lt-LT'),
            reason: reason
        });

        localStorage.setItem('warnings', JSON.stringify(warnings));
        refreshWarningsTable();
        
        reasonInput.value = '';

        alert(`Įspėjimas sėkmingai pridėtas ${employee}.`);
    }

    function removeWarning(employee, index) {
        if (!warnings[employee] || !warnings[employee].history[index]) return;

        warnings[employee].history.splice(index, 1);
        warnings[employee].count--;
        if (warnings[employee].count <= 0) {
            delete warnings[employee];
        }

        localStorage.setItem('warnings', JSON.stringify(warnings));

        refreshWarningsTable();
    }

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

            let warningClass = '';
            if (data.count === 1) warningClass = 'table-info';
            else if (data.count === 2) warningClass = 'table-warning';
            else if (data.count >= 3) warningClass = 'table-danger';
            
            row.className = warningClass;
            
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

        document.querySelectorAll('.remove-warning-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const employee = this.getAttribute('data-employee');
                const index = parseInt(this.getAttribute('data-index'));
                removeWarning(employee, index);
            });
        });
    }

    function refreshWarnings() {
        refreshEmployeeDropdown();
        refreshWarningsTable();
    }

    document.getElementById('processData').addEventListener('click', function() {
        setTimeout(refreshEmployeeDropdown, 1000); 
    });
});
