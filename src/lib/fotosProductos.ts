import type { Producto } from './types';
import { normalizar } from './format';

/**
 * Fotos de referencia de productos (public/fotos/productos/<archivo>-256.webp y -640.webp).
 * Se buscan por palabras del nombre. "excluir" evita poner una foto que no corresponde
 * (por ejemplo, la foto de tomates grandes en los tomates cherry).
 * Para agregar una foto nueva: guardar los dos tamaños y sumar una línea aquí.
 */
const FOTOS: { si: RegExp; excluir?: RegExp; archivo: string }[] = [
  { si: /\bpalta/, archivo: 'paltas' },
  { si: /\bfrutilla/, archivo: 'frutillas' },
  { si: /\bnaranja/, archivo: 'naranjas' },
  { si: /\blimon(es)? sutil|\blima\b/, archivo: 'limon-sutil' },
  { si: /\blimon/, archivo: 'limones' },
  { si: /\bmango/, archivo: 'mango' },
  { si: /\bmanzana.*verde|\bverde.*manzana/, archivo: 'manzana-verde' },
  { si: /\bmanzana/, archivo: 'manzana-roja' },
  { si: /\bmelon.*tuna/, archivo: 'melon-tuna' },
  { si: /\bmelon.*calame/, archivo: 'melon-calameno' },
  { si: /\bplatano/, archivo: 'platanos' },
  { si: /\btomate/, excluir: /cherry/, archivo: 'tomates' },
  { si: /\bcebolla/, excluir: /morada|cebollin/, archivo: 'cebollas' },
  { si: /\bpapa/, excluir: /camote|papaya/, archivo: 'papas' },
  { si: /\bzanahoria/, archivo: 'zanahorias' },
  { si: /\blechuga/, excluir: /morada|rosada|roble/, archivo: 'lechuga' },
  { si: /\bcilantro/, archivo: 'cilantro' },
  { si: /\bperejil/, archivo: 'perejil' },
  { si: /\bhuevo/, excluir: /codorniz/, archivo: 'huevos' },
];

/** Solo productos frescos: así "cebolla en polvo" o "plátano confitado" no usan la foto de la fruta. */
const CATEGORIAS = /frut|verdur|huevo/;

export interface FotoProducto {
  chica: string;
  grande: string;
}

export function fotoProducto(p: Pick<Producto, 'n' | 'c'>): FotoProducto | null {
  if (!CATEGORIAS.test(normalizar(p.c))) return null;
  const n = normalizar(p.n);
  for (const f of FOTOS) {
    if (f.si.test(n) && !f.excluir?.test(n)) return rutas(f.archivo);
  }
  return null;
}

export function rutas(archivo: string): FotoProducto {
  const base = `${import.meta.env.BASE_URL}fotos/productos/${archivo}`;
  return { chica: `${base}-256.webp`, grande: `${base}-640.webp` };
}
