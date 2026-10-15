
const reglas = require('../dominio/reglasDeAgenda');

const { verificarRepositorios } =
  require('./contratos/repositorios');

function crearCitaService({
  citaRepository,
  profesionalRepository,
  reloj = () => new Date()
}) {

  // Verificar que los repositorios cumplan el contrato
  verificarRepositorios({
    citaRepository,
    profesionalRepository
  });

  // Consultar todas las citas
  async function consultarCitas() {
    return citaRepository.listarTodas();
  }

  // Consultar profesionales disponibles
  async function consultarProfesionales() {
    return profesionalRepository.listarTodos();
  }

  // Registrar una nueva cita
  async function reservarCita(datos) {

    // Validaciones del dominio
    reglas.validarDatosCompletos(datos);
    reglas.validarFechaFutura(
      datos.fecha_hora,
      reloj()
    );

    // Consultar disponibilidad
    const ocupado = await citaRepository.existeEnHorario(
      datos.profesional_id,
      datos.fecha_hora
    );

    reglas.validarAgendaLibre(ocupado);

    // Guardar la cita
    const id = await citaRepository.guardar(datos);

    return {
      mensaje: 'Cita creada',
      id
    };
  }

  // Operaciones que ofrece el servicio
  return {
    consultarCitas,
    consultarProfesionales,
    reservarCita
  };
}

module.exports = { crearCitaService };