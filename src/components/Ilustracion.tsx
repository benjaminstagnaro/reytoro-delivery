import type { Producto } from '../lib/types';
import { normalizar } from '../lib/format';

/**
 * Ilustraciones de frutas y verduras (dibujadas en SVG, sin fotos).
 * Cuando haya fotos reales de productos, se pueden mostrar en lugar de estas.
 */
export type NombreIlustracion =
  'palta' | 'naranja' | 'tomate' | 'limon' | 'zanahoria' | 'lechuga' | 'frutilla' | 'huevo' | 'carne' | 'copo' | 'canasta';

const DIBUJOS: Record<NombreIlustracion, { viewBox: string; svg: React.ReactNode }> = {
  palta: {
    viewBox: '0 0 100 120',
    svg: (
      <>
        <path d="M50 4C33 4 26 26 22 44 16 70 12 92 30 108c12 10 28 10 40 0 18-16 14-38 8-64C74 26 67 4 50 4Z" fill="#3f6b2a" />
        <path d="M50 14c-12 0-17 18-20 33-5 22-7 40 6 52 8 7 20 7 28 0 13-12 11-30 6-52-3-15-8-33-20-33Z" fill="#cfe08a" />
        <circle cx="50" cy="72" r="17" fill="#8a5a2b" />
        <circle cx="45" cy="67" r="5" fill="#a9763f" />
      </>
    ),
  },
  naranja: {
    viewBox: '0 0 100 100',
    svg: (
      <>
        <circle cx="50" cy="52" r="44" fill="#f39a1e" />
        <circle cx="50" cy="52" r="36" fill="#ffc35a" />
        <path d="M50 18v68M16 52h68M26 28l48 48M74 28 26 76" stroke="#f7a325" strokeWidth="3" />
        <circle cx="50" cy="52" r="5" fill="#fff4d6" />
        <path d="M52 9c6-8 18-8 22-4-6 6-14 8-22 4Z" fill="#4c8a2e" />
      </>
    ),
  },
  tomate: {
    viewBox: '0 0 100 100',
    svg: (
      <>
        <circle cx="50" cy="56" r="40" fill="#e2412b" />
        <ellipse cx="36" cy="44" rx="9" ry="6" fill="#f37a62" />
        <path d="M50 22 40 12l10 6 8-10-2 12 14-2-12 8 12 6-14-1-6 9-2-10-12 4 8-8Z" fill="#3d7a2a" />
      </>
    ),
  },
  limon: {
    viewBox: '0 0 100 80',
    svg: (
      <>
        <ellipse cx="50" cy="40" rx="42" ry="30" fill="#f6d93a" />
        <path d="M8 40c-4-2-6-2-8 0 2 2 4 2 8 0ZM92 40c4-2 6-2 8 0-2 2-4 2-8 0Z" fill="#e8c51f" />
        <ellipse cx="38" cy="30" rx="12" ry="5" fill="#fbe983" />
      </>
    ),
  },
  zanahoria: {
    viewBox: '0 0 60 140',
    svg: (
      <>
        <path d="M30 138C22 120 10 64 12 48c2-12 34-12 36 0 2 16-10 72-18 90Z" fill="#f07a1d" />
        <path d="M18 64h8M34 80h8M20 96h7M32 110h6" stroke="#c85c0e" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M30 46C24 30 16 22 8 18c10 0 18 6 22 18 2-14 8-26 18-32-4 10-6 24-6 34-2-6 0 4-12 8Z" fill="#4a9a35" />
      </>
    ),
  },
  lechuga: {
    viewBox: '0 0 120 100',
    svg: (
      <>
        <path
          d="M60 96C26 96 6 76 10 52 12 34 26 22 38 26 40 12 56 4 66 14c10-8 28-2 30 14 14 0 22 16 18 30-4 22-24 38-54 38Z"
          fill="#5fa83a"
        />
        <path
          d="M60 92c-24 0-38-14-36-32 2-14 14-20 22-16 2-10 14-16 22-8 8-6 20 0 20 12 10 2 14 12 10 22-4 14-16 22-38 22Z"
          fill="#a6d465"
        />
        <path d="M60 90V36M60 60 44 48M60 70l18-14M60 78 42 68" stroke="#e6f3b5" strokeWidth="3" fill="none" strokeLinecap="round" />
      </>
    ),
  },
  frutilla: {
    viewBox: '0 0 100 110',
    svg: (
      <>
        <path d="M50 106C22 86 8 54 18 36c8-14 56-14 64 0 10 18-4 50-32 70Z" fill="#e3263f" />
        <g fill="#ffd9a8">
          <circle cx="34" cy="50" r="2.5" />
          <circle cx="50" cy="46" r="2.5" />
          <circle cx="66" cy="50" r="2.5" />
          <circle cx="40" cy="66" r="2.5" />
          <circle cx="58" cy="66" r="2.5" />
          <circle cx="50" cy="84" r="2.5" />
        </g>
        <path d="M50 36 30 28l12-4-6-12 14 8 4-14 4 14 14-8-6 12 12 4Z" fill="#3e8a2b" />
      </>
    ),
  },
  huevo: {
    viewBox: '0 0 80 100',
    svg: (
      <>
        <path d="M40 4C18 4 4 40 4 62c0 20 16 34 36 34s36-14 36-34C76 40 62 4 40 4Z" fill="#f4e3c8" stroke="#e2c9a0" strokeWidth="2" />
        <ellipse cx="28" cy="36" rx="7" ry="11" fill="#fff8ec" />
      </>
    ),
  },
  carne: {
    viewBox: '0 0 110 90',
    svg: (
      <>
        <path d="M14 46C10 24 30 6 56 8c26 2 46 18 44 40-2 24-26 36-50 34C28 80 18 66 14 46Z" fill="#d9483b" />
        <path d="M22 46c-2-16 14-30 34-28 20 2 34 14 32 30-2 18-20 26-38 24-16-2-26-12-28-26Z" fill="#ef6f5e" />
        <path d="M34 34c10 8 24 10 40 6M30 52c14 6 30 8 48 2" stroke="#fbd3c9" strokeWidth="4" fill="none" strokeLinecap="round" />
        <circle cx="76" cy="58" r="9" fill="#fff1e6" />
      </>
    ),
  },
  copo: {
    viewBox: '0 0 100 100',
    svg: (
      <g stroke="#2b7fb3" strokeWidth="7" strokeLinecap="round" fill="none">
        <path d="M50 8v84M14 29l72 42M14 71l72-42" />
        <path d="M40 16l10 10 10-10M40 84l10-10 10 10M16 42l14-3-4-14M84 58l-14 3 4 14M16 58l14 3-4 14M84 42l-14-3 4-14" />
      </g>
    ),
  },
  canasta: {
    viewBox: '0 0 120 100',
    svg: (
      <>
        <path d="M30 40c0-22 60-22 60 0" stroke="#8a5a2b" strokeWidth="7" fill="none" strokeLinecap="round" />
        <path d="M8 42h104l-12 50H20Z" fill="#b9814b" />
        <path d="M14 56h92M18 72h84" stroke="#9c6634" strokeWidth="5" />
        <rect x="6" y="36" width="108" height="12" rx="6" fill="#cf9a62" />
      </>
    ),
  },
};

