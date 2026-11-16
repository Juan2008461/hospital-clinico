document.addEventListener('DOMContentLoaded', () => {
  const session = initDashboard(['desarrollador']);
  if (!session) return;

  function renderInicio() {
    document.getElementById('statLogs').textContent = getLogs().length;
    document.getElementById('statKeys').textContent = Object.keys(STORAGE_KEYS).length;
    document.getElementById('statUsers').textContent = getUsers().length;
  }

  function renderLogs() {
    const logs = getLogs();
    const tbody = document.getElementById('logsBody');
    if (logs.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" class="text-muted" style="text-align:center;padding:2rem;">Sin registros</td></tr>';
      return;
    }
    tbody.innerHTML = logs.map(l => `
      <tr>
        <td>${formatDateTime(l.fecha)}</td>
        <td>${l.usuario}</td>
        <td>${l.accion}</td>
        <td>${l.detalle || '-'}</td>
      </tr>
    `).join('');
  }

  function renderStorage() {
    const tbody = document.getElementById('storageBody');
    const rows = Object.entries(STORAGE_KEYS).map(([name, key]) => {
      const raw = localStorage.getItem(key) || '[]';
      let count = 0;
      try {
        const parsed = JSON.parse(raw);
        count = Array.isArray(parsed) ? parsed.length : 1;
      } catch { count = 0; }
      const size = (raw.length / 1024).toFixed(2) + ' KB';
      return `<tr><td>${key}</td><td>${count}</td><td>${size}</td></tr>`;
    });
    tbody.innerHTML = rows.join('');
  }

  document.getElementById('btnRefreshLogs').addEventListener('click', renderLogs);

  document.getElementById('btnClearLogs').addEventListener('click', () => {
    if (!confirm('¿Limpiar todos los logs?')) return;
    localStorage.setItem(STORAGE_KEYS.LOGS, '[]');
    addLog(session.username, 'Logs limpiados', 'Mantenimiento');
    showAlert('alertMant', 'Logs limpiados.', 'success');
    renderLogs();
    renderInicio();
  });

  document.getElementById('btnClearAll').addEventListener('click', () => {
    if (!confirm('¿Borrar TODO el almacenamiento y restablecer datos de demostración?')) return;
    Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
    initStorage();
    // Re-login no necesario, pero session sigue
    addLog(session.username, 'Storage reseteado', 'Reset completo desde panel técnico');
    showAlert('alertMant', 'Storage restablecido con datos de demostración.', 'success');
    renderInicio();
    renderLogs();
    renderStorage();
  });

  document.querySelectorAll('.nav-item[data-module]').forEach(item => {
    item.addEventListener('click', () => {
      const m = item.dataset.module;
      if (m === 'inicio') renderInicio();
      if (m === 'logs') renderLogs();
      if (m === 'storage') renderStorage();
    });
  });

  renderInicio();
  renderLogs();
  renderStorage();
});
