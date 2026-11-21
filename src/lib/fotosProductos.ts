import type { Producto } from './types';
import { normalizar } from './format';

/**
 * Fotos de los productos (public/fotos/productos/<archivo>-256.webp y -640.webp).
 *
 * Cada regla mira el nombre del producto (sin tildes, en minúsculas) y, si hace falta, la medida.
 * Se usa la PRIMERA regla que calce, así que las más específicas van arriba
 * (por ejemplo "tomate cherry mix" antes que "tomate cherry", y este antes que "tomate").
 * archivo: null = ese producto todavía no tiene foto: se queda con su dibujo.
 *
 * Para agregar una foto: guardar los dos tamaños en public/fotos/productos y sumar una línea aquí.
 */
type Regla = { nombre: RegExp; medida?: RegExp; archivo: string | null };

const REGLAS: Regla[] = [
  // Congelados (van primero: "congelado haba" no debe usar la foto de habas frescas)
  { nombre: /arandano.*congelad/, archivo: 'arandanos-congelados' },
  { nombre: /congelad.*arveja/, archivo: 'congelado-arvejas' },
  { nombre: /congelad.*pasta de choclo/, archivo: 'congelado-pasta-choclo' },
  { nombre: /congelad.*choclo/, archivo: 'congelado-choclo' },
  { nombre: /congelad.*haba/, archivo: 'congelado-haba' },
  { nombre: /congelad.*jardinera/, archivo: 'congelado-jardinera' },
  { nombre: /congelad.*poroto/, archivo: 'congelado-porotos-verdes' },

  // Frutas
  { nombre: /arandano.*grande/, archivo: 'arandanos-grandes' },
  { nombre: /arandano/, archivo: 'arandanos' },
  { nombre: /cereza/, archivo: 'cerezas' },
  { nombre: /chirimoya/, archivo: 'chirimoya' },
  { nombre: /clementina/, archivo: 'clementinas' },
  { nombre: /nectarin/, archivo: 'durazno-nectarin' },
  { nombre: /durazno/, archivo: 'durazno-peludo' },
  { nombre: /frutillas? caja/, archivo: 'frutillas-caja' },
  { nombre: /frutilla/, archivo: 'frutillas' },
  { nombre: /limon(es)? sutil|\blima\b/, archivo: 'limon-sutil' },
  { nombre: /limon(es)? de pica/, archivo: 'limon-pica' },
  { nombre: /limon/, archivo: 'limones' },
  { nombre: /mango/, archivo: 'mango' },
  { nombre: /pink lady/, medida: /\b2\b/, archivo: 'pink-lady-2' },
  { nombre: /pink lady/, archivo: 'pink-lady' },
  { nombre: /manzana.*verde/, archivo: 'manzana-verde' },
  { nombre: /manzana/, archivo: 'manzana-roja' },
  { nombre: /melon.*tuna/, archivo: 'melon-tuna' },
  { nombre: /melon.*calame/, archivo: 'melon-calameno' },
  { nombre: /naranja/, archivo: 'naranjas' },
  { nombre: /palta/, archivo: 'paltas' },
  { nombre: /^peras?\b/, archivo: 'peras' },
  { nombre: /^pina\b/, archivo: 'pina' },
  { nombre: /barraganete/, archivo: 'barraganete' },
  { nombre: /platano/, archivo: 'platanos' },
  { nombre: /pomelo/, archivo: 'pomelo' },
  { nombre: /sandia/, archivo: 'sandia' },

  // Verduras
  { nombre: /acelga/, archivo: 'acelga' },
  { nombre: /aji peruano|aji amarillo/, archivo: 'aji-amarillo' },
  { nombre: /aji verde/, archivo: 'aji-verde' },
  { nombre: /\bajos?\b/, archivo: 'ajos' },
  { nombre: /alcachofa/, archivo: 'alcachofa' },
  { nombre: /albahaca/, archivo: 'albahaca' },
  { nombre: /apio picado/, archivo: 'apio-picado' },
  { nombre: /\bapio\b/, archivo: 'apio' },
  { nombre: /berenjena/, medida: /\b3\b/, archivo: 'berenjenas-3' },
  { nombre: /berenjena/, archivo: 'berenjena' },
  { nombre: /berros?.*bandeja/, archivo: 'berros-bandeja' },
  { nombre: /\bberros?\b/, archivo: 'berros' },
  { nombre: /betarraga/, archivo: 'betarraga' },
  { nombre: /chapsui/, archivo: 'chapsui' },
  { nombre: /brocoli/, archivo: 'brocoli' },
  { nombre: /cebolla morada/, archivo: 'cebolla-morada' },
  { nombre: /cebollin/, archivo: 'cebollines' },
  { nombre: /cebolla/, archivo: 'cebollas' },
  { nombre: /champinon.*paris/, archivo: 'champinon-paris' },
  { nombre: /champinon/, archivo: 'champinon' },
  { nombre: /choclo/, archivo: 'choclo' },
  { nombre: /ciboulette/, archivo: 'ciboulette' },
  { nombre: /cilantro/, archivo: 'cilantro' },
  { nombre: /coliflor/, archivo: 'coliflor' },
  { nombre: /curcuma/, archivo: 'curcuma' },
  { nombre: /dientes? de dragon/, archivo: 'dientes-dragon' },
  { nombre: /esparrago/, archivo: 'esparragos' },
  { nombre: /espinaca/, archivo: 'espinaca' },
  { nombre: /\bhabas?\b/, archivo: 'habas' },
  { nombre: /jengibre/, archivo: 'jengibre' },
  { nombre: /\bkale\b/, archivo: 'kale' },
  { nombre: /lollo roble/, archivo: 'lollo-roble' },
  { nombre: /lollo espanola/, archivo: 'lollo-espanola' },
  { nombre: /lollo rosada/, archivo: 'lollo-rosada' },
  { nombre: /lollo marina|lechugas? marina/, archivo: null },
  { nombre: /francesa/, archivo: 'lechuga-francesa' },
  { nombre: /costina/, archivo: 'lechuga-costina' },
  { nombre: /escarola/, archivo: 'lechuga-escarola' },
  { nombre: /lechugas? espanola/, archivo: 'lechuga' },
  { nombre: /mizuna/, archivo: 'mizuna' },
  { nombre: /papa camote/, archivo: 'papa-camote' },
  { nombre: /papas? soufle/, archivo: null },
  { nombre: /^papas?\b/, archivo: 'papas' },
  { nombre: /pepino alaska/, archivo: null },
  { nombre: /pepino/, archivo: 'pepino' },
  { nombre: /perejil/, archivo: 'perejil' },
  { nombre: /pimiento.*amarillo/, archivo: 'pimiento-amarillo' },
  { nombre: /pimiento.*rojo/, archivo: 'pimiento-rojo' },
  { nombre: /pimiento.*verde/, archivo: 'pimiento-verde' },
  { nombre: /poroto granado/, archivo: 'poroto-granado' },
  { nombre: /porotos? verde/, archivo: 'porotos-verdes' },
  { nombre: /puerro/, archivo: 'puerro' },
  { nombre: /rabanito/, archivo: 'rabanitos' },
  { nombre: /repollo crespo/, archivo: 'repollo-crespo' },
  { nombre: /repollo morado/, archivo: 'repollo-morado' },
  { nombre: /romero/, archivo: 'romero' },
  { nombre: /rucula.*bandeja/, archivo: 'rucula-bandeja' },
  { nombre: /rucula/, archivo: 'rucula' },
  { nombre: /tomate cherry mix/, archivo: 'tomate-cherry-mix' },
  { nombre: /tomate cherry bandeja/, archivo: 'tomate-cherry-bandeja' },
  { nombre: /tomate cherry/, archivo: 'tomate-cherry-kilo' },
  { nombre: /tomate pera/, archivo: 'tomate-pera' },
  { nombre: /tomate/, archivo: 'tomates' },
  { nombre: /\byuca\b/, archivo: 'yuca' },
  { nombre: /zanahoria/, archivo: 'zanahorias' },
  { nombre: /zapallo camote/, archivo: 'zapallo-camote' },
  { nombre: /zapallo italiano/, archivo: 'zapallo-italiano' },
  { nombre: /zuquin|zapallito/, archivo: 'zuquines' },

  // Huevos: según cuántos trae
  { nombre: /codorniz/, archivo: 'huevos-codorniz' },
  { nombre: /huevos de color/, archivo: 'huevos-color-30' },
  { nombre: /huevo/, medida: /docena/, archivo: 'huevos-12' },
  { nombre: /huevo/, medida: /\b12\b/, archivo: 'huevos' },
  { nombre: /huevo/, medida: /\b20\b/, archivo: 'huevos-20' },
  { nombre: /huevo/, medida: /\b30\b/, archivo: 'huevos-30' },
  { nombre: /huevo/, archivo: 'huevos' },
];

/** Solo productos frescos y congelados: así "cebolla en polvo" o "plátano confitado" no usan la foto de la fruta. */
const CATEGORIAS = /frut|verdur|huevo|congelad/;

export interface FotoProducto {
  chica: string;
  grande: string;
}

export function fotoProducto(p: Pick<Producto, 'n' | 'c'> & { m?: string }): FotoProducto | null {
  if (!CATEGORIAS.test(normalizar(p.c))) return null;
  const n = normalizar(p.n);
  const m = normalizar(p.m ?? '');
  for (const r of REGLAS) {
    if (r.nombre.test(n) && (!r.medida || r.medida.test(m))) return r.archivo ? rutas(r.archivo) : null;
  }
  return null;
}

export function rutas(archivo: string): FotoProducto {
  const base = `${import.meta.env.BASE_URL}fotos/productos/${archivo}`;
  return { chica: `${base}-256.webp`, grande: `${base}-640.webp` };
}
