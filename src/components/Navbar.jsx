import React from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav
      style={{
        background: "#1C2A39", // azul profundo elegante
        padding: "15px 30px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        color: "#FDF7E2",
        boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
      }}
    >
      {/* LOGO */}
      <Link to="/" style={{ textDecoration: "none" }}>
        <h1
          style={{
            color: "#C9A66B", // dorado suave
            fontSize: "1.8rem",
            fontWeight: "bold",
            letterSpacing: "2px",
          }}
        >
          Books
        </h1>
      </Link>

      {/* LINKS */}
      <div
        style={{
          display: "flex",
          gap: "25px",
          fontSize: "1.1rem",
          alignItems: "center",
        }}
      >
        <Link to="/" style={linkStyle}>
          Inicio
        </Link>

        <Link to="/catalogo" style={linkStyle}>
          Catalogo
        </Link>

        <Link to="/carrito" style={linkStyle}>Carrito</Link>


        <Link to="/login" style={linkStyle}>
          Iniciar sesión
        </Link>
      </div>
    </nav>
  );
}

const linkStyle = {
  color: "#FDF7E2",
  textDecoration: "none",
  transition: "0.2s",
};
