const tablas = [
  { value: 'reg_customers', label: 'Clientes' },
  { value: 'reg_providers', label: 'Proveedores' },
  { value: 'reg_users', label: 'Usuarios' },
  { value: 'reg_inventories', label: 'Inventarios' },
  { value: 'reg_receipts', label: 'Recibos' },
  { value: 'reg_recitm', label: 'Items de Recibo' },
  { value: 'reg_sales', label: 'Ventas' },
  { value: 'reg_salitm', label: 'Items de Venta' }
];

const selector = document.getElementById('tabla-selector');
const tabla = document.getElementById('tabla-registros');
const thead = tabla.querySelector('thead');
const tbody = tabla.querySelector('tbody');
const errorDiv = document.getElementById('error-msg');

function renderSelector() {
  selector.innerHTML = tablas.map(t => `<option value="${t.value}">${t.label}</option>`).join('');
}

async function fetchRegistros(tabla) {
  errorDiv.style.display = 'none';
  errorDiv.textContent = '';
  thead.innerHTML = '<tr><th colspan="99">Cargando...</th></tr>';
  tbody.innerHTML = '';
  try {
    const res = await fetch(`/StockiFy/api/registros/get.php?table=${tabla}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Error desconocido');
    renderTable(data.data);
  } catch (e) {
    thead.innerHTML = '';
    tbody.innerHTML = '';
    errorDiv.textContent = '⚠ ' + e.message;
    errorDiv.style.display = 'block';
  }
}

function renderTable(rows) {
  if (!rows.length) {
    thead.innerHTML = '<tr><th colspan="99">Sin registros</th></tr>';
    tbody.innerHTML = '';
    return;
  }
  const cols = Object.keys(rows[0]);
  thead.innerHTML = '<tr>' + cols.map(c => `<th>${c}</th>`).join('') + '</tr>';
  tbody.innerHTML = rows.map(r =>
    '<tr>' + cols.map(c => {
      const val = r[c] ?? '';
      // Resaltar acción
      if (c === 'action') {
        const color = val === 'Agregado' ? '#0a0' : val === 'Modificado' ? '#f80' : '#c00';
        return `<td style="font-weight:600;color:${color}">${val}</td>`;
      }
      return `<td>${val}</td>`;
    }).join('') + '</tr>'
  ).join('');
}

selector.addEventListener('change', e => {
  fetchRegistros(e.target.value);
});

// Inicialización
renderSelector();
fetchRegistros(tablas[0].value);
