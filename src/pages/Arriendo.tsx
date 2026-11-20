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
  const whatsapp = estado.tipo === 'listo' ? estado.catalogo.config.whatsapp : '';

  return (
    <>
      {arriendo.pendiente && <p className="bg-cartulina px-4 py-2 text-center font-bold">{arriendo.pendiente}</p>}

      <section className="border-b-2 border-tinta bg-feria">
        <div className="contenedor py-10 md:py-14">
          <p className="text-4xl" aria-hidden="true">
            {emoji}
          </p>
          <h1 className="letrero mt-3 text-[2.5rem] sm:text-[3.4rem]">{arriendo.titulo}</h1>
          <p className="mt-3 max-w-2xl text-[1.25rem] text-gris">{arriendo.bajada}</p>
        </div>
      </section>

      <section className="contenedor py-10" aria-label="Fotos">
        <Galeria fotos={arriendo.fotos} />
      </section>

      <section className="contenedor grid gap-10 pb-16 lg:grid-cols-[1fr_24rem]">
        <div>
          <div className="max-w-2xl space-y-4 text-[1.15rem]">
            {arriendo.descripcion.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>

          <dl className="mt-8 grid gap-3 sm:grid-cols-3">
            {arriendo.datos.map((d) => (
              <div key={d.etiqueta} className="rounded-xl border-2 border-linea p-4">
                <dt className="text-gris">{d.etiqueta}</dt>
                <dd className="mt-1 text-[1.2rem] font-bold">{d.valor}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-10 grid gap-8 sm:grid-cols-2">
            <div>
              <h2 className="letrero text-[1.6rem]">Incluye</h2>
              <ul className="mt-3 space-y-2 text-[1.1rem]">
                {arriendo.incluye.map((i) => (
                  <li key={i} className="flex gap-2">
                    <span className="font-bold text-hoja" aria-hidden="true">
                      ✓
                    </span>
                    {i}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="letrero text-[1.6rem]">Antes de reservar</h2>
              <ul className="mt-3 list-disc space-y-2 pl-6 text-[1.1rem]">
                {arriendo.condiciones.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          {arriendo.reserva ? (
            <Reserva arriendo={arriendo} whatsapp={whatsapp} />
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
    <div className="rounded-2xl border-2 border-tinta p-5">
      <h2 className="letrero text-[1.6rem]">¿Te interesa?</h2>
      <p className="mt-1 text-gris">{r.nota}</p>
      <a href={r.url} target="_blank" rel="noopener" className="boton boton-oscuro mt-5 w-full text-[1.15rem]">
        {r.texto} en {r.sitio}
        <span className="sr-only"> (se abre en otra pestaña)</span>
      </a>
      {whatsapp && (
        <p className="mt-5 border-t-2 border-linea pt-4">
          ¿Tienes alguna duda antes de reservar?{' '}
          <a
            href={linkWhatsApp(whatsapp, arriendo.mensajeWhatsApp)}
            target="_blank"
            rel="noopener"
            className="font-bold underline underline-offset-4"
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
    <form onSubmit={enviar} className="rounded-2xl border-2 border-tinta p-5">
      <h2 className="letrero text-[1.6rem]">Consulta disponibilidad</h2>
      <p className="mt-1 text-gris">Te respondemos por WhatsApp con precio y fechas libres.</p>
      <div className="mt-5 grid gap-4">
        <div>
          <label htmlFor="desde" className="mb-1.5 block font-bold">
            {conFechas ? 'Llegada' : 'Fecha del evento'} <span className="font-normal text-gris">(opcional)</span>
          </label>
          <input id="desde" type="date" className="campo" value={desde} onChange={(e) => setDesde(e.target.value)} />
        </div>
        {conFechas && (
          <div>
            <label htmlFor="hasta" className="mb-1.5 block font-bold">
              Salida <span className="font-normal text-gris">(opcional)</span>
            </label>
            <input id="hasta" type="date" className="campo" min={desde || undefined} value={hasta} onChange={(e) => setHasta(e.target.value)} />
          </div>
        )}
        <div>
          <label htmlFor="personas" className="mb-1.5 block font-bold">
            {conFechas ? '¿Cuántas personas?' : '¿Cuántos invitados, más o menos?'} <span className="font-normal text-gris">(opcional)</span>
          </label>
          <input id="personas" inputMode="numeric" className="campo" value={personas} onChange={(e) => setPersonas(e.target.value.replace(/[^\d]/g, ''))} />
        </div>
        <div>
          <label htmlFor="nota" className="mb-1.5 block font-bold">
            Comentario <span className="font-normal text-gris">(opcional)</span>
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
