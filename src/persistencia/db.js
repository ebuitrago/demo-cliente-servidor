// Conexión a Postgres (Supabase). La cadena llega por variable de entorno
// para no versionar credenciales; ver .env.example.
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Supabase exige TLS
});

module.exports = pool;
