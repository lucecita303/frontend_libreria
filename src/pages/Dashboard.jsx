import React from "react";

function Dashboard() {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* SIDEBAR */}
      <aside
        style={{
          width: "260px",
          backgroundColor: "#D7C7A3", // beige pergamino
          padding: "20px",
          borderRight: "2px solid #BFA67A",
          fontFamily: "'Times New Roman', serif",
        }}
      >
        <h2 style={{ marginBottom: "30px", color: "#3B2F2F" }}>
          📚 Dashboard
        </h2>

        <nav style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <a href="#" style={linkStyle}>Estadísticas</a>
          <a href="#" style={linkStyle}>Libros</a>
          <a href="#" style={linkStyle}>Usuarios</a>
          <a href="#" style={linkStyle}>Órdenes</a>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main
        style={{
          flex: 1,
          backgroundColor: "#EFE5D2",
          padding: "40px",
          fontFamily: "'Times New Roman', serif",
          color: "#3F2F2F",
        }}
      >
        <h1 style={{ marginBottom: "30px" }}>Panel general</h1>

        {/* Tarjetas del dashboard */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "20px",
          }}
        >
          <div style={cardStyle}>
            <h3>Total de libros</h3>
            <p style={numberStyle}>324</p>
          </div>

          <div style={cardStyle}>
            <h3>Órdenes activas</h3>
            <p style={numberStyle}>18</p>
          </div>

          <div style={cardStyle}>
            <h3>Usuarios registrados</h3>
            <p style={numberStyle}>512</p>
          </div>

          <div style={cardStyle}>
            <h3>Visitas hoy</h3>
            <p style={numberStyle}>85</p>
          </div>
        </div>
      </main>
    </div>
  );
}

const linkStyle = {
  color: "#3F2F2F",
  textDecoration: "none",
  fontSize: "1.1rem",
  borderBottom: "1px solid #BFA67A",
  paddingBottom: "5px",
  transition: "0.2s",
};

const cardStyle = {
  backgroundColor: "#F4E8D5",
  border: "1px solid #CBB892",
  borderRadius: "10px",
  padding: "20px",
  boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
  textAlign: "center",
};

const numberStyle = {
  fontSize: "2.5rem",
  fontWeight: "bold",
  marginTop: "10px",
  color: "#3B2F2F",
};

export default Dashboard;
