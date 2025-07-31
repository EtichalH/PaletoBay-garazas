// Statistics Management System - Sunday-Only Saving
document.addEventListener('DOMContentLoaded', function() {
    // Load statistics from localStorage (simulating statistics.json)
    let statistics = JSON.parse(localStorage.getItem('statistics')) || {
        weeks: {},
        workers: {},
        warnings: {},
        lastUpdated: null
    };
    
    // Initialize the system
    initStatisticsSystem();
    
    // Event listeners
    document.getElementById('exportStatsBtn').addEventListener('click', exportStatistics);
    document.getElementById('resetStatsBtn').addEventListener('click', resetStatistics);
    
    // Initialize the statistics system
    function initStatisticsSystem() {
        refreshStatisticsTables();
        
        // Listen for salary calculations to update stats
        document.getElementById('processData').addEventListener('click', function() {
            setTimeout(() => checkAndUpdateStatistics(), 1000);
        });
    }
    
    // Check if we should update statistics (only on Sundays)
    function checkAndUpdateStatistics() {
        const today = new Date();
        const isSunday = today.getDay() === 0; // 0 = Sunday
        const weekNumber = getWeekNumber(today);
        const weekKey = `${today.getFullYear()}-W${weekNumber}`;
        
        // Check if we already updated this week
        const alreadyUpdatedThisWeek = statistics.lastUpdated === weekKey;
        
        if (isSunday && !alreadyUpdatedThisWeek) {
            updateStatistics();
            showToast('Savaitės statistika sėkmingai išsaugota!');
        } else if (!isSunday) {
            previewCurrentWeekStatistics();
        }
    }
    
    // Update statistics with current data (only called on Sundays)
    function updateStatistics() {
        const today = new Date();
        const weekNumber = getWeekNumber(today);
        const weekKey = `${today.getFullYear()}-W${weekNumber}`;
        
        // Get current data from results table
        const employeeRows = document.querySelectorAll('#resultsTable tr:not(.total-row)');
        let totalHours = 0;
        let totalPay = 0;
        const currentEmployees = [];
        
        employeeRows.forEach(row => {
            if (row.cells.length === 1) return;
            
            const name = row.cells[1].textContent.trim();
            const hoursText = row.cells[3].textContent.trim();
            const payText = row.cells[5].textContent.trim();
            
            // Parse hours (format: Xh Ym)
            const hoursMatch = hoursText.match(/(\d+)h\s*(\d*)m/);
            const hours = hoursMatch ? parseInt(hoursMatch[1]) + (parseInt(hoursMatch[2] || 0) / 60) : 0;
            
            // Parse pay (format: €X or $X)
            const pay = parseFloat(payText.replace(/[^\d.]/g, '')) || 0;
            
            totalHours += hours;
            totalPay += pay;
            
            currentEmployees.push({
                name: name,
                hours: hours,
                pay: pay
            });
        });
        
        // Create or update weekly stats
        statistics.weeks[weekKey] = {
            date: today.toISOString(),
            employeeCount: currentEmployees.length,
            totalHours: totalHours,
            totalPay: totalPay,
            employees: {}
        };
        
        // Update individual employee stats for this week
        currentEmployees.forEach(emp => {
            // Weekly stats
            statistics.weeks[weekKey].employees[emp.name] = {
                hours: emp.hours,
                pay: emp.pay
            };
            
            // Worker lifetime stats
            if (!statistics.workers[emp.name]) {
                statistics.workers[emp.name] = {
                    totalHours: 0,
                    totalPay: 0,
                    weeksWorked: 0,
                    firstWeek: weekKey,
                    lastWeek: weekKey
                };
            }
            
            statistics.workers[emp.name].totalHours += emp.hours;
            statistics.workers[emp.name].totalPay += emp.pay;
            statistics.workers[emp.name].weeksWorked++;
            statistics.workers[emp.name].lastWeek = weekKey;
        });
        
        // Update warnings stats from warnings data
        const warnings = JSON.parse(localStorage.getItem('warnings')) || {};
        statistics.warnings = {};
        
        for (const [name, data] of Object.entries(warnings)) {
            statistics.warnings[name] = {
                totalWarnings: data.count,
                firstWarning: data.history[0]?.date || '',
                lastWarning: data.history[data.history.length - 1]?.date || ''
            };
        }
        
        // Mark when we last updated
        statistics.lastUpdated = weekKey;
        
        // Save statistics
        saveStatistics();
        refreshStatisticsTables();
    }
    
    // Show preview of current week's data (without saving)
    function previewCurrentWeekStatistics() {
        const today = new Date();
        const weekNumber = getWeekNumber(today);
        const weekKey = `${today.getFullYear()}-W${weekNumber}`;
        
        // Don't show preview if we already have saved data for this week
        if (statistics.weeks[weekKey]) return;
        
        // Calculate current totals for preview
        const employeeRows = document.querySelectorAll('#resultsTable tr:not(.total-row)');
        let totalHours = 0;
        let totalPay = 0;
        const employeeCount = employeeRows.length;
        
        employeeRows.forEach(row => {
            if (row.cells.length === 1) return;
            
            const hoursText = row.cells[3].textContent.trim();
            const payText = row.cells[5].textContent.trim();
            
            const hoursMatch = hoursText.match(/(\d+)h\s*(\d*)m/);
            const hours = hoursMatch ? parseInt(hoursMatch[1]) + (parseInt(hoursMatch[2] || 0) / 60) : 0;
            const pay = parseFloat(payText.replace(/[^\d.]/g, '')) || 0;
            
            totalHours += hours;
            totalPay += pay;
        });
        
        // Update the display (but don't save to statistics)
        const previewHTML = `
            <div class="alert alert-info mt-3">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <strong>Šios savaitės peržiūra (neišsaugota):</strong><br>
                        Darbuotojų: ${employeeCount} | Valandos: ${formatHours(totalHours)} | Išmokėta: €${totalPay.toFixed(2)}
                    </div>
                    <div class="text-end">
                        <small class="text-muted">Bus išsaugota sekmadienį</small>
                    </div>
                </div>
            </div>
        `;
        
        // Add or update preview in the weekly stats tab
        let previewElement = document.getElementById('weeklyPreview');
        if (!previewElement) {
            previewElement = document.createElement('div');
            previewElement.id = 'weeklyPreview';
            document.getElementById('weekly-tab-pane').prepend(previewElement);
        }
        previewElement.innerHTML = previewHTML;
    }
    
    // Refresh all statistics tables
    function refreshStatisticsTables() {
        refreshWeeklyStatsTable();
        refreshWorkersStatsTable();
        refreshWarningsStatsTable();
    }
    
    // Refresh weekly stats table
    function refreshWeeklyStatsTable() {
        const tableBody = document.getElementById('weeklyStatsTable');
        
        if (Object.keys(statistics.weeks).length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-4">Nėra duomenų</td></tr>';
            return;
        }
        
        tableBody.innerHTML = '';
        const weeks = Object.entries(statistics.weeks).sort((a, b) => b[0].localeCompare(a[0]));
        
        weeks.forEach(([weekKey, data]) => {
            const row = document.createElement('tr');
            
            // Highlight current week if it's saved
            const today = new Date();
            const currentWeekKey = `${today.getFullYear()}-W${getWeekNumber(today)}`;
            const isCurrentWeek = weekKey === currentWeekKey;
            
            row.className = isCurrentWeek ? 'table-primary' : '';
            
            row.innerHTML = `
                <td>${formatWeekDisplay(weekKey)} ${isCurrentWeek ? '<span class="badge bg-success ms-2">Dabartinė</span>' : ''}</td>
                <td>${data.employeeCount}</td>
                <td>${formatHours(data.totalHours)}</td>
                <td>€${data.totalPay.toFixed(2)}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary view-week-btn" data-week="${weekKey}">
                        <i class="bi bi-eye"></i> Peržiūrėti
                    </button>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
        
        // Add event listeners to view buttons
        document.querySelectorAll('.view-week-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                viewWeekDetails(this.getAttribute('data-week'));
            });
        });
    }
    
    // Refresh workers stats table
    function refreshWorkersStatsTable() {
        const tableBody = document.getElementById('workersStatsTable');
        
        if (Object.keys(statistics.workers).length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4">Nėra duomenų</td></tr>';
            return;
        }
        
        tableBody.innerHTML = '';
        const workers = Object.entries(statistics.workers).sort((a, b) => b[1].totalHours - a[1].totalHours);
        
        workers.forEach(([name, data]) => {
            const row = document.createElement('tr');
            const avgHoursPerWeek = data.weeksWorked > 0 ? data.totalHours / data.weeksWorked : 0;
            const avgPayPerWeek = data.weeksWorked > 0 ? data.totalPay / data.weeksWorked : 0;
            
            row.innerHTML = `
                <td>${name}</td>
                <td>${formatHours(data.totalHours)}</td>
                <td>€${data.totalPay.toFixed(2)}</td>
                <td>${data.weeksWorked}</td>
                <td>${avgHoursPerWeek.toFixed(2)}h</td>
                <td>€${avgPayPerWeek.toFixed(2)}</td>
            `;
            
            tableBody.appendChild(row);
        });
    }
    
    // Refresh warnings stats table
    function refreshWarningsStatsTable() {
        const tableBody = document.getElementById('warningsStatsTable');
        
        if (Object.keys(statistics.warnings).length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-4">Nėra duomenų</td></tr>';
            return;
        }
        
        tableBody.innerHTML = '';
        const warnings = Object.entries(statistics.warnings).sort((a, b) => b[1].totalWarnings - a[1].totalWarnings);
        
        warnings.forEach(([name, data]) => {
            const row = document.createElement('tr');
            
            // Add warning level class
            let warningClass = '';
            if (data.totalWarnings === 1) warningClass = 'table-info';
            else if (data.totalWarnings === 2) warningClass = 'table-warning';
            else if (data.totalWarnings >= 3) warningClass = 'table-danger';
            
            row.className = warningClass;
            
            row.innerHTML = `
                <td>${name}</td>
                <td>
                    <span class="badge bg-${data.totalWarnings >= 3 ? 'danger' : 'warning'}">
                        ${data.totalWarnings}/3
                    </span>
                </td>
                <td>${formatDate(data.firstWarning)}</td>
                <td>${formatDate(data.lastWarning)}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary view-warnings-btn" data-worker="${name}">
                        <i class="bi bi-eye"></i> Peržiūrėti
                    </button>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
        
        // Add event listeners to view buttons
        document.querySelectorAll('.view-warnings-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                viewWorkerWarnings(this.getAttribute('data-worker'));
            });
        });
    }
    
    // View week details modal
    function viewWeekDetails(weekKey) {
        const weekData = statistics.weeks[weekKey];
        if (!weekData) return;
        
        // Create modal HTML
        const modalHTML = `
            <div class="modal fade" id="weekDetailsModal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Savaitės detalės: ${formatWeekDisplay(weekKey)}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row mb-3">
                                <div class="col-md-4">
                                    <div class="card bg-light">
                                        <div class="card-body text-center">
                                            <h6 class="card-subtitle mb-1">Darbuotojų</h6>
                                            <h3 class="card-title">${weekData.employeeCount}</h3>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="card bg-light">
                                        <div class="card-body text-center">
                                            <h6 class="card-subtitle mb-1">Viso valandų</h6>
                                            <h3 class="card-title">${formatHours(weekData.totalHours)}</h3>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="card bg-light">
                                        <div class="card-body text-center">
                                            <h6 class="card-subtitle mb-1">Viso išmokėta</h6>
                                            <h3 class="card-title">€${weekData.totalPay.toFixed(2)}</h3>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="table-responsive">
                                <table class="table table-striped">
                                    <thead>
                                        <tr>
                                            <th>Darbuotojas</th>
                                            <th>Valandos</th>
                                            <th>Alga</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${Object.entries(weekData.employees).map(([name, data]) => `
                                            <tr>
                                                <td>${name}</td>
                                                <td>${formatHours(data.hours)}</td>
                                                <td>€${data.pay.toFixed(2)}</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Uždaryti</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal to DOM and show it
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        const modal = new bootstrap.Modal(document.getElementById('weekDetailsModal'));
        modal.show();
        
        // Remove modal after it's hidden
        document.getElementById('weekDetailsModal').addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
    }
    
    // View worker warnings modal
    function viewWorkerWarnings(workerName) {
        const warnings = JSON.parse(localStorage.getItem('warnings')) || {};
        const workerWarnings = warnings[workerName]?.history || [];
        
        if (workerWarnings.length === 0) return;
        
        // Create modal HTML
        const modalHTML = `
            <div class="modal fade" id="workerWarningsModal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">${workerName} įspėjimų istorija</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="table-responsive">
                                <table class="table table-striped">
                                    <thead>
                                        <tr>
                                            <th>Data</th>
                                            <th>Priežastis</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${workerWarnings.map(warning => `
                                            <tr>
                                                <td>${formatDate(warning.date)}</td>
                                                <td>${warning.reason}</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Uždaryti</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal to DOM and show it
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        const modal = new bootstrap.Modal(document.getElementById('workerWarningsModal'));
        modal.show();
        
        // Remove modal after it's hidden
        document.getElementById('workerWarningsModal').addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
    }
    
    // Export statistics to JSON file
    function exportStatistics() {
        const dataStr = JSON.stringify(statistics, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `mechaniku-statistika-${new Date().toISOString().slice(0,10)}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }
    
    // Reset all statistics
    function resetStatistics() {
        if (confirm('Ar tikrai norite išvalyti visą statistiką? Šio veiksmo atšaukti negalėsite.')) {
            statistics = {
                weeks: {},
                workers: {},
                warnings: {},
                lastUpdated: null
            };
            saveStatistics();
            refreshStatisticsTables();
            showToast('Statistika sėkmingai išvalyta!', 'success');
        }
    }
    
    // Save statistics to localStorage
    function saveStatistics() {
        localStorage.setItem('statistics', JSON.stringify(statistics));
    }
    
    // Helper function to format hours (e.g. 8.5 => "8h 30m")
    function formatHours(hours) {
        const h = Math.floor(hours);
        const m = Math.round((hours - h) * 60);
        return `${h}h ${m}m`;
    }
    
    // Helper function to get week number
    function getWeekNumber(date) {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
        const week1 = new Date(d.getFullYear(), 0, 4);
        return 1 + Math.round(((d - week1) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
    }
    
    // Helper function to format week display
    function formatWeekDisplay(weekKey) {
        const [year, week] = weekKey.split('-W');
        return `${year} m. ${week} sav.`;
    }
    
    // Helper function to format date
    function formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return isNaN(date) ? dateString : date.toLocaleString('lt-LT');
    }
    
    // Helper function to show toast notifications
    function showToast(message, type = 'info') {
        const toastHTML = `
            <div class="position-fixed bottom-0 end-0 p-3" style="z-index: 11">
                <div class="toast show" role="alert" aria-live="assertive" aria-atomic="true">
                    <div class="toast-header bg-${type} text-white">
                        <strong class="me-auto">Statistika</strong>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
                    </div>
                    <div class="toast-body">
                        ${message}
                    </div>
                </div>
            </div>
        `;
        
        const toastElement = document.createElement('div');
        toastElement.innerHTML = toastHTML;
        document.body.appendChild(toastElement);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            toastElement.remove();
        }, 5000);
    }
});