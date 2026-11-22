import { CAJA_TORO, LADO_SELLO, SELLO, TORO } from './marcaTrazos';

/** Sello circular de Rey Toro (el logo original, en vector). Decorativo: el nombre siempre va escrito al lado. */
export function Logo({ size = 56, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox={`0 0 ${LADO_SELLO} ${LADO_SELLO}`}
      width={size}
      height={size}
      className={`shrink-0 ${className}`}
      aria-hidden="true"
      focusable="false"
    >
      <circle cx={LADO_SELLO / 2} cy={LADO_SELLO / 2} r={LADO_SELLO / 2} fill="#111" />
      <path fill="#fff" d={SELLO} />
    </svg>
  );
}

/** Solo el toro del logo, del color del texto (currentColor). */
export function Toro({ className = '' }: { className?: string }) {
  return (
    <svg viewBox={CAJA_TORO} className={className} aria-hidden="true" focusable="false">
      <path fill="currentColor" d={TORO} />
    </svg>
  );
}
