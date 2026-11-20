import { Link } from 'react-router';
import { Logo } from '../components/Logo';
import { Cartel } from '../components/Cartel';
import { FilaProducto } from '../components/FilaProducto';
import { useCatalogo } from '../state/catalogo';
import { useTitulo } from '../lib/useTitulo';
import { clp, nombreLindo, nombreSinOferta } from '../lib/format';
import type { Producto } from '../lib/types';

const PASOS = [
  { titulo: 'Elige tus productos', texto: 'Mira la lista de precios del día y toca "Agregar" en lo que quieras.' },
  { titulo: 'Envíanos el pedido', texto: 'Escribe tu dirección y mándanos el pedido por WhatsApp con un botón.' },
  { titulo: 'Recibe y paga', texto: 'Te lo llevamos a la casa. Pagas por transferencia cuando lo recibes.' },
];

export function Inicio() {
  useTitulo('Frutas y verduras a domicilio');
  const { estado } = useCatalogo();
  const catalogo = estado.tipo === 'listo' ? estado.catalogo : null;
  const ofertas = catalogo ? catalogo.productos.filter((p) => p.o === 'OFERTA' || p.o === 'DESTACADO') : [];
  const carteles = elegirCarteles(ofertas);

  return (
    <>
      {/* Portada: el sello del toro con carteles de precio de feria alrededor */}
      <section className="overflow-hidden border-b-2 border-tinta bg-feria">
        <div className="contenedor grid items-center gap-10 py-12 md:grid-cols-[1.15fr_1fr] md:py-20">
          <div>
            <h1 className="letrero text-[2.5rem] sm:text-[3.4rem] lg:text-[4.2rem]">
              Frutas y verduras de La Vega, en la puerta de tu casa.
            </h1>
            <p className="mt-6 max-w-xl text-[1.2rem] text-gris">
              Elegimos todo fresco cada madrugada. Tú pides desde el celular y te lo llevamos.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/pedido" className="boton boton-oscuro text-[1.15rem]">
                Hacer mi pedido
              </Link>
              {ofertas.length > 0 && (
                <a href="#ofertas" className="boton boton-borde">
                  Ver ofertas
                </a>
              )}
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 font-bold">
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

          <div className="relative mx-auto aspect-square w-full max-w-[26rem]" aria-hidden="true">
            <div className="absolute inset-[9%] rounded-full bg-naranjo" />
            <Logo size={400} className="absolute inset-[13%] !h-[74%] !w-[74%] shadow-[0_18px_40px_rgb(0_0_0/0.25)]" />
            {carteles.map((p, i) => (
              <div key={p.n + p.m} className={`absolute ${POSICIONES[i]}`}>
                <Cartel precio={p.p} medida={p.m} oferta={p.o === 'OFERTA'} tamano="md" inclinado={GIROS[i]} />
                <span className="mt-1 block max-w-[9rem] rounded bg-papel px-2 py-0.5 text-sm font-bold shadow-sm">
                  {nombreLindo(nombreSinOferta(p.n))}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cómo funciona: es una secuencia real, por eso va numerada */}
      <section className="contenedor py-14 md:py-20" aria-labelledby="como-funciona">
        <h2 id="como-funciona" className="letrero text-[2rem] sm:text-[2.6rem]">
          Pedir es así de simple
        </h2>
        <ol className="mt-8 grid gap-5 md:grid-cols-3">
          {PASOS.map((p, i) => (
            <li key={p.titulo} className="flex gap-4 rounded-2xl border-2 border-tinta p-5">
              <span className="letrero grid size-12 shrink-0 place-items-center rounded-full bg-cartulina text-2xl" aria-hidden="true">
                {i + 1}
              </span>
              <div>
                <h3 className="text-[1.2rem] font-bold">{p.titulo}</h3>
                <p className="mt-1 text-gris">{p.texto}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {ofertas.length > 0 && (
        <section id="ofertas" className="scroll-mt-24 border-y-2 border-tinta bg-feria py-14 md:py-20" aria-labelledby="titulo-ofertas">
          <div className="contenedor">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 id="titulo-ofertas" className="letrero text-[2rem] sm:text-[2.6rem]">
                  Ofertas de esta semana
                </h2>
                <p className="mt-2 text-gris">Puedes agregarlas a tu pedido desde aquí mismo.</p>
              </div>
              <Link to="/pedido" className="boton boton-borde">
                Ver todos los productos
              </Link>
            </div>
            <ul className="mt-8 grid gap-3 md:grid-cols-2">
              {ofertas.slice(0, 8).map((p) => (
                <FilaProducto key={p.n + p.m} producto={p} />
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* La historia: por qué la fruta llega fresca */}
      <section className="bg-tinta text-papel">
        <div className="contenedor grid items-center gap-8 py-14 md:grid-cols-[auto_1fr] md:py-20">
          <p className="letrero text-[4.5rem] text-cartulina sm:text-[6rem]" aria-hidden="true">
            2 AM
          </p>
          <div>
            <h2 className="letrero text-[1.9rem] sm:text-[2.4rem]">A esa hora ya estamos en La Vega</h2>
            <p className="mt-4 max-w-2xl text-[1.15rem] text-white/85">
              Cada madrugada vamos a La Vega Central a elegir la fruta y la verdura una por una. Lo que pides, lo compramos
              para ti y te llega el mismo día, sin pasar días en una bodega.
            </p>
          </div>
        </div>
      </section>

      {/* Otros servicios */}
      <section className="contenedor py-14 md:py-20" aria-labelledby="tambien">
        <h2 id="tambien" className="letrero text-[2rem] sm:text-[2.6rem]">
          También arrendamos
        </h2>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <Servicio a="/food-truck" emoji="🚚" titulo="Food truck" texto="Equipado y listo para tu evento, cumpleaños o feria." />
          <Servicio a="/casa-en-la-playa" emoji="🏖️" titulo="Casa en la playa" texto="Para descansar con la familia, a pasos del mar." />
        </div>
      </section>
    </>
  );
}

const POSICIONES = ['left-0 top-[4%]', 'right-0 top-[30%]', 'left-[6%] bottom-[2%]'];
const GIROS = [-6, 5, -3];

/** Hasta 3 ofertas para los carteles de la portada (distintas y con buen precio). */
function elegirCarteles(ofertas: Producto[]): Producto[] {
  const vistos = new Set<string>();
  return ofertas
    .filter((p) => {
      const base = nombreSinOferta(p.n).split(' ')[0];
      if (vistos.has(base)) return false;
      vistos.add(base);
      return true;
    })
    .slice(0, 3);
}

function Servicio({ a, emoji, titulo, texto }: { a: string; emoji: string; titulo: string; texto: string }) {
  return (
    <Link
      to={a}
      className="group flex items-center gap-5 rounded-2xl border-2 border-tinta bg-papel p-6 no-underline hover:bg-feria"
    >
      <span className="grid size-20 shrink-0 place-items-center rounded-full bg-naranjo text-4xl" aria-hidden="true">
        {emoji}
      </span>
      <span>
        <span className="letrero block text-[1.6rem]">{titulo}</span>
        <span className="mt-1 block text-gris">{texto}</span>
        <span className="mt-2 inline-block font-bold underline underline-offset-4 group-hover:text-naranjo-texto">Ver fotos y consultar</span>
      </span>
    </Link>
  );
}

function Check() {
  return (
    <svg viewBox="0 0 24 24" className="size-6 shrink-0 text-hoja" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
      <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
