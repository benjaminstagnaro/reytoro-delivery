import { useEffect, useRef, useState } from 'react';
import type { FotoArriendo } from '../content/arriendos';
import { Foto } from './Foto';

/**
 * Galería: una foto grande y las demás en cuadrícula.
 * Al tocar una foto se abre en pantalla completa, con botones grandes para pasar a la siguiente.
 */
export function Galeria({ fotos }: { fotos: FotoArriendo[] }) {
  const [abierta, setAbierta] = useState<number | null>(null);
  const reales = fotos.filter((f) => f.src);
  const [principal, ...resto] = fotos;
  // Debajo de las 3 grandes, máximo 8 recuadros: si hay más, el último dice "+N" y abre el visor.
  const abajo = resto.slice(2);
  const miniaturas = abajo.length > 8 ? abajo.slice(0, 7) : abajo;
  const ocultas = abajo.length > 8 ? abajo.slice(7) : [];

  const abrir = (f: FotoArriendo) => {
    const i = reales.indexOf(f);
    if (i >= 0) setAbierta(i);
  };

  const celda = (f: FotoArriendo, clase: string, prioridad = false, sizes?: string) =>
    f.src ? (
      <button
        key={f.src + f.alt}
        type="button"
        onClick={() => abrir(f)}
        className={`group relative overflow-hidden rounded-3xl ${clase}`}
        aria-label={`Ver en grande: ${f.alt}`}
      >
        <Foto foto={f} prioridad={prioridad} sizes={sizes} className="transition-transform duration-300 group-hover:scale-[1.03]" />
      </button>
    ) : (
      <div key={f.alt} className={`overflow-hidden rounded-3xl ${clase}`}>
        <Foto foto={f} />
      </div>
    );

  return (
    <>
      <div className="grid gap-3 md:grid-cols-[2fr_1fr] md:grid-rows-2">
        {principal && celda(principal, 'aspect-[4/3] md:row-span-2 md:aspect-auto', true, '(min-width: 768px) 66vw, 100vw')}
        {resto.slice(0, 2).map((f) => celda(f, 'aspect-[4/3]', false, '(min-width: 768px) 33vw, 100vw'))}
      </div>
      {miniaturas.length > 0 && (
        <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
          {miniaturas.map((f) => celda(f, 'aspect-[4/3]', false, '(min-width: 768px) 25vw, 50vw'))}
          {ocultas.length > 0 && (
            <button
              type="button"
              onClick={() => abrir(ocultas[0])}
              className="relative aspect-[4/3] overflow-hidden rounded-3xl"
              aria-label={`Ver ${ocultas.length} fotos más`}
            >
              <Foto foto={ocultas[0]} sizes="(min-width: 768px) 25vw, 50vw" />
              <span className="absolute inset-0 grid place-items-center bg-hoja/65 text-papel">
                <span className="titulo text-[2rem]">+{ocultas.length}</span>
              </span>
            </button>
          )}
        </div>
      )}
      {reales.length > 0 && <p className="mt-3 text-hoja-suave">{reales.length} fotos. Toca una para verla en grande.</p>}
      {abierta !== null && <Visor fotos={reales} inicio={abierta} onCerrar={() => setAbierta(null)} />}
    </>
  );
}

function Visor({ fotos, inicio, onCerrar }: { fotos: FotoArriendo[]; inicio: number; onCerrar: () => void }) {
  const [i, setI] = useState(inicio);
  const dialogo = useRef<HTMLDialogElement>(null);
  const toque = useRef<number | null>(null);
  const n = fotos.length;
  const ir = (d: number) => setI((x) => (x + d + n) % n);

  useEffect(() => {
    const d = dialogo.current;
    d?.showModal();
    const teclas = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') ir(1);
      if (e.key === 'ArrowLeft') ir(-1);
    };
    window.addEventListener('keydown', teclas);
    return () => window.removeEventListener('keydown', teclas);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const f = fotos[i];
  return (
    <dialog
      ref={dialogo}
      onClose={onCerrar}
      onCancel={onCerrar}
      className="m-0 h-dvh max-h-none w-screen max-w-none bg-hoja p-0 text-papel backdrop:bg-black/80"
      aria-label="Fotos en pantalla completa"
      onTouchStart={(e) => (toque.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (toque.current === null) return;
        const dx = e.changedTouches[0].clientX - toque.current;
        if (Math.abs(dx) > 50) ir(dx < 0 ? 1 : -1);
        toque.current = null;
      }}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between gap-3 p-3">
          <p className="font-bold" aria-live="polite">
            {f.alt}{' '}
            <span className="font-normal text-white/70">
              ({i + 1} de {n})
            </span>
          </p>
          <button type="button" onClick={() => dialogo.current?.close()} className="boton boton-principal min-h-12 px-5" autoFocus>
            Cerrar
          </button>
        </div>
        <div className="relative min-h-0 flex-1">
          <img src={`${import.meta.env.BASE_URL}${f.src}`} alt={f.alt} className="h-full w-full object-contain" />
        </div>
        <div className="flex justify-center gap-4 p-4">
          <button type="button" onClick={() => ir(-1)} className="boton boton-borde min-w-36 text-papel shadow-[inset_0_0_0_2px_#fff]">
            Anterior
          </button>
          <button type="button" onClick={() => ir(1)} className="boton boton-principal min-w-36">
            Siguiente
          </button>
        </div>
      </div>
    </dialog>
  );
}
