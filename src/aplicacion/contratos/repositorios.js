
function exigirMetodos(objeto, metodos, nombre) {
  for (const metodo of metodos) {
    if (typeof objeto?.[metodo] !== 'function') {
      throw new TypeError(
        `${nombre} debe implementar ${metodo}()`
      );
    }
  }
}

function verificarRepositorios({
  citaRepository,
  profesionalRepository
}) {
  exigirMetodos(
    citaRepository,
    ['listarTodas', 'existeEnHorario', 'guardar'],
    'citaRepository'
  );

  exigirMetodos(
    profesionalRepository,
    ['listarTodos'],
    'profesionalRepository'
  );
}

module.exports = { verificarRepositorios };