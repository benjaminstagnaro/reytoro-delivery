import type { FotoArriendo } from '../content/arriendos';

const BASE = import.meta.env.BASE_URL;

/** Versión chica para celulares: "x.webp" -> "x-640.webp" (si existe). */
function srcChica(src: string) {
  return src.endsWith('.webp') ? src.replace(/\.webp$/, '-640.webp') : '';
}

/**
 * Foto real si existe; si no, un recuadro "foto pendiente" para saber qué falta.
 * Las fotos van en /public/fotos/… (ver content/arriendos.ts).
 */
export function Foto({
  foto,
  className = '',
  prioridad = false,
  sizes = '(min-width: 768px) 50vw, 100vw',
}: {
  foto: FotoArriendo;
  className?: string;
  prioridad?: boolean;
  sizes?: string;
}) {
  if (foto.src) {
    const chica = srcChica(foto.src);
    return (
      <img
        src={`${BASE}${foto.src}`}
        srcSet={chica ? `${BASE}${chica} 640w, ${BASE}${foto.src} 1280w` : undefined}
        sizes={chica ? sizes : undefined}
        alt={foto.alt}
        loading={prioridad ? 'eager' : 'lazy'}
        decoding="async"
        className={`h-full w-full object-cover ${className}`}
      />
    );
  }
  return (
    <div
      className={`foto-pendiente grid h-full w-full place-items-center p-4 text-center ${className}`}
      role="img"
      aria-label={`${foto.alt} (foto pendiente)`}
    >
      <div>
        <span className="text-4xl" aria-hidden="true">
          📷
        </span>
        <p className="mt-2 font-bold text-hoja-suave">{foto.alt}</p>
        <p className="text-sm text-hoja-suave">Foto pendiente</p>
      </div>
    </div>
  );
}
