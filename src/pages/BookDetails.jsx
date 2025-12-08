import React from "react";
import { useParams } from "react-router-dom";
import {libros} from "../data/libros";
import "./BookDetails.css";

const BookDetails = () => {
    const { id } = useParams();

    const book = libros.find((b) => b.id === Number(id));

    if (!book) {
        return <h2 style={{ textAlign: "center" }}>Libro no encontrado</h2>;
    }

    return (
        <div className="details-container">
            <div className="details-card">

                {/* Imagen */}
                <div className="details-image">
                    <img src={book.imagen} alt={book.titulo} />
                </div>

                {/* Información */}
                <div className="details-info">
                    <h1>{book.titulo}</h1>
                    <h3 className="details-autor">Por {book.autor}</h3>

                    <p className="details-descripcion">
                        {book.descripcion}
                    </p>

                    <p className="details-precio">${book.precio}</p>

                    <button className="details-btn">Agregar al carrito</button>
                </div>
            </div>
        </div>
    );
};

export default BookDetails;
