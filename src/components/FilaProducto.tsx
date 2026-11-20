import type { Producto } from '../lib/types';
import { claveProducto, nombreLindo, nombreSinOferta } from '../lib/format';
import { useCarrito } from '../state/carrito';
import { Cartel } from './Cartel';
import { Contador } from './Contador';

/** Un producto de la lista: nombre, cartel de precio y botones para agregar. */
export function FilaProducto({ producto }: { producto: Producto }) {
  const { cantidad, cambiar } = useCarrito();
  const clave = claveProducto(producto);
  const q = cantidad(clave);
  const oferta = producto.o === 'OFERTA';
  const destacado = producto.o === 'DESTACADO';
  const nombre = nombreLindo(oferta ? nombreSinOferta(producto.n) : producto.n);

  return (
    // Celular: precio a la izquierda, nombre arriba y botón abajo. Pantallas anchas: todo en una línea.
    <li
      className={`grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-2 rounded-xl border-2 p-3 transition-colors sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:gap-x-4 sm:p-4 ${
        q > 0 ? 'border-naranjo bg-[#fff6ef]' : 'border-linea bg-papel'
      }`}
    >
      <Cartel
        precio={producto.p}
        medida={producto.m}
        oferta={oferta}
        tamano="sm"
        className="row-span-2 min-w-[5.6rem] self-start sm:row-span-1 sm:self-center"
      />
      <div className="min-w-0">
        <p className="text-[1.08rem] leading-snug font-bold break-words">{nombre}</p>
        {destacado && <p className="mt-0.5 text-sm font-bold text-hoja">Recomendado de la semana</p>}
      </div>
      <div className="justify-self-end sm:col-start-3 sm:row-start-1">
        <Contador cantidad={q} nombre={nombre} onCambiar={(d) => cambiar(clave, d)} />
      </div>
    </li>
  );
}
