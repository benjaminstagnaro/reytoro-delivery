import type { Producto } from '../lib/types';
import { fotoProducto } from '../lib/fotosProductos';
import { Ilustracion, colorCategoria, ilustracionProducto } from './Ilustracion';

/**
 * Cuadrado del producto: la foto si la tenemos; si no, el dibujo sobre el color de su categoría.
 * Es decorativa (alt vacío) porque el nombre del producto siempre va escrito al lado.
 */
export function ImagenProducto({ producto, className = '' }: { producto: Pick<Producto, 'n' | 'c'>; className?: string }) {
  const foto = fotoProducto(producto);
  return (
    <div
      className={`relative grid aspect-square place-items-center overflow-hidden rounded-2xl ${className}`}
      style={{ background: colorCategoria(producto.c) }}
      aria-hidden="true"
    >
      {foto ? (
        <img src={foto.chica} alt="" width={256} height={256} loading="lazy" decoding="async" className="h-full w-full object-cover" />
      ) : (
        <Ilustracion nombre={ilustracionProducto(producto)} className="h-[62%] w-[62%]" />
      )}
    </div>
  );
}
