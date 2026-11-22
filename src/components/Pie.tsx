import { Link } from 'react-router';
import { Logo, Toro } from './Logo';
import { useCatalogo } from '../state/catalogo';
import { clp } from '../lib/format';
import { linkWhatsApp } from '../lib/whatsapp';

export function Pie() {
  const { estado } = useCatalogo();
  const cfg = estado.tipo === 'listo' ? estado.catalogo.config : null;
  return (
    <footer className="mt-auto px-3 pb-3 md:px-6 md:pb-6">
      <div className="panel relative overflow-hidden bg-hoja text-papel">
        {/* El toro del logo, grande y suave, como marca de agua */}
        <Toro className="pointer-events-none absolute -right-20 -bottom-14 w-[24rem] text-white/[0.07] md:w-[34rem]" />
        <div className="contenedor relative grid gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr] md:py-16">
          <div>
            <div className="flex items-center gap-3">
              <Logo size={64} className="rounded-full ring-2 ring-naranjo" />
              <p className="titulo-sm text-[1.6rem]">Rey Toro</p>
            </div>
            <p className="mt-4 max-w-sm text-[1.1rem] text-white/85">
              Frutas y verduras elegidas cada madrugada en La Vega, en la puerta de tu casa.
            </p>
            <Link to="/pedido" className="boton boton-principal mt-6">
              Hacer mi pedido
            </Link>
          </div>
          <div>
            <h2 className="titulo-sm text-[1.25rem] text-naranjo-claro">Delivery</h2>
            <ul className="mt-4 space-y-2.5 text-white/85">
              {cfg && cfg.minimo > 0 && <li>Despacho gratis desde {clp(cfg.minimo)}</li>}
              <li>Pagas al recibir, por transferencia</li>
              <li>
                <Link to="/pedido" className="font-bold text-papel underline underline-offset-4">
                  Lista de precios
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h2 className="titulo-sm text-[1.25rem] text-naranjo-claro">Contacto</h2>
            <ul className="mt-4 space-y-2.5 text-white/85">
              {cfg?.whatsapp && (
                <li>
                  <a
                    href={linkWhatsApp(cfg.whatsapp, 'Hola, tengo una consulta')}
                    className="font-bold text-papel underline underline-offset-4"
                    target="_blank"
                    rel="noopener"
                  >
                    WhatsApp
                  </a>
                </li>
              )}
              {cfg?.correo && (
                <li>
                  <a href={`mailto:${cfg.correo}`} className="underline underline-offset-4">
                    {cfg.correo}
                  </a>
                </li>
              )}
              <li>
                <Link to="/food-truck" className="underline underline-offset-4">
                  Arriendo de food truck
                </Link>
              </li>
              <li>
                <Link to="/casa-en-la-playa" className="underline underline-offset-4">
                  Casa en la playa
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <p className="relative border-t border-white/15 py-5 text-center text-sm text-white/75">
          © {new Date().getFullYear()} Rey Toro Delivery ·{' '}
          <Link to="/privacidad" className="underline underline-offset-4">
            Tus datos y privacidad
          </Link>
        </p>
      </div>
    </footer>
  );
}
