
const test = require('node:test');
const assert = require('node:assert/strict');

const { crearCitaService } =
  require('../src/aplicacion/citaService');

// Crear un servicio con repositorios simulados
function crearServicioParaPrueba(ocupado = false) {
  let guardadas = 0;

  const citaRepository = {
    listarTodas: async () => [],

    existeEnHorario: async () => ocupado,

    guardar: async () => {
      guardadas++;
      return 7;
    }
  };

  const profesionalRepository = {
    listarTodos: async () => []
  };

  const servicio = crearCitaService({
    citaRepository,
    profesionalRepository,
    reloj: () => new Date('2026-10-01T00:00:00Z')
  });

  return {
    servicio,
    guardadas: () => guardadas
  };
}

// Prueba 1: reserva válida
test('Permite registrar una cita válida', async () => {
  const { servicio, guardadas } =
    crearServicioParaPrueba();

  const resultado = await servicio.reservarCita({
    paciente: 'Ana',
    profesional_id: 1,
    fecha_hora: '2026-11-15T10:00:00Z'
  });

  assert.equal(resultado.id, 7);
  assert.equal(guardadas(), 1);
});

// Prueba 2: horario ocupado
test('Rechaza una agenda ocupada', async () => {
  const { servicio, guardadas } =
    crearServicioParaPrueba(true);

  await assert.rejects(
    () => servicio.reservarCita({
      paciente: 'Ana',
      profesional_id: 1,
      fecha_hora: '2026-11-15T10:00:00Z'
    }),
    { codigo: 'AGENDA_OCUPADA' }
  );

  assert.equal(guardadas(), 0);
});

// Prueba 3: fecha pasada
test('Rechaza una fecha pasada', async () => {
  const { servicio, guardadas } =
    crearServicioParaPrueba();

  await assert.rejects(
    () => servicio.reservarCita({
      paciente: 'Ana',
      profesional_id: 1,
      fecha_hora: '2026-09-01T10:00:00Z'
    }),
    { codigo: 'FECHA_PASADA' }
  );

  assert.equal(guardadas(), 0);
});


test('Rechaza repositorios que no cumplen el contrato', () => {

  const citaRepositoryIncompleto = {
    listarTodas: async () => [],
    existeEnHorario: async () => false

    // Falta el método guardar()
  };

  const profesionalRepository = {
    listarTodos: async () => []
  };

  assert.throws(
    () => crearCitaService({
      citaRepository: citaRepositoryIncompleto,
      profesionalRepository
    }),
    {
      name: 'TypeError',
      message: /citaRepository debe implementar guardar\(\)/
    }
  );
});
