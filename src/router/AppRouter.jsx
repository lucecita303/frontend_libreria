import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import MainLayout from "../layout/MainLayout";
import Home from "../pages/Home";
import Catalogo from "../pages/Catalogo";
import Carrito from "../pages/Carrito";
import Login from "../pages/Login";

function AppRouter() {
  return (
    <AuthProvider> {/* 1. Envolvemos todo con el Proveedor de Autenticación */}
      <BrowserRouter>
        <MainLayout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/catalogo" element={<Catalogo />} />
            <Route path="/carrito" element={<Carrito />} />
            <Route path="/login" element={<Login />} />
            {/* Aquí luego agregaremos rutas protegidas */}
          </Routes>
        </MainLayout>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default AppRouter;