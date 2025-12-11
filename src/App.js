import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Catalog from "./pages/Catalog";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Register from "./pages/Register";
import BookDetails from "./pages/BookDetails";
import Checkout from "./pages/Checkout"; // <--- NUEVO
import MyOrders from "./pages/MyOrders"; // <--- NUEVO
import AdminDashboard from './pages/admin/AdminDashboard';
import ProtectedRoute from './layout/ProtectedRoute';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/* --- RUTAS PÚBLICAS --- */}
        <Route path="/" element={<Home />} />
        <Route path="/catalogo" element={<Catalog />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/libro/:id" element={<BookDetails />} />

        {/* --- RUTAS PROTEGIDAS (CLIENTES) --- */}
        <Route 
          path="/carrito" 
          element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/checkout" 
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/mis-ordenes" 
          element={
            <ProtectedRoute>
              <MyOrders />
            </ProtectedRoute>
          } 
        />

        {/* --- RUTAS ADMIN --- */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute soloAdmin={true}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />

      </Routes>
    </Router>
  );
}

export default App;