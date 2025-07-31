    let hideLessThan10 = false;
    let originalResults = [];

    function showAlert(message, type) {
        const alert = document.createElement('div');
        alert.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 end-0 m-3`;
        alert.style.zIndex = '1000';
        alert.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        document.body.appendChild(alert);
        
        setTimeout(() => {
            alert.remove();
        }, 3000);
    }

    document.addEventListener('DOMContentLoaded', function() {
        const darkModeToggle = document.getElementById('toggleDarkMode');
        const body = document.body;
        
        if (localStorage.getItem('darkMode') === 'enabled') {
            body.classList.add('dark-mode');
            darkModeToggle.innerHTML = '<i class="bi bi-sun-fill"></i>';
        }
        
        darkModeToggle.addEventListener('click', function() {
            body.classList.toggle('dark-mode');
            const isDarkMode = body.classList.contains('dark-mode');
            
            if (isDarkMode) {
                darkModeToggle.innerHTML = '<i class="bi bi-sun-fill"></i>';
                localStorage.setItem('darkMode', 'enabled');
            } else {
                darkModeToggle.innerHTML = '<i class="bi bi-moon-fill"></i>';
                localStorage.setItem('darkMode', 'disabled');
            }
        });
        
        document.getElementById('processData').addEventListener('click', processEmployeeData);
        document.getElementById('clearData').addEventListener('click', function() {
            document.getElementById('employeeData').value = '';
            document.getElementById('resultsTable').innerHTML = `
                <tr>
                    <td colspan="6" class="text-center text-muted py-4">Įveskite duomenis ir spauskite "Apskaičiuoti algas"</td>
                </tr>
            `;
            document.getElementById('totalHours').textContent = '0h 0m';
            document.getElementById('totalPay').textContent = '$0';
            document.getElementById('displayTotalHours').textContent = '0h 0m';
            document.getElementById('displayTotalPay').textContent = '$0';
            document.getElementById('totalEmployees').textContent = '0';
            

            document.querySelectorAll('.progress-bar').forEach(bar => {
                bar.style.width = '0%';
            });
            
            hideLessThan10 = false;
            originalResults = [];
            const hideButton = document.getElementById('hideLessThan10');
            hideButton.innerHTML = '<i class="bi bi-eye-slash"></i> Paslepti kurie nepradirbo';
            hideButton.classList.remove('btn-warning');
            hideButton.classList.add('btn-outline-light');
        });
        
        document.getElementById('exportCSV').addEventListener('click', exportToCSV);
        document.getElementById('exportPDF').addEventListener('click', exportToPDF);
        document.getElementById('saveRates').addEventListener('click', function() {
            const rates = {};
            document.querySelectorAll('.editable-rate').forEach(input => {
                rates[input.id] = input.value;
            });
            localStorage.setItem('salaryRates', JSON.stringify(rates));
            
            const toast = document.createElement('div');
            toast.className = 'position-fixed bottom-0 end-0 p-3';
            toast.innerHTML = `
                <div class="toast show" role="alert" aria-live="assertive" aria-atomic="true">
                    <div class="toast-header bg-success text-white">
                        <strong class="me-auto">Sėkmingai</strong>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
                    </div>
                    <div class="toast-body">
                        Įkainiai sėkmingai išsaugoti!
                    </div>
                </div>
            `;
            document.body.appendChild(toast);
            
            setTimeout(() => {
                toast.remove();
            }, 3000);
        });
        
        document.getElementById('resetRates').addEventListener('click', function() {
            if (confirm('Ar tikrai norite atstatyti įkainius į numatytąsias reikšmes?')) {
                document.getElementById('rate-Praktikantas').value = '8000';
                document.getElementById('rate-Kėbulistas').value = '9000';
                document.getElementById('rate-Motoristas').value = '10000';
                document.getElementById('rate-Inžinierius').value = '13000';
                document.getElementById('rate-Elektrikas').value = '11000';
                document.getElementById('rate-Direktorius').value = '17000';
                document.getElementById('rate-Pavaduotojas').value = '15000';
                document.getElementById('rate-default').value = '2000';
                
                if (document.getElementById('employeeData').value.trim()) {
                    processEmployeeData();
                }
            }
        });
        
        const savedRates = localStorage.getItem('salaryRates');
        if (savedRates) {
            const rates = JSON.parse(savedRates);
            for (const id in rates) {
                const input = document.getElementById(id);
                if (input) {
                    input.value = rates[id];
                }
            }
        }
        
        document.getElementById('addManualRow').addEventListener('click', function() {
            const container = document.getElementById('manualInputContainer');
            const newRow = document.createElement('div');
            newRow.className = 'manual-input-row mb-2';
            newRow.innerHTML = `
                <div class="row g-2">
                    <div class="col-md-5">
                        <input type="text" class="form-control" placeholder="Vardas Pavardė">
                    </div>
                    <div class="col-md-3">
                        <select class="form-select">
                            <option value="">Rangas</option>
                            <option value="Praktikantas">Praktikantas</option>
                            <option value="Kėbulistas">Kėbulistas</option>
                            <option value="Motoristas">Motoristas</option>
                            <option value="Inžinierius">Inžinierius</option>
                            <option value="Elektrikas">Elektrikas</option>
                            <option value="Direktorius">Direktorius</option>
                            <option value="Pavaduotojas">Pavaduotojas</option>
                        </select>
                    </div>
                    <div class="col-md-3">
                        <input type="text" class="form-control" placeholder="Valandos (Xh Ym)">
                    </div>
                    <div class="col-md-1">
                        <button class="btn btn-outline-danger btn-sm w-100 remove-row-btn"><i class="bi bi-trash"></i></button>
                    </div>
                </div>
            `;
            container.appendChild(newRow);
            
            newRow.querySelector('.remove-row-btn').addEventListener('click', function() {
                newRow.remove();
            });
        });
        
        document.querySelectorAll('.editable-rate').forEach(input => {
            input.addEventListener('change', function() {
                if (document.getElementById('employeeData').value.trim() || 
                    document.querySelectorAll('.manual-input-row').length > 0) {
                    processEmployeeData();
                }
            });
        });
        
        document.getElementById('hideLessThan10').addEventListener('click', toggleHideLessThan10);
        document.getElementById('bonus50').addEventListener('click', () => addBonus(50000));
        document.getElementById('bonus20').addEventListener('click', () => addBonus(20000));
    });


    function processEmployeeData() {
        const activeTab = document.querySelector('.nav-link.active').id;
        
        let inputData = '';
        let results = [];
        
        if (activeTab === 'paste-tab') {
            inputData = document.getElementById('employeeData').value.trim();
            if (!inputData) {
                showAlert('Prašome įvesti darbuotojų informaciją!', 'danger');
                return;
            }
            
            const lines = inputData.split('\n');
            results = processLines(lines);
        } else {
            const manualRows = document.querySelectorAll('.manual-input-row');
            if (manualRows.length === 0) {
                showAlert('Prašome pridėti bent vieną darbuotoją!', 'danger');
                return;
            }
            
            const lines = [];
            manualRows.forEach(row => {
                const inputs = row.querySelectorAll('input, select');
                const name = inputs[0].value.trim();
                const rank = inputs[1].value.trim();
                const hours = inputs[2].value.trim();
                
                if (name && rank && hours) {
                    lines.push(`${name}\t${rank}\t${hours}`);
                }
            });
            
            if (lines.length === 0) {
                showAlert('Prašome užpildyti visus laukus!', 'danger');
                return;
            }
            
            results = processLines(lines);
        }
        
        if (results.length === 0) {
            showAlert('Nepavyko apdoroti duomenų. Patikrinkite formatą!', 'danger');
            return;
        }

        let totalMinutes = 0;
        let totalPay = 0;
        
        results.forEach(employee => {
            totalMinutes += employee.minutes;
            totalPay += employee.pay;
        });
        displayResults(results, totalMinutes, totalPay);
        showAlert(`Sėkmingai apskaičiuota ${results.length} darbuotojų algos!`, 'success');
    }
    
    function processLines(lines) {
        const results = [];
        
        lines.forEach((line, index) => {
            if (!line.trim()) return;

            const parts = line.split(/\t|\s\s+/).filter(part => part.trim() !== '');
            
            if (parts.length >= 3) {
                const fullName = parts[0];
                const rank = parts[1];
                const timeWorked = parts[2];
                const timeMatch = timeWorked.match(/(\d+)h\s*(\d+)m/);

                if (timeMatch) {
                    const hours = parseInt(timeMatch[1]);
                    const minutes = parseInt(timeMatch[2]);
                    const totalHours = hours + (minutes / 60);
                    const totalMinutes = hours * 60 + minutes;
                    const rateInput = document.getElementById(`rate-${rank}`) || document.getElementById('rate-default');
                    const hourlyRate = parseFloat(rateInput.value);
                    const pay = Math.round(totalHours * hourlyRate);
                    
                    results.push({
                        fullName,
                        rank,
                        hours: timeWorked,
                        totalHours,
                        minutes: totalMinutes,
                        hourlyRate,
                        pay
                    });
                }
            }
        });
        
        return results;
    }
    
    function displayResults(results, totalMinutes, totalPay) {
        const resultsTable = document.getElementById('resultsTable');
        resultsTable.innerHTML = '';
        
        const totalHours = Math.floor(totalMinutes / 60);
        const remainingMinutes = totalMinutes % 60;
        

        document.getElementById('totalEmployees').textContent = results.length;
        document.getElementById('displayTotalHours').textContent = `${totalHours}h ${remainingMinutes}m`;
        document.getElementById('displayTotalPay').textContent = `$${totalPay.toLocaleString()}`;
        document.getElementById('totalHours').textContent = `${totalHours}h ${remainingMinutes}m`;
        document.getElementById('totalPay').textContent = `$${totalPay.toLocaleString()}`;
        document.getElementById('employeesProgress').style.width = `${Math.min(100, results.length)}%`;
        document.getElementById('hoursProgress').style.width = `${Math.min(100, totalHours)}%`;
        document.getElementById('payProgress').style.width = `${Math.min(100, totalPay / 50000)}%`;
        
        results.sort((a, b) => b.pay - a.pay);
        originalResults = [];
        
         results.forEach((employee, index) => {
        const row = document.createElement('tr');
        row.className = 'animate__animated animate__fadeIn';
        row.style.animationDelay = `${index * 0.05}s`;
        
        let badgeClass = 'bg-secondary';
        if (employee.rank === 'Direktorius') badgeClass = 'bg-danger';
        else if (employee.rank === 'Pavaduotojas') badgeClass = 'bg-warning text-dark';
        else if (employee.rank === 'Inžinierius') badgeClass = 'bg-primary';
        else if (employee.rank === 'Elektrikas') badgeClass = 'bg-info text-dark';
        else if (employee.rank === 'Motoristas') badgeClass = 'bg-success';
        else if (employee.rank === 'Kėbulistas') badgeClass = 'bg-purple';
        else if (employee.rank === 'Praktikantas') badgeClass = 'bg-light text-dark';
        
        let promotion = '';
        if (employee.rank === 'Praktikantas') {
            promotion = 'Kėbulistas';
        } else if (employee.rank === 'Kėbulistas') {
            promotion = 'Motoristas';
        } else if (employee.rank === 'Motoristas') {
            promotion = 'Elektrikas';
        } else if (employee.rank === 'Elektrikas') {
            promotion = 'Inžinierius';
        } else if (employee.rank === 'Inžinierius' || 
                   employee.rank === 'Direktorius' || 
                   employee.rank === 'Pavaduotojas') {
            promotion = 'Nėra';
        }
        
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${employee.fullName}</td>
            <td><span class="salary-badge ${badgeClass}">${employee.rank}</span></td>
            <td><b>${employee.hours}</b></td>
            <td>$${employee.hourlyRate.toLocaleString()}</td>
            <td><strong>$${employee.pay.toLocaleString()}</strong></td>
            <td>${promotion}</td>
        `;
        resultsTable.appendChild(row);
        originalResults.push(row.outerHTML);

        setTimeout(() => {
            row.classList.add('highlight-row');
        }, 10);
    });
        
        hideLessThan10 = false;
        const hideButton = document.getElementById('hideLessThan10');
        hideButton.innerHTML = '<i class="bi bi-eye-slash"></i> Paslepti kurie nepradirbo';
        hideButton.classList.remove('btn-warning');
        hideButton.classList.add('btn-outline-light');
    }
    
    function exportToCSV() {
        const rows = document.querySelectorAll('#resultsTable tr:not(.highlight-row)');
        if (rows.length === 0) {
            showAlert('Nėra duomenų eksportui!', 'warning');
            return;
        }
        
        let csvContent = "Nr.,Vardas Pavardė,Rangas,Valandos,Valandinis įkainis,Alga\n";
        
        rows.forEach(row => {
            const cols = row.querySelectorAll('td');
            const rowData = Array.from(cols).map(col => {
                const content = col.innerHTML;
                if (content.includes('salary-badge')) {
                    const badgeMatch = content.match(/">([^<]+)</);
                    return badgeMatch ? `"${badgeMatch[1]}"` : '""';
                }
                return `"${col.textContent.trim().replace('$', '')}"`;
            }).join(',');
            csvContent += rowData + '\n';
        });
        
        csvContent += `"","","Iš viso","${document.getElementById('totalHours').textContent}","","${document.getElementById('totalPay').textContent.replace('$', '')}"`;
        
        const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `paleto_algos_${new Date().toISOString().slice(0,10)}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showAlert('Duomenys sėkmingai eksportuoti į CSV!', 'success');
    }
    
    function exportToPDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        const rows = document.querySelectorAll('#resultsTable tr:not(.highlight-row)');
        if (rows.length === 0) {
            showAlert('Nėra duomenų eksportui!', 'warning');
            return;
        }
        
        const tableData = [];
        rows.forEach(row => {
            const cols = row.querySelectorAll('td');
            const rowData = Array.from(cols).map(col => {
                const content = col.innerHTML;
                if (content.includes('salary-badge')) {
                    const badgeMatch = content.match(/">([^<]+)</);
                    return badgeMatch ? badgeMatch[1] : '';
                }
                return col.textContent.trim().replace('$', '');
            });
            tableData.push(rowData);
        });
        
        doc.setFontSize(18);
        doc.text('Paleto algų ataskaita', 14, 15);
        doc.setFontSize(10);
        doc.text(`Sugeneruota: ${new Date().toLocaleDateString()}`, 14, 22);
        doc.autoTable({
            head: [['Nr.', 'Vardas Pavardė', 'Rangas', 'Valandos', 'Valandinis', 'Alga']],
            body: tableData,
            startY: 30,
            styles: {
                fontSize: 8,
                cellPadding: 2
            },
            headStyles: {
                fillColor: [52, 152, 219],
                textColor: 255
            }
        });
        
        doc.setFontSize(10);
        doc.text(`Iš viso valandų: ${document.getElementById('totalHours').textContent}`, 14, doc.lastAutoTable.finalY + 10);
        doc.text(`Bendra suma: ${document.getElementById('totalPay').textContent}`, 14, doc.lastAutoTable.finalY + 15);
        doc.save(`paleto_algos_${new Date().toISOString().slice(0,10)}.pdf`);

        showAlert('Duomenys sėkmingai eksportuoti į PDF!', 'success');
    }

    function toggleHideLessThan10() {
        hideLessThan10 = !hideLessThan10;
        const button = document.getElementById('hideLessThan10');
        
        if (hideLessThan10) {
            if (originalResults.length === 0) {
                const rows = document.querySelectorAll('#resultsTable tr');
                originalResults = Array.from(rows).map(row => row.outerHTML);
            }
            

            const filteredRows = originalResults.filter(rowHtml => {
                const row = document.createElement('tr');
                row.innerHTML = rowHtml;
                const timeCell = row.querySelector('td:nth-child(4)');
                if (!timeCell) return true;
                
                const timeText = timeCell.textContent;
                const match = timeText.match(/(\d+)h\s*(\d+)m/);
                if (!match) return true;
                
                const hours = parseInt(match[1]);
                const minutes = parseInt(match[2]);
                const totalHours = hours + (minutes / 60);
                
                return totalHours >= 10;
            });
            
            document.getElementById('resultsTable').innerHTML = filteredRows.join('');
            button.innerHTML = '<i class="bi bi-eye"></i> Rodyti visus benkartus';
            button.classList.remove('btn-outline-light');
            button.classList.add('btn-warning');
        } else {

            document.getElementById('resultsTable').innerHTML = originalResults.join('');
            button.innerHTML = '<i class="bi bi-eye-slash"></i> Paslepti kurie nepradirbo';
            button.classList.remove('btn-warning');
            button.classList.add('btn-outline-light');
        }
    }


    function addBonus(amount) {
        const rows = document.querySelectorAll('#resultsTable tr');
        
        if (rows.length === 0 || (rows.length === 1 && rows[0].querySelectorAll('td').length < 6)) {
            showAlert('Nėra duomenų bonusui pridėti!', 'warning');
            return;
        }
        
        let totalPay = 0;
        
        rows.forEach(row => {
            const cols = row.querySelectorAll('td');
            if (cols.length >= 6) {

                if (cols[0].colSpan === 6) return;
                
                const payCell = cols[5];
                let currentPay = parseInt(payCell.textContent.replace(/[$,]/g, ''));
                currentPay += amount;
                
                payCell.innerHTML = `<strong>$${currentPay.toLocaleString()}</strong>`;
                totalPay += currentPay;
            }
        });
        
        const totalPayElement = document.getElementById('totalPay');
        const displayTotalPayElement = document.getElementById('displayTotalPay');
        totalPayElement.textContent = `$${totalPay.toLocaleString()}`;
        displayTotalPayElement.textContent = `$${totalPay.toLocaleString()}`;
        
        if (originalResults.length > 0) {
            originalResults = Array.from(document.querySelectorAll('#resultsTable tr')).map(row => row.outerHTML);
        }
        
        showAlert(`Sėkmingai pridėtas $${amount.toLocaleString()} bonusas visiems darbuotojams!`, 'success');
    }

    function spinRaffle() {

    const previousWinner = document.querySelector(".winning-item");
    if (previousWinner) {
        previousWinner.classList.remove("winning-item");
    }

    const results = Array.from(document.querySelectorAll('#resultsTable tr'));
    const eligible = results.map(row => {
        const cols = row.querySelectorAll('td');
        if (cols.length < 4 || cols[0].colSpan === 6) return null;
        const time = cols[3].textContent;
        const name = cols[1].textContent;
        const match = time.match(/(\d+)h\s*(\d+)m/);
        if (!match) return null;
        const hours = parseInt(match[1]);
        const minutes = parseInt(match[2]);
        return (hours + minutes / 60 >= 10) ? name : null;
    }).filter(Boolean);

    const uniqueNames = [...new Set(eligible)];

    if (uniqueNames.length === 0) {
        alert("Nėra darbuotojų, kurie dirbo 10+ valandų.");
        return;
    }

    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    const shuffledNames = shuffle([...uniqueNames]);
    const repeatedNames = [];
    while (repeatedNames.length < 50) { 
        repeatedNames.push(...shuffledNames);
    }
    const finalNames = repeatedNames.slice(0, 50);

    const spinnerTrack = document.getElementById("spinnerTrack");
    if (!spinnerTrack) {
        console.error("Sukimo elementas nerastas");
        return;
    }

    spinnerTrack.innerHTML = "";
    spinnerTrack.style.transition = "none";
    spinnerTrack.style.marginLeft = "0";

    finalNames.forEach((name, index) => {
        const item = document.createElement("div");
        item.className = "item"; 
        item.textContent = name;
        spinnerTrack.appendChild(item);
    });

    void spinnerTrack.offsetWidth;

    const itemWidth = spinnerTrack.querySelector(".item").offsetWidth + 10;
    const randomIndex = Math.floor(Math.random() * finalNames.length);
    const targetPosition = -(itemWidth * randomIndex);

    spinnerTrack.style.transition = "all 4s cubic-bezier(0.1, 0.8, 0.2, 1)";
    spinnerTrack.style.marginLeft = `${targetPosition}px`;

    setTimeout(() => {
        const roller = document.querySelector(".raffle-roller-holder");
        if (!roller) return;

        const centerX = roller.getBoundingClientRect().left + roller.offsetWidth / 2;
        const items = spinnerTrack.querySelectorAll(".item");
        let winnerEl = null;
        let closestDistance = Infinity;

        items.forEach(item => {
            const rect = item.getBoundingClientRect();
            const itemCenter = rect.left + rect.width / 2;
            const distance = Math.abs(itemCenter - centerX);
            
            if (distance < closestDistance) {
                closestDistance = distance;
                winnerEl = item;
            }
        });

        if (winnerEl) {
            winnerEl.classList.add("winning-item");
            const winnerNameElement = document.getElementById("winnerName");
            if (winnerNameElement) {
                winnerNameElement.textContent = winnerEl.textContent.trim();
            }
        }
    }, 6200); 
}