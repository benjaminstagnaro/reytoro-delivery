interface Props {
  cantidad: number;
  nombre: string;
  onCambiar: (delta: number) => void;
}

/** Botones grandes de − y + (mínimo 48 px, fáciles de tocar). */
export function Contador({ cantidad, nombre, onCambiar }: Props) {
  if (cantidad === 0) {
    return (
      <button
        type="button"
        onClick={() => onCambiar(1)}
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
        onClick={() => onCambiar(-1)}
        className="grid size-11 place-items-center rounded-full bg-papel text-2xl leading-none hover:bg-menta-fuerte"
        aria-label={cantidad === 1 ? `Quitar ${nombre}` : `Uno menos de ${nombre}`}
      >
        −
      </button>
      <span className="min-w-8 text-center text-lg font-bold" aria-live="polite">
        {cantidad}
      </span>
      <button
        type="button"
        onClick={() => onCambiar(1)}
        className="grid size-11 place-items-center rounded-full bg-hoja text-2xl leading-none text-papel hover:bg-[#234a31]"
        aria-label={`Uno más de ${nombre}`}
      >
        +
      </button>
    </div>
  );
}
