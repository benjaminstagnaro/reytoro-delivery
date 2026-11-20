import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { obtenerCatalogo } from '../lib/api';
import type { Catalogo } from '../lib/types';

type Estado =
  | { tipo: 'cargando' }
  | { tipo: 'listo'; catalogo: Catalogo }
  | { tipo: 'error'; mensaje: string };

const Ctx = createContext<{ estado: Estado; reintentar: () => void } | null>(null);

/** Carga la lista de precios una sola vez y la comparte con toda la página. */
export function CatalogoProvider({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<Estado>({ tipo: 'cargando' });

  const cargar = useCallback(() => {
    setEstado({ tipo: 'cargando' });
    obtenerCatalogo()
      .then((catalogo) => setEstado({ tipo: 'listo', catalogo }))
      .catch((e: unknown) =>
        setEstado({ tipo: 'error', mensaje: e instanceof Error ? e.message : 'No pudimos cargar la lista de precios.' }),
      );
  }, []);

  useEffect(cargar, [cargar]);

  return <Ctx.Provider value={{ estado, reintentar: cargar }}>{children}</Ctx.Provider>;
}

export function useCatalogo() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useCatalogo debe usarse dentro de CatalogoProvider');
  return v;
}
