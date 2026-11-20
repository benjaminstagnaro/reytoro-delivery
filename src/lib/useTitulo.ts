import { useEffect } from 'react';

/** Título de la pestaña del navegador (y lo que anuncian los lectores de pantalla al cambiar de página). */
export function useTitulo(titulo: string) {
  useEffect(() => {
    document.title = `${titulo} · Rey Toro Delivery`;
  }, [titulo]);
}
