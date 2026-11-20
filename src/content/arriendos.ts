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
  /** Si existe, el botón principal lleva a esta página para reservar (ej: Airbnb) */
  reserva?: { url: string; texto: string; sitio: string; nota?: string };
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
  titulo: 'Casa en la playa en Algarrobo',
  bajada: 'Casa en condominio con piscina, a pocas cuadras de la playa. Ideal para descansar en familia.',
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
    { src: 'fotos/casa-playa/12-vista-balcon.webp', alt: 'Vista al mar desde el balcón' },
    { src: 'fotos/casa-playa/13-costa.webp', alt: 'La costa de Algarrobo' },
  ],
  descripcion: [
    'Casa en un condominio seguro y tranquilo de Algarrobo, a pocas cuadras de la playa. Estás a unos 10 minutos a pie de la Plaza Porto Alegre, con playas y el Parque Canelillo cerca.',
    'La casa tiene living-comedor, cocina equipada, terraza techada, patio con parrilla y vista al mar. El condominio tiene piscina, sauna y juegos para niños.',
    'Las reservas se hacen por Airbnb, donde puedes ver las fechas libres, el precio y las opiniones de otros huéspedes.',
  ],
  datos: [
    { etiqueta: 'Ubicación', valor: 'Algarrobo, Valparaíso' },
    { etiqueta: 'Capacidad', valor: 'Hasta 5 personas' },
    { etiqueta: 'Dormitorios', valor: '2 dormitorios, 4 camas' },
    { etiqueta: 'Baño', valor: '1 baño' },
    { etiqueta: 'Opiniones en Airbnb', valor: '4,74 de 5 (61 reseñas)' },
    { etiqueta: 'Anfitrión', valor: 'Superanfitrión en Airbnb' },
  ],
  incluye: [
    'Piscina del condominio',
    'Sauna (con reserva previa)',
    'Juegos para niños',
    'Parrilla y patio',
    'Terraza techada',
    'Cocina equipada',
    'Estacionamiento gratis',
    'Vista al mar',
  ],
  condiciones: [
    'Las sábanas no están incluidas; se pueden pedir con costo aparte.',
    'El sauna se reserva con anticipación y tiene un costo aparte.',
    'La reserva y el pago se hacen en Airbnb.',
  ],
  mensajeWhatsApp: 'Hola, tengo una consulta sobre la casa en Algarrobo.',
  reserva: {
    url: 'https://www.airbnb.cl/rooms/52151452',
    texto: 'Ver fechas y reservar',
    sitio: 'Airbnb',
    nota: 'Se abre la página de la casa en Airbnb, con el precio y las fechas libres.',
  },
};
