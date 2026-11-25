import { describe, expect, it } from 'vitest';
import { clp, medidaLinda, nombreLindo, nombreSinOferta, normalizar } from './format';
import { cambiarCantidad, limpiarCarrito, resumir } from './carrito';
import type { Producto } from './types';

describe('formatos', () => {
  it('formatea pesos chilenos', () => {
    expect(clp(5990)).toBe('$5.990');
    expect(clp(1250000)).toBe('$1.250.000');
    expect(clp(0)).toBe('$0');
  });

  it('convierte la medida en una frase natural', () => {
    expect(medidaLinda('KILO')).toBe('el kilo');
    expect(medidaLinda('SOLO KILO')).toBe('el kilo');
    expect(medidaLinda('500 GRS')).toBe('500 g');
    expect(medidaLinda('3 KILOS')).toBe('3 kilos');
    expect(medidaLinda('30 UNIDADES')).toBe('30 unidades');
    expect(medidaLinda('UNIDAD')).toBe('la unidad');
    expect(medidaLinda('6 O 7 KILOS')).toBe('6 o 7 kilos');
  });

  it('muestra nombres legibles', () => {
    expect(nombreLindo('PALTA HASS OFERTA')).toBe('Palta hass oferta');
    expect(nombreSinOferta('Palta hass super oferta')).toBe('Palta hass');
    expect(normalizar('Plátano')).toBe('platano');
  });
});

describe('carrito', () => {
  const productos: Producto[] = [
    { c: 'Frutas', n: 'PALTA', m: 'KILO', p: 5000, o: '' },
    { c: 'Frutas', n: 'LIMON', m: 'KILO', p: 1500, o: '' },
  ];

  it('suma y resta cantidades sin bajar de cero', () => {
    let c = cambiarCantidad({}, 'PALTA|KILO', 1);
    c = cambiarCantidad(c, 'PALTA|KILO', 1);
    expect(c['PALTA|KILO']).toBe(2);
    c = cambiarCantidad(c, 'PALTA|KILO', -5);
    expect(c['PALTA|KILO']).toBeUndefined();
  });

  it('quita productos que ya no existen', () => {
    expect(limpiarCarrito({ 'PALTA|KILO': 1, 'MANGO|KILO': 2 }, productos)).toEqual({ 'PALTA|KILO': 1 });
  });

  it('calcula total y despacho', () => {
    const cfg = { minimo: 10000, envio: 0 };
    const bajo = resumir({ 'PALTA|KILO': 1 }, productos, cfg);
    expect(bajo.subtotal).toBe(5000);
    expect(bajo.despachoTexto).toBe('Por confirmar');
    expect(bajo.falta).toBe(5000);
    const sobre = resumir({ 'PALTA|KILO': 2 }, productos, cfg);
    expect(sobre.despachoTexto).toBe('Gratis');
    expect(sobre.avance).toBe(1);
    const conEnvio = resumir({ 'LIMON|KILO': 1 }, productos, { minimo: 10000, envio: 2500 });
    expect(conEnvio.total).toBe(4000);
  });
});

describe('despacho', () => {
  it('lista bonita y fines de semana', async () => {
    const { listaBonita, esFinDeSemana, soloDiasHabiles } = await import('./format');
    expect(listaBonita(['Ñuñoa', 'La Reina', 'Providencia'])).toBe('Ñuñoa, La Reina y Providencia');
    expect(esFinDeSemana('2026-11-28')).toBe(true);
    expect(esFinDeSemana('2026-11-27')).toBe(false);
    expect(esFinDeSemana('')).toBe(false);
    expect(soloDiasHabiles('Lunes a viernes')).toBe(true);
  });
});
