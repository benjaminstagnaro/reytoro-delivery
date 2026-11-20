import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type Tamano = 'normal' | 'grande' | 'muy-grande';
const ORDEN: Tamano[] = ['normal', 'grande', 'muy-grande'];
const CLAVE = 'reytoro:texto';

const Ctx = createContext<{ tamano: Tamano; siguiente: () => void } | null>(null);

/** Botón "Aa": agranda toda la página (letras y botones) en tres pasos. */
export function TamanoTextoProvider({ children }: { children: ReactNode }) {
  const [tamano, setTamano] = useState<Tamano>(() => {
    try {
      const t = localStorage.getItem(CLAVE) as Tamano | null;
      return t && ORDEN.includes(t) ? t : 'normal';
    } catch {
      return 'normal';
    }
  });

  useEffect(() => {
    document.documentElement.dataset.texto = tamano;
    try {
      localStorage.setItem(CLAVE, tamano);
    } catch {
      /* sin almacenamiento */
    }
  }, [tamano]);

  const siguiente = () => setTamano((t) => ORDEN[(ORDEN.indexOf(t) + 1) % ORDEN.length]);
  return <Ctx.Provider value={{ tamano, siguiente }}>{children}</Ctx.Provider>;
}

export function useTamanoTexto() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useTamanoTexto debe usarse dentro de TamanoTextoProvider');
  return v;
}