export function Ilustracion({ nombre, className = '' }: { nombre: NombreIlustracion; className?: string }) {
  const d = DIBUJOS[nombre];
  return (
    <svg viewBox={d.viewBox} className={className} aria-hidden="true" focusable="false">
      {d.svg}
    </svg>
  );
}

/** Color de fondo de cada categoría (como los cajones de la feria). */
const COLORES: Record<string, string> = {
  frutas: 'var(--color-frutas)',
  verduras: 'var(--color-verduras)',
  carnes: 'var(--color-carnes)',
  huevos: 'var(--color-huevos)',
  congelados: 'var(--color-congelados)',
  otros: 'var(--color-otros)',
  ofertas: 'var(--color-oferta)',
};
export function colorCategoria(categoria: string): string {
  return COLORES[normalizar(categoria)] ?? 'var(--color-menta)';
}

const POR_CATEGORIA: Record<string, NombreIlustracion> = {
  frutas: 'naranja',
  verduras: 'lechuga',
  carnes: 'carne',
  huevos: 'huevo',
  congelados: 'copo',
  otros: 'canasta',
  ofertas: 'frutilla',
};
export function ilustracionCategoria(categoria: string): NombreIlustracion {
  return POR_CATEGORIA[normalizar(categoria)] ?? 'canasta';
}

/** Elige el dibujo según el nombre del producto (palta, tomate…) o, si no hay, según su categoría. */
const PALABRAS: [RegExp, NombreIlustracion][] = [
  [/palta/, 'palta'],
  [/naranj|clementin|mandarin|pomelo/, 'naranja'],
  [/tomate/, 'tomate'],
  [/limon/, 'limon'],
  [/zanahori/, 'zanahoria'],
  [/lechug|repollo|espinac|acelga|rucula|berro/, 'lechuga'],
  [/frutill|frambues|cereza|arandan|mora/, 'frutilla'],
  [/huevo/, 'huevo'],
];
export function ilustracionProducto(p: Pick<Producto, 'n' | 'c'>): NombreIlustracion {
  const n = normalizar(p.n);
  for (const [re, nombre] of PALABRAS) if (re.test(n)) return nombre;
  return ilustracionCategoria(p.c);
}
