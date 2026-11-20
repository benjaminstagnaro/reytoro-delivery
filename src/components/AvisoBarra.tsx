import { useCatalogo } from '../state/catalogo';

/** Aviso que pasa en movimiento bajo el menú. El texto se cambia en la hoja "Configuración". */
export function AvisoBarra() {
  const { estado } = useCatalogo();
  const texto = estado.tipo === 'listo' ? estado.catalogo.config.barra : '';
  if (!texto) return null;
  return (
    <div className="aviso-barra overflow-hidden border-b-2 border-tinta bg-cartulina py-2 font-bold" role="note">
      {/* Para lectores de pantalla, el aviso se lee una sola vez */}
      <span className="sr-only">{texto}</span>
      <div className="aviso-pista flex w-max whitespace-nowrap" aria-hidden="true">
        {Array.from({ length: 6 }, (_, i) => (
          <span key={i} className="pr-16">
            {texto}
          </span>
        ))}
      </div>
    </div>
  );
}
