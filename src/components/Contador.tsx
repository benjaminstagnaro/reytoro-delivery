import { useEffect, useRef } from 'react';

interface Props {
  cantidad: number;
  nombre: string;
  onCambiar: (delta: number) => void;
}

/**
 * Botones grandes de − y + (mínimo 48 px, fáciles de tocar).
 * Al tocar "Agregar" el botón se cambia por − 1 +: el foco pasa al "+" (y al revés, a "Agregar"
 * cuando se quita el último), para que quien usa teclado o lector de pantalla no pierda su lugar.
 */
export function Contador({ cantidad, nombre, onCambiar }: Props) {
  const agregar = useRef<HTMLButtonElement>(null);
  const mas = useRef<HTMLButtonElement>(null);
  const moverFoco = useRef(false);

  useEffect(() => {
    if (!moverFoco.current) return;
    moverFoco.current = false;
    (cantidad === 0 ? agregar : mas).current?.focus();
  }, [cantidad]);

  const cambiar = (d: number) => {
    // Solo si el botón que tiene el foco va a desaparecer
    if ((cantidad === 0 && d > 0) || (cantidad === 1 && d < 0)) moverFoco.current = document.activeElement instanceof HTMLButtonElement;
    onCambiar(d);
  };

  if (cantidad === 0) {
    return (
      <button
        ref={agregar}
        type="button"
        onClick={() => cambiar(1)}
        className="boton boton-oscuro min-h-12 shrink-0 px-5 text-base"
        aria-label={`Agregar ${nombre}`}
      >
        <span aria-hidden="true" className="text-xl leading-none">
          +
        </span>{' '}
        Agregar
      </button>
    );
  }
  return (
    <div className="flex shrink-0 items-center gap-1 rounded-full bg-menta p-1" role="group" aria-label={`Cantidad de ${nombre}`}>
      <button
        type="button"
        onClick={() => cambiar(-1)}
        className="grid size-11 place-items-center rounded-full bg-papel text-2xl leading-none hover:bg-menta-fuerte"
        aria-label={cantidad === 1 ? `Quitar ${nombre}` : `Uno menos de ${nombre}`}
      >
        −
      </button>
      <span className="min-w-8 text-center text-lg font-bold" aria-live="polite">
        {cantidad}
      </span>
      <button
        ref={mas}
        type="button"
        onClick={() => cambiar(1)}
        className="grid size-11 place-items-center rounded-full bg-hoja text-2xl leading-none text-papel hover:bg-[#234a31]"
        aria-label={`Uno más de ${nombre}`}
      >
        +
      </button>
    </div>
  );
}
