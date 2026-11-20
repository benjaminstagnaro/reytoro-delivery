import type { Producto } from '../lib/types';
import { claveProducto, clp, medidaLinda, nombreLindo, nombreSinOferta } from '../lib/format';
import { useCarrito } from '../state/carrito';
import { Contador } from './Contador';
import { Ilustracion, colorCategoria, ilustracionProducto } from './Ilustracion';

/** Tarjeta de un producto: dibujo en su color de categoría, nombre, precio y botones para agregar. */
export function FilaProducto({ producto }: { producto: Producto }) {
  const { cantidad, cambiar } = useCarrito();
  const clave = claveProducto(producto);
  const q = cantidad(clave);
  const oferta = producto.o === 'OFERTA';
  const destacado = producto.o === 'DESTACADO';
  const nombre = nombreLindo(oferta ? nombreSinOferta(producto.n) : producto.n);

  return (
    <li
      className={`grid min-w-0 grid-cols-[4.5rem_minmax(0,1fr)] items-center gap-x-4 gap-y-3 rounded-3xl border-2 bg-papel p-3 transition-colors sm:grid-cols-[5rem_minmax(0,1fr)_auto] ${
        q > 0 ? 'border-hoja' : 'border-linea'
      }`}
    >
      <div
        className="relative row-span-2 grid aspect-square place-items-center self-start rounded-2xl sm:row-span-1 sm:self-center"
        style={{ background: colorCategoria(producto.c) }}
      >
        <Ilustracion nombre={ilustracionProducto(producto)} className="h-[62%] w-[62%]" />
      </div>
      <div className="min-w-0">
        {(oferta || destacado) && (
          <span className={`mb-1 inline-block rounded-full px-2.5 py-0.5 text-sm font-bold ${oferta ? 'bg-oferta' : 'bg-menta'}`}>
            {oferta ? 'Oferta' : 'Recomendado'}
          </span>
        )}
        <p className="text-[1.1rem] leading-snug font-bold break-words">{nombre}</p>
        <p className="mt-0.5">
          <span className="titulo-sm text-[1.35rem]">{clp(producto.p)}</span>{' '}
          <span className="text-hoja-suave">{medidaLinda(producto.m)}</span>
        </p>
      </div>
      <div className="justify-self-end sm:col-start-3 sm:row-start-1">
        <Contador cantidad={q} nombre={nombre} onCambiar={(d) => cambiar(clave, d)} />
      </div>
    </li>
  );
}
