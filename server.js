// Servidor de la demo de reserva de citas.
// Versión en un solo archivo: las rutas, las reglas de negocio y el acceso
// a datos conviven aquí de forma deliberada, como punto de partida para una
// posterior separación en capas.
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config();

// La cadena de conexión llega por variable de entorno; ver .env.example.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Supabase exige TLS
});

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/salud', (req, res) => {
  res.json({ estado: 'ok', servidor: 'activo', hora: new Date().toISOString() });
});

app.get('/api/citas', async (req, res) => {
  try {
    const resultado = await pool.query(
      `SELECT c.id, c.paciente, c.fecha_hora, p.nombre AS profesional
         FROM citas c
         JOIN profesionales p ON p.id = c.profesional_id
        ORDER BY c.fecha_hora`
    );
    res.json(resultado.rows);
  } catch (error) {
    console.error('Error consultando citas:', error.message);
    res.status(500).json({ error: 'No se pudo consultar la base de datos' });
  }
});

app.get('/api/profesionales', async (req, res) => {
  try {
    const resultado = await pool.query(
      'SELECT id, nombre, especialidad FROM profesionales ORDER BY nombre'
    );
    res.json(resultado.rows);
  } catch (error) {
    console.error('Error consultando profesionales:', error.message);
    res.status(500).json({ error: 'No se pudo consultar la base de datos' });
  }
});

app.post('/api/citas', async (req, res) => {
  const { paciente, profesional_id, fecha_hora } = req.body;

  // Las reglas se aplican en el servidor; el cliente no valida nada.
  if (!paciente || !profesional_id || !fecha_hora) {
    return res.status(400).json({ error: 'Faltan datos: paciente, profesional y fecha son obligatorios' });
  }

  const fecha = new Date(fecha_hora);
  if (isNaN(fecha.getTime())) {
    return res.status(400).json({ error: 'Regla del servidor: la fecha enviada no es válida' });
  }
  if (fecha <= new Date()) {
    return res.status(400).json({ error: 'Regla del servidor: no se pueden reservar citas en el pasado' });
  }

  try {
    const ocupado = await pool.query(
      'SELECT id FROM citas WHERE profesional_id = $1 AND fecha_hora = $2',
      [profesional_id, fecha_hora]
    );
    if (ocupado.rows.length > 0) {
      return res.status(409).json({ error: 'Regla del servidor: ese profesional ya tiene una cita a esa hora' });
    }

    const insercion = await pool.query(
      `INSERT INTO citas (paciente, profesional_id, fecha_hora)
       VALUES ($1, $2, $3) RETURNING id`,
      [paciente, profesional_id, fecha_hora]
    );
    res.status(201).json({ mensaje: 'Cita creada', id: insercion.rows[0].id });
  } catch (error) {
    console.error('Error creando cita:', error.message);
    res.status(500).json({ error: 'No se pudo guardar en la base de datos' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
  console.log(`Cliente web: http://localhost:${PORT}`);
});
