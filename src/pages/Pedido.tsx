import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { ConCatalogo } from '../components/Estado';
import { FilaProducto } from '../components/FilaProducto';
import { Ilustracion, colorCategoria, ilustracionCategoria } from '../components/Ilustracion';
import { useCarrito } from '../state/carrito';
import { useTitulo } from '../lib/useTitulo';
import { clp, normalizar } from '../lib/format';
import type { Catalogo } from '../lib/types';

export function Pedido() {
  useTitulo('Lista de precios');
  return <ConCatalogo>{(c) => <ListaPrecios catalogo={c} />}</ConCatalogo>;
}

type Filtro = 'todo' | 'ofertas' | 'mios';

function ListaPrecios({ catalogo }: { catalogo: Catalogo }) {
  const { productos, config } = catalogo;
  const { carrito, resumen, ultimo, repetirUltimo } = useCarrito();
  const [params] = useSearchParams();
  const [busqueda, setBusqueda] = useState(params.get('buscar') ?? '');
  const [filtro, setFiltro] = useState<Filtro>(params.get('ver') === 'ofertas' ? 'ofertas' : 'todo');

  // Secciones en el orden de "Configuración"; si hay otras en la planilla, van al final.
  const categorias = useMemo(() => {
    const orden = config.categorias.map((c) => c.nombre).filter((n) => productos.some((p) => p.c === n));
    for (const p of productos) if (!orden.includes(p.c)) orden.push(p.c);
    return orden;
  }, [productos, config.categorias]);

  const visibles = useMemo(() => {
    const t = normalizar(busqueda.trim());
    return productos.filter((p) => {
      if (t && !normalizar(`${p.n} ${p.c}`).includes(t)) return false;
      if (filtro === 'ofertas') return p.o === 'OFERTA' || p.o === 'DESTACADO';
      if (filtro === 'mios') return (carrito[`${p.n}|${p.m}`] ?? 0) > 0;
      return true;
    });
  }, [productos, busqueda, filtro, carrito]);

  const hayCarrito = (resumen?.productos ?? 0) > 0;
  const hayUltimo = Object.keys(ultimo).length > 0;

  const irA = (c: string) => {
    setFiltro('todo');
    setBusqueda('');
    requestAnimationFrame(() => document.getElementById(idSeccion(c))?.scrollIntoView({ block: 'start' }));
  };

  // Si se llegó desde una categoría de la portada, bajar a esa sección.
  useEffect(() => {
    const s = params.get('seccion');
    if (s) requestAnimationFrame(() => document.getElementById(idSeccion(s))?.scrollIntoView({ block: 'start' }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="pb-44">
      <section className="px-3 pt-2 md:px-6">
        <div className="panel bg-menta">
          <div className="contenedor py-10 md:py-14">
            <h1 className="titulo text-[2.6rem] sm:text-[3.6rem]">Lista de precios</h1>
            <p className="mt-3 max-w-2xl text-[1.2rem] text-hoja-suave">
              Toca <strong className="text-hoja">Agregar</strong> en lo que quieras. Cuando termines, revisa tu pedido en la barra de abajo.
            </p>
            <div className="sombra-suave mt-6 flex max-w-xl items-center gap-2 rounded-full bg-papel p-2 pl-5">
              <svg
                viewBox="0 0 24 24"
                className="size-6 shrink-0 text-hoja-suave"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" strokeLinecap="round" />
              </svg>
              <label htmlFor="buscar" className="sr-only">
                Buscar un producto
              </label>
              <input
                id="buscar"
                type="search"
                className="min-h-12 min-w-0 flex-1 bg-transparent text-[1.05rem] outline-none"
                placeholder="Buscar: palta, huevos, pollo…"
                value={busqueda}
                onChange={(e) => {
                  setBusqueda(e.target.value);
                  setFiltro('todo');
                }}
                autoComplete="off"
              />
            </div>
            {!hayCarrito && hayUltimo && (
              <div className="mt-6 flex max-w-xl flex-wrap items-center justify-between gap-3 rounded-3xl bg-papel p-4">
                <p className="font-bold">¿Lo mismo que la última vez?</p>
                <button type="button" className="boton boton-oscuro" onClick={repetirUltimo}>
                  Repetir mi último pedido
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Secciones: quedan fijas arriba al bajar */}
      <div className="sticky top-[4.5rem] z-30 bg-papel/95 backdrop-blur">
        <nav aria-label="Secciones de la lista" className="contenedor flex gap-2 overflow-x-auto py-3">
          {hayCarrito && (
            <Chip activo={filtro === 'mios'} color="var(--color-naranjo)" onClick={() => setFiltro(filtro === 'mios' ? 'todo' : 'mios')}>
              🛒 Mi pedido ({resumen?.productos})
            </Chip>
          )}
          <Chip
            activo={filtro === 'ofertas'}
            color={colorCategoria('ofertas')}
            onClick={() => setFiltro(filtro === 'ofertas' ? 'todo' : 'ofertas')}
          >
            Ofertas
          </Chip>
          {categorias.map((c) => (
            <Chip key={c} color={colorCategoria(c)} onClick={() => irA(c)}>
              {c}
            </Chip>
          ))}
        </nav>
      </div>

      <div className="contenedor">
        {visibles.length === 0 && (
          <div className="py-16 text-center">
            <p className="titulo-sm text-[1.6rem]">No encontramos “{busqueda}”.</p>
            <p className="mt-2 text-[1.1rem] text-hoja-suave">Prueba con otra palabra, o escríbenos por WhatsApp y te lo conseguimos.</p>
          </div>
        )}
        {categorias.map((c) => {
          const de = visibles.filter((p) => p.c === c);
          if (!de.length) return null;
          return (
            <section key={c} id={idSeccion(c)} className="scroll-mt-[9rem] pt-10" aria-labelledby={`${idSeccion(c)}-t`}>
              <h2 id={`${idSeccion(c)}-t`} className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="grid size-14 place-items-center rounded-2xl" style={{ background: colorCategoria(c) }} aria-hidden="true">
                  <Ilustracion nombre={ilustracionCategoria(c)} className="size-9" />
                </span>
                <span className="titulo min-w-0 text-[2rem] break-words">{c}</span>
                <span className="text-[1.05rem] text-hoja-suave">{de.length}</span>
              </h2>
              <ul className="mt-5 grid gap-3 lg:grid-cols-2">
                {de.map((p) => (
                  <FilaProducto key={p.n + p.m} producto={p} />
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      {resumen && <BarraPedido resumen={resumen} minimo={config.minimo} />}
    </div>
  );
}

function idSeccion(c: string) {
  return 'seccion-' + normalizar(c).replace(/[^a-z0-9]+/g, '-');
}

function Chip({
  children,
  activo = false,
  color,
  onClick,
}: {
  children: React.ReactNode;
  activo?: boolean;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activo}
      className={`flex min-h-12 shrink-0 items-center gap-2 rounded-full px-4 py-2.5 font-bold whitespace-nowrap ${
        activo ? 'bg-hoja text-papel' : 'bg-menta hover:bg-menta-fuerte'
      }`}
    >
      <span className="size-3.5 rounded-full ring-2 ring-white/70" style={{ background: color }} aria-hidden="true" />
      {children}
    </button>
  );
}

/** Barra fija abajo con el total y el avance hacia el despacho gratis. */
function BarraPedido({ resumen, minimo }: { resumen: NonNullable<ReturnType<typeof useCarrito>['resumen']>; minimo: number }) {
  const vacio = resumen.productos === 0;
  const mensaje = vacio
    ? 'Toca "Agregar" para empezar'
    : minimo > 0 && resumen.falta > 0
      ? `Te faltan ${clp(resumen.falta)} para despacho gratis`
      : '¡Tu despacho es gratis!';
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 px-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] md:px-6">
      <div className="mx-auto max-w-[76rem] rounded-[1.75rem] bg-hoja px-5 py-3.5 text-papel shadow-[0_-6px_30px_rgb(22_48_31/0.25)]">
        <div className="flex items-center gap-4">
          <p className="titulo-sm min-w-0 flex-1 text-[1.6rem] leading-none sm:text-[1.9rem]" aria-live="polite">
            {clp(resumen.subtotal)}
          </p>
          <Link to="/pedido/tu-pedido" className="boton boton-principal shrink-0" aria-disabled={vacio} tabIndex={vacio ? -1 : undefined}>
            <span className="sm:hidden">Continuar</span>
            <span className="hidden sm:inline">Revisar pedido</span>
            {!vacio && ` (${resumen.productos})`}
          </Link>
        </div>
        <p className={`mt-2 text-[0.98rem] font-bold ${!vacio && resumen.falta === 0 ? 'text-wa' : 'text-naranjo-claro'}`}>{mensaje}</p>
        {minimo > 0 && (
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/20" aria-hidden="true">
            <div
              className={`h-full rounded-full transition-[width] duration-300 ${resumen.avance >= 1 ? 'bg-wa' : 'bg-naranjo'}`}
              style={{ width: `${resumen.avance * 100}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
