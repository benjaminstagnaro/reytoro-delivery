import { useLocation } from 'react-router';
import { useCatalogo } from '../state/catalogo';

/**
 * Aviso fijo bajo el menú. El texto se cambia en la hoja "Configuración".
 * Es un aviso del delivery: no se muestra en las páginas de arriendo.
 * Va quieto (no en movimiento): se lee mejor y cumple WCAG 2.2.2, que pide poder pausar lo que se mueve.
 */
export function AvisoBarra() {
  const { estado } = useCatalogo();
  const { pathname } = useLocation();
  const texto = estado.tipo === 'listo' ? estado.catalogo.config.barra : '';
  const esDelivery = pathname === '/' || pathname.startsWith('/pedido');
  if (!texto || !esDelivery) return null;
  return (
    <section aria-label="Aviso" className="bg-hoja px-4 py-2.5 text-center font-bold text-papel">
      {texto}
    </section>
  );
}
