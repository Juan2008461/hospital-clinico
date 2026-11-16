document.addEventListener('DOMContentLoaded', () => {
  const session = initDashboard(['doctor']);
  if (!session) return;

  // Identificar médico por userId
  const medicos = getMedicos();
  const medico = medicos.find(m => m.userId === session.id) || medicos.find(m => m.nombre.includes(session.nombre.split(' ').pop()));
  const medicoId = medico ? medico.id : 1;

  function getMisTurnos() {
    return getTurnos().filter(t => t.medicoId === medicoId);
  }

  function getMisConsultas() {
    return getConsultas().filter(c => c.medicoId === medicoId);
  }

  function renderInicio() {
    const turnos = getMisTurnos();
    const hoy = '2026-09-18'; // demo date aligned with seed data
    const deHoy = turnos.filter(t => t.fecha === hoy && t.estado !== 'cancelado');
    document.getElementById('statHoy').textContent = deHoy.length;
    document.getElementById('statPendientes').textContent = turnos.filter(t => t.estado === 'pendiente' || t.estado === 'confirmado').length;
    document.getElementById('statRealizadas').textContent = getMisConsultas().length;

    const tbody = document.getElementById('agendaHoyBody');
    if (deHoy.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-muted" style="text-align:center;padding:2rem;">Sin turnos para hoy</td></tr>';
      return;
    }
    tbody.innerHTML = deHoy.map(t => `
      <tr>
        <td>${t.hora}</td>
        <td>${t.pacienteNombre}</td>
        <td>${t.motivo || '-'}</td>
        <td>${estadoBadge(t.estado)}</td>
        <td>
          ${t.estado === 'confirmado' || t.estado === 'pendiente'
            ? `<button class="btn btn-sm btn-primary" onclick="window.iniciarConsulta(${t.id})">Atender</button>`
            : '-'}
        </td>
      </tr>
    `).join('');
  }

  function renderAgenda() {
    const filtro = document.getElementById('filtroEstadoAgenda').value;
    let turnos = getMisTurnos().sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora));
    if (filtro) turnos = turnos.filter(t => t.estado === filtro);

    const tbody = document.getElementById('agendaBody');
    if (turnos.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-muted" style="text-align:center;padding:2rem;">Sin turnos</td></tr>';
      return;
    }
    tbody.innerHTML = turnos.map(t => `
      <tr>
        <td>${formatDate(t.fecha)}</td>
        <td>${t.hora}</td>
        <td>${t.pacienteNombre}</td>
        <td>${t.motivo || '-'}</td>
        <td>${estadoBadge(t.estado)}</td>
        <td>
          ${t.estado === 'confirmado' || t.estado === 'pendiente'
            ? `<button class="btn btn-sm btn-primary" onclick="window.iniciarConsulta(${t.id})">Atender</button>`
            : '-'}
        </td>
      </tr>
    `).join('');
  }

  function loadTurnosConsulta() {
    const select = document.getElementById('consTurno');
    const turnos = getMisTurnos().filter(t => t.estado === 'confirmado' || t.estado === 'pendiente');
    select.innerHTML = '<option value="">Seleccione un turno confirmado...</option>' +
      turnos.map(t => `<option value="${t.id}">${formatDate(t.fecha)} ${t.hora} – ${t.pacienteNombre}</option>`).join('');
  }

  function loadNotasSelect() {
    const select = document.getElementById('notaConsulta');
    const consultas = getMisConsultas();
    select.innerHTML = '<option value="">Seleccione...</option>' +
      consultas.map(c => `<option value="${c.id}">${formatDate(c.fecha)} – ${c.pacienteNombre} (${c.diagnostico || 'Sin diag.'})</option>`).join('');
  }

  function renderHistorial(filtro = '') {
    let consultas = getMisConsultas().sort((a, b) => b.fecha.localeCompare(a.fecha));
    if (filtro) {
      const f = filtro.toLowerCase();
      consultas = consultas.filter(c => c.pacienteNombre.toLowerCase().includes(f) || (c.diagnostico || '').toLowerCase().includes(f));
    }
    const tbody = document.getElementById('historialPacBody');
    if (consultas.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-muted" style="text-align:center;padding:2rem;">Sin registros</td></tr>';
      return;
    }
    tbody.innerHTML = consultas.map(c => `
      <tr>
        <td>${formatDate(c.fecha)}</td>
        <td>${c.pacienteNombre}</td>
        <td>${c.diagnostico || '-'}</td>
        <td>${c.notas || '-'}</td>
        <td>${estadoBadge(c.estado)}</td>
      </tr>
    `).join('');
  }

  document.getElementById('formConsulta').addEventListener('submit', (e) => {
    e.preventDefault();
    const turnoId = parseInt(document.getElementById('consTurno').value);
    const diagnostico = document.getElementById('consDiagnostico').value.trim();
    const notas = document.getElementById('consNotas').value.trim();
    const receta = document.getElementById('consReceta').value.trim();
    const estado = document.getElementById('consEstado').value;

    const turnos = getTurnos();
    const turno = turnos.find(t => t.id === turnoId);
    if (!turno) return;

    const consultas = getConsultas();
    const nueva = {
      id: nextId(consultas),
      turnoId,
      pacienteId: turno.pacienteId,
      pacienteNombre: turno.pacienteNombre,
      medicoId,
      medicoNombre: session.nombre,
      fecha: turno.fecha,
      hora: turno.hora,
      diagnostico,
      notas,
      estado,
      receta
    };
    consultas.push(nueva);
    saveConsultas(consultas);

    // Actualizar estado del turno
    turno.estado = 'finalizada';
    saveTurnos(turnos);

    addLog(session.username, 'Consulta registrada', `Consulta #${nueva.id} – ${turno.pacienteNombre}`);
    showAlert('alertConsulta', 'Consulta registrada correctamente.', 'success');
    e.target.reset();
    loadTurnosConsulta();
    renderInicio();
    renderAgenda();
  });

  document.getElementById('formNota').addEventListener('submit', (e) => {
    e.preventDefault();
    const consId = parseInt(document.getElementById('notaConsulta').value);
    const texto = document.getElementById('notaTexto').value.trim();
    const consultas = getConsultas();
    const c = consultas.find(x => x.id === consId);
    if (c) {
      c.notas = (c.notas ? c.notas + '\n' : '') + `[${new Date().toLocaleString('es-AR')}] ${texto}`;
      saveConsultas(consultas);
      addLog(session.username, 'Nota agregada', `Consulta #${consId}`);
      showAlert('alertNota', 'Nota agregada correctamente.', 'success');
      e.target.reset();
      loadNotasSelect();
      renderHistorial();
    }
  });

  document.getElementById('filtroEstadoAgenda').addEventListener('change', renderAgenda);
  document.getElementById('buscarPacienteHist').addEventListener('input', (e) => {
    renderHistorial(e.target.value);
  });

  window.iniciarConsulta = function(turnoId) {
    // Cambiar a módulo de consulta y preseleccionar
    document.querySelector('.nav-item[data-module="consultas"]').click();
    setTimeout(() => {
      document.getElementById('consTurno').value = turnoId;
    }, 100);
  };

  document.querySelectorAll('.nav-item[data-module]').forEach(item => {
    item.addEventListener('click', () => {
      const m = item.dataset.module;
      if (m === 'inicio') renderInicio();
      if (m === 'agenda') renderAgenda();
      if (m === 'consultas') loadTurnosConsulta();
      if (m === 'historial') renderHistorial();
      if (m === 'notas') loadNotasSelect();
    });
  });

  renderInicio();
  renderAgenda();
  loadTurnosConsulta();
  loadNotasSelect();
  renderHistorial();
});
