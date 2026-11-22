import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { FilaProducto } from '../components/FilaProducto';
import { Ilustracion, colorCategoria, ilustracionCategoria } from '../components/Ilustracion';
import { rutas } from '../lib/fotosProductos';
import { useCatalogo } from '../state/catalogo';
import { useTitulo } from '../lib/useTitulo';
import { clp } from '../lib/format';
import { casaPlaya, foodTruck } from '../content/arriendos';
import { Foto } from '../components/Foto';
import { Logo } from '../components/Logo';

// Fotos de la portada, en círculos con el color de cada fruta como borde.
const BURBUJAS: { archivo: string; color: string; clase: string; retraso: number }[] = [
  { archivo: 'naranjas', color: '#ffcf8a', clase: 'left-[4%] top-[2%] w-[48%]', retraso: 0 },
  { archivo: 'frutillas', color: '#ff9c8a', clase: 'left-[52%] top-0 w-[40%]', retraso: 120 },
  { archivo: 'paltas', color: '#bfe39a', clase: 'left-[40%] top-[42%] w-[54%]', retraso: 240 },
];

const PASOS = [
  { titulo: 'Elige', texto: 'Mira los precios del día y toca "Agregar" en lo que quieras.' },
  { titulo: 'Envía', texto: 'Escribe tu dirección y mándanos el pedido por WhatsApp con un botón.' },
  { titulo: 'Recibe', texto: 'Te lo llevamos a la casa y pagas por transferencia al recibir.' },
];

