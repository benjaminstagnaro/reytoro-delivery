import { useEffect } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router';
import { CatalogoProvider } from './state/catalogo';
import { CarritoProvider } from './state/carrito';
import { TamanoTextoProvider } from './state/tamanoTexto';
import { Encabezado } from './components/Encabezado';
import { AvisoBarra } from './components/AvisoBarra';
import { Pie } from './components/Pie';
import { Inicio } from './pages/Inicio';
import { Pedido } from './pages/Pedido';
import { TuPedido } from './pages/TuPedido';
import { Listo } from './pages/Listo';
import { CasaPlaya, FoodTruck } from './pages/Arriendo';
import { NoEncontrado } from './pages/NoEncontrado';

/** Al cambiar de página, vuelve arriba (como en una página web normal). */
function VolverArriba() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <TamanoTextoProvider>
        <CatalogoProvider>
          <CarritoProvider>
            <VolverArriba />
            <a
              href="#contenido"
              className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-cartulina focus:px-4 focus:py-3 focus:font-bold"
            >
              Saltar al contenido
            </a>
            <div className="flex min-h-dvh flex-col">
              <Encabezado />
              <AvisoBarra />
              <main id="contenido" className="flex-1">
                <Routes>
                  <Route path="/" element={<Inicio />} />
                  <Route path="/pedido" element={<Pedido />} />
                  <Route path="/pedido/tu-pedido" element={<TuPedido />} />
                  <Route path="/pedido/listo" element={<Listo />} />
                  <Route path="/food-truck" element={<FoodTruck />} />
                  <Route path="/casa-en-la-playa" element={<CasaPlaya />} />
                  <Route path="*" element={<NoEncontrado />} />
                </Routes>
              </main>
              <Pie />
            </div>
          </CarritoProvider>
        </CatalogoProvider>
      </TamanoTextoProvider>
    </BrowserRouter>
  );
}
