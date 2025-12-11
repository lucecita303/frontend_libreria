import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; 
import "./Navbar.css";

export default function Navbar() {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

  const roles = user?.roles || [];
  const esAdmin = roles.includes('ADMIN') || roles.some(r => r === 'ADMIN' || r?.authority === 'ADMIN');

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      {/* LOGO */}
      <Link to="/" className="navbar-logo">
        <h1 className="navbar-title">Books</h1>
      </Link>

      {/* LINKS */}
      <div className="navbar-links">
        
        {/* CASO 1: Es CLIENTE (o no logueado) -> Ve la tienda */}
        {!esAdmin && (
            <>
                <Link to="/" className="nav-link">Inicio</Link>
                <Link to="/catalogo" className="nav-link">Catálogo</Link>
                <Link to="/carrito" className="nav-link">Carrito</Link>
                
                {/* Solo mostramos "Mis Compras" si ya inició sesión */}
                {isAuthenticated && (
                    <Link to="/mis-ordenes" className="nav-link">Mis Compras</Link>
                )}
            </>
        )}

        {/* CASO 2: Es ADMIN -> Solo ve su panel */}
        {esAdmin && (
             <Link to="/admin" className="nav-link" style={{color: '#ff6b6b'}}>
                Panel Admin
             </Link>
        )}

        {/* LOGIN / LOGOUT */}
        {isAuthenticated ? (
          <div className="user-menu">
            <span className="user-name">
                Hola, {user?.usuario || user?.email}
            </span>
            
            <button onClick={handleLogout} className="btn-logout">
              Salir
            </button>
          </div>
        ) : (
          <Link to="/login" className="nav-link">
            Iniciar sesión
          </Link>
        )}
      </div>
    </nav>
  );
}