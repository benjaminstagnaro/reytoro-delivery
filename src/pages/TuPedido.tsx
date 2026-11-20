import { useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { ConCatalogo } from '../components/Estado';
import { Contador } from '../components/Contador';
import { useCarrito } from '../state/carrito';
import { useTitulo } from '../lib/useTitulo';
import { claveProducto, clp, medidaLinda, nombreLindo } from '../lib/format';
import { enviarPedido, MODO_DEMO } from '../lib/api';
import type { Catalogo, DatosCliente } from '../lib/types';

export function TuPedido() {
  useTitulo('Tu pedido');
  return <ConCatalogo>{(c) => <Formulario catalogo={c} />}</ConCatalogo>;
}

type Errores = Partial<Record<'nombre' | 'telefono' | 'direccion', string>>;

function Formulario({ catalogo }: { catalogo: Catalogo }) {
  const { carrito, resumen, cambiar, cliente, setCliente, vaciar, recordarPedido } = useCarrito();
  const navigate = useNavigate();
  const [datos, setDatos] = useState<DatosCliente>(cliente);
  const [errores, setErrores] = useState<Errores>({});
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState('');
  const trampa = useRef<HTMLInputElement>(null);
  const resumenErrores = useRef<HTMLDivElement>(null);

  const lineas = catalogo.productos.filter((p) => (carrito[claveProducto(p)] ?? 0) > 0);

  if (!resumen || lineas.length === 0) {
    return (
      <div className="contenedor py-20 text-center">
        <h1 className="letrero text-[2.3rem]">Tu pedido está vacío</h1>
        <p className="mt-3 text-lg text-gris">Elige tus productos en la lista de precios.</p>
        <Link to="/pedido" className="boton boton-oscuro mt-8">
          Ir a la lista de precios
        </Link>
      </div>
    );
  }

  const campo = (k: keyof DatosCliente) => ({
    id: k,
    value: datos[k],
    onChange: (e: { target: { value: string } }) => {
      setDatos((d) => ({ ...d, [k]: e.target.value }));
      if (errores[k as keyof Errores]) setErrores((er) => ({ ...er, [k]: undefined }));
    },
  });

  async function confirmar(e: FormEvent) {
    e.preventDefault();
    const er: Errores = {};
    if (!datos.nombre.trim()) er.nombre = 'Escribe tu nombre.';
    if (datos.telefono.replace(/\D/g, '').length < 8) er.telefono = 'Escribe tu teléfono (al menos 8 números).';
    if (!datos.direccion.trim()) er.direccion = 'Escribe la dirección donde te llevamos el pedido.';
    setErrores(er);
    if (Object.keys(er).length) {
      requestAnimationFrame(() => resumenErrores.current?.focus());
      return;
    }
    setEnviando(true);
    setErrorEnvio('');
    try {
      const items = lineas.map((p) => ({ n: p.n, m: p.m, q: carrito[claveProducto(p)] }));
      const pedido = await enviarPedido(datos, items, catalogo, trampa.current?.value ?? '');
      setCliente(datos);
      recordarPedido(carrito);
      vaciar();
      navigate('/pedido/listo', { state: { pedido } });
    } catch (err) {
      setErrorEnvio(err instanceof Error ? err.message : 'No pudimos enviar tu pedido.');
    } finally {
      setEnviando(false);
    }
  }

  const hoy = new Date();
  hoy.setMinutes(hoy.getMinutes() - hoy.getTimezoneOffset());
  const nErrores = Object.values(errores).filter(Boolean).length;

  return (
    <div className="contenedor grid gap-10 py-8 lg:grid-cols-[1fr_26rem] lg:py-12">
      <section aria-labelledby="titulo-pedido">
        <Link to="/pedido" className="font-bold underline underline-offset-4">
          Volver a la lista de precios
        </Link>
        <h1 id="titulo-pedido" className="letrero mt-4 text-[2.3rem] sm:text-[2.8rem]">
          Tu pedido
        </h1>
        <ul className="mt-6 divide-y-2 divide-linea border-y-2 border-linea">
          {lineas.map((p) => {
            const k = claveProducto(p);
            const q = carrito[k];
            const nombre = nombreLindo(p.n);
            return (
              <li key={k} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-4">
                <div className="min-w-[10rem] flex-1">
                  <p className="text-[1.1rem] font-bold">{nombre}</p>
                  <p className="text-gris">
                    {clp(p.p)} {medidaLinda(p.m)}
                  </p>
                </div>
                <Contador cantidad={q} nombre={nombre} onCambiar={(d) => cambiar(k, d)} />
                <p className="w-24 text-right text-[1.15rem] font-bold">{clp(p.p * q)}</p>
              </li>
            );
          })}
        </ul>
      </section>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-2xl border-2 border-tinta p-5">
          <dl className="space-y-2 text-[1.1rem]">
            <div className="flex justify-between">
              <dt>Productos</dt>
              <dd className="font-bold">{clp(resumen.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Despacho</dt>
              <dd className="font-bold">{resumen.despachoTexto}</dd>
            </div>
            <div className="flex justify-between border-t-2 border-tinta pt-3 text-[1.45rem]">
              <dt className="font-bold">Total</dt>
              <dd className="letrero">
                {clp(resumen.total)}
                {resumen.despachoTexto === 'Por confirmar' && <span className="block text-right font-sans text-sm font-bold"> + despacho</span>}
              </dd>
            </div>
          </dl>
          {catalogo.config.minimo > 0 && (
            <p className={`mt-3 font-bold ${resumen.falta ? 'text-naranjo-texto' : 'text-hoja'}`}>
              {resumen.falta ? `Te faltan ${clp(resumen.falta)} para el despacho gratis.` : 'Tu despacho es gratis.'}
            </p>
          )}
        </div>

        <form onSubmit={confirmar} noValidate className="mt-6 space-y-4" aria-labelledby="titulo-datos">
          <h2 id="titulo-datos" className="letrero text-[1.6rem]">
            ¿Dónde te lo llevamos?
          </h2>

          {nErrores > 0 && (
            <div ref={resumenErrores} tabIndex={-1} role="alert" className="rounded-xl border-2 border-[#c0261d] bg-[#fff5f4] p-4 font-bold">
              Falta completar {nErrores === 1 ? 'un dato' : `${nErrores} datos`}:
              <ul className="mt-1 list-disc pl-6 font-normal">
                {Object.values(errores)
                  .filter(Boolean)
                  .map((m) => (
                    <li key={m}>{m}</li>
                  ))}
              </ul>
            </div>
          )}

          <Campo etiqueta="Tu nombre" error={errores.nombre} id="nombre">
            <input {...campo('nombre')} className="campo" autoComplete="name" aria-invalid={!!errores.nombre} aria-describedby={errores.nombre ? 'nombre-error' : undefined} />
          </Campo>
          <Campo etiqueta="Teléfono o WhatsApp" error={errores.telefono} id="telefono">
            <input
              {...campo('telefono')}
              className="campo"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="+56 9 …"
              aria-invalid={!!errores.telefono}
              aria-describedby={errores.telefono ? 'telefono-error' : undefined}
            />
          </Campo>
          <Campo etiqueta="Dirección" error={errores.direccion} id="direccion" ayuda="Calle, número, depto y comuna">
            <input
              {...campo('direccion')}
              className="campo"
              autoComplete="street-address"
              aria-invalid={!!errores.direccion}
              aria-describedby={`direccion-ayuda${errores.direccion ? ' direccion-error' : ''}`}
            />
          </Campo>
          <Campo etiqueta="Fecha de entrega" opcional id="entrega">
            <input {...campo('entrega')} className="campo" type="date" min={hoy.toISOString().slice(0, 10)} />
          </Campo>
          <Campo etiqueta="Comentarios" opcional id="comentarios">
            <textarea {...campo('comentarios')} className="campo min-h-24" rows={3} placeholder="Ej: paltas para el fin de semana, tocar timbre…" />
          </Campo>

          {/* Campo trampa: invisible para las personas, los robots lo llenan */}
          <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
            <label>
              No llenar <input ref={trampa} tabIndex={-1} autoComplete="off" name="sitio" />
            </label>
          </div>

          {errorEnvio && (
            <p role="alert" className="rounded-xl border-2 border-[#c0261d] bg-[#fff5f4] p-4 font-bold">
              {errorEnvio}
            </p>
          )}

          <button type="submit" className="boton boton-oscuro w-full text-[1.15rem]" disabled={enviando}>
            {enviando ? 'Enviando…' : 'Confirmar pedido'}
          </button>
          <p className="text-center text-gris">En el siguiente paso nos envías el pedido por WhatsApp.</p>
          {MODO_DEMO && <p className="text-center text-sm font-bold text-naranjo-texto">Modo demo: el pedido no se guarda en la planilla.</p>}
        </form>
      </aside>
    </div>
  );
}

function Campo({
  etiqueta,
  id,
  error,
  ayuda,
  opcional = false,
  children,
}: {
  etiqueta: string;
  id: string;
  error?: string;
  ayuda?: string;
  opcional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block font-bold">
        {etiqueta} {opcional && <span className="font-normal text-gris">(opcional)</span>}
      </label>
      {ayuda && (
        <p id={`${id}-ayuda`} className="-mt-1 mb-1.5 text-sm text-gris">
          {ayuda}
        </p>
      )}
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 font-bold text-[#a31f17]">
          {error}
        </p>
      )}
    </div>
  );
}
