
const express = require('express');

const { ErrorDeNegocio } =
  require('../dominio/reglasDeAgenda');

// Códigos HTTP asociados con errores de negocio
const CODIGO_HTTP = {
  DATOS_FALTANTES: 400,
  FECHA_INVALIDA: 400,
  FECHA_PASADA: 400,
  AGENDA_OCUPADA: 409
};

// Factoría que recibe el servicio de aplicación
function crearCitasRoutes({ citaService }) {

  const router = express.Router();

  // Estado del servidor
  router.get('/salud', (req, res) => {
    res.json({
      estado: 'ok',
      servidor: 'activo',
      hora: new Date().toISOString()
    });
  });

  // Consultar citas
  router.get('/citas', async (req, res) => {
    try {
      const citas = await citaService.consultarCitas();
      res.json(citas);
    } catch (error) {
      console.error('Error consultando citas:', error.message);
      res.status(500).json({
        error: 'No se pudo consultar la base de datos'
      });
    }
  });

  // Consultar profesionales
  router.get('/profesionales', async (req, res) => {
    try {
      const profesionales =
        await citaService.consultarProfesionales();

      res.json(profesionales);
    } catch (error) {
      console.error(
        'Error consultando profesionales:',
        error.message
      );
      res.status(500).json({
        error: 'No se pudo consultar la base de datos'
      });
    }
  });

  // Registrar una cita
  router.post('/citas', async (req, res) => {
    try {
      const resultado =
        await citaService.reservarCita(req.body);

      res.status(201).json(resultado);

    } catch (error) {
      if (error instanceof ErrorDeNegocio) {
        res.status(
          CODIGO_HTTP[error.codigo] || 400
        ).json({
          error: error.message
        });

      } else {
        console.error('Error creando cita:', error.message);
        res.status(500).json({
          error: 'No se pudo guardar en la base de datos'
        });
      }
    }
  });

  return router;
}

module.exports = { crearCitasRoutes };