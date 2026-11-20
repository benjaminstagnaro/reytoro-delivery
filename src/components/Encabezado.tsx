import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router';
import { Logo } from './Logo';
import { useCarrito } from '../state/carrito';
import { useTamanoTexto } from '../state/tamanoTexto';

const SECCIONES = [
  { a: '/pedido', texto: 'Hacer pedido' },
  { a: '/food-truck', texto: 'Food truck' },
  { a: '/casa-en-la-playa', texto: 'Casa en la playa' },
];

const NOMBRE_TAMANO = { normal: 'Letra normal', grande: 'Letra grande', 'muy-grande': 'Letra muy grande' };

export function Encabezado() {
  const { resumen } = useCarrito();
  const { tamano, siguiente } = useTamanoTexto();
  const [abierto, setAbierto] = useState(false);
  const { pathname } = useLocation();
  const n = resumen?.productos ?? 0;

  useEffect(() => setAbierto(false), [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-tinta text-papel">
      <div className="contenedor flex min-h-[4.5rem] items-center gap-3">
        <Link to="/" className="flex items-center gap-3 rounded-full py-2 pr-2 no-underline" aria-label="Rey Toro Delivery, ir al inicio">
          <Logo size={48} className="shrink-0 ring-2 ring-naranjo" />
          <span className="letrero text-[1.05rem] leading-none whitespace-nowrap sm:text-[1.35rem]">
            Rey Toro
            <span className="block font-sans text-[0.72rem] font-bold tracking-wide text-naranjo-claro">Delivery</span>
          </span>
        </Link>

        <nav aria-label="Secciones" className="ml-auto hidden items-center gap-1 md:flex">
          {SECCIONES.map((s) => (
            <NavLink
              key={s.a}
              to={s.a}
              className={({ isActive }) =>
                `rounded-full px-4 py-2.5 font-bold no-underline hover:bg-white/10 ${isActive ? 'bg-white/15 text-cartulina' : ''}`
              }
            >
              {s.texto}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 md:ml-2">
          <button
            type="button"
            onClick={siguiente}
            className="grid h-12 min-w-12 place-items-center rounded-full border-2 border-white/40 px-3 font-bold hover:border-papel"
            aria-label={`Tamaño de letra: ${NOMBRE_TAMANO[tamano]}. Tocar para cambiar.`}
            title="Cambiar tamaño de letra"
          >
            <span aria-hidden="true">
              A<span className="text-[1.3em]">A</span>
            </span>
          </button>
          <Link
            to="/pedido/tu-pedido"
            className="relative grid size-12 place-items-center rounded-full bg-naranjo text-tinta no-underline hover:bg-naranjo-claro"
            aria-label={n ? `Tu pedido: ${n} ${n === 1 ? 'producto' : 'productos'}` : 'Tu pedido (vacío)'}
          >
            <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
              <path d="M3 4h2l2.4 11.2a1 1 0 0 0 1 .8h9.2a1 1 0 0 0 1-.8L20 8H6.2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="9.5" cy="20" r="1.4" />
              <circle cx="17" cy="20" r="1.4" />
            </svg>
            {n > 0 && (
              <span className="absolute -top-1 -right-1 grid min-w-6 place-items-center rounded-full bg-cartulina px-1 text-sm font-bold text-tinta ring-2 ring-tinta">
                {n}
              </span>
            )}
          </Link>
          <button
            type="button"
            className="grid size-12 place-items-center rounded-full border-2 border-white/40 md:hidden"
            aria-expanded={abierto}
            aria-controls="menu-movil"
            onClick={() => setAbierto((v) => !v)}
          >
            <span className="sr-only">{abierto ? 'Cerrar menú' : 'Abrir menú'}</span>
            <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
              {abierto ? <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" /> : <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />}
            </svg>
          </button>
        </div>
      </div>

      {abierto && (
        <nav id="menu-movil" aria-label="Secciones" className="border-t border-white/15 md:hidden">
          <ul className="contenedor flex flex-col py-2">
            <li>
              <NavLink to="/" end className="block rounded-lg px-3 py-3.5 text-lg font-bold no-underline hover:bg-white/10">
                Inicio
              </NavLink>
            </li>
            {SECCIONES.map((s) => (
              <li key={s.a}>
                <NavLink to={s.a} className="block rounded-lg px-3 py-3.5 text-lg font-bold no-underline hover:bg-white/10">
                  {s.texto}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
