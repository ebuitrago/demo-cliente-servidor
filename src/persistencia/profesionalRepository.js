// Acceso a datos del catálogo de profesionales.
const pool = require('./db');

async function listarTodos() {
  const resultado = await pool.query(
    'SELECT id, nombre, especialidad FROM profesionales ORDER BY nombre'
  );
  return resultado.rows;
}

module.exports = { listarTodos };
