import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import * as publicService from "../api/publicService";
import * as cartService from "../api/cartService"; // Conexión real
import "./BookDetails.css";

const BookDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mensaje, setMensaje] = useState(null);
    
    // Estado para la cantidad local
    const [cantidad, setCantidad] = useState(1);
    const [procesando, setProcesando] = useState(false);

    // --- CARGAR DATOS ---
    useEffect(() => {
        const fetchBook = async () => {
            try {
                const data = await publicService.obtenerDetalleLibro(id);
                setBook(data);
            } catch (err) {
                console.error(err);
                mostrarNotificacion("El libro que buscas se ha perdido.", "error");
            } finally {
                setLoading(false);
            }
        };
        fetchBook();
    }, [id]);

    // --- NOTIFICACIONES ---
    const mostrarNotificacion = (texto, tipo = 'success') => {
        setMensaje({ texto, tipo });
        setTimeout(() => setMensaje(null), 3000);
    };

    // --- HANDLER CANTIDAD ---
    const handleCantidadChange = (e) => {
        const val = parseInt(e.target.value);
        if (val >= 1 && val <= book.stock) {
            setCantidad(val);
        }
    };

    // --- HANDLER TRANSACCIÓN (Conexión Backend) ---
    const handleTransaction = async (accion) => {
        // 1. Validar Login (SIN ALERTAS FEAS)
        if (!user) {
            mostrarNotificacion("🔒 Debes iniciar sesión para comprar. Redirigiendo...", "error");
            setTimeout(() => {
                navigate("/login");
            }, 1500);
            return;
        }

        // 2. Validar Admin
        const roles = user.roles || [];
        const esAdmin = roles.includes('ADMIN') || roles.some(r => r === 'ADMIN' || r.authority === 'ADMIN');
        
        if (esAdmin) {
            mostrarNotificacion("🚫 Los administradores no pueden realizar compras.", "error");
            return;
        }

        // 3. Ejecutar llamada al Backend
        setProcesando(true);
        try {
            // POST /agregarItem
            await cartService.agregarItem(book.id, cantidad);

            if (accion === 'comprar') {
                mostrarNotificacion("¡Procesando! Yendo al carrito...", "success");
                setTimeout(() => navigate("/carrito"), 500); 
            } else {
                mostrarNotificacion(`✅ Agregadas ${cantidad} unidad(es) al carrito.`, "success");
            }

        } catch (error) {
            console.error("Error al agregar:", error);
            mostrarNotificacion("Hubo un error al conectar con el carrito.", "error");
        } finally {
            setProcesando(false);
        }
    };

    // --- RENDER ---
    if (loading) return <div className="details-loading">Cargando obra literaria...</div>;
    if (!book) return <div className="details-loading">Libro no encontrado.</div>;

    const sinStock = book.stock === 0;
    const roles = user?.roles || [];
    const esAdmin = roles.includes('ADMIN') || roles.some(r => r === 'ADMIN' || r.authority === 'ADMIN');

    return (
        <div className="book-page-wrapper">
            {/* Toast */}
            {mensaje && (
                <div className={`notification-toast ${mensaje.tipo === 'success' ? 'toast-success' : 'toast-error'}`}>
                    {mensaje.texto}
                </div>
            )}

            <div className="breadcrumb-bar">
                <Link to="/catalogo" className="breadcrumb-link">⬅ Volver al listado</Link>
                <span className="breadcrumb-separator">|</span>
                <span className="breadcrumb-current">{book.categorias?.[0]?.nombre || 'Libros'}</span>
            </div>

            <div className="details-main-layout">
                
                {/* 1. IMAGEN */}
                <div className="col-gallery">
                    <div className="main-image-frame">
                        {book.portadaUrl ? (
                            <img src={book.portadaUrl} alt={book.titulo} className="main-img" />
                        ) : (
                            <div className="placeholder-img">📖</div>
                        )}
                    </div>
                </div>

                {/* 2. INFO */}
                <div className="col-info">
                    <h1 className="book-title-large">{book.titulo}</h1>
                    
                    <div className="book-meta-info">
                        <span className="author-link">Por {book.autores?.[0]?.nombre || "Anónimo"}</span>
                        <span className="meta-divider">•</span>
                        <span>{book.idiomas?.[0]}</span>
                    </div>

                    <div className="tags-row">
                        {book.categorias?.map(c => (
                            <span key={c.id} className="book-tag">{c.nombre}</span>
                        ))}
                    </div>

                    <div className="book-description">
                        <h3>Sinopsis</h3>
                        <p>{book.descripcion || "No hay descripción disponible."}</p>
                    </div>
                </div>

                {/* 3. BUY BOX */}
                <div className="col-buybox">
                    <div className="buybox-card">
                        <h2 className="buybox-price">
                            ${book.precio ? book.precio.toFixed(2) : "0.00"}
                        </h2>

                        <div className="buybox-stock">
                            {sinStock ? (
                                <span className="status-out">Agotado</span>
                            ) : (
                                <span className="status-available">Stock disponible</span>
                            )}
                        </div>

                        {!sinStock && (
                            <div className="quantity-selector">
                                <label>Cantidad:</label>
                                <input 
                                    type="number" 
                                    min="1" 
                                    max={book.stock} 
                                    value={cantidad}
                                    onChange={handleCantidadChange}
                                    className="qty-input"
                                />
                                <span className="stock-count">({book.stock} disponibles)</span>
                            </div>
                        )}

                        <div className="buybox-actions">
                            {!sinStock && !esAdmin ? (
                                <>
                                    <button 
                                        className="btn-primary-action" 
                                        onClick={() => handleTransaction('comprar')}
                                        disabled={procesando}
                                    >
                                        {procesando ? "..." : "Comprar ahora"}
                                    </button>
                                    <button 
                                        className="btn-secondary-action" 
                                        onClick={() => handleTransaction('carrito')}
                                        disabled={procesando}
                                    >
                                        Agregar al carrito
                                    </button>
                                </>
                            ) : (
                                <button className="btn-disabled-action" disabled>
                                    {esAdmin ? "Modo Admin (Vista)" : "Sin Stock"}
                                </button>
                            )}
                        </div>

                        <div className="buybox-footer">
                            <p>🔒 Compra Protegida</p>
                            <p>🏆 Calidad Garantizada</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default BookDetails;