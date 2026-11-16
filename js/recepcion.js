document.addEventListener('DOMContentLoaded', () => {
  const session = initDashboard(['recepcion']);
  if (!session) return;

  const hoy = '2026-09-18';

  function renderInicio() {
    const turnos = getTurnos();
    const deHoy = turnos.filter(t => t.fecha === hoy);
    document.getElementById('statHoy').textContent = deHoy.length;
    document.getElementById('statPendientes').textContent = turnos.filter(t => t.estado === 'pendiente').length;
    document.getElementById('statConfirmados').textContent = turnos.filter(t => t.estado === 'confirmado').length;
    document.getElementById('statCancelados').textContent = turnos.filter(t => t.estado === 'cancelado').length;

    const tbody = document.getElementById('turnosHoyBody');
    if (deHoy.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-muted" style="text-align:center;padding:2rem;">Sin turnos para hoy</td></tr>';
      return;
    }
    tbody.innerHTML = deHoy.map(t => `
      <tr>
        <td>${t.hora}</td>
        <td>${t.pacienteNombre}</td>
        <td>${t.medicoNombre}</td>
        <td>${t.especialidad}</td>
        <td>${estadoBadge(t.estado)}</td>
        <td>
          <div class="flex gap-1">
            ${t.estado === 'pendiente' ? `<button class="btn btn-sm btn-success" onclick="window.confirmarTurno(${t.id})">Confirmar</button>` : ''}
            ${t.estado !== 'cancelado' && t.estado !== 'finalizada' ? `<button class="btn btn-sm btn-danger" onclick="window.cancelarTurnoRec(${t.id})">Cancelar</button>` : ''}
          </div>
        </td>
      </tr>
    `).join('');
  }

  function renderAgenda() {
    const fecha = document.getElementById('filtroFechaAgenda').value;
    const estado = document.getElementById('filtroEstadoAgenda').value;
    let turnos = getTurnos().sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora));
    if (fecha) turnos = turnos.filter(t => t.fecha === fecha);
    if (estado) turnos = turnos.filter(t => t.estado === estado);

    const tbody = document.getElementById('agendaBody');
    if (turnos.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-muted" style="text-align:center;padding:2rem;">Sin turnos</td></tr>';
      return;
    }
    tbody.innerHTML = turnos.map(t => `
      <tr>
        <td>${formatDate(t.fecha)}</td>
        <td>${t.hora}</td>
        <td>${t.pacienteNombre}</td>
        <td>${t.medicoNombre}</td>
        <td>${t.especialidad}</td>
        <td>${estadoBadge(t.estado)}</td>
        <td>
          <div class="flex gap-1">
            ${t.estado === 'pendiente' ? `<button class="btn btn-sm btn-success" onclick="window.confirmarTurno(${t.id})">Confirmar</button>` : ''}
            ${t.estado !== 'cancelado' && t.estado !== 'finalizada' ? `<button class="btn btn-sm btn-danger" onclick="window.cancelarTurnoRec(${t.id})">Cancelar</button>` : ''}
          </div>
        </td>
      </tr>
    `).join('');
  }

  function loadAsignarForm() {
    const pacientes = getUsers().filter(u => u.role === 'paciente');
    const especs = getEspecialidades();
    const medicos = getMedicos();

    document.getElementById('asigPaciente').innerHTML =
      '<option value="">Seleccione...</option>' +
      pacientes.map(p => `<option value="${p.id}">${p.nombre} (${p.dni || p.email})</option>`).join('');

    document.getElementById('asigEspecialidad').innerHTML =
      '<option value="">Seleccione...</option>' +
      especs.map(e => `<option value="${e.id}">${e.nombre}</option>`).join('');

    document.getElementById('asigEspecialidad').addEventListener('change', function() {
      const filtrados = medicos.filter(m => m.especialidadId == this.value && m.disponible);
      document.getElementById('asigMedico').innerHTML = filtrados.length
        ? filtrados.map(m => `<option value="${m.id}">${m.nombre}</option>`).join('')
        : '<option value="">No hay médicos disponibles</option>';
    });

    document.getElementById('asigFecha').min = new Date().toISOString().split('T')[0];
  }

  document.getElementById('formAsignar').addEventListener('submit', (e) => {
    e.preventDefault();
    const pacienteId = parseInt(document.getElementById('asigPaciente').value);
    const especialidadId = document.getElementById('asigEspecialidad').value;
    const medicoId = parseInt(document.getElementById('asigMedico').value);
    const fecha = document.getElementById('asigFecha').value;
    const hora = document.getElementById('asigHora').value;
    const estado = document.getElementById('asigEstado').value;
    const motivo = document.getElementById('asigMotivo').value.trim();

    const paciente = getUsers().find(u => u.id === pacienteId);
    const medico = getMedicos().find(m => m.id === medicoId);
    const espec = getEspecialidades().find(e => e.id == especialidadId);

    if (!paciente || !medico) return;

    const all = getTurnos();
    const nuevo = {
      id: nextId(all),
      pacienteId,
      pacienteNombre: paciente.nombre,
      medicoId,
      medicoNombre: medico.nombre,
      especialidad: espec ? espec.nombre : medico.especialidad,
      fecha,
      hora,
      estado,
      motivo
    };
    all.push(nuevo);
    saveTurnos(all);
    addLog(session.username, 'Turno asignado', `Turno #${nuevo.id} – ${paciente.nombre}`);
    showAlert('alertAsignar', 'Turno asignado correctamente.', 'success');
    e.target.reset();
    renderInicio();
    renderAgenda();
  });

  function renderPacientes(filtro = '') {
    let pacientes = getUsers().filter(u => u.role === 'paciente');
    if (filtro) {
      const f = filtro.toLowerCase();
      pacientes = pacientes.filter(p =>
        (p.nombre || '').toLowerCase().includes(f) ||
        (p.dni || '').includes(f) ||
        (p.email || '').toLowerCase().includes(f)
      );
    }
    const turnos = getTurnos();
    const tbody = document.getElementById('pacientesBody');
    if (pacientes.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-muted" style="text-align:center;padding:2rem;">No se encontraron pacientes</td></tr>';
      return;
    }
    tbody.innerHTML = pacientes.map(p => {
      const cant = turnos.filter(t => t.pacienteId === p.id).length;
      return `
        <tr>
          <td>${p.nombre}</td>
          <td>${p.dni || '-'}</td>
          <td>${p.email || '-'}</td>
          <td>${p.telefono || '-'}</td>
          <td>${cant}</td>
        </tr>
      `;
    }).join('');
  }

  function renderDisponibilidad() {
    const medicos = getMedicos();
    const tbody = document.getElementById('dispBody');
    tbody.innerHTML = medicos.map(m => `
      <tr>
        <td>${m.nombre}</td>
        <td>${m.especialidad}</td>
        <td>${m.horario}</td>
        <td>${m.disponible ? '<span class="badge badge-success">Disponible</span>' : '<span class="badge badge-danger">No disponible</span>'}</td>
        <td>
          <button class="btn btn-sm btn-secondary" onclick="window.toggleDisponibilidad(${m.id})">
            ${m.disponible ? 'Marcar no disponible' : 'Marcar disponible'}
          </button>
        </td>
      </tr>
    `).join('');
  }

  window.confirmarTurno = function(id) {
    const all = getTurnos();
    const t = all.find(x => x.id === id);
    if (t) {
      t.estado = 'confirmado';
      saveTurnos(all);
      addLog(session.username, 'Turno confirmado', `Turno #${id}`);
      showAlert('alertAgenda', 'Turno confirmado.', 'success');
      renderInicio();
      renderAgenda();
    }
  };

  window.cancelarTurnoRec = function(id) {
    if (!confirm('¿Cancelar este turno?')) return;
    const all = getTurnos();
    const t = all.find(x => x.id === id);
    if (t) {
      t.estado = 'cancelado';
      saveTurnos(all);
      addLog(session.username, 'Turno cancelado', `Turno #${id}`);
      showAlert('alertAgenda', 'Turno cancelado.', 'success');
      renderInicio();
      renderAgenda();
    }
  };

  window.toggleDisponibilidad = function(id) {
    const medicos = getMedicos();
    const m = medicos.find(x => x.id === id);
    if (m) {
      m.disponible = !m.disponible;
      saveMedicos(medicos);
      addLog(session.username, 'Disponibilidad actualizada', `${m.nombre}: ${m.disponible ? 'disponible' : 'no disponible'}`);
      showAlert('alertDisp', 'Disponibilidad actualizada.', 'success');
      renderDisponibilidad();
    }
  };

  document.getElementById('filtroFechaAgenda').addEventListener('change', renderAgenda);
  document.getElementById('filtroEstadoAgenda').addEventListener('change', renderAgenda);
  document.getElementById('buscarPaciente').addEventListener('input', (e) => renderPacientes(e.target.value));

  document.querySelectorAll('.nav-item[data-module]').forEach(item => {
    item.addEventListener('click', () => {
      const m = item.dataset.module;
      if (m === 'inicio') renderInicio();
      if (m === 'agenda') renderAgenda();
      if (m === 'asignar') loadAsignarForm();
      if (m === 'pacientes') renderPacientes();
      if (m === 'disponibilidad') renderDisponibilidad();
    });
  });

  loadAsignarForm();
  renderInicio();
  renderAgenda();
  renderPacientes();
  renderDisponibilidad();
});
