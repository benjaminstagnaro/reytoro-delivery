import type { Config, Producto } from './types';
import { claveProducto } from './format';

/** El carrito guarda solo cantidades por producto (clave = nombre|medida). */
export type Carrito = Record<string, number>;

export const MAX_CANTIDAD = 99;

export function cambiarCantidad(carrito: Carrito, clave: string, delta: number): Carrito {
  const q = Math.max(0, Math.min(MAX_CANTIDAD, (carrito[clave] ?? 0) + delta));
  const nuevo = { ...carrito };
  if (q > 0) nuevo[clave] = q;
  else delete nuevo[clave];
  return nuevo;
}

/** Quita del carrito los productos que ya no están en la lista (agotados o renombrados). */
export function limpiarCarrito(carrito: Carrito, productos: Producto[]): Carrito {
  const existentes = new Set(productos.map(claveProducto));
  return Object.fromEntries(Object.entries(carrito).filter(([k, q]) => existentes.has(k) && q > 0));
}

export interface Resumen {
  /** Cantidad de productos distintos */
  productos: number;
  subtotal: number;
  despacho: number;
  despachoTexto: string;
  total: number;
  /** Cuánto falta para el despacho gratis (0 si ya se alcanzó) */
  falta: number;
  /** Avance hacia el despacho gratis, de 0 a 1 */
  avance: number;
}

export function resumir(carrito: Carrito, productos: Producto[], config: Pick<Config, 'minimo' | 'envio'>): Resumen {
  const precios = new Map(productos.map((p) => [claveProducto(p), p.p]));
  let subtotal = 0;
  let n = 0;
  for (const [k, q] of Object.entries(carrito)) {
    const precio = precios.get(k);
    if (precio === undefined) continue;
    subtotal += precio * q;
    n += 1;
  }
  const { minimo, envio } = config;
  let despacho = 0;
  let despachoTexto = '—';
  if (subtotal > 0) {
    if (subtotal >= minimo) despachoTexto = 'Gratis';
    else if (envio > 0) {
      despacho = envio;
      despachoTexto = '$' + envio.toLocaleString('es-CL');
    } else despachoTexto = 'Por confirmar';
  }
  return {
    productos: n,
    subtotal,
    despacho,
    despachoTexto,
    total: subtotal + despacho,
    falta: Math.max(0, minimo - subtotal),
    avance: minimo > 0 ? Math.min(1, subtotal / minimo) : subtotal > 0 ? 1 : 0,
  };
}
