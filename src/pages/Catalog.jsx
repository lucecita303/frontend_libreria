import React, { useState } from "react";
import { useContext } from "react";
import { CartContext } from "../context/CartContext";
import { Link } from "react-router-dom";
import books from "../data/libros";


function Catalog() {
  const [search, setSearch] = useState("");
  const { addToCart } = useContext(CartContext);

  // Libros de ejemplo — luego los conectamos al backend
  const books = [
    { id: 1, title: "La Odisea", author: "Homero", genre: "Épica" },
    { id: 2, title: "Divina Comedia", author: "Dante Alighieri", genre: "Poesía" },
    { id: 3, title: "Don Quijote", author: "Cervantes", genre: "Novela" },
    { id: 4, title: "Orgullo y Prejuicio", author: "Jane Austen", genre: "Romance" },
    { id: 5, title: "Frankenstein", author: "Mary Shelley", genre: "Terror" },
    { id: 6, title: "Crimen y Castigo", author: "Dostoievski", genre: "Drama" },
  ];

  // Filtrar por búsqueda
  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
        <div
            style={{
                backgroundColor: "#EFE5D2",
                minHeight: "100vh",
                padding: "40px",
                fontFamily: "'Times New Roman', serif",
            }}
        >
            <h1 style={{ color: "#3B2F2F", marginBottom: "20px" }}>
                📚 Catálogo de libros clásicos
            </h1>

            {/* Filtros */}
            <div
                style={{
                    display: "flex",
                    gap: "20px",
                    marginBottom: "30px",
                    flexWrap: "wrap",
                }}
            >
                <input
                    type="text"
                    placeholder="Buscar por título..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{
                        padding: "10px",
                        borderRadius: "8px",
                        border: "1px solid #CBB892",
                        width: "250px",
                        fontFamily: "'Times New Roman', serif",
                    }}
                />

                <select
                    style={{
                        padding: "10px",
                        borderRadius: "8px",
                        border: "1px solid #CBB892",
                        fontFamily: "'Times New Roman', serif",
                    }}
                >
                    <option>Todos los géneros</option>
                    <option>Drama</option>
                    <option>Épica</option>
                    <option>Poesía</option>
                    <option>Novela</option>
                    <option>Terror</option>
                    <option>Romance</option>
                </select>
            </div>

            {/* Grid del catálogo */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "25px",
                }}
            >
                {filteredBooks.map((book) => (
                    <div key={book.id}>
                        <Link
                            to={`/libro/${book.id}`}
                            style={{ textDecoration: "none", color: "inherit" }}
                        >
                            <div
                                style={{
                                    backgroundColor: "#F4E8D5",
                                    padding: "20px",
                                    borderRadius: "12px",
                                    border: "1px solid #CBB892",
                                    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                                    transition: "transform 0.2s",
                                }}
                            >
                                <div
                                    style={{
                                        height: "180px",
                                        backgroundColor: "#D7C7A3",
                                        borderRadius: "8px",
                                        marginBottom: "15px",
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        color: "#3B2F2F",
                                        fontSize: "1.2rem",
                                    }}
                                >
                                    📘 Portada
                                </div>

                                <h3 style={{ color: "#3B2F2F" }}>{book.title}</h3>
                                <p style={{ fontStyle: "italic", color: "#5A4A42" }}>
                                    {book.author}
                                </p>
                                <p style={{ color: "#6C5A4E" }}>Género: {book.genre}</p>
                            </div>
                        </Link>

                        {/* Botón agregar al carrito */}
                        <button
                            onClick={() => addToCart(book)}
                            style={{
                                marginTop: "10px",
                                padding: "10px",
                                width: "100%",
                                backgroundColor: "#CBB892",
                                border: "none",
                                borderRadius: "8px",
                                cursor: "pointer",
                                fontFamily: "'Times New Roman', serif",
                                fontWeight: "bold",
                            }}
                        >
                            Añadir al carrito
                        </button>
                    </div>
                ))}
            </div>
        </div>
);
}

export default Catalog;
