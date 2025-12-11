import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import * as orderService from "../api/orderService";
import * as publicService from "../api/publicService"; 
import { useAuth } from "../context/AuthContext";
import "./MyOrders.css";
import "./Checkout.css"; 

function MyOrders() {
  const { user } = useAuth();
  
  // Datos
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estado para el Modal de PAGO (Acción principal)
  const [ordenParaPagar, setOrdenParaPagar] = useState(null);
  const [procesando, setProcesando] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  // --- NUEVO: Estado para el Modal de Confirmación de Cancelación ---
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Estado para fila expandida
  const [ordenExpandida, setOrdenExpandida] = useState(null); 
  const [nombresLibros, setNombresLibros] = useState({});

  useEffect(() => {
    if (user) cargarOrdenes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const cargarOrdenes = async () => {
      try {
          setLoading(true);
          const data = await orderService.obtenerMisOrdenes();
          const ordenadas = data.sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion));
          setOrdenes(ordenadas);
      } catch (error) {
          console.error("Error al cargar órdenes:", error);
      } finally {
          setLoading(false);
      }
  };

  const toggleDetalle = async (ordenId, items) => {
      if (ordenExpandida === ordenId) {
          setOrdenExpandida(null);
          return;
      }
      setOrdenExpandida(ordenId); 

      const nuevosNombres = { ...nombresLibros };
      let huboCambios = false;

      await Promise.all(items.map(async (item) => {
          if (!nuevosNombres[item.libroID]) {
              try {
                  const info = await publicService.obtenerDetalleLibro(item.libroID);
                  nuevosNombres[item.libroID] = info.titulo;
                  huboCambios = true;
              } catch (e) {
                  nuevosNombres[item.libroID] = "Libro no disponible"; 
                  huboCambios = true;
              }
          }
      }));

      if (huboCambios) setNombresLibros(nuevosNombres);
  };

  const mostrarNotificacion = (texto, tipo = 'success') => {
      setMensaje({ texto, tipo });
      setTimeout(() => setMensaje(null), 3000);
  };

  // --- ACCIONES DE PAGO ---
  const handlePagar = async () => {
      if (!ordenParaPagar) return;
      setProcesando(true);
      try {
          await orderService.confirmarPago(ordenParaPagar.id);
          mostrarNotificacion("¡Pago recibido! Disfruta tu lectura.", "success");
          setOrdenParaPagar(null); // Cerrar modal principal
          cargarOrdenes();
      } catch (error) {
          mostrarNotificacion("Error al procesar el pago.", "error");
      } finally {
          setProcesando(false);
      }
  };

  // 1. Botón "Cancelar" del modal principal -> Abre confirmación
  const abrirConfirmacionCancelar = () => {
      setShowCancelConfirm(true);
  };

  // 2. Botón "Sí, cancelar" del modal de confirmación -> Llama al backend
  const ejecutarCancelacion = async () => {
      if (!ordenParaPagar) return;

      setProcesando(true);
      try {
          await orderService.cancelarOrden(ordenParaPagar.id);
          mostrarNotificacion("Orden cancelada correctamente.", "info");
          
          // Cerramos ambos modales
          setShowCancelConfirm(false);
          setOrdenParaPagar(null);
          
          cargarOrdenes();
      } catch (error) {
          mostrarNotificacion("No se pudo cancelar la orden.", "error");
          setShowCancelConfirm(false); // Cerramos confirmación si falla
      } finally {
          setProcesando(false);
      }
  };

  // 3. Botón "Volver/No" -> Solo cierra la confirmación
  const cerrarConfirmacion = () => {
      setShowCancelConfirm(false);
  };

  if (loading) return <div className="orders-container">Cargando historial...</div>;

  return (
    <div className="orders-container">
      
      {mensaje && (
          <div className={`notification-toast ${mensaje.tipo === 'success' ? 'toast-success' : 'toast-error'}`}>
              {mensaje.texto}
          </div>
      )}

      {/* --- MODAL DE CONFIRMACIÓN DE CANCELACIÓN (NUEVO) --- */}
      {/* Este modal tiene un z-index mayor para salir encima del otro */}
      {showCancelConfirm && (
          <div className="payment-modal-overlay" style={{zIndex: 2100}}>
              <div className="payment-ticket" style={{maxWidth: '400px', border:'4px double #b91c1c'}}>
                  <div className="ticket-header" style={{borderBottom:'2px dashed #b91c1c'}}>
                      <h2 className="ticket-title" style={{color:'#b91c1c'}}>¿Cancelar Orden?</h2>
                  </div>
                  <div className="ticket-info">
                      <p style={{textAlign:'center', fontSize:'1.1rem'}}>
                          ¿Estás seguro de que deseas cancelar la orden <strong>#{ordenParaPagar?.id.substring(0,8)}</strong>?
                      </p>
                      <p style={{textAlign:'center', fontSize:'0.9rem', color:'#666'}}>
                          Esta acción no se puede deshacer.
                      </p>
                  </div>
                  <div className="ticket-actions">
                      <button 
                          className="btn-cancel-order" 
                          onClick={ejecutarCancelacion} 
                          disabled={procesando}
                          style={{backgroundColor:'#b91c1c', color:'white'}}
                      >
                          {procesando ? "Cancelando..." : "Sí, Cancelar Orden"}
                      </button>
                      <button 
                          className="btn-view-details" 
                          onClick={cerrarConfirmacion} 
                          disabled={procesando}
                      >
                          No, Volver
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* --- MODAL DE DETALLE / PAGO (PRINCIPAL) --- */}
      {ordenParaPagar && (
          <div className="payment-modal-overlay">
              <div className="payment-ticket">
                  <div className="ticket-header">
                      <h2 className="ticket-title">Finalizar Compra</h2>
                      <small>Orden #{ordenParaPagar.id.substring(0, 8)}</small>
                  </div>
                  <div className="ticket-info">
                      <p><span>Total:</span> <span>${ordenParaPagar.total.toFixed(2)}</span></p>
                      <p><span>Items:</span> <span>{ordenParaPagar.items.length} libros</span></p>
                      <p><span>Estado:</span> <span style={{color:'#d97706', fontWeight:'bold'}}>PENDIENTE</span></p>
                  </div>
                  <div className="ticket-actions">
                      <button className="btn-pay-now" onClick={handlePagar} disabled={procesando}>
                          {procesando ? "Procesando..." : "💵 Pagar Ahora"}
                      </button>
                      
                      {/* Aquí llamamos a abrirConfirmacionCancelar en vez de window.confirm */}
                      <button className="btn-cancel-order" onClick={abrirConfirmacionCancelar} disabled={procesando}>
                          ❌ Cancelar Orden
                      </button>
                      
                      <button className="btn-view-details" onClick={() => setOrdenParaPagar(null)}>
                          Cerrar
                      </button>
                  </div>
              </div>
          </div>
      )}

      <div style={{textAlign:'center'}}>
        <h1 className="orders-title">📜 Historial de Pedidos</h1>
      </div>

      {ordenes.length === 0 ? (
        <div className="empty-history">
            <p>Aún no has escrito tu historia con nosotros.</p>
            <Link to="/catalogo" className="btn-pay-pending" style={{textDecoration:'none', display:'inline-block', marginTop:'10px'}}>
                Ir a la Tienda
            </Link>
        </div>
      ) : (
        <div className="orders-table-wrapper">
            <table className="orders-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Fecha</th>
                        <th>Total</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {ordenes.map((orden) => (
                        <React.Fragment key={orden.id}>
                            {/* FILA PRINCIPAL */}
                            <tr className={ordenExpandida === orden.id ? "row-expanded" : ""}>
                                <td>#{orden.id.substring(0, 8)}...</td>
                                <td>{new Date(orden.fechaCreacion).toLocaleDateString()}</td>
                                <td style={{fontWeight:'bold'}}>${orden.total.toFixed(2)}</td>
                                <td>
                                    <span className={`status-badge status-${orden.estado.toLowerCase()}`}>
                                        {orden.estado}
                                    </span>
                                </td>
                                <td>
                                    <button 
                                        className="btn-view-details"
                                        onClick={() => toggleDetalle(orden.id, orden.items)}
                                        title={ordenExpandida === orden.id ? "Cerrar detalle" : "Ver detalle"}
                                    >
                                        {ordenExpandida === orden.id ? "🔼 Ocultar" : "👁️ Ver"}
                                    </button>

                                    {orden.estado === 'PENDIENTE' && (
                                        <button 
                                            className="btn-pay-pending"
                                            onClick={() => setOrdenParaPagar(orden)}
                                            style={{marginLeft:'10px'}}
                                        >
                                            Pagar
                                        </button>
                                    )}
                                </td>
                            </tr>

                            {/* FILA DE DETALLE */}
                            {ordenExpandida === orden.id && (
                                <tr className="detail-row">
                                    <td colSpan="5">
                                        <div className="order-details-panel">
                                            <div className="details-section">
                                                <h4>📚 Libros Comprados</h4>
                                                <ul>
                                                    {orden.items.map((item, idx) => (
                                                        <li key={idx}>
                                                            {nombresLibros[item.libroID] || "Cargando..."} (x{item.cantidad}) 
                                                            - <span style={{fontWeight:'bold'}}>${(item.precioUnitario * item.cantidad).toFixed(2)}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                            
                                            <div className="details-section">
                                                <h4>📍 Datos de Envío</h4>
                                                <p><strong>Recibe:</strong> {orden.nombre} {orden.apellido}</p>
                                                <p><strong>Dirección:</strong> {orden.direccion.direccion}</p>
                                                <p>{orden.direccion.municipio}, {orden.direccion.departamento}</p>
                                                <p><strong>CP:</strong> {orden.direccion.codigoPostal}</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </React.Fragment>
                    ))}
                </tbody>
            </table>
        </div>
      )}
    </div>
  );
}

export default MyOrders;