/** Un producto tal como lo entrega la planilla (hoja "Productos"). */
export interface Producto {
  /** Categoría (Frutas, Verduras, Carnes…) */
  c: string;
  /** Nombre, como está escrito en la planilla (normalmente en mayúsculas) */
  n: string;
  /** Medida: KILO, 500 GRS, UNIDAD, PAQUETE… */
  m: string;
  /** Precio en pesos chilenos */
  p: number;
  /** Promoción: "OFERTA", "DESTACADO" o vacío */
  o: string;
}

export interface Categoria {
  nombre: string;
  emoji: string;
}

/** Datos públicos de la hoja "Configuración". */
export interface Config {
  negocio: string;
  whatsapp: string;
  bienvenida: string;
  minimo: number;
  envio: number;
  razon: string;
  rut: string;
  banco: string;
  tipoCuenta: string;
  cuenta: string;
  correo: string;
  web: string;
  barra: string;
  categorias: Categoria[];
  /** Ej: "Lunes a viernes". Si dice "lunes a viernes", no se aceptan fechas de fin de semana. */
  diasDespacho?: string;
  /** Comunas donde se despacha. Vacía = no se pide comuna. */
  comunas?: string[];
}

export interface Catalogo {
  productos: Producto[];
  config: Config;
}

export interface DatosCliente {
  nombre: string;
  telefono: string;
  comuna: string;
  direccion: string;
  /** AAAA-MM-DD o vacío */
  entrega: string;
  comentarios: string;
}

export interface PedidoEnviado {
  numero: number;
  subtotal: number;
  despacho: number;
  despachoTexto: string;
  total: number;
  hecho: string;
  mensaje: string;
  whatsapp: string;
}
