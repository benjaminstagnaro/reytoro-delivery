import type { Producto } from './types';

/** 5990 -> "$5.990" */
export function clp(n: number): string {
  return (
    '$' +
    Math.round(n)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  );
}

/** Clave única de un producto (nombre + medida), igual que en Apps Script. */
export function claveProducto(p: Pick<Producto, 'n' | 'm'>): string {
  return `${p.n}|${p.m}`;
}

/** "PALTA HASS OFERTA" -> "Palta hass oferta" */
export function nombreLindo(nombre: string): string {
  const s = nombre.trim().toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Quita "OFERTA" del nombre cuando ya se muestra la etiqueta de oferta. */
export function nombreSinOferta(nombre: string): string {
  return nombre
    .replace(/\s*\b(super\s+)?oferta\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const UNIDADES: Record<string, string> = {
  KILO: 'el kilo',
  'SOLO KILO': 'el kilo',
  UNIDAD: 'la unidad',
  PAQUETE: 'el paquete',
  BANDEJA: 'la bandeja',
  MATA: 'la mata',
  DOCENA: 'la docena',
  OCTAVO: 'el octavo',
  CAJA: 'la caja',
  MALLA: 'la malla',
};

/**
 * Convierte la medida de la planilla en una frase natural para acompañar el precio.
 * "KILO" -> "el kilo" · "500 GRS" -> "500 g" · "3 KILOS" -> "3 kilos" · "30 UNIDADES" -> "30 unidades"
 */
export function medidaLinda(medida: string): string {
  const s = medida.trim().toUpperCase().replace(/\s+/g, ' ');
  if (UNIDADES[s]) return UNIDADES[s];
  let r = /^(\d+(?:[.,]\d+)?) ?(GRS|GR|G)$/.exec(s);
  if (r) return `${r[1]} g`;
  r = /^(\d+(?:[.,]\d+)?) ?(KILOS?|KG)$/.exec(s);
  if (r) return Number(r[1].replace(',', '.')) === 1 ? '1 kilo' : `${r[1]} kilos`;
  r = /^(\d+) ?(UNIDADES|UNIDAD|UN)$/.exec(s);
  if (r) return Number(r[1]) === 1 ? '1 unidad' : `${r[1]} unidades`;
  r = /^(\d+) ?ML$/.exec(s);
  if (r) return `${r[1]} ml`;
  return s.toLowerCase();
}

/** ¿Se lee como "el kilo" (precio por unidad de medida) o como un pack ("3 kilos")? */
export function esPrecioPorUnidad(medida: string): boolean {
  return medidaLinda(medida).startsWith('el ') || medidaLinda(medida).startsWith('la ');
}

/** Texto para comparar en el buscador: sin mayúsculas ni tildes. */
export function normalizar(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

/** ['A', 'B', 'C'] → "A, B y C" */
export function listaBonita(xs: string[]): string {
  return xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} y ${xs[xs.length - 1]}`;
}

/** true si la fecha "AAAA-MM-DD" cae sábado o domingo */
export function esFinDeSemana(fecha: string): boolean {
  const f = fecha.split('-').map(Number);
  if (f.length !== 3 || f.some((x) => !x)) return false;
  const d = new Date(f[0], f[1] - 1, f[2]).getDay();
  return d === 0 || d === 6;
}

/** ¿Se despacha solo de lunes a viernes? (según el texto de Configuración) */
export function soloDiasHabiles(dias?: string): boolean {
  return /lunes a viernes/i.test(dias ?? '');
}
