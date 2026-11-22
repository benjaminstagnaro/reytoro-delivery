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
  /** Arriendo con precio fijo (ej: mensual): se muestra en grande en la caja de contacto */
  precio?: { monto: string; periodo: string; nota?: string };
  /** Dirección fija: se muestra con un mapa */
  ubicacion?: { direccion: string; comuna: string };
  /** WhatsApp propio de este arriendo (si no, usa el de la planilla) */
  whatsapp?: string;
  /** Título de la lista de condiciones (por defecto "Antes de reservar") */
  tituloCondiciones?: string;
}

export const foodTruck: Arriendo = {
  pendiente: 'Pronto subiremos fotos del food truck.',
  titulo: 'Arrienda nuestro food truck en Ñuñoa',
  bajada: 'Un food truck fijo, con patente comercial y terraza para tus clientes, listo para que instales tu negocio de comida.',
  fotos: [],
  descripcion: [
    'Es un food truck estático: está instalado de forma permanente en General Pedro Pablo Dartnell 1632, Ñuñoa, y se arrienda por mes para que trabajes ahí con tu propio negocio de comida.',
    'El arriendo incluye la patente comercial, así que puedes empezar a vender sin hacer ese trámite. También incluye una terraza amoblada con mesas y sillas para tus clientes, baño y agua.',
    'Escríbenos por WhatsApp para consultar disponibilidad.',
  ],
  datos: [
    { etiqueta: 'Arriendo', valor: '$490.000 al mes' },
    { etiqueta: 'Ubicación', valor: 'Dartnell 1632, Ñuñoa' },
    { etiqueta: 'Tipo', valor: 'Food truck fijo' },
  ],
  incluye: ['Patente comercial', 'Terraza amoblada', 'Mesas y sillas', 'Baño', 'Agua'],
  tituloCondiciones: 'Bueno saber',
  condiciones: ['Se arrienda por mes.', 'Es fijo: no se traslada a eventos.', 'El agua va incluida en el precio.'],
  precio: { monto: '$490.000', periodo: 'al mes', nota: 'Incluye agua' },
  ubicacion: { direccion: 'General Pedro Pablo Dartnell 1632', comuna: 'Ñuñoa' },
  whatsapp: '56992417052',
  mensajeWhatsApp: 'Hola, me interesa arrendar el food truck de Dartnell 1632, Ñuñoa.',
};

export const casaPlaya: Arriendo = {
  titulo: 'Casa en la playa en Algarrobo',
  bajada: 'Casa en condominio con piscina, a pocas cuadras de la playa. Ideal para descansar en familia.',
  fotos: [
    { src: 'fotos/casa-playa/01-living-comedor.webp', alt: 'Living y comedor' },
    { src: 'fotos/casa-playa/02-dormitorio-principal.webp', alt: 'Dormitorio principal' },
    { src: 'fotos/casa-playa/03-cocina.webp', alt: 'Cocina' },
    { src: 'fotos/casa-playa/04-dormitorio-camarotes.webp', alt: 'Dormitorio con camarote' },
    { src: 'fotos/casa-playa/05-bano.webp', alt: 'Baño' },
    { src: 'fotos/casa-playa/06-terraza-techada.webp', alt: 'Terraza techada' },
    { src: 'fotos/casa-playa/07-patio.webp', alt: 'Patio con pasto' },
    { src: 'fotos/casa-playa/08-vista-balcon.webp', alt: 'Vista al mar desde el balcón' },
    { src: 'fotos/casa-playa/09-piscina.webp', alt: 'Piscina del condominio' },
    { src: 'fotos/casa-playa/10-piscina-2.webp', alt: 'Otra piscina del condominio' },
    { src: 'fotos/casa-playa/11-sauna.webp', alt: 'Sauna' },
    { src: 'fotos/casa-playa/12-juegos-ninos.webp', alt: 'Juegos para niños' },
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
