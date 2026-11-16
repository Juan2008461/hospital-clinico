document.addEventListener('DOMContentLoaded', () => {
  const session = initDashboard(['paciente']);
  if (!session) return;

  const user = getUsers().find(u => u.id === session.id);
  let turnos = getTurnos().filter(t => t.pacienteId === session.id);

  function refreshTurnos() {
    turnos = getTurnos().filter(t => t.pacienteId === session.id);
    renderInicio();
    renderMisTurnos();
  }

  function renderInicio() {
    const proximos = turnos.filter(t => t.estado !== 'cancelado' && t.fecha >= '2026-09-18');
    document.getElementById('statTurnos').textContent = proximos.length;
    document.getElementById('statConfirmados').textContent = turnos.filter(t => t.estado === 'confirmado').length;
    document.getElementById('statConsultas').textContent = getConsultas().filter(c => c.pacienteId === session.id).length;

    const tbody = document.getElementById('proximosTurnosBody');
    if (proximos.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-muted" style="text-align:center;padding:2rem;">No tiene turnos próximos</td></tr>';
      return;
    }
    tbody.innerHTML = proximos.slice(0, 5).map(t => `
      <tr>
        <td>${formatDate(t.fecha)}</td>
        <td>${t.hora}</td>
        <td>${t.medicoNombre}</td>
        <td>${t.especialidad}</td>
        <td>${estadoBadge(t.estado)}</td>
      </tr>
    `).join('');
  }

  function renderMisTurnos() {
    const tbody = document.getElementById('misTurnosBody');
    if (turnos.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-muted" style="text-align:center;padding:2rem;">No tiene turnos registrados</td></tr>';
      return;
    }
    tbody.innerHTML = turnos.map(t => {
      const acciones = [];
      if (t.estado === 'pendiente' || t.estado === 'confirmado') {
        acciones.push(`<button class="btn btn-sm btn-warning" onclick="window.reprogramarTurno(${t.id})">Reprogramar</button>`);
        acciones.push(`<button class="btn btn-sm btn-danger" onclick="window.cancelarTurno(${t.id})">Cancelar</button>`);
      }
      return `
        <tr>
          <td>${formatDate(t.fecha)}</td>
          <td>${t.hora}</td>
          <td>${t.medicoNombre}</td>
          <td>${t.especialidad}</td>
          <td>${t.motivo || '-'}</td>
          <td>${estadoBadge(t.estado)}</td>
          <td><div class="flex gap-1">${acciones.join('')}</div></td>
        </tr>
      `;
    }).join('');
  }

  function renderHistorial() {
    const consultas = getConsultas().filter(c => c.pacienteId === session.id);
    const tbody = document.getElementById('historialBody');
    if (consultas.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-muted" style="text-align:center;padding:2rem;">Sin historial de consultas</td></tr>';
      return;
    }
    tbody.innerHTML = consultas.map(c => `
      <tr>
        <td>${formatDate(c.fecha)}</td>
        <td>${c.medicoNombre}</td>
        <td>${c.diagnostico || '-'}</td>
        <td>${c.notas || '-'}</td>
        <td>${estadoBadge(c.estado)}</td>
      </tr>
    `).join('');
  }

  function renderDatos() {
    const el = document.getElementById('datosPersonales');
    if (!user) return;
    el.innerHTML = `
      <div class="form-row">
        <div class="form-group">
          <label>Nombre completo</label>
          <input class="form-control" value="${user.nombre || ''}" readonly>
        </div>
        <div class="form-group">
          <label>DNI</label>
          <input class="form-control" value="${user.dni || '-'}" readonly>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Email</label>
          <input class="form-control" value="${user.email || ''}" readonly>
        </div>
        <div class="form-group">
          <label>Teléfono</label>
          <input class="form-control" value="${user.telefono || '-'}" readonly>
        </div>
      </div>
      <p class="text-muted mt-2" style="font-size:0.85rem;">Para modificar sus datos, contacte a recepción o administración.</p>
    `;
  }

  // Cargar especialidades y médicos para formulario
  function loadSolicitarForm() {
    const especSelect = document.getElementById('solEspecialidad');
    const medicos = getMedicos().filter(m => m.disponible);
    const especs = getEspecialidades();

    especSelect.innerHTML = '<option value="">Seleccione...</option>' +
      especs.map(e => `<option value="${e.id}">${e.nombre}</option>`).join('');

    especSelect.addEventListener('change', () => {
      const medSelect = document.getElementById('solMedico');
      const filtrados = medicos.filter(m => m.especialidadId == especSelect.value);
      medSelect.innerHTML = filtrados.length
        ? filtrados.map(m => `<option value="${m.id}">${m.nombre}</option>`).join('')
        : '<option value="">No hay médicos disponibles</option>';
    });

    // Fecha mínima hoy
    const fechaInput = document.getElementById('solFecha');
    const today = new Date().toISOString().split('T')[0];
    fechaInput.min = today;
  }

  document.getElementById('formSolicitar').addEventListener('submit', (e) => {
    e.preventDefault();
    const especialidadId = document.getElementById('solEspecialidad').value;
    const medicoId = parseInt(document.getElementById('solMedico').value);
    const fecha = document.getElementById('solFecha').value;
    const hora = document.getElementById('solHora').value;
    const motivo = document.getElementById('solMotivo').value.trim();

    const medicos = getMedicos();
    const medico = medicos.find(m => m.id === medicoId);
    const espec = getEspecialidades().find(e => e.id == especialidadId);

    if (!medico) {
      showAlert('alertSolicitar', 'Seleccione un médico válido', 'info');
      return;
    }

    const allTurnos = getTurnos();
    const nuevo = {
      id: nextId(allTurnos),
      pacienteId: session.id,
      pacienteNombre: session.nombre,
      medicoId: medico.id,
      medicoNombre: medico.nombre,
      especialidad: espec ? espec.nombre : medico.especialidad,
      fecha,
      hora,
      estado: 'pendiente',
      motivo
    };
    allTurnos.push(nuevo);
    saveTurnos(allTurnos);
    addLog(session.username, 'Turno solicitado', `Turno #${nuevo.id} - ${fecha} ${hora}`);

    showAlert('alertSolicitar', 'Turno solicitado correctamente. Estado: pendiente de confirmación.', 'success');
    e.target.reset();
    refreshTurnos();
  });

  window.cancelarTurno = function(id) {
    if (!confirm('¿Confirma cancelar este turno?')) return;
    const all = getTurnos();
    const t = all.find(x => x.id === id);
    if (t) {
      t.estado = 'cancelado';
      saveTurnos(all);
      addLog(session.username, 'Turno cancelado', `Turno #${id}`);
      showAlert('alertTurnos', 'Turno cancelado correctamente.', 'success');
      refreshTurnos();
    }
  };

  window.reprogramarTurno = function(id) {
    document.getElementById('reprogId').value = id;
    const t = getTurnos().find(x => x.id === id);
    if (t) {
      document.getElementById('reprogFecha').value = t.fecha;
      document.getElementById('reprogHora').value = t.hora;
    }
    openModal('modalReprogramar');
  };

  document.getElementById('btnConfirmarReprog').addEventListener('click', () => {
    const id = parseInt(document.getElementById('reprogId').value);
    const fecha = document.getElementById('reprogFecha').value;
    const hora = document.getElementById('reprogHora').value;
    if (!fecha) return;

    const all = getTurnos();
    const t = all.find(x => x.id === id);
    if (t) {
      t.fecha = fecha;
      t.hora = hora;
      t.estado = 'reprogramado';
      saveTurnos(all);
      addLog(session.username, 'Turno reprogramado', `Turno #${id} → ${fecha} ${hora}`);
      closeModal('modalReprogramar');
      showAlert('alertTurnos', 'Turno reprogramado correctamente.', 'success');
      refreshTurnos();
    }
  });

  // Listeners de navegación para re-render
  document.querySelectorAll('.nav-item[data-module]').forEach(item => {
    item.addEventListener('click', () => {
      if (item.dataset.module === 'historial') renderHistorial();
      if (item.dataset.module === 'datos') renderDatos();
      if (item.dataset.module === 'turnos') renderMisTurnos();
      if (item.dataset.module === 'inicio') renderInicio();
    });
  });

  loadSolicitarForm();
  renderInicio();
  renderMisTurnos();
  renderHistorial();
  renderDatos();
});
