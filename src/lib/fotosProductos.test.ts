import { describe, expect, it } from 'vitest';
import { fotoProducto } from './fotosProductos';

const foto = (n: string, c = 'Frutas', m = 'KILO') => fotoProducto({ n, c, m })?.chica.match(/productos\/(.+)-256/)?.[1] ?? null;

describe('fotos de productos', () => {
  it('encuentra la foto por el nombre, con o sin tildes ni "oferta"', () => {
    expect(foto('PALTA HASS CHILENA OFERTA')).toBe('paltas');
    expect(foto('MANZANA FUJI')).toBe('manzana-roja');
    expect(foto('MANZANA VERDE OFERTA')).toBe('manzana-verde');
    expect(foto('LIMÓN SUTÍL')).toBe('limon-sutil');
    expect(foto('PIÑA CARAMELO', 'Frutas', 'UNIDAD')).toBe('pina');
  });

  it('elige la más específica primero', () => {
    expect(foto('TOMATE CHERRY MIX COLORES', 'Verduras', '200 GRS')).toBe('tomate-cherry-mix');
    expect(foto('TOMATE CHERRY BANDEJA', 'Verduras', '200 GRS')).toBe('tomate-cherry-bandeja');
    expect(foto('TOMATE CHERRY', 'Verduras')).toBe('tomate-cherry-kilo');
    expect(foto('TOMATE PERA', 'Verduras')).toBe('tomate-pera');
    expect(foto('TOMATES NATURAL GRANDES', 'Verduras')).toBe('tomates');
    expect(foto('CHAPSUI (BROCOLI, COLIFLOR, DIENTE DE DRAGÓN)', 'Verduras', 'BANDEJA')).toBe('chapsui');
    expect(foto('CONGELADO HABA (MINUTO VERDE)', 'Congelados')).toBe('congelado-haba');
    expect(foto('HABAS FRESCAS', 'Verduras')).toBe('habas');
  });

  it('usa la medida cuando hay fotos distintas por cantidad', () => {
    expect(foto('MANZANA PINK LADY')).toBe('pink-lady');
    expect(foto('MANZANA PINK LADY OFERTA', 'Frutas', '2 KILOS')).toBe('pink-lady-2');
    expect(foto('BERENJENAS OFERTA', 'Verduras', '3 UNIDADES')).toBe('berenjenas-3');
    expect(foto('HUEVOS SUPER', 'Huevos', 'DOCENA')).toBe('huevos-12');
    expect(foto('HUEVOS GRANDES', 'Huevos', '20 UNIDADES')).toBe('huevos-20');
    expect(foto('HUEVOS MEDIANOS', 'Huevos', '30 UNIDADES')).toBe('huevos-30');
  });

  it('no usa una foto que no corresponde', () => {
    expect(foto('PAPAS SOUFLÉ', 'Verduras')).toBeNull();
    expect(foto('PEPINO ALASKA', 'Verduras', 'UNIDAD')).toBeNull();
    expect(foto('LECHUGA MARINA', 'Verduras', 'UNIDAD')).toBeNull();
    expect(foto('CEBOLLA EN POLVO', 'Otros')).toBeNull();
    expect(foto('PLATANO CONFITADO', 'Otros')).toBeNull();
  });
});
