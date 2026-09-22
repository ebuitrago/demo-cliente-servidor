// Punto de entrada. La lógica vive en src/, una carpeta por capa;
// aquí solo se configura Express y se conecta la capa de presentación.
const express = require('express');
const cors = require('cors');
const path = require('path');
const citasRoutes = require('./src/presentacion/citasRoutes');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api', citasRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
  console.log(`Cliente web: http://localhost:${PORT}`);
});
