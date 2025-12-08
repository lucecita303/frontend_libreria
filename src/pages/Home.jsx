import React from "react";
import {Link} from "react-router-dom";


export default function Home() {
  return (
    <div
      style={{
        backgroundColor: "#F5ECD7",
        minHeight: "100vh",
        padding: "40px 20px",
        color: "#1C2A39",
        fontFamily: "'Georgia', serif",
      }}
    >
      {/* Hero principal */}
      <section
        style={{
          background: "#FFF9E6",
          padding: "60px 40px",
          borderRadius: "12px",
          boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
          maxWidth: "900px",
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            color: "#1C2A39",
            fontSize: "3rem",
            marginBottom: "10px",
            letterSpacing: "2px",
          }}
        >
          Bienvenido a Bookstore
        </h1>

        <p
          style={{
            fontSize: "1.2rem",
            color: "#4A3F35",
            maxWidth: "600px",
            margin: "0 auto",
          }}
        >
          Un rincón clásico para almas curiosas.
          Aquí encontrarás libros antiguos, raros y tesoros literarios que
          resisten al tiempo.
        </p>
          <Link to="/catalogo" style={{ textDecoration: "none" }}>
        <button
          style={{
            marginTop: "25px",
            padding: "12px 25px",
            background: "#1C2A39",
            color: "#FFF9E6",
            border: "none",
            borderRadius: "8px",
            fontSize: "1.1rem",
            cursor: "pointer",
            letterSpacing: "1px",
            transition: "0.3s",
          }}
          onMouseOver={(e) => (e.target.style.background = "#B68D40")}
          onMouseOut={(e) => (e.target.style.background = "#1C2A39")}
        >
          Ver catálogo
        </button
        >
          </Link>
      </section>

      {/* Libros destacados */}
      <section style={{ marginTop: "60px" }}>
        <h2
          style={{
            textAlign: "center",
            fontSize: "2rem",
            color: "#1C2A39",
            marginBottom: "30px",
          }}
        >
          Libros destacados
        </h2>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "30px",
            flexWrap: "wrap",
          }}
        >
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                backgroundColor: "#FFF9E6",
                width: "260px",
                padding: "20px",
                borderRadius: "10px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                textAlign: "center",
                border: "1px solid #C8A27A",
              }}
            >
              <div
                style={{
                  height: "180px",
                  background: "#C8A27A",
                  borderRadius: "8px",
                }}
              ></div>
              <h3 style={{ marginTop: "15px", color: "#1C2A39" }}>
                Libro clásico #{i}
              </h3>
              <p style={{ color: "#594A3C" }}>
                Una obra reconocida que marcó historia.
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
