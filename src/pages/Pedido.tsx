import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { ConCatalogo } from '../components/Estado';
import { FilaProducto } from '../components/FilaProducto';
import { useCarrito } from '../state/carrito';
import { useTitulo } from '../lib/useTitulo';
import { clp, normalizar } from '../lib/format';
import type { Catalogo } from '../lib/types';

export function Pedido() {
  useTitulo('Lista de precios');
  return <ConCatalogo>{(c) => <ListaPrecios catalogo={c} />}</ConCatalogo>;
}

type Filtro = { tipo: 'todo' } | { tipo: 'ofertas' } | { tipo: 'mios' };

function ListaPrecios({ catalogo }: { catalogo: Catalogo }) {
  const { productos, config } = catalogo;
  const { carrito, resumen, ultimo, repetirUltimo } = useCarrito();
  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro] = useState<Filtro>({ tipo: 'todo' });

  // Secciones en el orden de "Configuración"; si hay otras en la planilla, van al final.
  const categorias = useMemo(() => {
    const orden = config.categorias.map((c) => c.nombre).filter((n) => productos.some((p) => p.c === n));
    for (const p of productos) if (!orden.includes(p.c)) orden.push(p.c);
    return orden;
  }, [productos, config.categorias]);
  const emoji = (c: string) => config.categorias.find((k) => k.nombre === c)?.emoji ?? '';

  const visibles = useMemo(() => {
    const t = normalizar(busqueda.trim());
    return productos.filter((p) => {
      if (t && !normalizar(`${p.n} ${p.c}`).includes(t)) return false;
      if (filtro.tipo === 'ofertas') return p.o === 'OFERTA' || p.o === 'DESTACADO';
      if (filtro.tipo === 'mios') return (carrito[`${p.n}|${p.m}`] ?? 0) > 0;
      return true;
    });
  }, [productos, busqueda, filtro, carrito]);

  const hayCarrito = (resumen?.productos ?? 0) > 0;
  const hayUltimo = Object.keys(ultimo).length > 0;

  const irA = (c: string) => {
    setFiltro({ tipo: 'todo' });
    setBusqueda('');
    requestAnimationFrame(() => document.getElementById(idSeccion(c))?.scrollIntoView({ block: 'start' }));
  };

  return (
    <div className="pb-40">
      <div className="contenedor pt-8 pb-4">
        <h1 className="letrero text-[2.3rem] sm:text-[3rem]">Lista de precios</h1>
        <p className="mt-2 text-[1.1rem] text-gris">
          Toca <strong className="text-tinta">Agregar</strong> en lo que quieras. Cuando termines, revisa tu pedido abajo.
        </p>
        {!hayCarrito && hayUltimo && (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-tinta bg-cartulina p-4">
            <p className="font-bold">¿Quieres pedir lo mismo que la última vez?</p>
            <button type="button" className="boton boton-oscuro" onClick={repetirUltimo}>
              Repetir mi último pedido
            </button>
          </div>
        )}
      </div>

      <div className="contenedor pb-3">
        <label htmlFor="buscar" className="mb-1.5 block font-bold">
          Buscar un producto
        </label>
        <input
          id="buscar"
          type="search"
          className="campo"
          placeholder="Ej: palta, huevos, pollo…"
          value={busqueda}
          onChange={(e) => {
            setBusqueda(e.target.value);
            setFiltro({ tipo: 'todo' });
          }}
          autoComplete="off"
        />
      </div>

      {/* Secciones: quedan fijas arriba al bajar */}
      <div className="sticky top-[4.5rem] z-30 border-y border-linea bg-papel/95 backdrop-blur">
        <nav aria-label="Secciones de la lista" className="contenedor flex gap-2 overflow-x-auto py-2.5">
          {hayCarrito && (
            <Chip activo={filtro.tipo === 'mios'} destacado onClick={() => setFiltro(filtro.tipo === 'mios' ? { tipo: 'todo' } : { tipo: 'mios' })}>
              🛒 Mi pedido ({resumen?.productos})
            </Chip>
          )}
          <Chip activo={filtro.tipo === 'ofertas'} onClick={() => setFiltro(filtro.tipo === 'ofertas' ? { tipo: 'todo' } : { tipo: 'ofertas' })}>
            🔥 Ofertas
          </Chip>
          {categorias.map((c) => (
            <Chip key={c} onClick={() => irA(c)}>
              {emoji(c)} {c}
            </Chip>
          ))}
        </nav>
      </div>

      <div className="contenedor">
        {visibles.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-xl font-bold">No encontramos “{busqueda}”.</p>
            <p className="mt-2 text-gris">Prueba con otra palabra o escríbenos por WhatsApp y te lo conseguimos.</p>
          </div>
        )}
        {categorias.map((c) => {
          const de = visibles.filter((p) => p.c === c);
          if (!de.length) return null;
          return (
            <section key={c} id={idSeccion(c)} className="scroll-mt-[9rem] pt-8" aria-labelledby={`${idSeccion(c)}-t`}>
              <h2 id={`${idSeccion(c)}-t`} className="letrero flex items-center gap-3 text-[1.7rem]">
                <span aria-hidden="true">{emoji(c)}</span> {c}
                <span className="font-sans text-base font-normal text-gris">({de.length})</span>
              </h2>
              <ul className="mt-4 grid gap-3 lg:grid-cols-2">
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
  destacado = false,
  onClick,
}: {
  children: React.ReactNode;
  activo?: boolean;
  destacado?: boolean;
  onClick: () => void;
}) {
  const base = 'shrink-0 rounded-full border-2 px-4 py-2.5 font-bold whitespace-nowrap min-h-12';
  const estilo = destacado
    ? activo
      ? 'border-tinta bg-tinta text-cartulina'
      : 'border-naranjo bg-naranjo text-tinta'
    : activo
      ? 'border-tinta bg-tinta text-papel'
      : 'border-linea bg-papel hover:border-tinta';
  return (
    <button type="button" onClick={onClick} aria-pressed={activo} className={`${base} ${estilo}`}>
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
    <div className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-tinta bg-tinta pb-[env(safe-area-inset-bottom)] text-papel">
      <div className="contenedor py-3">
        <div className="flex items-center gap-4">
          <p className="letrero min-w-0 flex-1 text-[1.7rem] leading-none" aria-live="polite">
            {clp(resumen.subtotal)}
          </p>
          <Link
            to="/pedido/tu-pedido"
            className="boton boton-principal shrink-0"
            aria-disabled={vacio}
            tabIndex={vacio ? -1 : undefined}
          >
            Revisar pedido{!vacio && ` (${resumen.productos})`}
          </Link>
        </div>
        <p className={`mt-2 text-[0.95rem] font-bold ${!vacio && resumen.falta === 0 ? 'text-wa' : 'text-cartulina'}`}>{mensaje}</p>
        {minimo > 0 && (
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/20" aria-hidden="true">
            <div className={`h-full rounded-full ${resumen.avance >= 1 ? 'bg-wa' : 'bg-naranjo'}`} style={{ width: `${resumen.avance * 100}%` }} />
          </div>
        )}
      </div>
    </div>
  );
}