export function Inicio() {
  useTitulo('Frutas y verduras a domicilio');
  const { estado } = useCatalogo();
  const catalogo = estado.tipo === 'listo' ? estado.catalogo : null;
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState('');

  const ofertas = catalogo ? catalogo.productos.filter((p) => p.o === 'OFERTA' || p.o === 'DESTACADO') : [];
  const categorias = catalogo
    ? catalogo.config.categorias.map((c) => ({ ...c, n: catalogo.productos.filter((p) => p.c === c.nombre).length })).filter((c) => c.n > 0)
    : [];

  function buscar(e: FormEvent) {
    e.preventDefault();
    navigate(busqueda.trim() ? `/pedido?buscar=${encodeURIComponent(busqueda.trim())}` : '/pedido');
  }

  return (
    <>
      {/* Portada */}
      <section className="px-3 pt-2 md:px-6">
        <div className="panel relative overflow-hidden bg-menta">
          <div className="contenedor grid grid-cols-1 items-center gap-8 py-12 md:grid-cols-[1.15fr_1fr] md:py-20">
            <div>
              <h1 className="titulo text-[clamp(2.3rem,11vw,2.9rem)] sm:text-[4rem] lg:text-[5.2rem]">
                Fruta y verdura fresca, a tu puerta.
              </h1>
              <p className="mt-6 max-w-xl text-[1.25rem] text-hoja-suave">
                Elegida cada madrugada en La Vega. Pides en minutos desde el celular y pagas al recibir.
              </p>

              <form
                onSubmit={buscar}
                role="search"
                className="sombra-suave mt-8 flex max-w-xl items-center gap-2 rounded-full bg-papel p-2"
              >
                <label htmlFor="buscar-inicio" className="sr-only">
                  ¿Qué necesitas hoy?
                </label>
                <input
                  id="buscar-inicio"
                  type="search"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="¿Qué necesitas hoy? Ej: paltas"
                  className="min-h-12 min-w-0 flex-1 rounded-full bg-transparent px-4 text-[1.05rem] outline-none focus-visible:shadow-none"
                  autoComplete="off"
                />
                <button type="submit" className="boton boton-principal shrink-0">
                  Buscar
                </button>
              </form>

              <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 font-bold">
                {catalogo && catalogo.config.minimo > 0 && (
                  <li className="flex items-center gap-2">
                    <Check /> Despacho gratis desde {clp(catalogo.config.minimo)}
                  </li>
                )}
                <li className="flex items-center gap-2">
                  <Check /> Pagas al recibir
                </li>
              </ul>
            </div>

            <div className="relative mx-auto aspect-square w-full max-w-[30rem]" aria-hidden="true">
              {/* El sello de Rey Toro, como un timbre entre la fruta */}
              <div
                className="burbuja absolute top-[54%] left-0 w-[38%] -rotate-[10deg] rounded-full shadow-[0_14px_30px_rgb(17_17_17/0.25)] ring-[6px] ring-papel"
                style={{ animationDelay: '360ms' }}
              >
                <Logo size={200} className="h-auto w-full" />
              </div>
              {BURBUJAS.map((b) => (
                <div
                  key={b.archivo}
                  className={`burbuja absolute aspect-square rounded-full p-[5%] ${b.clase}`}
                  style={{ background: b.color, animationDelay: `${b.retraso}ms` }}
                >
                  <img
                    src={rutas(b.archivo).grande}
                    alt=""
                    width={640}
                    height={640}
                    fetchPriority={b.retraso === 0 ? 'high' : undefined}
                    className="h-full w-full rounded-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categorías: cada una con su color, como los cajones de la feria */}
      {categorias.length > 0 && (
        <section className="contenedor pt-6" aria-label="Categorías">
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7 [&>li:last-child:nth-child(odd)]:col-span-2 sm:[&>li:last-child:nth-child(odd)]:col-span-1">
            <li>
              <Link
                to="/pedido?ver=ofertas"
                className="relative flex h-36 flex-col overflow-hidden rounded-3xl p-5 no-underline transition-transform hover:-translate-y-1 md:h-40"
                style={{ background: colorCategoria('ofertas') }}
              >
                <span className="titulo-sm text-[1.45rem]">Ofertas</span>
                <span className="text-[0.95rem] font-bold">de esta semana</span>
                <Ilustracion nombre="frutilla" className="absolute -right-2 -bottom-3 size-24" />
              </Link>
            </li>
            {categorias.map((c) => (
              <li key={c.nombre}>
                <Link
                  to={`/pedido?seccion=${encodeURIComponent(c.nombre)}`}
                  className="relative flex h-36 flex-col overflow-hidden rounded-3xl p-5 no-underline transition-transform hover:-translate-y-1 md:h-40"
                  style={{ background: colorCategoria(c.nombre) }}
                >
                  <span className="titulo-sm text-[1.45rem]">{c.nombre}</span>
                  <span className="text-[0.95rem] font-bold">
                    {c.n} {c.n === 1 ? 'producto' : 'productos'}
                  </span>
                  <Ilustracion nombre={ilustracionCategoria(c.nombre)} className="absolute -right-2 -bottom-3 size-24" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Ofertas */}
      {ofertas.length > 0 && (
        <section id="ofertas" className="contenedor scroll-mt-24 py-16 md:py-24" aria-labelledby="titulo-ofertas">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 id="titulo-ofertas" className="titulo text-[2.3rem] sm:text-[3rem]">
                Ofertas de esta semana
              </h2>
              <p className="mt-2 text-[1.1rem] text-hoja-suave">Agrégalas a tu pedido desde aquí mismo.</p>
            </div>
            <Link to="/pedido" className="boton boton-suave">
              Ver todos los productos
            </Link>
          </div>
          <ul className="mt-8 grid gap-3 md:grid-cols-2">
            {ofertas.slice(0, 6).map((p) => (
              <FilaProducto key={p.n + p.m} producto={p} />
            ))}
          </ul>
        </section>
      )}

      {/* Cómo funciona: es una secuencia real, por eso va numerada */}
      <section className="px-3 md:px-6" aria-labelledby="como-funciona">
        <div className="panel bg-hoja text-papel">
          <div className="contenedor py-14 md:py-20">
            <h2 id="como-funciona" className="titulo text-[2.3rem] sm:text-[3rem]">
              Pedir es así de simple
            </h2>
            <ol className="mt-10 grid gap-8 md:grid-cols-3">
              {PASOS.map((p, i) => (
                <li key={p.titulo} className="flex gap-5">
                  <span
                    className="titulo grid size-16 shrink-0 place-items-center rounded-full bg-naranjo text-[2rem] text-hoja"
                    aria-hidden="true"
                  >
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="titulo-sm text-[1.6rem]">{p.titulo}</h3>
                    <p className="mt-1 text-[1.1rem] text-white/80">{p.texto}</p>
                  </div>
                </li>
              ))}
            </ol>
            <Link to="/pedido" className="boton boton-principal mt-10">
              Hacer mi pedido
            </Link>
          </div>
        </div>
      </section>

      {/* Historia */}
      <section className="contenedor grid items-center gap-10 py-16 md:grid-cols-2 md:py-24">
        <div className="relative grid aspect-[4/3] place-items-center overflow-hidden rounded-[2rem] bg-[#ffe9c9]" aria-hidden="true">
          <Ilustracion nombre="canasta" className="w-1/2" />
          <span className="titulo absolute top-6 left-7 text-[3.5rem] text-naranjo-texto">2:00</span>
        </div>
        <div>
          <h2 className="titulo text-[2.3rem] sm:text-[3rem]">Mientras duermes, estamos en La Vega</h2>
          <p className="mt-5 max-w-xl text-[1.2rem] text-hoja-suave">
            Cada madrugada vamos a La Vega Central a elegir la fruta y la verdura una por una. Lo que pides, lo compramos fresco para ti y
            te llega el mismo día.
          </p>
        </div>
      </section>

      {/* Arriendos */}
      <section className="contenedor pb-16 md:pb-24" aria-labelledby="tambien">
        <h2 id="tambien" className="titulo text-[2.3rem] sm:text-[3rem]">
          También arrendamos
        </h2>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <Link to="/casa-en-la-playa" className="group block overflow-hidden rounded-[2rem] bg-menta no-underline">
            <div className="aspect-[16/10] overflow-hidden">
              <Foto foto={casaPlaya.fotos[0]} className="transition-transform duration-500 group-hover:scale-[1.04]" />
            </div>
            <div className="p-6">
              <p className="titulo-sm text-[1.7rem]">Casa en la playa</p>
              <p className="mt-1 text-hoja-suave">Casa con piscina en Algarrobo, a pocas cuadras del mar.</p>
              <p className="mt-3 font-bold underline underline-offset-4">Ver fotos y reservar</p>
            </div>
          </Link>
          <Link to="/food-truck" className="group block overflow-hidden rounded-[2rem] bg-[#ffe9c9] no-underline">
            <div className="aspect-[16/10] overflow-hidden">
              <Foto foto={foodTruck.fotos[0]} className="transition-transform duration-500 group-hover:scale-[1.04]" />
            </div>
            <div className="p-6">
              <p className="titulo-sm text-[1.7rem]">Food truck</p>
              <p className="mt-1 text-hoja-suave">Food truck fijo y equipado en Ñuñoa, con patente comercial y terraza. $490.000 al mes.</p>
              <p className="mt-3 font-bold underline underline-offset-4">Ver detalles y consultar</p>
            </div>
          </Link>
        </div>
      </section>
    </>
  );
}

function Check() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-6 shrink-0 text-[#2f6b3d]"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      aria-hidden="true"
    >
      <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
