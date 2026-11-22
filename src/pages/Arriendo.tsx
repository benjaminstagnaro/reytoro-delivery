import { useState, type FormEvent } from 'react';
import { Galeria } from '../components/Galeria';
import { useCatalogo } from '../state/catalogo';
import { useTitulo } from '../lib/useTitulo';
import { linkWhatsApp } from '../lib/whatsapp';
import { casaPlaya, foodTruck, type Arriendo } from '../content/arriendos';

export function FoodTruck() {
  useTitulo('Arriendo de food truck');
  return <PaginaArriendo arriendo={foodTruck} conFechas={false} emoji="🚚" />;
}

export function CasaPlaya() {
  useTitulo('Casa en la playa');
  return <PaginaArriendo arriendo={casaPlaya} conFechas emoji="🏖️" />;
}

function PaginaArriendo({ arriendo, conFechas, emoji }: { arriendo: Arriendo; conFechas: boolean; emoji: string }) {
  const { estado } = useCatalogo();
  const whatsapp = arriendo.whatsapp || (estado.tipo === 'listo' ? estado.catalogo.config.whatsapp : '');

  return (
    <>
      <section className="px-3 pt-2 md:px-6">
        <div className={`panel ${conFechas ? 'bg-[#dff0f7]' : 'bg-[#ffe9c9]'}`}>
          <div className="contenedor py-10 md:py-16">
            {arriendo.pendiente && (
              <p className="mb-6 inline-block rounded-full bg-papel px-4 py-2 font-bold text-naranjo-texto">{arriendo.pendiente}</p>
            )}
            <span className="grid size-20 place-items-center rounded-full bg-papel text-[2.6rem]" aria-hidden="true">
              {emoji}
            </span>
            <h1 className="titulo mt-5 text-[2.6rem] sm:text-[3.8rem]">{arriendo.titulo}</h1>
            <p className="mt-4 max-w-2xl text-[1.25rem] text-hoja-suave">{arriendo.bajada}</p>
          </div>
        </div>
      </section>

      {arriendo.fotos.length > 0 ? (
        <section className="contenedor py-10" aria-label="Fotos">
          <Galeria fotos={arriendo.fotos} />
        </section>
      ) : (
        <div className="py-5" />
      )}

      <section className="contenedor grid grid-cols-1 gap-10 pb-16 lg:grid-cols-[1fr_24rem]">
        <div>
          <div className="max-w-2xl space-y-4 text-[1.15rem]">
            {arriendo.descripcion.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>

          <dl className="mt-8 grid gap-3 sm:grid-cols-3">
            {arriendo.datos.map((d) => (
              <div key={d.etiqueta} className="rounded-3xl bg-menta p-5">
                <dt className="text-hoja-suave">{d.etiqueta}</dt>
                <dd className="titulo-sm mt-1 text-[1.35rem]">{d.valor}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-10 grid gap-8 sm:grid-cols-2">
            <div>
              <h2 className="titulo text-[1.8rem]">Incluye</h2>
              <ul className="mt-3 space-y-2 text-[1.1rem]">
                {arriendo.incluye.map((i) => (
                  <li key={i} className="flex gap-3">
                    <span
                      className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-menta-fuerte text-sm font-bold"
                      aria-hidden="true"
                    >
                      ✓
                    </span>
                    {i}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="titulo text-[1.8rem]">{arriendo.tituloCondiciones ?? 'Antes de reservar'}</h2>
              <ul className="mt-3 list-disc space-y-2 pl-6 text-[1.1rem]">
                {arriendo.condiciones.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>
          </div>

          {arriendo.ubicacion && <Mapa {...arriendo.ubicacion} />}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          {arriendo.reserva ? (
            <Reserva arriendo={arriendo} whatsapp={whatsapp} />
          ) : arriendo.precio ? (
            <ArriendoMensual arriendo={arriendo} whatsapp={whatsapp} />
          ) : (
            <Consulta arriendo={arriendo} conFechas={conFechas} whatsapp={whatsapp} />
          )}
        </aside>
      </section>
    </>
  );
}

/** Cuando ya existe una página de reservas (Airbnb): botón grande hacia ella y WhatsApp para dudas. */
function Reserva({ arriendo, whatsapp }: { arriendo: Arriendo; whatsapp: string }) {
  const r = arriendo.reserva!;
  return (
    <div className="rounded-[2rem] bg-hoja p-6 text-papel">
      <h2 className="titulo text-[1.9rem]">¿Te interesa?</h2>
      <p className="mt-2 text-white/80">{r.nota}</p>
      <a href={r.url} target="_blank" rel="noopener" className="boton boton-principal mt-6 w-full text-[1.15rem]">
        {r.texto} en {r.sitio}
        <span className="sr-only"> (se abre en otra pestaña)</span>
      </a>
      {whatsapp && (
        <p className="mt-6 border-t border-white/20 pt-5 text-white/90">
          ¿Tienes alguna duda antes de reservar?{' '}
          <a
            href={linkWhatsApp(whatsapp, arriendo.mensajeWhatsApp)}
            target="_blank"
            rel="noopener"
            className="font-bold text-papel underline underline-offset-4"
          >
            Escríbenos por WhatsApp
          </a>
        </p>
      )}
    </div>
  );
}

/** Arma el mensaje de WhatsApp con las fechas y personas, para que la consulta llegue completa. */
function Consulta({ arriendo, conFechas, whatsapp }: { arriendo: Arriendo; conFechas: boolean; whatsapp: string }) {
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [personas, setPersonas] = useState('');
  const [nota, setNota] = useState('');

  const fecha = (iso: string) => (iso ? iso.split('-').reverse().join('-') : '');
  const mensaje = [
    arriendo.mensajeWhatsApp,
    conFechas && desde ? `Llegada: ${fecha(desde)}` : desde ? `Fecha del evento: ${fecha(desde)}` : '',
    conFechas && hasta ? `Salida: ${fecha(hasta)}` : '',
    personas ? `${conFechas ? 'Personas' : 'Invitados aproximados'}: ${personas}` : '',
    nota ? `Comentario: ${nota}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  function enviar(e: FormEvent) {
    e.preventDefault();
    if (whatsapp) window.open(linkWhatsApp(whatsapp, mensaje), '_blank', 'noopener');
  }

  return (
    <form onSubmit={enviar} className="rounded-[2rem] border-2 border-linea bg-papel p-6">
      <h2 className="titulo text-[1.8rem]">Consulta disponibilidad</h2>
      <p className="mt-1 text-hoja-suave">Te respondemos por WhatsApp con precio y fechas libres.</p>
      <div className="mt-5 grid gap-4">
        <div>
          <label htmlFor="desde" className="mb-1.5 block font-bold">
            {conFechas ? 'Llegada' : 'Fecha del evento'} <span className="font-normal text-hoja-suave">(opcional)</span>
          </label>
          <input id="desde" type="date" className="campo" value={desde} onChange={(e) => setDesde(e.target.value)} />
        </div>
        {conFechas && (
          <div>
            <label htmlFor="hasta" className="mb-1.5 block font-bold">
              Salida <span className="font-normal text-hoja-suave">(opcional)</span>
            </label>
            <input
              id="hasta"
              type="date"
              className="campo"
              min={desde || undefined}
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
            />
          </div>
        )}
        <div>
          <label htmlFor="personas" className="mb-1.5 block font-bold">
            {conFechas ? '¿Cuántas personas?' : '¿Cuántos invitados, más o menos?'}{' '}
            <span className="font-normal text-hoja-suave">(opcional)</span>
          </label>
          <input
            id="personas"
            inputMode="numeric"
            className="campo"
            value={personas}
            onChange={(e) => setPersonas(e.target.value.replace(/[^\d]/g, ''))}
          />
        </div>
        <div>
          <label htmlFor="nota" className="mb-1.5 block font-bold">
            Comentario <span className="font-normal text-hoja-suave">(opcional)</span>
          </label>
          <textarea id="nota" className="campo min-h-20" rows={2} value={nota} onChange={(e) => setNota(e.target.value)} />
        </div>
      </div>
      <button type="submit" className="boton boton-wa mt-5 w-full text-[1.1rem]" disabled={!whatsapp}>
        Consultar por WhatsApp
      </button>
    </form>
  );
}

/** Mapa de Google con la dirección (no necesita clave) y botón para abrir la app de mapas. */
function Mapa({ direccion, comuna }: { direccion: string; comuna: string }) {
  const q = encodeURIComponent(`${direccion}, ${comuna}, Santiago, Chile`);
  return (
    <section className="mt-12" aria-labelledby="titulo-mapa">
      <h2 id="titulo-mapa" className="titulo text-[1.8rem]">
        Dónde está
      </h2>
      <p className="mt-2 text-[1.15rem]">
        {direccion}, {comuna}
      </p>
      <div className="mt-4 overflow-hidden rounded-[2rem] border-2 border-linea">
        <iframe
          title={`Mapa: ${direccion}, ${comuna}`}
          src={`https://www.google.com/maps?q=${q}&output=embed`}
          className="block aspect-[4/3] w-full sm:aspect-[16/9]"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
      <a href={`https://www.google.com/maps/search/?api=1&query=${q}`} target="_blank" rel="noopener" className="boton boton-suave mt-4">
        Abrir en Google Maps<span className="sr-only"> (se abre en otra pestaña)</span>
      </a>
    </section>
  );
}

/** Arriendo con precio fijo (food truck): precio grande y consulta por WhatsApp con lo que quiere vender. */
function ArriendoMensual({ arriendo, whatsapp }: { arriendo: Arriendo; whatsapp: string }) {
  const p = arriendo.precio!;
  const [nombre, setNombre] = useState('');
  const [comida, setComida] = useState('');
  const [nota, setNota] = useState('');

  const mensaje = [
    arriendo.mensajeWhatsApp,
    nombre ? `Mi nombre: ${nombre}` : '',
    comida ? `Quiero vender: ${comida}` : '',
    nota ? `Comentario: ${nota}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  function enviar(e: FormEvent) {
    e.preventDefault();
    if (whatsapp) window.open(linkWhatsApp(whatsapp, mensaje), '_blank', 'noopener');
  }

  return (
    <form onSubmit={enviar} className="rounded-[2rem] bg-hoja p-6 text-papel">
      <p className="text-white/80">Arriendo</p>
      <p className="titulo text-[2.8rem] leading-none">
        {p.monto} <span className="font-sans text-[1.2rem] font-bold">{p.periodo}</span>
      </p>
      {p.nota && <p className="mt-2 inline-block rounded-full bg-naranjo px-3 py-1 font-bold text-hoja">{p.nota}</p>}
      {arriendo.ubicacion && (
        <p className="mt-4 text-white/85">
          {arriendo.ubicacion.direccion}, {arriendo.ubicacion.comuna}
        </p>
      )}

      <div className="mt-6 grid gap-4 border-t border-white/20 pt-5">
        <h2 className="titulo-sm text-[1.4rem]">Consulta por WhatsApp</h2>
        <div>
          <label htmlFor="ft-nombre" className="mb-1.5 block font-bold">
            Tu nombre <span className="font-normal text-white/70">(opcional)</span>
          </label>
          <input
            id="ft-nombre"
            className="campo text-hoja"
            autoComplete="name"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="ft-comida" className="mb-1.5 block font-bold">
            ¿Qué te gustaría vender? <span className="font-normal text-white/70">(opcional)</span>
          </label>
          <input
            id="ft-comida"
            className="campo text-hoja"
            placeholder="Ej: hamburguesas, sushi, café"
            value={comida}
            onChange={(e) => setComida(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="ft-nota" className="mb-1.5 block font-bold">
            Comentario <span className="font-normal text-white/70">(opcional)</span>
          </label>
          <textarea id="ft-nota" className="campo min-h-20 text-hoja" rows={2} value={nota} onChange={(e) => setNota(e.target.value)} />
        </div>
      </div>
      <button type="submit" className="boton boton-wa mt-5 w-full text-[1.1rem]" disabled={!whatsapp}>
        Consultar por WhatsApp
      </button>
    </form>
  );
}
