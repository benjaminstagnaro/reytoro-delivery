import { describe, expect, it } from 'vitest';
import { fotoProducto } from './fotosProductos';

const foto = (n: string, c = 'Frutas') => fotoProducto({ n, c })?.chica.match(/productos\/(.+)-256/)?.[1] ?? null;

describe('fotos de productos', () => {
  it('encuentra la foto por el nombre, con o sin tildes ni "oferta"', () => {
    expect(foto('PALTA HASS CHILENA OFERTA')).toBe('paltas');
    expect(foto('MANZANA PINK LADY')).toBe('manzana-roja');
    expect(foto('MANZANA VERDE OFERTA')).toBe('manzana-verde');
    expect(foto('MELON TUNA')).toBe('melon-tuna');
    expect(foto('LECHUGA ESPAÑOLA', 'Verduras')).toBe('lechuga');
    expect(foto('HUEVOS SUPER BANDEJA', 'Huevos')).toBe('huevos');
  });

  it('no usa una foto que no corresponde', () => {
    expect(foto('TOMATE CHERRY', 'Verduras')).toBeNull();
    expect(foto('PAPA CAMOTE', 'Verduras')).toBeNull();
    expect(foto('CEBOLLA MORADA', 'Verduras')).toBeNull();
    expect(foto('LECHUGA FRANCESA (MORADA)', 'Verduras')).toBeNull();
    expect(foto('HUEVOS DE CODORNIZ', 'Huevos')).toBeNull();
    expect(foto('CEBOLLA EN POLVO', 'Otros')).toBeNull();
    expect(foto('PLATANO CONFITADO', 'Otros')).toBeNull();
  });
});
