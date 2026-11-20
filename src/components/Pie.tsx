import { Link } from 'react-router';
import { Logo } from './Logo';
import { useCatalogo } from '../state/catalogo';
import { clp } from '../lib/format';
import { linkWhatsApp } from '../lib/whatsapp';

export function Pie() {
  const { estado } = useCatalogo();
  const cfg = estado.tipo === 'listo' ? estado.catalogo.config : null;
  return (
    <footer className="mt-auto bg-tinta text-papel">
      <div className="contenedor grid gap-10 py-12 md:grid-cols-[1.3fr_1fr_1fr]">
        <div className="flex items-start gap-4">
          <Logo size={72} className="ring-2 ring-naranjo" />
          <div>
            <p className="letrero text-2xl">Rey Toro Delivery</p>
            <p className="mt-2 max-w-sm text-white/80">
              Frutas y verduras compradas de madrugada en La Vega, en la puerta de tu casa.
            </p>
          </div>
        </div>
        <div>
          <h2 className="text-lg font-bold text-cartulina">Pedidos</h2>
          <ul className="mt-3 space-y-2 text-white/85">
            {cfg && cfg.minimo > 0 && <li>Despacho gratis desde {clp(cfg.minimo)}</li>}
            <li>Pagas al recibir, por transferencia</li>
            <li>
              <Link to="/pedido" className="font-bold text-papel underline underline-offset-4">
                Ver la lista de precios
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h2 className="text-lg font-bold text-cartulina">Contacto</h2>
          <ul className="mt-3 space-y-2 text-white/85">
            {cfg?.whatsapp && (
              <li>
                <a
                  href={linkWhatsApp(cfg.whatsapp, 'Hola, tengo una consulta')}
                  className="font-bold text-papel underline underline-offset-4"
                  target="_blank"
                  rel="noopener"
                >
                  Escríbenos por WhatsApp
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
      <div className="border-t border-white/10 py-4 text-center text-sm text-white/60">
        © {new Date().getFullYear()} Rey Toro Delivery
      </div>
    </footer>
  );
}
