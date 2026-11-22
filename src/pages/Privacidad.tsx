import { useState } from 'react';
import { Link } from 'react-router';
import { useCarrito } from '../state/carrito';
import { useCatalogo } from '../state/catalogo';
import { useTitulo } from '../lib/useTitulo';
import { linkWhatsApp } from '../lib/whatsapp';

/** Qué datos pedimos, para qué y cómo pedir que se borren. En palabras simples. */
export function Privacidad() {
  useTitulo('Privacidad');
  const { olvidarDatos } = useCarrito();
  const { estado } = useCatalogo();
  const whatsapp = estado.tipo === 'listo' ? estado.catalogo.config.whatsapp : '';
  const [borrado, setBorrado] = useState(false);

  return (
    <div className="px-3 pt-2 pb-16 md:px-6">
      <div className="panel bg-menta">
        <div className="contenedor max-w-3xl py-10 md:py-14">
          <h1 className="titulo text-[2.6rem] sm:text-[3.4rem]">Tus datos</h1>
          <p className="mt-3 text-[1.2rem] text-hoja-suave">Qué te pedimos, para qué lo usamos y cómo pedirnos que lo borremos.</p>
        </div>
      </div>

      <div className="contenedor max-w-3xl space-y-10 pt-10 text-[1.15rem]">
        <section>
          <h2 className="titulo text-[1.8rem]">Qué te pedimos</h2>
          <p className="mt-3">
            Para hacer un pedido te pedimos tu <strong>nombre</strong>, tu <strong>teléfono</strong> y tu <strong>dirección</strong>. Si
            quieres, también el día de entrega y un comentario.
          </p>
        </section>

        <section>
          <h2 className="titulo text-[1.8rem]">Para qué lo usamos</h2>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>Para preparar tu pedido, llevártelo y contactarte si hay algo que confirmar.</li>
            <li>No lo usamos para publicidad, no lo vendemos y no lo compartimos con otras empresas.</li>
          </ul>
        </section>

        <section>
          <h2 className="titulo text-[1.8rem]">Dónde queda guardado</h2>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>Tu pedido se guarda en la planilla de pedidos del negocio, en Google, y nos llega un aviso por correo y WhatsApp.</li>
            <li>
              Para que no tengas que escribirlos de nuevo, tu nombre, teléfono, dirección y último pedido quedan guardados{' '}
              <strong>solo en este celular o computador</strong>. Puedes borrarlos cuando quieras con el botón de abajo.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="titulo text-[1.8rem]">Borrar tus datos</h2>
          <p className="mt-3">
            Si quieres que borremos tus datos de nuestra planilla, escríbenos y lo hacemos.
            {whatsapp && (
              <>
                {' '}
                <a
                  href={linkWhatsApp(whatsapp, 'Hola, quiero que borren mis datos de sus pedidos.')}
                  target="_blank"
                  rel="noopener"
                  className="font-bold underline underline-offset-4"
                >
                  Pedirlo por WhatsApp<span className="sr-only"> (se abre en otra pestaña)</span>
                </a>
              </>
            )}
          </p>
          <div className="mt-5 rounded-3xl border-2 border-linea p-5">
            <p className="font-bold">Borrar lo que quedó guardado en este dispositivo</p>
            <p className="mt-1 text-hoja-suave">
              Se borran tu nombre, teléfono, dirección, tu último pedido y lo que tengas en el carrito.
            </p>
            <button
              type="button"
              className="boton boton-oscuro mt-4"
              onClick={() => {
                olvidarDatos();
                setBorrado(true);
              }}
            >
              Borrar mis datos de este dispositivo
            </button>
            <p className="mt-3 font-bold" role="status">
              {borrado ? 'Listo, tus datos se borraron de este dispositivo.' : ''}
            </p>
          </div>
        </section>

        <p>
          <Link to="/pedido" className="font-bold underline underline-offset-4">
            Volver a la lista de precios
          </Link>
        </p>
      </div>
    </div>
  );
}
