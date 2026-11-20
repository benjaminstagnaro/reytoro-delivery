// GitHub Pages no conoce las rutas de React (/pedido, /food-truck...).
// Copiando index.html como 404.html, cualquier ruta abre la página y React muestra la sección correcta.
import { copyFileSync } from 'node:fs';
copyFileSync('dist/index.html', 'dist/404.html');
console.log('404.html listo (rutas de la página funcionan en GitHub Pages)');
