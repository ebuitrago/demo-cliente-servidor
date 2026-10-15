
const express = require('express');
const cors = require('cors');
const path = require('path');

const { crearCitasRoutes } =
  require('./src/presentacion/citasRoutes');

const { crearCitaService } =
  require('./src/aplicacion/citaService');

const citaRepository =
  require('./src/persistencia/citaRepository');

const profesionalRepository =
  require('./src/persistencia/profesionalRepository');

// 1. Crear el servicio e inyectar los repositorios
const citaService = crearCitaService({
  citaRepository,
  profesionalRepository
});

// 2. Configurar el servidor Express
const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static(
  path.join(__dirname, 'public')
));

// 3. Inyectar el servicio en las rutas HTTP
app.use('/api', crearCitasRoutes({
  citaService
}));

// 4. Iniciar el servidor
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(
    `Servidor escuchando en el puerto ${PORT}`
  );
  console.log(
    `Cliente web: http://localhost:${PORT}`
  );
});