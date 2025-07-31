const materials = [
  { name: "Guma", price: 150 },
  { name: "Plastikas", price: 150 },
  { name: "Aliuminis", price: 150 },
  { name: "Poperius", price: 70 },
  { name: "Stiklas", price: 150 },
  { name: "Variniai zetonai", price: 1000 }
];

document.addEventListener('DOMContentLoaded', function() {
  const materialsTable = document.getElementById('materialsTable');
  const materialsTotal = document.getElementById('materialsTotal');
  const resetMaterials = document.getElementById('resetMaterials');
  
  let materialsData = [];
  let currentMarkup = 0;

  materials.forEach((material, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${material.name}</td>
      <td>€${material.price.toLocaleString()}</td>
      <td class="material-quantity" data-index="${index}" contenteditable="true">0</td>
      <td class="material-total">€0</td>
    `;
    materialsTable.appendChild(row);
    materialsData.push({ ...material, quantity: 0, total: 0 });
    
    const quantityCell = row.querySelector('.material-quantity');
    quantityCell.addEventListener('input', function() {
      updateMaterial(this);
    });
  });

  function updateMaterial(cell) {
    const index = parseInt(cell.dataset.index);
    const quantity = parseInt(cell.textContent) || 0;
    materialsData[index].quantity = quantity;
    materialsData[index].total = quantity * materialsData[index].price;
    
    const row = cell.closest('tr');
    row.querySelector('.material-total').textContent = `€${materialsData[index].total.toLocaleString()}`;
    
    updateMaterialsTotal();
  }

  function updateMaterialsTotal() {
    const subtotal = materialsData.reduce((sum, material) => sum + material.total, 0);
    const total = subtotal * (1 + currentMarkup/100);
    
    if (currentMarkup > 0) {
      materialsTotal.innerHTML = `
        <span>€${subtotal.toLocaleString()}</span>
        <small class="text-muted">(+${currentMarkup}%: €${total.toLocaleString()})</small>
      `;
    } else {
      materialsTotal.textContent = `€${subtotal.toLocaleString()}`;
    }
  }

  function applyMarkup(percent) {
    currentMarkup = percent;
    updateMaterialsTotal();
    
    document.querySelectorAll('.markup-btn').forEach(btn => {
      btn.classList.toggle('active', parseInt(btn.dataset.percent) === percent);
    });
  }

  resetMaterials.addEventListener('click', function() {
    materialsData.forEach(material => {
      material.quantity = 0;
      material.total = 0;
    });
    
    document.querySelectorAll('.material-quantity').forEach(cell => {
      cell.textContent = '0';
    });
    
    document.querySelectorAll('.material-total').forEach(cell => {
      cell.textContent = '€0';
    });
    
    applyMarkup(0);
    materialsTotal.textContent = '€0';
  });

  document.querySelectorAll('.markup-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      applyMarkup(parseInt(this.dataset.percent));
    });
  });
});