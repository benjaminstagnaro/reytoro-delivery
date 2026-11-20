/**
 * REY TORO DELIVERY — Página de pedidos
 * Lee productos y precios desde la hoja "Productos",
 * guarda cada pedido como una fila en "Pedidos"
 * y arma el mensaje de WhatsApp para el cliente.
 */

const HOJA_PRODUCTOS = 'Productos';
const HOJA_PEDIDOS = 'Pedidos';
const HOJA_CONFIG = 'Configuración';
const HOJA_ARCHIVO = 'Archivo';
const MAX_CANTIDAD = 999;
const FILA_BARRA_ = 'Mensaje de la barra de avisos';
const BARRA_POR_DEFECTO_ = '🕘 Pedidos después de las 9 PM se entregan pasado mañana';
const FILA_CATEGORIAS_ = 'Categorías de la página (en orden, con emoji)';
const CATEGORIAS_POR_DEFECTO_ = '🍎 Frutas, 🥬 Verduras, 🥩 Carnes, 🥚 Huevos, 🧊 Congelados, 🧺 Otros';

/* ---------------- Página y API ---------------- */

// Sin parámetros: muestra la página de pedidos actual.
// Con ?api=catalogo: entrega productos y configuración en JSON (para la página web nueva).
function doGet(e) {
  if (e && e.parameter && e.parameter.api === 'catalogo') return json_(obtenerDatos_());
  const t = HtmlService.createTemplateFromFile('Index');
  t.datos = JSON.stringify(obtenerDatos_()).replace(/</g, '\\u003c');
  return t.evaluate()
    .setTitle('Rey Toro Delivery · Haz tu pedido')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function obtenerDatos_() {
  return { productos: obtenerProductos_(), config: configPublica_() };
}

// Solo lo que el cliente necesita ver: nunca el correo de avisos ni la clave de CallMeBot.
function configPublica_() {
  const c = obtenerConfig_();
  delete c.avisoCorreo;
  delete c.callmebot;
  return c;
}

// La página web nueva envía los pedidos aquí (POST con el pedido en JSON).
function doPost(e) {
  try {
    const pedido = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (pedido.sitio) return json_({ ok: true, ignorado: true }); // campo trampa: solo lo llenan los robots
    if ((pedido.items || []).length > 300) throw new Error('El pedido tiene demasiados productos.');
    return json_({ ok: true, pedido: guardarPedido(pedido) });
  } catch (err) {
    return json_({ ok: false, error: String((err && err.message) || err) });
  }
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

/* ---------------- Lectura de la planilla ---------------- */

function libro_() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

// Busca una hoja por nombre. Si alguien le cambió el nombre a la pestaña sin querer,
// la encuentra igual (por su ID) y le devuelve su nombre original.
function hoja_(nombre) {
  const libro = libro_();
  let h = libro.getSheetByName(nombre);
  if (h) return h;
  const id = PropertiesService.getScriptProperties().getProperty('hoja:' + nombre);
  if (id) {
    h = libro.getSheets().filter(function (x) { return String(x.getSheetId()) === id; })[0];
    if (h) { try { h.setName(nombre); } catch (e) {} return h; }
  }
  return null;
}

function obtenerConfig_() {
  const filas = hoja_(HOJA_CONFIG).getDataRange().getValues();
  const c = {};
  filas.forEach(function (f) { if (f[0] !== '') c[String(f[0]).trim()] = f[1]; });
  const txt = function (k, def) { return c[k] === undefined || c[k] === '' ? (def || '') : String(c[k]).trim(); };
  return {
    negocio: txt('Nombre del negocio', 'Rey Toro Delivery'),
    whatsapp: txt('WhatsApp que recibe los pedidos').replace(/\D/g, ''),
    bienvenida: txt('Mensaje de bienvenida'),
    minimo: aNumero_(c['Pedido mínimo para despacho gratis']),
    envio: aNumero_(c['Costo de despacho si no alcanza el mínimo']),
    razon: txt('Razón social'),
    rut: txt('RUT empresa'),
    banco: txt('Banco'),
    tipoCuenta: txt('Tipo de cuenta'),
    cuenta: txt('Número de cuenta'),
    correo: txt('Correo para comprobantes'),
    web: txt('Página web'),
    avisoCorreo: txt('Correo que recibe el aviso de cada pedido'),
    callmebot: txt('WhatsApp automático: clave CallMeBot (opcional)'),
    // Si la fila no existe todavía se usa el texto por defecto; si existe pero está vacía, no se muestra la barra.
    barra: c.hasOwnProperty(FILA_BARRA_) ? String(c[FILA_BARRA_]).trim() : BARRA_POR_DEFECTO_,
    categorias: leerCategorias_(String(c[FILA_CATEGORIAS_] || '').trim() || CATEGORIAS_POR_DEFECTO_)
  };
}

/* ---------------- Categorías (secciones de la página) ---------------- */

// "🍎 Frutas, 🥬 Verduras, 🥩 Carnes" -> [{nombre:'Frutas', emoji:'🍎'}, ...]
function leerCategorias_(texto) {
  return String(texto).split(',').map(function (x) {
    const t = x.trim();
    const i = t.search(/[A-Za-zÁÉÍÓÚÑáéíóúñ]/);
    if (i < 0) return null;
    return { nombre: t.slice(i).trim(), emoji: t.slice(0, i).trim() };
  }).filter(function (x) { return x && x.nombre; });
}

// Compara sin mayúsculas, tildes ni plurales: "carne", "CARNES " y "Carnes" son la misma.
function claveCategoria_(s) {
  return sinTildes_(s).split(' ').map(function (w) { return w.length > 3 ? w.replace(/(ES|S|E)$/, '') : w; }).join(' ');
}

// Devuelve el nombre oficial de la categoría y su posición en la lista de Configuración.
function categoriaOficial_(texto, cats) {
  const crudo = String(texto || '').trim() || 'Otros';
  const k = claveCategoria_(crudo);
  for (let i = 0; i < cats.length; i++) {
    if (claveCategoria_(cats[i].nombre) === k) return { nombre: cats[i].nombre, orden: i };
  }
  return { nombre: crudo, orden: 1000 };
}

function obtenerProductos_() {
  const cats = obtenerConfig_().categorias;
  const hoja = hoja_(HOJA_PRODUCTOS);
  const n = hoja.getLastRow();
  if (n < 2) return [];
  return hoja.getRange(2, 1, n - 1, 6).getValues()
    .map(function (f) {
      return {
        c: categoriaOficial_(f[0], cats).nombre,
        n: String(f[1]).trim(),
        m: String(f[2]).trim(),
        p: aNumero_(f[3]),
        o: String(f[4]).trim().toUpperCase(),
        d: String(f[5]).trim().toUpperCase()
      };
    })
    .filter(function (x) { return x.n && x.p > 0 && x.d !== 'NO'; })
    .map(function (x) { return { c: x.c, n: x.n, m: x.m, p: x.p, o: x.o }; });
}

/* ---------------- Guardar pedido ---------------- */

function guardarPedido(pedido) {
  pedido = pedido || {};
  const cfg = obtenerConfig_();
  const catalogo = {};
  obtenerProductos_().forEach(function (p) { catalogo[p.n + '|' + p.m] = p; });

  const nombre = limpiar_(pedido.nombre, 80);
  const telefono = limpiar_(pedido.telefono, 30);
  const direccion = limpiar_(pedido.direccion, 200);
  const comentarios = limpiar_(pedido.comentarios, 500);
  const entrega = fechaTexto_(pedido.entrega);
  if (!nombre || !telefono || !direccion) {
    throw new Error('Faltan datos: escribe tu nombre, teléfono y dirección.');
  }

  // Los precios se toman SIEMPRE de la planilla, no de lo que manda la página.
  const lineas = [];
  let subtotal = 0;
  (pedido.items || []).forEach(function (it) {
    const p = catalogo[String(it.n) + '|' + String(it.m)];
    const q = Math.floor(Number(it.q));
    if (!(q > 0)) return;
    if (!p) throw new Error('"' + it.n + '" ya no está disponible o cambió. Recarga la página e inténtalo de nuevo.');
    const cant = Math.min(q, MAX_CANTIDAD);
    subtotal += p.p * cant;
    lineas.push({ q: cant, p: p });
  });
  if (!lineas.length) throw new Error('Tu pedido está vacío.');

  const despacho = calcularDespacho_(subtotal, cfg);
  const total = subtotal + despacho.monto;
  const detalle = lineas.map(function (l) {
    return l.q + ' × ' + l.p.n + ' (' + l.p.m + ') = ' + clp_(l.p.p * l.q);
  }).join('\n');

  const ahora = new Date();
  const tz = libro_().getSpreadsheetTimeZone();
  const hecho = Utilities.formatDate(ahora, tz, 'dd-MM-yyyy') + ' a las ' + Utilities.formatDate(ahora, tz, 'HH:mm');

  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  let numero;
  try {
    numero = siguienteNumero_(ahora);
    const hoja = hoja_(HOJA_PEDIDOS);
    hoja.appendRow([numero, ahora, 'Nuevo', seguro_(nombre), seguro_(telefono), seguro_(direccion), entrega,
      detalle, subtotal, despacho.monto > 0 ? despacho.monto : despacho.texto, total, seguro_(comentarios)]);
    const fila = hoja.getLastRow();
    hoja.getRange(fila, 2).setNumberFormat('dd-mm-yyyy hh:mm');
    hoja.getRange(fila, 9, 1, 3).setNumberFormat('$#,##0');
    hoja.getRange(fila, 1, 1, 12).setVerticalAlignment('top');
    hoja.getRange(fila, 8).setWrap(true);
    SpreadsheetApp.flush();
  } finally {
    lock.releaseLock();
  }

  const msj = [
    '*Pedido N° ' + numero + ' — ' + cfg.negocio + '*',
    '🕘 Hecho el ' + hecho,
    '',
    lineas.map(function (l) { return '• ' + l.q + ' × ' + l.p.n + ' (' + l.p.m + ') = ' + clp_(l.p.p * l.q); }).join('\n'),
    '',
    'Subtotal: ' + clp_(subtotal),
    'Despacho: ' + (despacho.monto > 0 ? clp_(despacho.monto) : despacho.texto),
    '*Total: ' + clp_(total) + '*' + (despacho.texto === 'Por confirmar' ? ' + despacho' : ''),
    '',
    'Nombre: ' + nombre,
    'Teléfono: ' + telefono,
    'Dirección: ' + direccion,
    entrega ? 'Entrega: ' + entrega : null,
    comentarios ? 'Comentarios: ' + comentarios : null
  ].filter(function (x) { return x !== null; }).join('\n');

  // Aviso automático a Rey Toro (no depende de que el cliente toque el botón de WhatsApp).
  avisarNuevoPedido_({ numero: numero, nombre: nombre, total: total, mensaje: msj }, cfg);

  return {
    numero: numero,
    subtotal: subtotal,
    despacho: despacho.monto,
    despachoTexto: despacho.texto,
    hecho: hecho,
    total: total,
    mensaje: msj,
    whatsapp: cfg.whatsapp
  };
}

function calcularDespacho_(subtotal, cfg) {
  if (subtotal >= cfg.minimo) return { monto: 0, texto: 'Gratis' };
  if (cfg.envio > 0) return { monto: cfg.envio, texto: clp_(cfg.envio) };
  return { monto: 0, texto: 'Por confirmar' };
}

// Número de pedido DEL DÍA: el primer pedido de cada día es el N° 1, el segundo el N° 2...
// (Se cuenta según el día en que llegó el pedido, en hora de Chile.)
function siguienteNumero_(ahora) {
  const tz = libro_().getSpreadsheetTimeZone();
  const dia = Utilities.formatDate(ahora, tz, 'yyyy-MM-dd');
  const clave = 'pedidosDelDia:' + dia;
  const props = PropertiesService.getScriptProperties();
  let ultimo = Number(props.getProperty(clave));
  if (!ultimo) {
    // Por seguridad, si no hay contador guardado, revisa los pedidos que ya llegaron hoy.
    ultimo = 0;
    [HOJA_PEDIDOS, HOJA_ARCHIVO].forEach(function (nombre) {
      const h = hoja_(nombre);
      if (!h || h.getLastRow() < 2) return;
      h.getRange(2, 1, h.getLastRow() - 1, 2).getValues().forEach(function (f) {
        const esDeHoy = Object.prototype.toString.call(f[1]) === '[object Date]' &&
          Utilities.formatDate(f[1], tz, 'yyyy-MM-dd') === dia;
        if (esDeHoy && Number(f[0]) > ultimo) ultimo = Number(f[0]);
      });
    });
  }
  ultimo += 1;
  props.setProperty(clave, String(ultimo));
  return ultimo;
}

/* ---------------- Menú y ayudas para tu papá ---------------- */

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  const ver = ui.createMenu('👁️ Ver pedidos')
    .addItem('Solo Nuevos', 'verNuevos')
    .addItem('Solo Entregados', 'verEntregados')
    .addSeparator()
    .addItem('Ver todos (quitar filtro)', 'verTodos');
  ui.createMenu('Rey Toro')
    .addItem('🗑️ Eliminar pedidos entregados', 'eliminarEntregados')
    .addSeparator()
    .addSubMenu(ver)
    .addSeparator()
    .addItem('🛒 Imprimir lista de compras (pedidos nuevos)', 'imprimirListaCompras')
    .addItem('🖨️ Imprimir hojas de clientes (pedidos nuevos)', 'imprimirHojasClientes')
    .addItem('🖨️ Imprimir pedidos seleccionados', 'imprimirSeleccionados')
    .addToUi();
  try { prepararHojaPedidos_(); } catch (err) { Logger.log(err); }
  try { blindarPlanilla_(); } catch (err) { Logger.log(err); }
}

// Deja la hoja Pedidos lista: Estado con solo "Nuevo" / "Entregado" y el botón rojo arriba a la izquierda.
function prepararHojaPedidos_() {
  const hoja = hoja_(HOJA_PEDIDOS);
  if (!hoja) return;
  const regla = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Nuevo', 'Entregado'], true).setAllowInvalid(true).build();
  hoja.getRange(2, 3, hoja.getMaxRows() - 1, 1).setDataValidation(regla);
  const yaEsta = hoja.getImages().some(function (img) {
    try { return img.getScript() === 'eliminarEntregados'; } catch (e) { return false; }
  });
  if (!yaEsta) {
    hoja.setRowHeight(1, 62);
    hoja.getRange(1, 1, 1, 12).setVerticalAlignment('bottom');
    const blob = Utilities.newBlob(Utilities.base64Decode(BOTON_ELIMINAR_), 'image/png', 'eliminar-entregados.png');
    hoja.insertImage(blob, 1, 1, 4, 3).setWidth(176).setHeight(32).assignScript('eliminarEntregados');
  }
}

/* ---------------- Aviso automático de cada pedido ---------------- */

function avisarNuevoPedido_(r, cfg) {
  try {
    const para = cfg.avisoCorreo || Session.getEffectiveUser().getEmail();
    if (para) {
      MailApp.sendEmail({
        to: para,
        subject: '🛒 Pedido N° ' + r.numero + ' de hoy — ' + r.nombre + ' — ' + clp_(r.total),
        body: r.mensaje.replace(/\*/g, '') + '\n\nVer todos los pedidos: ' + libro_().getUrl()
      });
    }
  } catch (e) { Logger.log('No se pudo enviar el correo de aviso: ' + e); }
  try {
    if (cfg.callmebot && cfg.whatsapp) {
      UrlFetchApp.fetch('https://api.callmebot.com/whatsapp.php?phone=' + encodeURIComponent('+' + cfg.whatsapp) +
        '&text=' + encodeURIComponent(r.mensaje) + '&apikey=' + encodeURIComponent(cfg.callmebot), { muteHttpExceptions: true });
    }
  } catch (e) { Logger.log('No se pudo enviar el WhatsApp automático: ' + e); }
}

// Para probar el aviso desde Apps Script (botón Ejecutar). También sirve para autorizar los permisos nuevos.
function probarAviso() {
  avisarNuevoPedido_({ numero: 0, nombre: 'Cliente de prueba', total: 12345,
    mensaje: '*Pedido de PRUEBA — ' + obtenerConfig_().negocio + '*\n\nSi te llegó este aviso, los avisos automáticos funcionan.' },
    obtenerConfig_());
  avisar_('Listo: se envió un aviso de prueba. Revisa tu correo' + (obtenerConfig_().callmebot ? ' y tu WhatsApp.' : '.'));
}

/* ---------------- Protección contra cambios sin querer ---------------- */

function blindarPlanilla_() {
  const props = PropertiesService.getScriptProperties();
  [HOJA_PEDIDOS, HOJA_PRODUCTOS, HOJA_CONFIG].forEach(function (n) {
    const h = hoja_(n);
    if (h) props.setProperty('hoja:' + n, String(h.getSheetId()));
  });
  asegurarConfig_();
  actualizarListaCategorias_();
  if (props.getProperty('blindado') === '1') return;

  const AVISO = 'No cambies este título ni muevas las columnas: la página de pedidos las necesita tal cual.';
  const proteger = function (rango, desc) { rango.protect().setDescription(desc).setWarningOnly(true); };

  const pe = hoja_(HOJA_PEDIDOS);
  if (pe) {
    proteger(pe.getRange(1, 1, 1, 12), 'Títulos de la hoja Pedidos');
    pe.getRange('B1').setNote('⚠️ ' + AVISO);
    pe.getRange('C1').setNote('Elige "Nuevo" o "Entregado" con la flechita ▼.\n\n⚠️ ' + AVISO);
  }
  const pr = hoja_(HOJA_PRODUCTOS);
  if (pr) {
    if (!String(pr.getRange('H1').getValue()).trim()) pr.getRange('H1').setValue('Juntar en lista de compras como (opcional)');
    proteger(pr.getRange(1, 1, 1, 8), 'Títulos de la hoja Productos');
    pr.getRange('B1').setNote('⚠️ ' + AVISO);
    pr.getRange('D1').setNote('Escribe SOLO el número del precio, sin letras ni signos. Ejemplo: 3990\n\nSi un precio queda vacío, ese producto no aparece en la página.');
    pr.getRange('E1').setNote('Elige OFERTA o DESTACADO con la flechita ▼, o déjalo vacío.');
    pr.getRange('F1').setNote('SÍ = aparece en la página.\nNO = no aparece (por ejemplo, si se acabó).');
    pr.getRange('H1').setNote('Opcional. Escribe el mismo nombre en varios productos para que en la lista de compras salgan juntos y sumados.');
    const reglaPrecio = SpreadsheetApp.newDataValidation().requireNumberGreaterThan(0).setAllowInvalid(false)
      .setHelpText('Escribe solo el número del precio, sin letras. Ejemplo: 3990').build();
    pr.getRange(2, 4, pr.getMaxRows() - 1, 1).setDataValidation(reglaPrecio);
  }
  const cf = hoja_(HOJA_CONFIG);
  if (cf) {
    proteger(cf.getRange(1, 1, cf.getMaxRows(), 1), 'Nombres de la hoja Configuración');
    cf.getRange('A1').setNote('⚠️ No cambies esta columna. Cambia solo los valores de la columna B.');
  }
  props.setProperty('blindado', '1');
}

// La flechita de la columna Categoría (hoja Productos) ofrece las categorías de Configuración.
function actualizarListaCategorias_() {
  const pr = hoja_(HOJA_PRODUCTOS);
  if (!pr) return;
  const nombres = obtenerConfig_().categorias.map(function (c) { return c.nombre; });
  if (!nombres.length) return;
  const regla = SpreadsheetApp.newDataValidation().requireValueInList(nombres, true).setAllowInvalid(true).build();
  pr.getRange(2, 1, pr.getMaxRows() - 1, 1).setDataValidation(regla);
}

// Agrega a Configuración las filas nuevas si todavía no existen.
function asegurarConfig_() {
  const cf = hoja_(HOJA_CONFIG);
  if (!cf) return;
  const tiene = {};
  cf.getRange(1, 1, Math.max(cf.getLastRow(), 1), 1).getValues().forEach(function (f) { tiene[String(f[0]).trim()] = true; });
  [['Correo que recibe el aviso de cada pedido', '', 'Si queda vacío, el aviso llega al correo dueño de esta planilla.'],
   ['WhatsApp automático: clave CallMeBot (opcional)', '', 'Opcional. Si la llenas, cada pedido también llega por WhatsApp automático.'],
   [FILA_BARRA_, BARRA_POR_DEFECTO_, 'Texto que se mueve arriba en la página. Si lo borras, la barra desaparece.'],
   [FILA_CATEGORIAS_, CATEGORIAS_POR_DEFECTO_, 'Secciones de la página, en el orden en que aparecen. Formato: emoji + nombre, separadas por coma.']]
    .forEach(function (f) {
      if (!tiene[f[0]]) cf.getRange(cf.getLastRow() + 1, 1, 1, 3).setValues([f]);
    });
}

/* ---------------- Filtro por estado en la hoja Pedidos ---------------- */

const ESTADOS_ = ['Nuevo', 'Preparado', 'Entregado', 'Cancelado'];

function verNuevos() { filtrarPedidos_(['Nuevo', 'Preparado']); }
function verEntregados() { filtrarPedidos_(['Entregado']); }
function verTodos() { filtrarPedidos_(null); }

// Muestra solo los pedidos con esos estados (null = mostrar todos).
// El filtro abarca la hoja completa, así los pedidos que llegan después también se filtran.
function filtrarPedidos_(mostrar) {
  const hoja = hoja_(HOJA_PEDIDOS);
  const actual = hoja.getFilter();
  if (actual) actual.remove();
  hoja.activate();
  if (!mostrar) return;
  const ocultar = ESTADOS_.filter(function (e) { return mostrar.indexOf(e) < 0; }).concat(['']);
  const criterio = SpreadsheetApp.newFilterCriteria().setHiddenValues(ocultar).build();
  hoja.getRange(1, 1, hoja.getMaxRows(), 12).createFilter().setColumnFilterCriteria(3, criterio);
}

/* ---------------- Lista de compras: juntar variantes del mismo producto ---------------- */

function sinTildes_(s) {
  return String(s).toUpperCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ').trim();
}

// ¿Es una variante "oferta" (pack) de otro producto?
function esOferta_(nombre) {
  return /\bOFERTA\b/.test(sinTildes_(nombre));
}

// Clave para comparar nombres: sin OFERTA / SUPER OFERTA / "3 UNIDADES" / BANDEJA y sin plurales.
function claveGrupo_(nombre) {
  return sinTildes_(nombre)
    .replace(/\bSUPER OFERTA\b/g, ' ')
    .replace(/\bOFERTA\b/g, ' ')
    .replace(/\b\d+ UNIDAD(ES)?\b/g, ' ')
    .replace(/\bBANDEJA\b/g, ' ')
    .split(' ').filter(function (w) { return w; })
    .map(function (w) { return w.length > 3 ? w.replace(/(ES|S|E)$/, '') : w; })
    .join(' ');
}

// Convierte la medida en cantidad + unidad. "2 KILOS" -> {v:2,u:'kg'}, "500 GRS" -> {v:0.5,u:'kg'}
function medida_(m) {
  const s = sinTildes_(m);
  let r;
  if ((r = /^(?:SOLO )?(\d+(?: \d+)?)? ?(KILO|KILOS|KG)$/.exec(s))) return { v: r[1] ? Number(r[1].replace(' ', '.')) : 1, u: 'kg' };
  if ((r = /^(\d+) ?(GRS|GR|G)$/.exec(s))) return { v: Number(r[1]) / 1000, u: 'kg' };
  if ((r = /^(\d+)? ?(UNIDAD|UNIDADES|UN)$/.exec(s))) return { v: r[1] ? Number(r[1]) : 1, u: 'un' };
  if (s === 'DOCENA') return { v: 12, u: 'un' };
  return { v: 1, u: String(m).trim().toUpperCase() }; // PAQUETE, BANDEJA, MATA, 6 O 7 KILOS...
}

// Arma el mapa producto -> grupo usando la hoja Productos.
// Si la columna H ("Juntar como") tiene algo escrito, eso manda.
function mapaGrupos_() {
  const catsCfg = obtenerConfig_().categorias;
  const hp = hoja_(HOJA_PRODUCTOS);
  const n = hp.getLastRow();
  const filas = n >= 2 ? hp.getRange(2, 1, n - 1, 8).getValues() : [];
  const prods = filas.map(function (f, i) {
    const cat = categoriaOficial_(f[0], catsCfg);
    return { c: cat.nombre, co: cat.orden, n: String(f[1]).trim(), m: String(f[2]).trim(), i: i,
      manual: String(f[7] || '').trim(), clave: claveGrupo_(f[1]), oferta: esOferta_(f[1]) };
  }).filter(function (p) { return p.n; });

  const normales = {};
  prods.forEach(function (p) { if (!p.oferta) (normales[p.clave] = normales[p.clave] || []).push(p); });

  const mapa = {};
  prods.forEach(function (p) {
    let clave = p.clave;
    if (p.oferta && !normales[clave]) {
      // "PALTA HASS OFERTA" -> "PALTA HASS CHILENA" si es el único producto normal que empieza igual
      const cand = Object.keys(normales).filter(function (k) {
        return k.indexOf(clave + ' ') === 0 && normales[k][0].c === p.c;
      });
      if (cand.length === 1) clave = cand[0];
    }
    if (p.manual) clave = 'MANUAL:' + sinTildes_(p.manual);
    mapa[p.n + '|' + p.m] = { clave: clave, c: p.c, i: p.i, manual: p.manual };
  });

  // Nombre para mostrar: el manual, o el producto normal de nombre más corto, o el nombre sin "OFERTA".
  const nombres = {};
  prods.forEach(function (p) {
    const g = mapa[p.n + '|' + p.m];
    let propuesto = p.manual || (p.oferta ? p.n.replace(/\s*\bSUPER OFERTA\b|\s*\bOFERTA\b/gi, '') : p.n);
    propuesto = propuesto.replace(/\s+\d+\s+UNIDAD(ES)?\b/i, '').trim();
    const actual = nombres[g.clave];
    const mejor = !actual || p.manual ||
      (!p.oferta && (actual.oferta || propuesto.length < actual.nombre.length) && !actual.manual);
    if (mejor) nombres[g.clave] = { nombre: propuesto, oferta: p.oferta, manual: !!p.manual };
  });
  Object.keys(mapa).forEach(function (k) { mapa[k].nombre = nombres[mapa[k].clave].nombre; });
  return mapa;
}

function sumar_(acc, med, q) {
  acc[med.u] = (acc[med.u] || 0) + med.v * q;
}

function numeroLindo_(v) {
  const r = Math.round(v * 100) / 100;
  return String(r).replace('.', ',');
}

function textoCantidad_(acc, corto) {
  const partes = [];
  if (acc.kg) partes.push(numeroLindo_(acc.kg) + (corto ? ' kg' : (acc.kg === 1 ? ' kilo' : ' kilos')));
  if (acc.un) partes.push(numeroLindo_(acc.un) + (corto ? ' un' : (acc.un === 1 ? ' unidad' : ' unidades')));
  Object.keys(acc).filter(function (u) { return u !== 'kg' && u !== 'un'; }).forEach(function (u) {
    partes.push(numeroLindo_(acc[u]) + ' × ' + u.toLowerCase());
  });
  return partes.join(' + ');
}

/* ---------------- Impresión: lista de compras + una hoja por cliente ---------------- */

// Pedidos por entregar (todo lo que no está marcado como Entregado).
function pendientes_() {
  return leerPedidos_().filter(function (p) {
    return p.estado !== 'Entregado' && p.estado !== 'Cancelado';
  });
}

// Resumen total de lo que hay que comprar (una vez al día, antes de ir a comprar).
function imprimirListaCompras() {
  const pedidos = pendientes_();
  if (!pedidos.length) { avisar_('No hay pedidos nuevos (todos están marcados como Entregado).'); return; }
  mostrarImpresion_(pedidos, 'compras');
}

// Una hoja por cliente, para repartir.
function imprimirHojasClientes() {
  const pedidos = pendientes_();
  if (!pedidos.length) { avisar_('No hay pedidos nuevos (todos están marcados como Entregado).'); return; }
  mostrarImpresion_(pedidos, 'clientes');
}

function imprimirSeleccionados() {
  const hoja = libro_().getActiveSheet();
  if (hoja.getName() !== HOJA_PEDIDOS) {
    avisar_('Primero ve a la hoja "Pedidos" y selecciona las filas de los pedidos que quieres imprimir.');
    return;
  }
  const filas = {};
  hoja.getActiveRangeList().getRanges().forEach(function (r) {
    for (let f = r.getRow(); f <= r.getLastRow(); f++) filas[f] = true;
  });
  const pedidos = leerPedidos_().filter(function (p) { return filas[p.fila]; });
  if (!pedidos.length) {
    avisar_('Selecciona una o más filas de pedidos (haz clic en cualquier celda del pedido).');
    return;
  }
  mostrarImpresion_(pedidos, 'clientes');
}

function leerPedidos_() {
  const hoja = hoja_(HOJA_PEDIDOS);
  const n = hoja.getLastRow();
  if (n < 2) return [];
  const tz = libro_().getSpreadsheetTimeZone();
  const fecha = function (v, formato) {
    return Object.prototype.toString.call(v) === '[object Date]' ? Utilities.formatDate(v, tz, formato) : String(v || '');
  };
  const texto = function (v) { return String(v === undefined || v === null ? '' : v).replace(/^'/, ''); };
  return hoja.getRange(2, 1, n - 1, 12).getValues()
    .map(function (f, i) {
      return {
        fila: i + 2,
        numero: f[0],
        recibido: fecha(f[1], 'dd-MM-yyyy HH:mm'),
        estado: String(f[2]).trim(),
        nombre: texto(f[3]),
        telefono: texto(f[4]),
        direccion: texto(f[5]),
        entrega: fecha(f[6], 'dd-MM-yyyy'),
        detalle: String(f[7]),
        subtotal: aNumero_(f[8]),
        despacho: typeof f[9] === 'number' ? (f[9] > 0 ? clp_(f[9]) : 'Gratis') : String(f[9] || ''),
        total: aNumero_(f[10]),
        comentarios: texto(f[11])
      };
    })
    .filter(function (p) { return p.numero !== ''; });
}

// Convierte "2 × PALTA (KILO) = $11.980" en sus partes.
function leerLineas_(detalle) {
  return String(detalle).split('\n').filter(function (l) { return l.trim(); }).map(function (l) {
    const m = /^(\d+) × (.+) \(([^()]*)\) = (\$[\d.]+)$/.exec(l.trim());
    return m ? { q: Number(m[1]), n: m[2], m: m[3], total: m[4] } : { q: 0, n: l.trim(), m: '', total: '' };
  });
}

// modo: 'compras' = lista de compras total · 'clientes' = una hoja por cliente
// Como el número se repite cada día, un pedido se identifica por número + fecha en que llegó.
function clavePedido_(p) {
  return String(p.numero) + '|' + String(p.recibido).slice(0, 10);
}

function mostrarImpresion_(pedidos, modo) {
  const compras = modo === 'compras';
  const t = HtmlService.createTemplateFromFile('Imprimir');
  t.estilo = ESTILO_IMPRESION_;
  t.hojas = compras ? htmlCompras_(pedidos) : htmlPedidos_(pedidos);
  t.numeros = JSON.stringify(pedidos.map(clavePedido_));
  t.modo = JSON.stringify(compras ? 'compras' : 'clientes');
  t.resumen = compras
    ? 'Lista de compras de ' + pedidos.length + (pedidos.length === 1 ? ' pedido' : ' pedidos pendientes')
    : pedidos.length + (pedidos.length === 1 ? ' hoja de cliente' : ' hojas de clientes (cada uno en su propia hoja)');
  SpreadsheetApp.getUi().showModalDialog(
    t.evaluate().setWidth(920).setHeight(680),
    compras ? 'Lista de compras' : 'Imprimir ' + pedidos.length + (pedidos.length === 1 ? ' pedido' : ' pedidos'));
}

// Respaldo: si el botón Imprimir no funciona, crea un PDF en Drive.
function guardarPdfPedidos(numeros, modo) {
  const compras = modo === 'compras';
  const quiero = {};
  (numeros || []).forEach(function (n) { quiero[String(n)] = true; });
  const pedidos = leerPedidos_().filter(function (p) { return quiero[clavePedido_(p)]; });
  if (!pedidos.length) throw new Error('No encontré esos pedidos.');
  const html = '<html><head><meta charset="utf-8"><style>' + ESTILO_IMPRESION_ +
    '</style></head><body>' + (compras ? htmlCompras_(pedidos) : htmlPedidos_(pedidos)) + '</body></html>';
  const tz = libro_().getSpreadsheetTimeZone();
  const nombre = (compras ? 'Lista de compras ' : 'Pedidos ') + Utilities.formatDate(new Date(), tz, 'dd-MM-yyyy HH.mm') + '.pdf';
  const pdf = HtmlService.createHtmlOutput(html).getBlob().getAs('application/pdf').setName(nombre);
  const carpetas = DriveApp.getFoldersByName('Rey Toro - Pedidos para imprimir');
  const carpeta = carpetas.hasNext() ? carpetas.next() : DriveApp.createFolder('Rey Toro - Pedidos para imprimir');
  return carpeta.createFile(pdf).getUrl();
}

// Hoja resumen: todo lo que hay que comprar, sumando todos los pedidos.
// Junta las variantes del mismo producto (ej: CLEMENTINA + CLEMENTINA OFERTA 2 KILOS) y suma los kilos/unidades.
function htmlCompras_(pedidos) {
  const mapa = mapaGrupos_();
  const cats = [];
  Object.keys(mapa).map(function (k) { return mapa[k]; })
    .sort(function (a, b) { return (a.co - b.co) || (a.i - b.i); })
    .forEach(function (g) { if (cats.indexOf(g.c) < 0) cats.push(g.c); });
  if (cats.indexOf('Otros') < 0) cats.push('Otros');

  const grupos = {};
  let totalCobrar = 0;
  pedidos.forEach(function (p) {
    totalCobrar += p.total;
    const primerNombre = p.nombre.split(' ')[0];
    leerLineas_(p.detalle).forEach(function (l) {
      const g = mapa[l.n + '|' + l.m] || { clave: 'X:' + l.n + '|' + l.m, nombre: l.n, c: 'Otros', i: 99999 };
      if (!grupos[g.clave]) grupos[g.clave] = { nombre: g.nombre, c: g.c, i: g.i, total: {}, para: {}, orden: [] };
      const gr = grupos[g.clave];
      gr.i = Math.min(gr.i, g.i);
      const med = medida_(l.m);
      sumar_(gr.total, med, l.q);
      const quien = 'N°' + p.numero + ' ' + primerNombre;
      if (!gr.para[quien]) { gr.para[quien] = {}; gr.orden.push(quien); }
      sumar_(gr.para[quien], med, l.q);
    });
  });
  const items = Object.keys(grupos).map(function (k) { return grupos[k]; });

  let filas = '';
  cats.forEach(function (c) {
    const de = items.filter(function (x) { return x.c === c; }).sort(function (a, b) { return a.i - b.i; });
    if (!de.length) return;
    filas += '<tr class="catrow"><td colspan="4">' + esc_(c.toUpperCase()) + '</td></tr>';
    filas += de.map(function (x) {
      const para = x.orden.map(function (q) { return q + ' ' + textoCantidad_(x.para[q], true); }).join(' · ');
      return '<tr><td class="chk"><span></span></td><td class="cant">' + esc_(textoCantidad_(x.total, false)) +
        '</td><td class="prod">' + esc_(x.nombre) + '</td><td class="para">' + esc_(para) + '</td></tr>';
    }).join('');
  });

  const tz = libro_().getSpreadsheetTimeZone();
  return '<section class="hoja compras">' +
    '<header><div><div class="neg">REY TORO DELIVERY</div><div class="rec">Impreso: ' +
      Utilities.formatDate(new Date(), tz, 'dd-MM-yyyy HH:mm') + '</div></div>' +
    '<div class="num">Lista de compras</div></header>' +
    '<div class="resumen"><b>' + pedidos.length + '</b> pedidos · <b>' + items.length + '</b> productos · Total a cobrar: <b>' +
      clp_(totalCobrar) + '</b></div>' +
    '<table><thead>' +
      '<tr class="cont"><th colspan="4">Lista de compras</th></tr>' +
      '<tr><th class="chk">✓</th><th class="cant">Comprar</th><th>Producto</th><th>Para</th></tr></thead>' +
    '<tbody>' + filas + '</tbody></table>' +
    '<div class="incl"><b>Pedidos incluidos:</b> ' + pedidos.map(function (p) {
      return 'N°' + esc_(p.numero) + ' ' + esc_(p.nombre);
    }).join(' · ') + '</div>' +
    '</section>';
}

// Una hoja por cliente. Si el pedido es largo, sigue en la hoja siguiente
// repitiendo el nombre del cliente arriba de la tabla.
function htmlPedidos_(pedidos) {
  return pedidos.map(function (p) {
    const filas = leerLineas_(p.detalle).map(function (l) {
      return '<tr><td class="chk"><span></span></td><td class="q">' + (l.q || '') + '</td><td class="prod">' +
        esc_(l.n) + '</td><td class="med">' + esc_(l.m) + '</td><td class="tot">' + esc_(l.total) + '</td></tr>';
    }).join('');
    const porConfirmar = p.despacho === 'Por confirmar';
    return '<section class="hoja">' +
      '<header><div><div class="neg">REY TORO DELIVERY</div><div class="rec">Recibido: ' + esc_(p.recibido) + '</div></div>' +
      '<div class="num">Pedido N° ' + esc_(p.numero) + '</div></header>' +
      '<div class="cli">' +
        '<div class="nom">' + esc_(p.nombre) + '</div>' +
        '<div class="dir">📍 ' + esc_(p.direccion) + '</div>' +
        '<div class="fila"><span>📞 ' + esc_(p.telefono) + '</span>' +
        (p.entrega ? '<span>📅 Entrega: <b>' + esc_(p.entrega) + '</b></span>' : '') + '</div>' +
        (p.comentarios ? '<div class="com"><b>Comentarios:</b> ' + esc_(p.comentarios) + '</div>' : '') +
      '</div>' +
      '<table><thead>' +
        '<tr class="cont"><th colspan="5">Pedido N° ' + esc_(p.numero) + ' · ' + esc_(p.nombre) + '</th></tr>' +
        '<tr><th class="chk">✓</th><th class="q">Cant.</th><th>Producto</th><th class="med">Medida</th><th class="tot">Total</th></tr></thead>' +
      '<tbody>' + filas + '</tbody></table>' +
      '<div class="pie">' +
        '<div class="pago"><div><span class="box"></span> Pagado por transferencia</div>' +
        '<div><span class="box"></span> Pagado en efectivo</div>' +
        '<div><span class="box"></span> Entregado</div></div>' +
        '<div class="sumas"><div><span>Subtotal</span><b>' + clp_(p.subtotal) + '</b></div>' +
        '<div><span>Despacho</span><b>' + esc_(p.despacho) + '</b></div>' +
        '<div class="grande"><span>TOTAL</span><b>' + clp_(p.total) + (porConfirmar ? ' + desp.' : '') + '</b></div></div>' +
      '</div>' +
      '</section>';
  }).join('');
}

function esc_(s) {
  return String(s === undefined || s === null ? '' : s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

const ESTILO_IMPRESION_ = [
  '@page { size: letter; margin: 10mm; }',
  '.hoja { font-family: Arial, Helvetica, sans-serif; color: #111; page-break-after: always; break-after: page; }',
  '.hoja:last-child { page-break-after: auto; break-after: auto; }',
  '.hoja header { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2px solid #111; padding-bottom: 5px; }',
  '.neg { font-size: 12px; font-weight: bold; letter-spacing: 2px; }',
  '.rec { font-size: 10.5px; color: #555; margin-top: 2px; }',
  '.num { font-size: 22px; font-weight: bold; }',
  '.cli { border: 1.5px solid #111; border-radius: 6px; padding: 7px 10px; margin: 8px 0; break-inside: avoid; }',
  '.nom { font-size: 19px; font-weight: bold; }',
  '.dir { font-size: 15px; margin: 3px 0; }',
  '.fila { display: flex; flex-wrap: wrap; gap: 4px 24px; font-size: 13px; }',
  '.com { margin-top: 5px; font-size: 12.5px; background: #f2f2f2; padding: 4px 7px; border-radius: 4px; }',
  'table { width: 100%; border-collapse: collapse; font-size: 12.5px; }',
  'thead { display: table-header-group; }',
  'tr { break-inside: avoid; page-break-inside: avoid; }',
  'th { text-align: left; border-bottom: 1.5px solid #111; padding: 3px 4px; font-size: 10px; text-transform: uppercase; color: #444; }',
  'tr.cont th { border-bottom: none; padding: 0 0 2px; font-size: 10px; color: #888; text-transform: none; font-weight: normal; }',
  'td { border-bottom: 1px solid #c8c8c8; padding: 3.5px 4px; vertical-align: middle; }',
  '.chk { width: 24px; text-align: center; }',
  'td.chk span { display: inline-block; width: 11px; height: 11px; border: 1.5px solid #111; border-radius: 2px; }',
  '.q { width: 44px; text-align: center; }',
  'td.q { font-weight: bold; font-size: 14px; }',
  '.prod { font-weight: bold; }',
  '.med { width: 92px; color: #333; }',
  '.tot { width: 72px; text-align: right; }',
  '.para { font-size: 10.5px; color: #333; }',
  '.cant { width: 120px; text-align: left; }',
  'td.cant { font-weight: bold; font-size: 13.5px; white-space: nowrap; }',
  'tr.catrow td { background: #e9e9e9; font-weight: bold; font-size: 10.5px; letter-spacing: 1.5px; padding: 3px 6px; border-bottom: 1px solid #999; }',
  '.resumen { margin: 8px 0 6px; font-size: 13px; }',
  '.incl { margin-top: 10px; font-size: 11px; color: #333; break-inside: avoid; }',
  '.pie { display: flex; justify-content: space-between; gap: 16px; margin-top: 10px; break-inside: avoid; }',
  '.pago div { font-size: 12px; margin: 4px 0; }',
  '.box { display: inline-block; width: 11px; height: 11px; border: 1.5px solid #111; border-radius: 2px; vertical-align: -1px; margin-right: 5px; }',
  '.sumas { min-width: 200px; font-size: 12.5px; }',
  '.sumas div { display: flex; justify-content: space-between; padding: 2px 0; }',
  '.sumas .grande { font-size: 17px; border-top: 1.5px solid #111; margin-top: 3px; padding-top: 4px; }',
  '.notas { margin-top: 8px; border-top: 1px dashed #999; padding-top: 4px; height: 26px; font-size: 11px; color: #555; break-inside: avoid; }'
].join('\n');

// Anota la fecha cuando se cambia un precio en "Productos".
function onEdit(e) {
  if (!e || !e.range) return;
  const hoja = e.range.getSheet();
  if (hoja.getName() !== HOJA_PRODUCTOS || e.range.getRow() < 2) return;
  const col = e.range.getColumn(), ultCol = e.range.getLastColumn();
  if (col <= 4 && ultCol >= 4) {
    const filas = e.range.getNumRows();
    const fechas = [];
    for (let i = 0; i < filas; i++) fechas.push([new Date()]);
    hoja.getRange(e.range.getRow(), 7, filas, 1).setValues(fechas).setNumberFormat('dd-mm-yyyy');
  }
}

// Botón rojo "Eliminar entregados": saca de la hoja Pedidos todo lo marcado como Entregado.
// Por seguridad, quedan guardados en una hoja oculta "Archivo".
function eliminarEntregados() {
  try { blindarPlanilla_(); } catch (e) { Logger.log(e); }
  const libro = libro_();
  const hoja = hoja_(HOJA_PEDIDOS);
  const n = hoja.getLastRow();
  const datos = n >= 2 ? hoja.getRange(2, 1, n - 1, 12).getValues() : [];
  const mover = [], filas = [];
  datos.forEach(function (f, i) {
    const estado = String(f[2]).trim();
    if (estado === 'Entregado' || estado === 'Cancelado') { mover.push(f); filas.push(i + 2); }
  });
  if (!mover.length) { avisar_('No hay pedidos marcados como Entregado.'); return; }

  const ui = SpreadsheetApp.getUi();
  const resp = ui.alert('Eliminar entregados',
    '¿Eliminar ' + mover.length + (mover.length === 1 ? ' pedido entregado' : ' pedidos entregados') + ' de la hoja Pedidos?',
    ui.ButtonSet.YES_NO);
  if (resp !== ui.Button.YES) return;

  let archivo = hoja_(HOJA_ARCHIVO);
  if (!archivo) {
    archivo = libro.insertSheet(HOJA_ARCHIVO);
    hoja.getRange(1, 1, 1, 12).copyTo(archivo.getRange(1, 1));
    archivo.setFrozenRows(1);
  }
  const inicio = archivo.getLastRow() + 1;
  archivo.getRange(inicio, 1, mover.length, 12).setValues(mover);
  archivo.getRange(inicio, 2, mover.length, 1).setNumberFormat('dd-mm-yyyy hh:mm');
  archivo.getRange(inicio, 9, mover.length, 3).setNumberFormat('$#,##0');
  archivo.getRange(inicio, 8, mover.length, 1).setWrap(true);
  try { archivo.hideSheet(); } catch (e) {}
  for (let i = filas.length - 1; i >= 0; i--) hoja.deleteRow(filas[i]);
  hoja.activate();
  avisar_('Listo: ' + mover.length + (mover.length === 1 ? ' pedido eliminado.' : ' pedidos eliminados.'));
}

function avisar_(texto) {
  try { SpreadsheetApp.getUi().alert(texto); } catch (err) { Logger.log(texto); }
}

/* ---------------- Utilidades ---------------- */

function aNumero_(v) {
  if (typeof v === 'number') return Math.round(v);
  const s = String(v || '').replace(/[^\d]/g, '');
  return s ? Number(s) : 0;
}

function clp_(n) {
  return '$' + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function limpiar_(v, max) {
  return String(v === undefined || v === null ? '' : v).replace(/\s+/g, ' ').trim().slice(0, max);
}

// Evita que la planilla lea un texto como fórmula (por ejemplo "+56 9...").
function seguro_(s) {
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function fechaTexto_(v) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(v || ''));
  return m ? m[3] + '-' + m[2] + '-' + m[1] : '';
}

// Imagen del botón rojo "Eliminar entregados" (PNG en base64).
const BOTON_ELIMINAR_ = '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';
