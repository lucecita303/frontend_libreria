import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import * as publicService from "../api/publicService"; 
import "./Home.css"; 

export default function Home() {
  const [librosDestacados, setLibrosDestacados] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const data = await publicService.listarLibrosDisponibles();

        // Ordenamos por ventas (Mayor a menor)
        const topVentas = data.sort((a, b) => 
            (b.contadorVentas || 0) - (a.contadorVentas || 0)
        );

        setLibrosDestacados(topVentas.slice(0, 3));
      } catch (error) {
        console.error("Error cargando el catálogo:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  return (
    <div className="home-container">
      {/* Hero principal */}
      <section className="hero-section">
        <h1 className="hero-title">Bienvenido a Bookstore</h1>
        <p className="hero-text">
          Un rincón clásico para almas curiosas. Aquí encontrarás libros
          antiguos, raros y tesoros literarios que resisten al tiempo.
        </p>
        <Link to="/catalogo" style={{ textDecoration: "none" }}>
          <button className="hero-btn">Ver catálogo</button>
        </Link>
      </section>

      {/* Libros destacados (Top Ventas) */}
      <section className="featured-section">
        <h2 className="featured-title">Los más vendidos</h2>

        {loading ? (
          <p style={{ textAlign: "center", color: "#594A3C" }}>Buscando obras maestras...</p>
        ) : (
          <div className="featured-grid">
            {librosDestacados.length > 0 ? (
              librosDestacados.map((libro) => {
                
                // LÓGICA DE STOCK
                const sinStock = libro.stock === 0;
                const ultimasUnidades = libro.stock > 0 && libro.stock <= 7;

                return (
                  <div key={libro.id} className="book-card">
                    <div>
                      {/* Contenedor relativo para posicionar el badge */}
                      <div className="book-cover-container">
                        
                        {/* BADGES (ETIQUETAS) */}
                        {sinStock && <span className="stock-badge badge-out">Agotado</span>}
                        {ultimasUnidades && <span className="stock-badge badge-low">¡Últimas unidades!</span>}

                        {/* IMAGEN */}
                        {libro.portadaUrl ? (
                            <img 
                                src={libro.portadaUrl} 
                                alt={libro.titulo} 
                                className="book-cover-img" 
                            />
                        ) : (
                            <div className="book-cover-placeholder">📖</div>
                        )}
                      </div>
                      
                      <h3 className="book-title" title={libro.titulo}>{libro.titulo}</h3>
                      
                      <p className="book-author">
                        {libro.autores && libro.autores.length > 0
                          ? libro.autores.map(a => a.nombre).join(", ")
                          : "Autor Desconocido"}
                      </p>
                    </div>

                    <div>
                      <p className="book-price">
                          ${libro.precio ? libro.precio.toFixed(2) : "0.00"}
                      </p>
                      
                      {/* Si no hay stock, deshabilitamos el click o mostramos aviso visual */}
                      {sinStock ? (
                          <button className="btn-details btn-disabled" disabled>
                              No disponible
                          </button>
                      ) : (
                          <Link to={`/libro/${libro.id}`} style={{textDecoration: 'none'}}>
                              <button className="btn-details">
                                  Ver detalles
                              </button>
                          </Link>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <p style={{ color: "#594A3C" }}>No hay destacados disponibles por ahora.</p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}