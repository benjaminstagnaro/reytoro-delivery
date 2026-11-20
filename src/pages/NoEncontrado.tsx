import { Link } from 'react-router';
import { useTitulo } from '../lib/useTitulo';

export function NoEncontrado() {
  useTitulo('Página no encontrada');
  return (
    <div className="contenedor py-24 text-center">
      <h1 className="letrero text-[2.6rem]">Esta página no existe</h1>
      <p className="mt-3 text-lg text-gris">Puede que el link esté incompleto.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to="/" className="boton boton-borde">
          Ir al inicio
        </Link>
        <Link to="/pedido" className="boton boton-oscuro">
          Hacer un pedido
        </Link>
      </div>
    </div>
  );
}
