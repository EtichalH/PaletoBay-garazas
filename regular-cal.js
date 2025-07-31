const carParts = [
  { name: "Automobilio durys", price: 500, kalpokasPrice: 350 },
  { name: "Automobilio ratas", price: 2000, kalpokasPrice: 1350 },
  { name: "Automobilio akumuliatorius", price: 1000, kalpokasPrice: 750 },
  { name: "Automobilio pavaru deze", price: 6000, kalpokasPrice: 3300 },
  { name: "Automobilio radiatorius", price: 1000, kalpokasPrice: 750 },
  { name: "Automobilio metalo lauzas", price: 3000, kalpokasPrice: 2500 },
  { name: "Automobilio kapotas", price: 1500, kalpokasPrice: 1200 },
  { name: "Automobilio bagazine", price: 1000, kalpokasPrice: 700 }
];

document.addEventListener('DOMContentLoaded', function() {
  const partsTable = document.getElementById('partsTable');
  const partsTotal = document.getElementById('partsTotal');
  const resetParts = document.getElementById('resetParts');
  const kalpokasBtn = document.getElementById('kalpokasBtn');
  const discountInfo = document.getElementById('discountInfo');
  
  let partsData = [];
  let currentDiscount = 0;
  let originalTotal = 0;
  let isKalpokasMode = false;

  carParts.forEach((part, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${part.name}</td>
      <td class="price-cell">€${part.price.toLocaleString()}</td>
      <td class="quantity-cell" data-index="${index}" contenteditable="true">0</td>
      <td class="part-total">€0</td>
    `;
    partsTable.appendChild(row);
    partsData.push({ ...part, quantity: 0, total: 0 });
    
    const quantityCell = row.querySelector('.quantity-cell');
    quantityCell.addEventListener('input', function() {
      updatePart(this);
    });
  });

  function updatePart(cell) {
    const index = parseInt(cell.dataset.index);
    const quantity = parseInt(cell.textContent) || 0;
    partsData[index].quantity = quantity;
    const price = isKalpokasMode ? partsData[index].kalpokasPrice : partsData[index].price;
    partsData[index].total = quantity * price;
    
    const row = cell.closest('tr');
    row.querySelector('.part-total').textContent = `€${partsData[index].total.toLocaleString()}`;
    
    updateTotal();
  }

  function updateTotal() {
    originalTotal = partsData.reduce((sum, part) => sum + part.total, 0);
    if (currentDiscount > 0) {
      const discountedTotal = originalTotal * (currentDiscount / 100);
      partsTotal.innerHTML = `€${originalTotal.toLocaleString()} <small class="text-muted">(su ${currentDiscount}%: €${discountedTotal.toLocaleString()})</small>`;
    } else {
      partsTotal.textContent = `€${originalTotal.toLocaleString()}`;
    }
  }

  function applyDiscount(percent) {
    currentDiscount = percent;
    if (percent > 0) {
      discountInfo.classList.remove('d-none');
      document.getElementById('discountPercent').textContent = percent;
      const discountedTotal = originalTotal * (percent / 100);
      document.getElementById('discountedTotal').textContent = discountedTotal.toLocaleString();
    } else {
      discountInfo.classList.add('d-none');
    }
    updateTotal();
  }

  function toggleKalpokasMode() {
    isKalpokasMode = !isKalpokasMode;
    
    document.querySelectorAll('.price-cell').forEach((cell, index) => {
      const price = isKalpokasMode ? partsData[index].kalpokasPrice : partsData[index].price;
      cell.textContent = `€${price.toLocaleString()}`;
    });
    
    kalpokasBtn.classList.toggle('btn-success', isKalpokasMode);
    kalpokasBtn.classList.toggle('btn-outline-success', !isKalpokasMode);
    kalpokasBtn.innerHTML = isKalpokasMode 
      ? '<i class="bi bi-check-circle"></i> Kalpokas' 
      : '<i class="bi bi-currency-exchange"></i> Kalpokas';

    partsData.forEach((part, index) => {
      if (part.quantity > 0) {
        const price = isKalpokasMode ? part.kalpokasPrice : part.price;
        part.total = part.quantity * price;
        const row = partsTable.children[index];
        row.querySelector('.part-total').textContent = `€${part.total.toLocaleString()}`;
      }
    });
    
    updateTotal();
    showAlert(
      isKalpokasMode 
        ? 'Taikomos Kalpoko kainos!' 
        : 'Grįžta prie įprastų kainų',
      'success'
    );
  }

  resetParts.addEventListener('click', function() {
    partsData.forEach(part => {
      part.quantity = 0;
      part.total = 0;
    });
    
    document.querySelectorAll('.quantity-cell').forEach(cell => {
      cell.textContent = '0';
    });
    
    document.querySelectorAll('.part-total').forEach(cell => {
      cell.textContent = '€0';
    });
    
    applyDiscount(0);
    partsTotal.textContent = '€0';
  });

  kalpokasBtn.addEventListener('click', toggleKalpokasMode);

  document.querySelectorAll('.percentage-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      applyDiscount(parseInt(this.dataset.percent));
    });
  });

  document.getElementById('removeDiscount').addEventListener('click', function() {
    applyDiscount(0);
  });

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

const leaderboardData = [
  { name: "Joe Carloene", amount: 22 },
  { name: "Darell Kavaliauskas", amount: 21 },
  { name: "Mindoza Brazukas", amount: 13 },
  { name: "Vidmantas Paškevičius", amount: 6 },
  { name: "Kazys Vaskas", amount: 3 },
  { name: "Petras Jankauskas", amount: 2 },
  { name: "Erniuha Kazlinis", amount: 1 },
  { name: "Greta Jolie", amount: 1 }
  
];

const levelThresholds = [
  { threshold: 0, percent: 50 },
  { threshold: 40, percent: 60 },
  { threshold: 85, percent: 70 },
  { threshold: 150, percent: 80 },
  { threshold: 200, percent: 100 }
];

function getCurrentLevel(amount) {
  return [...levelThresholds].reverse().find(level => amount >= level.threshold) || levelThresholds[0];
}

function calculateProgress(playerAmount, currentLevel) {
  const nextLevel = levelThresholds.find(level => level.threshold > currentLevel.threshold);
  if (!nextLevel) return { width: 100, text: 'Pasiektas maksimumas' };
  
  const remaining = nextLevel.threshold - playerAmount;
  const progress = (playerAmount - currentLevel.threshold) / (nextLevel.threshold - currentLevel.threshold) * 100;
  return {
    width: progress,
    text: `${remaining} iki ${nextLevel.percent}%`
  };
}


const leaderboardHTML = `
<div class="mt-4">
  <div class="card border-0 shadow-sm">
    <div class="card-header bg-dark text-white">
      <h5 class="mb-0"><i class="bi bi-trophy-fill me-2"></i>Ardymo Lyderių Lentelė</h5>
    </div>
    <div class="card-body p-0">
      <div class="table-responsive">
        <table class="table table-hover mb-0">
          <thead class="table-light">
            <tr>
              <th style="width: 5%"></th>
              <th style="width: 30%">Vardas</th>
              <th class="text-center">Išardyti</th>
              <th class="text-center">Lygis</th>
              <th class="text-center">Progresas</th>
            </tr>
          </thead>
          <tbody id="leaderboardBody">
            ${leaderboardData.map((player, index) => {
              const currentLevel = getCurrentLevel(player.amount);
              const levelIndex = levelThresholds.indexOf(currentLevel);
              const progress = calculateProgress(player.amount, currentLevel);
              
              let positionIndicator = '';
              if (index === 0) {
                positionIndicator = '<i class="bi bi-trophy-fill text-warning"></i>';
              } else if (index === 1) {
                positionIndicator = '<i class="bi bi-award-fill text-secondary"></i>';
              } else if (index === 2) {
                positionIndicator = '<i class="bi bi-award-fill text-danger"></i>';
              } else {
                positionIndicator = `<span class="badge bg-dark">${index + 1}</span>`;
              }

              const rowClass = index === 0 ? 'leaderboard-gold' : 
                              index === 1 ? 'leaderboard-silver' : 
                              index === 2 ? 'leaderboard-bronze' : '';
              
              return `
              <tr class="${rowClass}">
                <td>${positionIndicator}</td>
                <td>${player.name}</td>
                <td class="text-center fw-bold">${player.amount}</td>
                <td class="text-center">
                  <span class="badge bg-level-${levelIndex + 1}">${levelIndex + 1} lygis</span>
                </td>
                <td>
                  <div class="progress" style="height: 20px;">
                    <div class="progress-bar bg-progress" role="progressbar" style="width: ${progress.width}%">
                      ${progress.text}
                    </div>
                  </div>
                </td>
              </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
    <div class="card-footer bg-light">
      <div class="d-flex flex-wrap justify-content-between align-items-center">
        <div class="level-indicators mb-2 mb-md-0">
          ${levelThresholds.map((level, index) => `
            <span class="badge bg-level-${index + 1} me-2 mb-1">
              <i class="bi bi-circle-fill"></i> ${index + 1} lygis (${level.percent}%)
            </span>
          `).join('')}
        </div>
        <small class="text-muted">Automobilių reikia: ${levelThresholds.map(l => l.threshold).join(', ')}</small>
      </div>
    </div>
  </div>
</div>
`;

document.querySelector('.alert-info').insertAdjacentHTML('afterend', leaderboardHTML);

const leaderboardStyles = document.createElement('style');
leaderboardStyles.textContent = `
.leaderboard-gold {
  background-color: rgba(255, 215, 0, 0.05);
}
.leaderboard-silver {
  background-color: rgba(192, 192, 192, 0.05);
}
.leaderboard-bronze {
  background-color: rgba(205, 127, 50, 0.05);
}

.bg-level-1 {
  background-color: #6c757d !important;
}
.bg-level-2 {
  background-color: #28a745 !important;
}
.bg-level-3 {
  background-color: #17a2b8 !important;
}
.bg-level-4 {
  background-color: #007bff !important;
}
.bg-level-5 {
  background-color: #dc3545 !important;
}

.bg-progress {
  background-color: #2c3e50;
  background-image: linear-gradient(45deg, rgba(255,255,255,.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,.15) 50%, rgba(255,255,255,.15) 75%, transparent 75%, transparent);
  background-size: 1rem 1rem;
}

.table-hover tbody tr:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  transition: all 0.2s ease;
}

.level-indicators .badge {
  padding: 5px 10px;
  font-size: 0.75rem;
  font-weight: 500;
}

.progress {
  border-radius: 10px;
  overflow: hidden;
  box-shadow: inset 0 1px 2px rgba(0,0,0,0.1);
}

.progress-bar {
  font-size: 0.7rem;
  font-weight: 600;
  white-space: nowrap;
  padding-left: 5px;
}
`;
document.head.appendChild(leaderboardStyles);

});