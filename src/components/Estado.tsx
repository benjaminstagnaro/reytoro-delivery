import type { ReactNode } from 'react';
import { useCatalogo } from '../state/catalogo';
import type { Catalogo } from '../lib/types';

/** Muestra "cargando" o el error mientras llega la lista de precios; luego dibuja el contenido. */
export function ConCatalogo({ children }: { children: (c: Catalogo) => ReactNode }) {
  const { estado, reintentar } = useCatalogo();
  if (estado.tipo === 'cargando') {
    return (
      <div className="contenedor py-20 text-center" role="status">
        <div className="mx-auto size-12 animate-spin rounded-full border-4 border-linea border-t-naranjo" aria-hidden="true" />
        <p className="mt-4 text-lg">Cargando la lista de precios…</p>
      </div>
    );
  }
  if (estado.tipo === 'error') {
    return (
      <div className="contenedor py-20 text-center" role="alert">
        <p className="text-xl font-bold">{estado.mensaje}</p>
        <p className="mt-2 text-hoja-suave">Revisa tu conexión a internet e inténtalo de nuevo.</p>
        <button type="button" className="boton boton-oscuro mt-6" onClick={reintentar}>
          Intentar de nuevo
        </button>
      </div>
    );
  }
  return <>{children(estado.catalogo)}</>;
}
