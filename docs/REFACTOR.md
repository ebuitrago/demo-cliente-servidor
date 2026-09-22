# Demo en Capas: Reserva de Citas (refactorización)

**Arquitectura de Sistemas I · 2026-2 · Semana 8**

Este proyecto es **el mismo sistema de la Semana 7** (demo Cliente-Servidor), con una diferencia deliberada: el interior del servidor fue **reorganizado en capas**. El comportamiento es idéntico — mismos endpoints, mismas reglas, mismas respuestas — y por eso:

- `public/index.html` (el cliente) **no cambió ni una línea**.
- `db/setup.sql` (la base de datos) **no cambió ni una línea**.
- El despliegue en Render y Supabase es **exactamente el mismo** (ver README de la Semana 7).

Ese es el mensaje central de la clase: la vista por capas organiza el **interior** de una aplicación; la vista cliente-servidor (quién habla con quién por la red) queda intacta. Son vistas complementarias.

---

## Antes y después

**Semana 7** — todo en un archivo:

```
server.js  (~130 líneas: rutas + reglas + SQL + conexión, todo mezclado)
```

**Semana 8** — una carpeta por capa:

```
server.js                              ← solo arranque y "cableado" (30 líneas)
src/
├── presentacion/
│   └── citasRoutes.js                 ← traduce HTTP ↔ aplicación; decide códigos 400/409/500
├── aplicacion/
│   └── citaService.js                 ← casos de uso: coordina en qué orden pasan las cosas
├── dominio/
│   └── reglasDeAgenda.js              ← las 3 reglas del negocio, puras (sin Express, sin SQL)
└── persistencia/
    ├── db.js                          ← la conexión a Supabase (único lugar que la conoce)
    ├── citaRepository.js              ← todo el SQL de citas
    └── profesionalRepository.js       ← todo el SQL de profesionales
```

### ¿A dónde se fue cada pedazo del server.js original?

| En la Semana 7 estaba... | En la Semana 8 vive en... | ¿Por qué ahí? |
|---|---|---|
| `if (!paciente || ...)` — datos obligatorios | `dominio/reglasDeAgenda.js` | Es una regla del negocio |
| `if (new Date(fecha_hora) <= new Date())` — no citas en el pasado | `dominio/reglasDeAgenda.js` | Es una regla del negocio |
| Consulta de choque de agenda + rechazo | Consulta: `persistencia/citaRepository.existeEnHorario` · Decisión: `dominio/validarAgendaLibre` | Averiguar es persistencia; decidir es dominio |
| Todos los `pool.query(...)` (SQL) | `persistencia/*Repository.js` | Guardar y consultar es persistencia |
| `new Pool({...})` (conexión) | `persistencia/db.js` | Detalle técnico, un solo lugar |
| `res.status(400/409/500).json(...)` | `presentacion/citasRoutes.js` | Los códigos HTTP son asunto del protocolo, no del negocio |
| El orden de los pasos al reservar | `aplicacion/citaService.reservarCita` | Coordinar el caso de uso es aplicación |
| `app.listen`, middlewares | `server.js` | Arranque y cableado |

### El flujo de una solicitud (la diapositiva 7 del deck, en código real)

```
Cliente (navegador)
  → POST /api/citas
    → presentacion/citasRoutes.js      (extrae req.body, sin decidir nada)
      → aplicacion/citaService.js      (receta: validar → consultar → guardar)
        → dominio/reglasDeAgenda.js    (¿cumple las reglas?)
        → persistencia/citaRepository  (SQL hacia Supabase)
          → Base de datos (Supabase)
  ← la respuesta regresa en sentido inverso:
    id nuevo → service → routes traduce a 201 + JSON → cliente
```

Y cuando una regla falla: el dominio lanza `ErrorDeNegocio('FECHA_PASADA')` → la aplicación lo deja subir → **la presentación** lo traduce a HTTP 400. El dominio nunca supo que existe HTTP.

---

## Cómo usarlo en clase

