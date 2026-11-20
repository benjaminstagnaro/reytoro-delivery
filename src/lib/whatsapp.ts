/** Link que abre WhatsApp con un mensaje ya escrito. */
export function linkWhatsApp(numero: string, mensaje: string): string {
  const n = numero.replace(/\D/g, '');
  return `https://wa.me/${n}?text=${encodeURIComponent(mensaje)}`;
}
