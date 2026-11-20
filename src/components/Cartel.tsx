import { clp, medidaLinda } from '../lib/format';

interface Props {
  precio: number;
  medida: string;
  oferta?: boolean;
  /** Tamaño del número */
  tamano?: 'sm' | 'md' | 'lg';
  /** Leve inclinación, como un cartel pegado a mano */
  inclinado?: number;
  className?: string;
}

const TAMANOS = {
  sm: 'text-[1.15rem] px-2.5 py-1.5',
  md: 'text-[1.45rem] px-3 py-2',
  lg: 'text-[2.6rem] px-4 py-3',
};

/** Precio como letrero de cartulina de feria: amarillo normal, fucsia en oferta. */
export function Cartel({ precio, medida, oferta = false, tamano = 'md', inclinado = 0, className = '' }: Props) {
  return (
    <span
      className={`cartel inline-flex flex-col items-start ${oferta ? 'cartel-oferta' : ''} ${TAMANOS[tamano]} ${className}`}
      style={inclinado ? { transform: `rotate(${inclinado}deg)` } : undefined}
    >
      {oferta && <span className="mb-1 text-[0.62em] font-sans font-bold tracking-normal">¡Oferta!</span>}
      <span>{clp(precio)}</span>
      <span className="mt-1 font-sans text-[0.55em] font-bold">{medidaLinda(medida)}</span>
    </span>
  );
}
