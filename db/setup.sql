-- Esquema y datos semilla de la demo de reserva de citas.
-- Se ejecuta completo en el SQL Editor de Supabase; es re-ejecutable
-- (elimina y vuelve a crear las tablas).

DROP TABLE IF EXISTS citas;
DROP TABLE IF EXISTS profesionales;

CREATE TABLE profesionales (
  id           SERIAL PRIMARY KEY,
  nombre       TEXT NOT NULL,
  especialidad TEXT NOT NULL
);

CREATE TABLE citas (
  id              SERIAL PRIMARY KEY,
  paciente        TEXT NOT NULL,
  profesional_id  INTEGER NOT NULL REFERENCES profesionales(id),
  fecha_hora      TIMESTAMPTZ NOT NULL,
  creada_en       TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO profesionales (nombre, especialidad) VALUES
  ('Dra. Laura Pérez',  'Medicina general'),
  ('Dr. Andrés Rojas',  'Odontología'),
  ('Dra. Camila Torres','Fisioterapia');

INSERT INTO citas (paciente, profesional_id, fecha_hora) VALUES
  ('Carlos Muñoz', 1, now() + interval '1 day'),
  ('María Salazar', 2, now() + interval '2 days');

-- Verificación: debe devolver las dos citas de ejemplo.
SELECT c.id, c.paciente, p.nombre AS profesional, c.fecha_hora
  FROM citas c JOIN profesionales p ON p.id = c.profesional_id;
