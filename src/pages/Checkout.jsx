import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as cartService from "../api/cartService";
import * as orderService from "../api/orderService";
import * as publicService from "../api/publicService";
import { useAuth } from "../context/AuthContext";
import "./Checkout.css";

function Checkout() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Datos
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Estados de Flujo
  const [paso, setPaso] = useState(1); 
  const [procesando, setProcesando] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  
  // Orden creada en el backend
  const [ordenCreada, setOrdenCreada] = useState(null);

  // Formulario
  const [direccion, setDireccion] = useState({
    nombre: "", apellido: "", pais: "Colombia", departamento: "",
    municipio: "", direccion: "", codigoPostal: "" 
  });

  const mostrarNotificacion = (texto, tipo = 'success') => {
      setMensaje({ texto, tipo });
      setTimeout(() => setMensaje(null), 4000);
  };

  // --- CARGAR CARRITO ---
  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    
    const cargarDatos = async () => {
        try {
            const carrito = await cartService.obtenerMiCarrito();
            
            if (!carrito || !carrito.items || carrito.items.length === 0) {
                mostrarNotificacion("Tu carrito está vacío.", "error");
                setTimeout(() => navigate("/catalogo"), 1000);
                return;
            }

            // Enriquecer items con nombres
            const itemsDetallados = await Promise.all(
                carrito.items.map(async (item) => {
                    try {
                        const libroInfo = await publicService.obtenerDetalleLibro(item.libroID);
                        return { 
                            ...item, 
                            titulo: libroInfo.titulo, 
                            precio: libroInfo.precio 
                        };
                    } catch (error) {
                        return { ...item, titulo: "Libro no disponible", precio: 0 };
                    }
                })
            );

            setCartItems(itemsDetallados);
            setCartTotal(carrito.total);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };
    cargarDatos();
  }, [user, navigate]);

  const handleChange = (e) => {
      setDireccion({ ...direccion, [e.target.name]: e.target.value });
  };

  // --- NAVEGACIÓN ---
  const handleIrARevision = (e) => {
      e.preventDefault();
      setPaso(2); // Ticket Preliminar
  };

  const handleVolverFormulario = () => {
      setPaso(1);
  };

  // --- CREAR ORDEN ---
  const handleConfirmarCreacion = async () => {
      setProcesando(true);
      try {
          const datosEnvio = { ...direccion, codigoPostal: parseInt(direccion.codigoPostal) || 0 };
          const orden = await orderService.crearOrden(datosEnvio);
          setOrdenCreada(orden); 
          setPaso(3); 
          mostrarNotificacion("Orden generada. Confirmando pago...", "info");
      } catch (error) {
          mostrarNotificacion("Error al crear la orden.", "error");
      } finally {
          setProcesando(false);
      }
  };

  // --- PAGAR ---
  const handlePagar = async () => {
      if (!ordenCreada) return;
      setProcesando(true);
      try {
          await orderService.confirmarPago(ordenCreada.id);
          mostrarNotificacion("¡Pago Exitoso! Disfruta tu libro 📚", "success");
          setTimeout(() => navigate("/catalogo"), 2000); 
      } catch (error) {
          mostrarNotificacion("Error en el pago.", "error");
          setProcesando(false);
      }
  };

  // --- CANCELAR ---
  const handleCancelar = async () => {
      if (!ordenCreada) return;
      setProcesando(true);
      try {
          await orderService.cancelarOrden(ordenCreada.id);
          mostrarNotificacion("Orden cancelada.", "error");
          setTimeout(() => navigate("/catalogo"), 1500);
      } catch (error) {
          mostrarNotificacion("Error al cancelar.", "error");
          setProcesando(false);
      }
  };

  const handleCerrarTicket = () => {
      navigate("/mis-ordenes");
  };

  const handleVolverCarrito = () => {
      navigate("/carrito");
  };

  if (loading) return <div className="checkout-container">Cargando...</div>;

  return (
    <div className="checkout-container">
      
      {mensaje && (
          <div className={`notification-toast ${mensaje.tipo === 'success' ? 'toast-success' : 'toast-error'}`}>
              {mensaje.texto}
          </div>
      )}

      {/* --- MODAL DE REVISIÓN (PASO 2) --- */}
      {paso === 2 && (
          <div className="payment-modal-overlay">
              <div className="payment-ticket">
                  <button className="btn-close-ticket" onClick={handleVolverFormulario} title="Volver a editar">&times;</button>
                  
                  <div className="ticket-header">
                      <h2 className="ticket-title">Revisar Pedido</h2>
                  </div>

                  <div className="ticket-info">
                      <p><span>Cliente:</span> <span>{direccion.nombre} {direccion.apellido}</span></p>
                      <p><span>Envío a:</span> <span>{direccion.municipio}, {direccion.departamento}</span></p>
                      <p><span>Dirección:</span> <span>{direccion.direccion}</span></p>
                      <hr style={{border:'1px dashed #CBB892', margin:'15px 0'}}/>
                      
                      <div className="ticket-items-list">
                          {cartItems.map((item, index) => (
                              <div key={index} style={{display:'flex', justifyContent:'space-between', fontSize:'0.9rem', marginBottom:'5px'}}>
                                  <span style={{textAlign:'left'}}>
                                      {item.titulo} <small>(x{item.cantidad})</small>
                                  </span>
                                  <span>${(item.precioUnitario * item.cantidad).toFixed(2)}</span>
                              </div>
                          ))}
                      </div>

                      <div className="ticket-total">
                          <span>TOTAL:</span>
                          <span>${cartTotal.toFixed(2)}</span>
                      </div>
                  </div>

                  <div className="ticket-actions">
                      <button className="btn-pay-now" onClick={handleConfirmarCreacion} disabled={procesando}>
                          {procesando ? "Creando..." : "✅ Confirmar Orden"}
                      </button>
                      <button className="btn-cancel-order" onClick={handleVolverFormulario} disabled={procesando}>
                          ✏️ Modificar Datos
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* --- MODAL DE PAGO FINAL (PASO 3) --- */}
      {paso === 3 && ordenCreada && (
          <div className="payment-modal-overlay">
              <div className="payment-ticket">
                  <button className="btn-close-ticket" onClick={handleCerrarTicket} title="Pagar más tarde">&times;</button>
                  
                  <div className="ticket-header">
                      <h2 className="ticket-title">Orden Creada</h2>
                      <small>ID: {ordenCreada.id.substring(0, 8)}...</small>
                  </div>

                  <div className="ticket-info">
                      <p><span>Estado:</span> <span style={{fontWeight:'bold', color:'#d97706'}}>PENDIENTE DE PAGO</span></p>
                      
                      <div className="ticket-items-list" style={{margin:'20px 0', borderTop:'1px dashed #333', paddingTop:'10px'}}>
                          {cartItems.map((item, index) => (
                              <div key={index} style={{display:'flex', justifyContent:'space-between', fontSize:'0.9rem', marginBottom:'5px'}}>
                                  <span style={{textAlign:'left'}}>
                                      {item.titulo} <small>(x{item.cantidad})</small>
                                  </span>
                                  <span>${(item.precioUnitario * item.cantidad).toFixed(2)}</span>
                              </div>
                          ))}
                      </div>

                      <div className="ticket-total">
                          <span>A PAGAR:</span>
                          <span>${ordenCreada.total.toFixed(2)}</span>
                      </div>
                  </div>

                  <div className="ticket-actions">
                      <button className="btn-pay-now" onClick={handlePagar} disabled={procesando}>
                          {procesando ? "Procesando..." : "💵 Pagar Ahora"}
                      </button>
                      <button className="btn-cancel-order" onClick={handleCancelar} disabled={procesando}>
                          ❌ Cancelar Orden
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* --- FORMULARIO (PASO 1) --- */}
      <div className="checkout-layout">
        <div className="checkout-form-card">
          <h2 className="checkout-title">📦 Datos de Envío</h2>
          <form id="checkoutForm" onSubmit={handleIrARevision}>
            <div className="form-row">
                <div className="form-group">
                    <label>Nombre</label>
                    <input 
                        type="text" 
                        name="nombre" 
                        required 
                        value={direccion.nombre} 
                        onChange={handleChange} 
                        placeholder="Ej. Juan" 
                    />
                </div>
                <div className="form-group">
                    <label>Apellido</label>
                    <input 
                        type="text" 
                        name="apellido" 
                        required 
                        value={direccion.apellido} 
                        onChange={handleChange} 
                        placeholder="Ej. Pérez" 
                    />
                </div>
            </div>
            <div className="form-row">
                <div className="form-group">
                    <label>País</label>
                    <input 
                        type="text" 
                        name="pais" 
                        required 
                        value={direccion.pais} 
                        onChange={handleChange} 
                        placeholder="Ej. Colombia" 
                    />
                </div>
                <div className="form-group">
                    <label>Departamento</label>
                    <input 
                        type="text" 
                        name="departamento" 
                        required 
                        value={direccion.departamento} 
                        onChange={handleChange} 
                        placeholder="Ej. Antioquia" 
                    />
                </div>
            </div>
            <div className="form-row">
                <div className="form-group">
                    <label>Municipio</label>
                    <input 
                        type="text" 
                        name="municipio" 
                        required 
                        value={direccion.municipio} 
                        onChange={handleChange} 
                        placeholder="Ej. Medellín" 
                    />
                </div>
                <div className="form-group">
                    <label>Código Postal</label>
                    <input 
                        type="number" 
                        name="codigoPostal" 
                        required 
                        value={direccion.codigoPostal} 
                        onChange={handleChange} 
                        placeholder="Ej. 050001" 
                    />
                </div>
            </div>
            <div className="form-group" style={{marginBottom:'15px'}}>
                <label>Dirección exacta</label>
                <input 
                    type="text" 
                    name="direccion" 
                    required 
                    value={direccion.direccion} 
                    onChange={handleChange} 
                    placeholder="Calle 123 # 45-67, Apto 101" 
                />
            </div>
          </form>
        </div>

        <div className="checkout-summary">
            <h2 style={{color:'#1C2A39', marginTop:0}}>Resumen de Pago</h2>
            
            <div style={{marginBottom:'15px', maxHeight:'200px', overflowY:'auto'}}>
                {cartItems.map(item => (
                    <div key={item.libroID} style={{display:'flex', justifyContent:'space-between', fontSize:'0.85rem', marginBottom:'8px', borderBottom:'1px solid #ddd', paddingBottom:'5px'}}>
                        <span>{item.titulo} (x{item.cantidad})</span>
                        <span>${(item.precioUnitario * item.cantidad).toFixed(2)}</span>
                    </div>
                ))}
            </div>

            <div className="summary-details">
                <p style={{fontSize:'1.2rem'}}>Total a Pagar:</p>
                <h1 style={{fontSize:'2.5rem', margin:'10px 0', color:'#1C2A39'}}>${cartTotal.toFixed(2)}</h1>
            </div>
            
            <button type="submit" form="checkoutForm" className="btn-confirm">
                Continuar
            </button>
            
            <button type="button" className="btn-clear-cart" onClick={handleVolverCarrito} style={{marginTop:'10px', color:'#1C2A39', borderColor:'#1C2A39'}}>
                ⬅ Volver al Carrito
            </button>
        </div>
      </div>
    </div>
  );
}

export default Checkout;