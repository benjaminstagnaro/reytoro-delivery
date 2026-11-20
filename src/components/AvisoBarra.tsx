import { useLocation } from 'react-router';
import { useCatalogo } from '../state/catalogo';

/**
 * Aviso que pasa en movimiento bajo el menú. El texto se cambia en la hoja "Configuración".
 * Es un aviso del delivery: no se muestra en las páginas de arriendo.
 */
export function AvisoBarra() {
  const { estado } = useCatalogo();
  const { pathname } = useLocation();
  const texto = estado.tipo === 'listo' ? estado.catalogo.config.barra : '';
  const esDelivery = pathname === '/' || pathname.startsWith('/pedido');
  if (!texto || !esDelivery) return null;
  return (
    <div className="overflow-hidden bg-hoja py-2.5 font-bold text-papel" role="note">
      <span className="sr-only">{texto}</span>
      <div className="aviso-pista flex w-max whitespace-nowrap" aria-hidden="true">
        {Array.from({ length: 6 }, (_, i) => (
          <span key={i} className="pr-20">
            {texto}
          </span>
        ))}
      </div>
    </div>
  );
}
