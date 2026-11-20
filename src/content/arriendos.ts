/**
 * Contenido de las secciones de arriendo.
 * ⚠️ Lo que todavía falta se indica en `pendiente` (se muestra como aviso amarillo en la página).
 *    Cuando esté todo, borrar `pendiente` y el aviso desaparece.
 *
 * Fotos: guardarlas en public/fotos/food-truck/ y public/fotos/casa-playa/
 * y poner el nombre del archivo en `src` (ej: "fotos/casa-playa/02-living.webp").
 * Cada foto tiene además una versión chica "-640.webp" para celulares.
 */

export interface FotoArriendo {
  /** Ruta dentro de /public. Vacío = foto pendiente. */
  src: string;
  /** Descripción de la foto (la leen los lectores de pantalla) */
  alt: string;
}

export interface Arriendo {
  /** Qué falta completar (aviso amarillo arriba de la página). Vacío = todo listo. */
  pendiente?: string;
  titulo: string;
  bajada: string;
  fotos: FotoArriendo[];
  descripcion: string[];
  datos: { etiqueta: string; valor: string }[];
  incluye: string[];
  condiciones: string[];
  /** Mensaje inicial de WhatsApp al consultar */
  mensajeWhatsApp: string;
}

export const foodTruck: Arriendo = {
  pendiente: 'Contenido de ejemplo: faltan las fotos y los datos reales del food truck.',
  titulo: 'Arrienda nuestro food truck',
  bajada: 'Equipado y listo para cocinar en tu evento, cumpleaños o feria.',
  fotos: [
    { src: '', alt: 'El food truck por fuera' },
    { src: '', alt: 'Cocina del food truck' },
    { src: '', alt: 'Ventana de atención' },
    { src: '', alt: 'Food truck en un evento' },
  ],
  descripcion: [
    'Tenemos un food truck propio que arrendamos para eventos particulares y de empresa.',
    'Escríbenos con la fecha y el tipo de evento y te contamos disponibilidad y precio.',
  ],
  datos: [
    { etiqueta: 'Ubicación', valor: 'Por confirmar' },
    { etiqueta: 'Ideal para', valor: 'Eventos, cumpleaños y ferias' },
    { etiqueta: 'Precio', valor: 'Consultar' },
  ],
  incluye: ['Cocina equipada', 'Ventana de atención', 'Conexión eléctrica'],
  condiciones: ['Reserva con anticipación', 'Precio según días y lugar del evento'],
  mensajeWhatsApp: 'Hola, quiero consultar por el arriendo del food truck.',
};

export const casaPlaya: Arriendo = {
  pendiente: 'Faltan por confirmar la ubicación, la capacidad y el precio.',
  titulo: 'Casa en la playa',
  bajada: 'Casa en condominio con piscinas, sauna y áreas verdes, cerca del mar.',
  fotos: [
    { src: 'fotos/casa-playa/01-piscina.webp', alt: 'Piscina del condominio' },
    { src: 'fotos/casa-playa/02-living-comedor.webp', alt: 'Living y comedor' },
    { src: 'fotos/casa-playa/03-dormitorio-principal.webp', alt: 'Dormitorio principal' },
    { src: 'fotos/casa-playa/04-cocina.webp', alt: 'Cocina' },
    { src: 'fotos/casa-playa/05-dormitorio-camarotes.webp', alt: 'Dormitorio con camarote' },
    { src: 'fotos/casa-playa/06-bano.webp', alt: 'Baño' },
    { src: 'fotos/casa-playa/07-terraza-techada.webp', alt: 'Terraza techada' },
    { src: 'fotos/casa-playa/08-patio.webp', alt: 'Patio con pasto' },
    { src: 'fotos/casa-playa/09-sauna.webp', alt: 'Sauna' },
    { src: 'fotos/casa-playa/10-piscina-2.webp', alt: 'Otra piscina del condominio' },
    { src: 'fotos/casa-playa/11-juegos-ninos.webp', alt: 'Juegos para niños' },
    { src: 'fotos/casa-playa/12-vista-balcon.webp', alt: 'Vista desde el balcón' },
    { src: 'fotos/casa-playa/13-costa.webp', alt: 'La costa, cerca de la casa' },
  ],
  descripcion: [
    'Arrendamos nuestra casa en un condominio tranquilo, con piscinas, sauna y juegos para niños, ideal para descansar en familia.',
    'La casa tiene living-comedor, cocina equipada, terraza techada y patio con pasto.',
    'Cuéntanos las fechas y cuántas personas son, y te respondemos con disponibilidad y precio.',
  ],
  datos: [
    { etiqueta: 'Ubicación', valor: 'Por confirmar' },
    { etiqueta: 'Capacidad', valor: 'Por confirmar' },
    { etiqueta: 'Precio', valor: 'Consultar' },
  ],
  incluye: [
    'Piscinas del condominio',
    'Sauna',
    'Juegos para niños',
    'Terraza techada',
    'Patio con pasto',
    'Cocina equipada',
  ],
  condiciones: ['Mínimo de noches según temporada', 'Reserva con anticipación'],
  mensajeWhatsApp: 'Hola, quiero consultar por el arriendo de la casa en la playa.',
};
