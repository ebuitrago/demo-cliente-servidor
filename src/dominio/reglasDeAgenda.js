// Reglas de negocio de la agenda.
// Este módulo no depende de Express ni de la base de datos, de modo que
// las reglas pueden probarse de forma aislada y sobreviven a cambios de
// framework o de motor de persistencia.

class ErrorDeNegocio extends Error {
  constructor(codigo, mensaje) {
    super(mensaje);
    this.codigo = codigo;
  }
}

function validarDatosCompletos({ paciente, profesional_id, fecha_hora }) {
  if (!paciente || !profesional_id || !fecha_hora) {
    throw new ErrorDeNegocio(
      'DATOS_FALTANTES',
      'Faltan datos: paciente, profesional y fecha son obligatorios'
    );
  }
}

function validarFechaFutura(fecha_hora, ahora = new Date()) {
  const fecha = new Date(fecha_hora);
  if (isNaN(fecha.getTime())) {
    throw new ErrorDeNegocio(
      'FECHA_INVALIDA',
      'Regla del servidor: la fecha enviada no es válida'
    );
  }
  if (fecha <= ahora) {
    throw new ErrorDeNegocio(
      'FECHA_PASADA',
      'Regla del servidor: no se pueden reservar citas en el pasado'
    );
  }
}

// Averiguar si el horario está ocupado es responsabilidad de la capa de
// persistencia; esta regla solo decide sobre el hecho ya consultado.
function validarAgendaLibre(horarioOcupado) {
  if (horarioOcupado) {
    throw new ErrorDeNegocio(
      'AGENDA_OCUPADA',
      'Regla del servidor: ese profesional ya tiene una cita a esa hora'
    );
  }
}

module.exports = {
  ErrorDeNegocio,
  validarDatosCompletos,
  validarFechaFutura,
  validarAgendaLibre,
};