**Opción recomendada (ver el diff en GitHub):** suba esta versión al **mismo repositorio** de la Semana 7. Sin instalar nada: abra el repositorio en github.com → **Add file → Upload files** → arrastre **todos** los archivos y carpetas de este proyecto → **Commit changes**. Los archivos con el mismo nombre (como `server.js`) quedan reemplazados y la carpeta `src/` se agrega; eso crea un *commit* nuevo. Para ver el antes/después: pestaña del repositorio → historial de *commits* (el ícono de reloj junto al botón verde) → clic en el commit recién creado: GitHub muestra en rojo lo que salió y en verde lo que entró, archivo por archivo — la mejor visualización del refactor. Render redesplegará solo y el sistema seguirá funcionando igual: demuéstrelo recargando el cliente.

**Opción alternativa:** repositorio y servicio de Render nuevos (`demo-en-capas`), siguiendo los mismos 3 pasos del README de la Semana 7. Útil si quiere tener las dos versiones vivas al tiempo para compararlas en paralelo.

**Verificación en vivo sugerida:** con la versión en capas desplegada, repita las pruebas de la Semana 7 (reservar, fecha pasada → 400, choque → 409). Todo responde igual. Pregunta al curso: *"si nada cambió por fuera, ¿qué ganamos?"* → mantenibilidad, pruebas aisladas, y saber dónde vive cada cosa.

---

## Mapa del código ↔ conceptos de la clase (Semana 8)

Equivalente a la tabla de la Semana 7, para que cada semana deje una evidencia comparable:

| Concepto (arquitectura en capas) | Dónde verlo en este proyecto |
|---|---|
| Presentación | `src/presentacion/citasRoutes.js` — rutas y traducción a HTTP |
| Aplicación | `src/aplicacion/citaService.js` — casos de uso como recetas |
| Dominio | `src/dominio/reglasDeAgenda.js` — reglas puras, cero dependencias |
| Persistencia | `src/persistencia/*Repository.js` + `db.js` — todo el SQL y la conexión |
| Infraestructura | PostgreSQL en Supabase (y la plataforma Render) — externa al código |
| El contrato de cada capa | Los `module.exports` de cada archivo |

**Nota honesta sobre concurrencia:** el refactor conserva la misma condición de carrera de la Semana 7 (verificar disponibilidad y luego insertar, en dos pasos). Es deliberado: las capas organizan responsabilidades, no resuelven concurrencia — la exclusión real se garantiza en el nivel de datos con un índice de unicidad, y ese es un ejercicio de la sesión.

## Mapa a las diapositivas de la Semana 8

| Diapositiva del deck | Dónde verlo aquí |
|---|---|
| 6 — Capas mínimas esperadas | Las carpetas de `src/` (infraestructura aparece como `db.js` y quedaría más clara al agregar, p. ej., envío de correo) |
| 7 — Flujo de una solicitud | El diagrama de arriba, endpoint `POST /api/citas` |
| 8 — Ejemplo aplicado (reserva de cita) | Este proyecto completo |
| 9 — Vista lógica con interfaces | Los `module.exports` de cada capa son sus "contratos" |
| 10 — Coherencia con Cliente-Servidor | Cliente y BD intactos; solo cambió el interior del servidor |
| 11 — Errores comunes | El server.js de la Semana 7 cometía "controlador con reglas de negocio" y "SQL en el controlador": muéstrelo como el ANTES |
| 12 — Actividad en clase | Los equipos repiten este mismo ejercicio con su proyecto |

**Pregunta de control** (la de la diapositiva 8): si mañana cambia la regla "máximo una cita por horario", ¿qué archivo se toca? → Solo `src/dominio/reglasDeAgenda.js`.

**Gancho para la Semana 9:** en `citaService.js`, la aplicación hace `require('../persistencia/citaRepository')` — la capa de arriba **conoce concretamente** a la de abajo. ¿Está bien que sea así? ¿Podría el dominio definir el contrato y la persistencia implementarlo? Eso es inversión de dependencias, Repository como abstracción e inyección de dependencias: el tema de la próxima semana.

---

## Ejecutar localmente

Idéntico a la Semana 7:

```bash
npm install
cp .env.example .env    # y pegar su DATABASE_URL de Supabase
npm start               # abre http://localhost:3000
```
