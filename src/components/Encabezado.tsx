import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router';
import { Logo } from './Logo';
import { useCarrito } from '../state/carrito';
import { useTamanoTexto } from '../state/tamanoTexto';

const SECCIONES = [
  { a: '/pedido', texto: 'Delivery' },
  { a: '/food-truck', texto: 'Food truck' },
  { a: '/casa-en-la-playa', texto: 'Casa en la playa' },
];

const NOMBRE_TAMANO = { normal: 'normal', grande: 'grande', 'muy-grande': 'muy grande' };

export function Encabezado() {
  const { resumen } = useCarrito();
  const { tamano, siguiente } = useTamanoTexto();
  const [abierto, setAbierto] = useState(false);
  const [conSombra, setConSombra] = useState(false);
  const { pathname } = useLocation();
  const n = resumen?.productos ?? 0;

  useEffect(() => setAbierto(false), [pathname]);
  useEffect(() => {
    const f = () => setConSombra(window.scrollY > 8);
    f();
    window.addEventListener('scroll', f, { passive: true });
    return () => window.removeEventListener('scroll', f);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 bg-papel/95 backdrop-blur transition-shadow ${conSombra ? 'shadow-[0_4px_20px_rgb(22_48_31/0.08)]' : ''}`}
    >
      <div className="contenedor flex min-h-[4.5rem] items-center gap-2 sm:gap-3">
        <Link
          to="/"
          className="flex min-w-0 shrink-0 items-center gap-2 rounded-full py-2 pr-1 no-underline sm:gap-3 sm:pr-2"
          aria-label="Rey Toro Delivery, ir al inicio"
        >
          <Logo size={44} />
          <span className="titulo-sm text-[1.2rem] whitespace-nowrap max-[25rem]:hidden sm:text-[1.3rem] [[data-texto=grande]_&]:max-[30rem]:hidden [[data-texto=muy-grande]_&]:max-sm:hidden">
            Rey Toro
          </span>
        </Link>

        <nav aria-label="Secciones" className="ml-4 hidden items-center gap-1 lg:flex">
          {SECCIONES.map((s) => (
            <NavLink
              key={s.a}
              to={s.a}
              className={({ isActive }) => `rounded-full px-4 py-2.5 font-bold no-underline hover:bg-menta ${isActive ? 'bg-menta' : ''}`}
            >
              {s.texto}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={siguiente}
            className="grid h-12 min-w-12 place-items-center rounded-full bg-menta px-2.5 font-bold hover:bg-menta-fuerte"
            aria-label={`Tamaño de letra ${NOMBRE_TAMANO[tamano]}. Tocar para cambiar.`}
            title="Cambiar tamaño de letra"
          >
            <span aria-hidden="true">
              A<span className="text-[1.3em]">A</span>
            </span>
          </button>
          <Link
            to="/pedido/tu-pedido"
            className="boton boton-oscuro min-h-12 gap-1.5 px-3 sm:px-5"
            aria-label={n ? `Mi pedido: ${n} ${n === 1 ? 'producto' : 'productos'}` : 'Mi pedido (vacío)'}
          >
            <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
              <path d="M3 4h2l2.4 11.2a1 1 0 0 0 1 .8h9.2a1 1 0 0 0 1-.8L20 8H6.2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="9.5" cy="20" r="1.4" />
              <circle cx="17" cy="20" r="1.4" />
            </svg>
            <span className="hidden sm:inline">Mi pedido</span>
            {n > 0 && <span className="grid min-w-7 place-items-center rounded-full bg-naranjo px-1.5 text-sm text-hoja">{n}</span>}
          </Link>
          <button
            type="button"
            className="grid size-12 place-items-center rounded-full bg-menta lg:hidden"
            aria-expanded={abierto}
            aria-controls="menu-movil"
            onClick={() => setAbierto((v) => !v)}
          >
            <span className="sr-only">{abierto ? 'Cerrar menú' : 'Abrir menú'}</span>
            <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
              {abierto ? (
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {abierto && (
        <nav id="menu-movil" aria-label="Secciones" className="border-t border-linea lg:hidden">
          <ul className="contenedor grid gap-2 py-4">
            {[{ a: '/', texto: 'Inicio' }, ...SECCIONES].map((s) => (
              <li key={s.a}>
                <NavLink
                  to={s.a}
                  end={s.a === '/'}
                  className={({ isActive }) =>
                    `block rounded-2xl px-5 py-4 text-[1.2rem] font-bold no-underline ${isActive ? 'bg-hoja text-papel' : 'bg-menta'}`
                  }
                >
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
