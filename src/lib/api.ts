import type { Catalogo, DatosCliente, PedidoEnviado } from './types';
import { clp, claveProducto } from './format';

/**
 * Conexión con la planilla de Google (Apps Script).
 * - GET  {API}?api=catalogo  -> productos y configuración
 * - POST {API}               -> guarda el pedido y devuelve el número y el mensaje de WhatsApp
 *
 * Si no hay VITE_API_URL, la página funciona en "modo demo" con productos de ejemplo.
 */
const API_URL = (import.meta.env.VITE_API_URL ?? '').trim();
export const MODO_DEMO = !API_URL;

export async function obtenerCatalogo(): Promise<Catalogo> {
  const url = MODO_DEMO
    ? `${import.meta.env.BASE_URL}demo/catalogo.json`
    : `${API_URL}?api=catalogo`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('No pudimos cargar la lista de precios.');
  const datos = (await res.json()) as Catalogo;
  if (!Array.isArray(datos.productos)) throw new Error('La lista de precios llegó incompleta.');
  return datos;
}

export interface ItemPedido {
  n: string;
  m: string;
  q: number;
}

export async function enviarPedido(
  cliente: DatosCliente,
  items: ItemPedido[],
  catalogo: Catalogo,
  /** Campo trampa para robots: las personas nunca lo llenan */
  sitio = '',
): Promise<PedidoEnviado> {
  if (MODO_DEMO) return pedidoDemo(cliente, items, catalogo);
  // text/plain evita el "preflight" CORS que Apps Script no responde
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ ...cliente, items, sitio }),
  });
  if (!res.ok) throw new Error('No pudimos enviar tu pedido. Revisa tu conexión e inténtalo otra vez.');
  const r = (await res.json()) as { ok: boolean; error?: string; pedido?: PedidoEnviado };
  if (!r.ok || !r.pedido) throw new Error(r.error || 'No pudimos enviar tu pedido.');
  return r.pedido;
}

/** Simula lo que hace Apps Script, para probar la página sin tocar la planilla real. */
function pedidoDemo(cliente: DatosCliente, items: ItemPedido[], catalogo: Catalogo): Promise<PedidoEnviado> {
  const precios = new Map(catalogo.productos.map((p) => [claveProducto(p), p]));
  let subtotal = 0;
  const lineas = items.map((it) => {
    const p = precios.get(claveProducto(it));
    const total = (p?.p ?? 0) * it.q;
    subtotal += total;
    return `• ${it.q} × ${it.n} (${it.m}) = ${clp(total)}`;
  });
  const { minimo, envio } = catalogo.config;
  const despacho = subtotal >= minimo ? 0 : envio;
  const despachoTexto = subtotal >= minimo ? 'Gratis' : envio > 0 ? clp(envio) : 'Por confirmar';
  const ahora = new Date();
  const hecho = `${ahora.toLocaleDateString('es-CL')} a las ${ahora.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', hour12: false })}`;
  const mensaje = [
    `*Pedido N° 1 (DEMO) — ${catalogo.config.negocio}*`,
    `🕘 Hecho el ${hecho}`,
    '',
    ...lineas,
    '',
    `Subtotal: ${clp(subtotal)}`,
    `Despacho: ${despachoTexto}`,
    `*Total: ${clp(subtotal + despacho)}*`,
    '',
    `Nombre: ${cliente.nombre}`,
    `Teléfono: ${cliente.telefono}`,
    `Dirección: ${cliente.direccion}`,
  ].join('\n');
  return new Promise((ok) =>
    setTimeout(
      () =>
        ok({
          numero: 1,
          subtotal,
          despacho,
          despachoTexto,
          total: subtotal + despacho,
          hecho,
          mensaje,
          whatsapp: catalogo.config.whatsapp,
        }),
      500,
    ),
  );
}
