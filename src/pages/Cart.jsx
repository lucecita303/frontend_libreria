import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as cartService from "../api/cartService";
import * as publicService from "../api/publicService";
import { useAuth } from "../context/AuthContext";
import "./Cart.css";

function Cart() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Estados de Datos
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  // Estados de UI (Modal y Toast)
  const [mensaje, setMensaje] = useState(null);
  const [modalConfig, setModalConfig] = useState(null); // { show: bool, type: 'DELETE'|'CLEAR', id: string }

  // --- CARGAR CARRITO ---
  useEffect(() => {
    if (!user) return;
    fetchCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchCart = async () => {
    try {
        setLoading(true);
        const carritoData = await cartService.obtenerMiCarrito();
        
        if (carritoData && carritoData.items) {
            // Enriquecemos con info del libro (Título, Imagen)
            const itemsDetallados = await Promise.all(
                carritoData.items.map(async (item) => {
                    try {
                        const libroInfo = await publicService.obtenerDetalleLibro(item.libroID);
                        return { ...item, detalles: libroInfo };
                    } catch (error) {
                        return { ...item, detalles: { titulo: "Libro no disponible", portadaUrl: null } };
                    }
                })
            );
            setCartItems(itemsDetallados);
            setTotal(carritoData.total);
        } else {
            setCartItems([]);
            setTotal(0);
        }
    } catch (error) {
        // Si da 404 o 500 porque es usuario nuevo, asumimos carrito vacío
        console.warn("Carrito no encontrado o error:", error);
        setCartItems([]);
        setTotal(0);
    } finally {
        setLoading(false);
    }
  };

  // --- NOTIFICACIONES ---
  const mostrarNotificacion = (texto, tipo = 'success') => {
      setMensaje({ texto, tipo });
      setTimeout(() => setMensaje(null), 3000);
  };

  // --- MODAL HANDLERS ---
  const abrirModalEliminar = (id) => {
      setModalConfig({ show: true, type: 'DELETE', id });
  };

  const abrirModalVaciar = () => {
      setModalConfig({ show: true, type: 'CLEAR', id: null });
  };

  const cerrarModal = () => {
      setModalConfig(null);
  };

  const confirmarAccionModal = async () => {
      if (!modalConfig) return;

      try {
          if (modalConfig.type === 'DELETE') {
              await cartService.eliminarItem(modalConfig.id);
              mostrarNotificacion("Libro eliminado del carrito", "success");
          } 
          else if (modalConfig.type === 'CLEAR') {
              await cartService.limpiarCarrito();
              mostrarNotificacion("Carrito vaciado correctamente", "success");
          }
          // Recargar datos
          fetchCart();
      } catch (error) {
          console.error("Error en acción:", error);
          mostrarNotificacion("Hubo un error al procesar la acción", "error");
      } finally {
          cerrarModal();
      }
  };

  // --- UPDATE QUANTITY ---
  const handleUpdateQuantity = async (libroID, nuevaCantidad, stockMax) => {
      if (nuevaCantidad < 1) return;
      if (stockMax && nuevaCantidad > stockMax) {
          mostrarNotificacion(`Solo hay ${stockMax} unidades disponibles`, "error");
          return;
      }

      try {
          // Optimistic UI Update (Actualizamos visualmente antes)
          const carritoActualizado = await cartService.actualizarCantidad(libroID, nuevaCantidad);
          setTotal(carritoActualizado.total);
          setCartItems(prev => prev.map(item => 
              item.libroID === libroID ? { ...item, cantidad: nuevaCantidad } : item
          ));
      } catch (error) {
          mostrarNotificacion("Error al actualizar cantidad", "error");
      }
  };

  const handleCheckout = () => {
      navigate("/checkout");
  };

  // --- RENDER ---

  if (!user) {
      return (
          <div className="cart-container" style={{textAlign:'center', paddingTop:'100px'}}>
              <h2>🔒 Inicia sesión para ver tu canasta.</h2>
              <Link to="/login" className="btn-checkout" style={{display:'inline-block', width:'auto', marginTop:'20px'}}>
                  Ir al Login
              </Link>
          </div>
      );
  }

  if (loading) return <div className="cart-container"><p style={{textAlign:'center', paddingTop:'50px'}}>Recuperando libros...</p></div>;

  return (
    <div className="cart-container">
      {/* Toast */}
      {mensaje && (
          <div className={`notification-toast ${mensaje.tipo === 'success' ? 'toast-success' : 'toast-error'}`}>
              {mensaje.texto}
          </div>
      )}

      {/* Modal Personalizado */}
      {modalConfig && modalConfig.show && (
          <div className="modal-overlay">
              <div className="modal-content">
                  <h3>¿Estás seguro?</h3>
                  <p>
                      {modalConfig.type === 'DELETE' 
                          ? "Vas a sacar este libro de tu selección." 
                          : "Vas a eliminar TODOS los libros del carrito."}
                  </p>
                  <div className="modal-actions">
                      <button className="btn-modal-cancel" onClick={cerrarModal}>Cancelar</button>
                      <button className="btn-modal-confirm" onClick={confirmarAccionModal}>Confirmar</button>
                  </div>
              </div>
          </div>
      )}

      <div className="cart-header">
        <h1 className="cart-title">Tu Cesta Literaria</h1>
      </div>

      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <p style={{fontSize:'1.5rem', color:'#6C5A4E'}}>Tu carrito está esperando grandes historias...</p>
          <Link to="/catalogo" className="btn-checkout" style={{display:'inline-block', width:'auto', marginTop:'20px', textDecoration:'none'}}>
            Ir al Catálogo
          </Link>
        </div>
      ) : (
        /* LAYOUT DE 2 COLUMNAS */
        <div className="cart-layout">
          
          {/* COLUMNA IZQ: LISTA */}
          <div className="cart-items-list">
            {cartItems.map((item) => (
              <div key={item.libroID} className="cart-item-card">
                
                {item.detalles?.portadaUrl ? (
                    <img src={item.detalles.portadaUrl} alt="Portada" className="cart-item-img" />
                ) : (
                    <div className="cart-item-placeholder">📖</div>
                )}

                <div className="cart-item-info">
                    <Link to={`/libro/${item.libroID}`} className="cart-item-title">
                        {item.detalles?.titulo || "Libro no disponible"}
                    </Link>
                    <p className="cart-item-author">
                        {item.detalles?.autores?.[0]?.nombre || "Autor Desconocido"}
                    </p>
                    <p className="cart-item-price">${item.precioUnitario.toFixed(2)}</p>
                </div>

                <div className="cart-controls">
                    <div className="quantity-box">
                        <button 
                            className="btn-qty" 
                            onClick={() => handleUpdateQuantity(item.libroID, item.cantidad - 1, item.detalles?.stock)}
                        >-</button>
                        <span className="qty-display">{item.cantidad}</span>
                        <button 
                            className="btn-qty" 
                            onClick={() => handleUpdateQuantity(item.libroID, item.cantidad + 1, item.detalles?.stock)}
                        >+</button>
                    </div>
                    
                    <button 
                        className="btn-text-remove"
                        onClick={() => abrirModalEliminar(item.libroID)}
                    >
                        Eliminar
                    </button>
                </div>
              </div>
            ))}
          </div>

          {/* COLUMNA DER: RESUMEN (Sticky) */}
          <div className="cart-summary-card">
            <div className="summary-title">Resumen del Pedido</div>
            
            <div className="summary-row">
                <span>Productos ({cartItems.length})</span>
                <span>${total.toFixed(2)}</span>
            </div>
            <div className="summary-row">
                <span>Envío</span>
                <span style={{color:'#166534', fontWeight:'bold'}}>Gratis</span>
            </div>

            <div className="summary-total">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
            </div>

            <button className="btn-checkout" onClick={handleCheckout}>
                Continuar Compra
            </button>

            <button className="btn-clear-cart" onClick={abrirModalVaciar}>
                Vaciar Carrito
            </button>
          </div>

        </div>
      )}
    </div>
  );
}

export default Cart;