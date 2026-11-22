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
  // Mezclas primero: su nombre menciona otros productos (nueces, avena, maní…)
  { nombre: /mix desayuno/, archivo: 'mix-desayuno' },
  { nombre: /mix especial/, archivo: 'mix-especial' },

  // Despensa: frutos secos, legumbres, especias, conservas…
  // (van antes que lo fresco: "cebolla en polvo" no es "cebolla", "plátano confitado" no es "plátano")
  { nombre: /aceitunas? morada/, archivo: 'aceituna-morada' },
  { nombre: /aceitunas? grande/, archivo: 'aceitunas-grandes' },
  { nombre: /aceitunas? negra/, archivo: 'aceitunas-negras' },
  { nombre: /aceitunas? sevillana/, archivo: 'aceitunas-sevillanas' },
  { nombre: /aceitunas?.*rellena/, archivo: 'aceitunas-rellenas' },
  { nombre: /aji color/, archivo: 'aji-color' },
  { nombre: /aji escabeche/, archivo: 'aji-escabeche' },
  { nombre: /cebolla escabeche/, archivo: 'cebolla-escabeche' },
  { nombre: /ajo en polvo/, archivo: 'ajo-en-polvo' },
  { nombre: /cebolla en polvo/, archivo: 'cebolla-en-polvo' },
  { nombre: /curcuma (en )?polvo/, archivo: 'curcuma-polvo' },
  { nombre: /jengibre en polvo/, archivo: 'jengibre-en-polvo' },
  { nombre: /curry/, archivo: 'curry-polvo' },
  { nombre: /canela/, archivo: 'canela-entera' },
  { nombre: /oregano/, archivo: 'oregano-seco' },
  { nombre: /pimienta/, archivo: 'pimienta-negra-entera' },
  { nombre: /sal rosada/, archivo: 'sal-rosada' },
  { nombre: /sal de mar/, archivo: 'sal-de-mar' },
  { nombre: /almendra/, medida: /kilo/, archivo: 'almendras-kilo' },
  { nombre: /almendra/, archivo: 'almendras' },
  { nombre: /castanas? de caju/, archivo: 'castanas-de-caju' },
  { nombre: /nuez|nueces/, archivo: 'nueces-mariposa' },
  { nombre: /pistacho/, archivo: 'pistachos' },
  { nombre: /mani con cascara/, archivo: 'mani-con-cascara' },
  { nombre: /mani japones merken/, archivo: 'mani-japones-merken-suave' },
  { nombre: /mani japones/, archivo: 'mani-japones-normal' },
  { nombre: /mani salado/, archivo: 'mani-salado' },
  { nombre: /mani\s+con \/ sin sal/, archivo: 'mani-salado' },
  { nombre: /mani sin sal/, archivo: 'mani-sin-sal' },
  { nombre: /maravilla/, archivo: 'maravillas-peladas' },
  { nombre: /semilla de zapallo/, archivo: 'semilla-de-zapallo' },
  { nombre: /sesamo/, archivo: 'sesamo-blanco' },
  { nombre: /linaza/, archivo: 'linaza-entera' },
  { nombre: /\bchia\b/, archivo: 'chia' },
  { nombre: /coco laminado/, archivo: 'coco-laminado' },
  { nombre: /cranberr/, archivo: 'cranberry' },
  { nombre: /pasas/, archivo: 'pasas-rubias' },
  { nombre: /datil/, archivo: 'datiles' },
  { nombre: /ciruela/, archivo: 'ciruelas-sin-carozo' },
  { nombre: /huesillo.*descorazad/, archivo: 'huesillo-descorazado' },
  { nombre: /huesillo/, archivo: 'huesillos-grandes' },
  { nombre: /platano confitado/, archivo: 'platano-confitado' },
  { nombre: /papayas? al jugo/, archivo: 'papayas-al-jugo-frasco' },
  { nombre: /flor de jamaica/, archivo: 'flor-de-jamaica' },
  { nombre: /cochayuyo/, archivo: 'cochayuyo' },
  { nombre: /granola/, archivo: 'granola-con-miel' },
  { nombre: /harina.*avena/, archivo: 'harina-avena' },
  { nombre: /harina.*garbanzo/, archivo: 'harina-garbanzo' },
  { nombre: /harina integral/, archivo: 'harina-integral' },
  { nombre: /avena instantanea/, archivo: 'avena-instantanea' },
  { nombre: /avena/, archivo: 'avena-natural-entera' },
  { nombre: /garbanzos? sin piel/, archivo: 'garbanzos-sin-piel' },
  { nombre: /garbanzo/, archivo: 'legumbre-garbanzos' },
  { nombre: /lentejas? mini/, archivo: 'legumbre-lentejas-mini' },
  { nombre: /lentejas? rojas|lentejas? turcas/, archivo: 'legumbre-lentejas-rojas-o-turcas' },
  { nombre: /lenteja/, archivo: 'legumbre-lentejas-del-ano' },
  { nombre: /porotos? negro/, archivo: 'legumbre-poroto-negro' },
  { nombre: /porotos? blanco/, archivo: 'legumbre-porotos-blancos-del-ano' },
  { nombre: /porotos? burro/, archivo: 'legumbre-porotos-burros-del-ano' },
  { nombre: /quinoa tricolor/, archivo: 'quinoa-tricolor' },
  { nombre: /quinoa/, archivo: 'quinoa-blanca' },
  { nombre: /trigo mote/, archivo: 'trigo-mote' },
  { nombre: /\bmote\b/, archivo: 'mote-fresco' },
  { nombre: /maiz curagua/, archivo: 'maiz-curagua' },
  { nombre: /tarro choclo/, archivo: 'tarro-choclo-coctel' },
  { nombre: /crema de coco/, archivo: 'tarro-crema-de-coco' },
  { nombre: /leche de coco/, archivo: 'tarro-leche-de-coco' },
  { nombre: /queso crema/, archivo: 'queso-crema-philadelphia' },
  { nombre: /queso gauda|queso gouda/, archivo: 'queso-gauda' },
  { nombre: /\bmiel\b/, archivo: 'miel-de-abeja' },
  { nombre: /menta/, archivo: 'menta-fresca' },
  { nombre: /yerba mate/, archivo: 'yerba-mate' },
  { nombre: /aceite.*oliva.*500/, archivo: 'aceite-oliva-500' },
  { nombre: /aceite.*oliva/, archivo: 'aceite-oliva-1l' },
  { nombre: /aceite/, archivo: 'aceite-vegetal' },

  // Carnes
  { nombre: /pechuga/, archivo: 'pechugas' },
  { nombre: /chuleta/, archivo: 'chuletas' },
  { nombre: /longaniza/, archivo: 'longaniza' },

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
  { nombre: /lollo marina|lechugas? marina/, archivo: 'lechuga-marina' },
  { nombre: /mongoliana/, archivo: 'mongoliana' },
  { nombre: /francesa/, archivo: 'lechuga-francesa' },
  { nombre: /costina/, archivo: 'lechuga-costina' },
  { nombre: /escarola/, archivo: 'lechuga-escarola' },
  { nombre: /lechugas? espanola/, archivo: 'lechuga' },
  { nombre: /mizuna/, archivo: 'mizuna' },
  { nombre: /papa camote/, archivo: 'papa-camote' },
  { nombre: /papas? soufle/, medida: /\b3\b/, archivo: 'papas-soufle-3' },
  { nombre: /papas? soufle/, archivo: 'papas-soufle' },
  { nombre: /^papas?\b/, archivo: 'papas' },
  { nombre: /pepino alaska/, archivo: 'pepino-alaska' },
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

export interface FotoProducto {
  chica: string;
  grande: string;
}

export function fotoProducto(p: Pick<Producto, 'n'> & { m?: string }): FotoProducto | null {
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
