import { Link } from 'react-router';
import { useTitulo } from '../lib/useTitulo';
import { Ilustracion } from '../components/Ilustracion';

export function NoEncontrado() {
  useTitulo('Página no encontrada');
  return (
    <div className="contenedor py-20 text-center">
      <span className="mx-auto grid size-32 place-items-center rounded-full bg-[#ffe9c9]" aria-hidden="true">
        <Ilustracion nombre="limon" className="size-20" />
      </span>
      <h1 className="titulo mt-6 text-[2.6rem]">Esta página no existe</h1>
      <p className="mt-3 text-lg text-hoja-suave">Puede que el link esté incompleto.</p>
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
