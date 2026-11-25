import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { cambiarCantidad, limpiarCarrito, resumir, type Carrito, type Resumen } from '../lib/carrito';
import type { DatosCliente } from '../lib/types';
import { useCatalogo } from './catalogo';

const CLAVE_CARRITO = 'reytoro:carrito:v1';
const CLAVE_CLIENTE = 'reytoro:cliente:v1';
const CLAVE_ULTIMO = 'reytoro:ultimo-pedido:v1';

// localStorage puede fallar (navegación privada, bloqueos): nunca debe romper la página.
function leer<T>(clave: string, porDefecto: T): T {
  try {
    const v = localStorage.getItem(clave);
    return v ? (JSON.parse(v) as T) : porDefecto;
  } catch {
    return porDefecto;
  }
}
function guardar(clave: string, valor: unknown) {
  try {
    localStorage.setItem(clave, JSON.stringify(valor));
  } catch {
    /* sin almacenamiento: seguimos igual */
  }
}

export const CLIENTE_VACIO: DatosCliente = { nombre: '', telefono: '', comuna: '', direccion: '', entrega: '', comentarios: '' };

interface CarritoCtx {
  carrito: Carrito;
  resumen: Resumen | null;
  cantidad: (clave: string) => number;
  cambiar: (clave: string, delta: number) => void;
  vaciar: () => void;
  /** Último pedido enviado (para el botón "Repetir mi último pedido") */
  ultimo: Carrito;
  repetirUltimo: () => void;
  recordarPedido: (c: Carrito) => void;
  cliente: DatosCliente;
  setCliente: (c: DatosCliente) => void;
  /** Borra de este dispositivo los datos guardados (nombre, teléfono, dirección, último pedido y carrito) */
  olvidarDatos: () => void;
}

const Ctx = createContext<CarritoCtx | null>(null);

export function CarritoProvider({ children }: { children: ReactNode }) {
  const { estado } = useCatalogo();
  const [carrito, setCarrito] = useState<Carrito>(() => leer(CLAVE_CARRITO, {}));
  const [ultimo, setUltimo] = useState<Carrito>(() => leer(CLAVE_ULTIMO, {}));
  const [cliente, setClienteState] = useState<DatosCliente>(() => ({
    ...CLIENTE_VACIO,
    ...leer<Partial<DatosCliente>>(CLAVE_CLIENTE, {}),
    entrega: '',
    comentarios: '',
  }));

  const productos = estado.tipo === 'listo' ? estado.catalogo.productos : null;

  // Si un producto desaparece de la planilla, se saca solo del carrito.
  useEffect(() => {
    if (productos) setCarrito((c) => limpiarCarrito(c, productos));
  }, [productos]);

  useEffect(() => guardar(CLAVE_CARRITO, carrito), [carrito]);

  const resumen = useMemo(
    () => (estado.tipo === 'listo' ? resumir(carrito, estado.catalogo.productos, estado.catalogo.config) : null),
    [carrito, estado],
  );

  const valor: CarritoCtx = {
    carrito,
    resumen,
    cantidad: (k) => carrito[k] ?? 0,
    cambiar: (k, d) => setCarrito((c) => cambiarCantidad(c, k, d)),
    vaciar: () => setCarrito({}),
    ultimo: productos ? limpiarCarrito(ultimo, productos) : {},
    repetirUltimo: () => productos && setCarrito(limpiarCarrito(ultimo, productos)),
    recordarPedido: (c) => {
      setUltimo(c);
      guardar(CLAVE_ULTIMO, c);
    },
    cliente,
    setCliente: (c) => {
      setClienteState(c);
      // Se recuerdan solo nombre, teléfono y dirección para el próximo pedido.
      guardar(CLAVE_CLIENTE, { nombre: c.nombre, telefono: c.telefono, comuna: c.comuna, direccion: c.direccion });
    },
    olvidarDatos: () => {
      for (const k of [CLAVE_CLIENTE, CLAVE_ULTIMO, CLAVE_CARRITO]) {
        try {
          localStorage.removeItem(k);
        } catch {
          /* sin almacenamiento: no hay nada que borrar */
        }
      }
      setClienteState({ ...CLIENTE_VACIO });
      setUltimo({});
      setCarrito({});
    },
  };

  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>;
}

export function useCarrito() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useCarrito debe usarse dentro de CarritoProvider');
  return v;
}
