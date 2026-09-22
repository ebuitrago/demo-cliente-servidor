// Casos de uso de citas: coordinan las reglas del dominio y los repositorios.
const reglas = require('../dominio/reglasDeAgenda');
const citaRepository = require('../persistencia/citaRepository');
const profesionalRepository = require('../persistencia/profesionalRepository');

async function consultarCitas() {
  return citaRepository.listarTodas();
}

async function consultarProfesionales() {
  return profesionalRepository.listarTodos();
}

async function reservarCita(datos) {
  reglas.validarDatosCompletos(datos);
  reglas.validarFechaFutura(datos.fecha_hora);

  const ocupado = await citaRepository.existeEnHorario(
    datos.profesional_id,
    datos.fecha_hora
  );
  reglas.validarAgendaLibre(ocupado);

  const id = await citaRepository.guardar(datos);
  return { mensaje: 'Cita creada', id };
}

module.exports = { consultarCitas, consultarProfesionales, reservarCita };
