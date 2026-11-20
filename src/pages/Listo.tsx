import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router';
import { useCatalogo } from '../state/catalogo';
import { useTitulo } from '../lib/useTitulo';
import { linkWhatsApp } from '../lib/whatsapp';
import { clp } from '../lib/format';
import type { PedidoEnviado } from '../lib/types';

/** Último paso: que el cliente envíe el pedido por WhatsApp (el correo a Rey Toro ya salió solo). */
export function Listo() {
  useTitulo('Envía tu pedido por WhatsApp');
  const { state } = useLocation() as { state: { pedido?: PedidoEnviado } | null };
  const { estado } = useCatalogo();
  const [enviado, setEnviado] = useState(false);
  const [recordar, setRecordar] = useState(false);
  const titulo = useRef<HTMLHeadingElement>(null);

  useEffect(() => titulo.current?.focus(), [enviado]);

  const pedido = state?.pedido;
  if (!pedido) return <Navigate to="/pedido" replace />;
  const cfg = estado.tipo === 'listo' ? estado.catalogo.config : null;
  const banco = cfg
    ? [
        ['Nombre', cfg.razon],
        ['RUT', cfg.rut],
        ['Banco', cfg.banco],
        ['Tipo de cuenta', cfg.tipoCuenta],
        ['N° de cuenta', cfg.cuenta],
        ['Correo', cfg.correo],
      ].filter(([, v]) => v)
    : [];

  return (
    <div className="px-3 pt-2 pb-12 md:px-6">
      <div className="panel bg-menta">
        <div className="contenedor max-w-2xl py-10 text-center md:py-14">
          <div className="flex justify-center gap-2" aria-hidden="true">
            <i className="h-2 w-12 rounded-full bg-hoja" />
            <i className="h-2 w-12 rounded-full bg-hoja" />
            <i className={`h-2 w-12 rounded-full ${enviado ? 'bg-hoja' : 'bg-menta-fuerte'}`} />
          </div>
          <h1 ref={titulo} tabIndex={-1} className="titulo mt-6 text-[2.4rem] outline-none sm:text-[3rem]">
            {enviado ? '¡Gracias por tu pedido!' : '¡Falta un último paso!'}
          </h1>
          <p className="mt-2 text-hoja-suave">Pedido hecho el {pedido.hecho}</p>
          <p className="mx-auto mt-4 max-w-md text-[1.2rem]">
            {enviado ? (
              'Si ya lo enviaste por WhatsApp, está todo listo.'
            ) : (
              <>
                Toca el botón verde para <strong>enviarnos tu pedido por WhatsApp</strong>. Así lo confirmamos y lo preparamos.
              </>
            )}
          </p>

          {recordar && !enviado && (
            <p role="alert" className="mx-auto mt-5 max-w-md rounded-2xl bg-papel p-3 font-bold text-naranjo-texto">
              Primero envía tu pedido por WhatsApp, con el botón verde.
            </p>
          )}

          <a
            href={linkWhatsApp(pedido.whatsapp, pedido.mensaje)}
            target="_blank"
            rel="noopener"
            onClick={() => setTimeout(() => setEnviado(true), 600)}
            className={`boton mx-auto mt-6 w-full max-w-md text-[1.3rem] ${enviado ? 'boton-borde' : 'boton-wa latido min-h-16 shadow-[0_8px_24px_rgb(37_211_102/0.45)]'}`}
          >
            <IconoWhatsApp />
            {enviado ? 'Abrir WhatsApp de nuevo' : 'Enviar pedido por WhatsApp'}
          </a>
          {!enviado && (
            <p className="mt-3 text-hoja-suave">
              El mensaje ya va escrito: en WhatsApp solo toca <strong className="text-hoja">enviar</strong>.
            </p>
          )}
        </div>
      </div>

      <div className="contenedor max-w-2xl text-center">
        <div className="mt-8 rounded-[2rem] bg-[#ffe9c9] p-6 text-left">
          <h2 className="titulo-sm text-[1.5rem] text-naranjo-texto">Transfiere al recibir tu pedido</h2>
          <p className="mt-1">No pagues ahora. Cuando te llegue el pedido, transfiere el total a estos datos:</p>
          <dl className="mt-4 divide-y divide-linea rounded-2xl bg-papel px-4">
            {banco.map(([k, v]) => (
              <div key={k} className="flex flex-wrap justify-between gap-x-4 py-2.5">
                <dt className="text-hoja-suave">{k}</dt>
                <dd className="font-bold">{v}</dd>
              </div>
            ))}
          </dl>
          <dl className="mt-4 space-y-1 text-[1.1rem]">
            <div className="flex justify-between">
              <dt>Productos</dt>
              <dd className="font-bold">{clp(pedido.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Despacho</dt>
              <dd className="font-bold">{pedido.despacho > 0 ? clp(pedido.despacho) : pedido.despachoTexto}</dd>
            </div>
            <div className="flex justify-between border-t-2 border-[#f3cf9c] pt-2 text-[1.35rem]">
              <dt className="font-bold">Total</dt>
              <dd className="titulo">
                {clp(pedido.total)}
                {pedido.despachoTexto === 'Por confirmar' && (
                  <span className="block text-right font-sans text-sm font-bold">+ despacho</span>
                )}
              </dd>
            </div>
          </dl>
        </div>

        {enviado ? (
          <Link to="/pedido" className="boton boton-borde mt-8">
            Hacer otro pedido
          </Link>
        ) : (
          <button type="button" className="boton boton-borde mt-8" onClick={() => (recordar ? setEnviado(true) : setRecordar(true))}>
            Hacer otro pedido
          </button>
        )}
      </div>
    </div>
  );
}

function IconoWhatsApp() {
  return (
    <svg viewBox="0 0 24 24" className="size-7 shrink-0" fill="currentColor" aria-hidden="true">
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.8-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.4.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.2-.2-.4-.3Z" />
    </svg>
  );
}
