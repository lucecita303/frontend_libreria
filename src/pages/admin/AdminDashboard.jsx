import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import * as adminService from '../../api/adminService'; 
import './AdminDashboard.css';

const IDIOMAS = [
    { codigo: 'es', nombre: '🇪🇸 Español' },
    { codigo: 'en', nombre: '🇺🇸 Inglés' },
    { codigo: 'fr', nombre: '🇫🇷 Francés' },
    { codigo: 'pt', nombre: '🇵🇹 Portugués' },
    { codigo: 'it', nombre: '🇮🇹 Italiano' },
    { codigo: 'de', nombre: '🇩🇪 Alemán' },
    { codigo: 'fi', nombre: '🇫🇮 Finlandés' },
    { codigo: 'zh', nombre: '🇨🇳 Chino' },
];

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // --- ESTADOS DE DATOS ---
  const [libros, setLibros] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [autores, setAutores] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);

  // --- ESTADOS DE INTERFAZ ---
  const [filtroLibros, setFiltroLibros] = useState('todos'); 
  const [modalOpen, setModalOpen] = useState(false);
  const [libroEditar, setLibroEditar] = useState({ id: null, titulo: '', precio: 0, stock: 0 });

  // --- ESTADOS API ---
  const [modoVistaLibros, setModoVistaLibros] = useState('local'); 
  const [tipoBusquedaApi, setTipoBusquedaApi] = useState('titulo'); 
  const [busquedaApi, setBusquedaApi] = useState('');
  const [idiomaApi, setIdiomaApi] = useState('es'); 
  const [resultadosApi, setResultadosApi] = useState([]);
  const [libroApiSeleccionado, setLibroApiSeleccionado] = useState(null);
  const [datosGuardadoApi, setDatosGuardadoApi] = useState({ precio: '', stock: '' });

  // --- MODALES EXTRA ---
  const [modalAdminOpen, setModalAdminOpen] = useState(false);
  const [nuevoAdmin, setNuevoAdmin] = useState({ email: '', password: '' });
  
  const [modalCarritoOpen, setModalCarritoOpen] = useState(false);
  const [carritoUsuario, setCarritoUsuario] = useState(null);

  const [modalOrdenesOpen, setModalOrdenesOpen] = useState(false);
  const [listaOrdenes, setListaOrdenes] = useState([]); 
  const [ordenSeleccionada, setOrdenSeleccionada] = useState(null);

  // --- NOTIFICACIONES ---
  const [mensaje, setMensaje] = useState(null); 

  const mostrarNotificacion = (texto, tipo = 'success') => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje(null), 3000);
  };

  // --- FUNCIONES DE CARGA (useCallback) ---
  
  const cargarLibros = useCallback(async () => {
    try {
      let data;
      if (filtroLibros === 'desactivados') {
        data = await adminService.listarLibrosDesactivados();
      } else if (filtroLibros === 'activados') {
        const response = await adminService.listarLibrosBD();
        const lista = response.content || response;
        data = lista.filter(l => l.estado === true);
      } else {
        const response = await adminService.listarLibrosBD();
        data = response.content || response;
      }
      setLibros(data || []); 
    } catch (error) {
      console.error("Error cargando libros", error);
    }
  }, [filtroLibros]);

  const cargarUsuarios = useCallback(async () => {
    try {
      const data = await adminService.listarClientes();
      setUsuarios(data);
    } catch (error) { console.error(error); }
  }, []);

  const cargarAutores = useCallback(async () => {
    try {
      const data = await adminService.listarAutores();
      setAutores(data);
    } catch (error) { console.error(error); }
  }, []);

  const cargarCategorias = useCallback(async () => {
    try {
      const data = await adminService.listarCategorias();
      setCategorias(data);
    } catch (error) { console.error(error); }
  }, []);

  // --- EFECTOS DE CARGA (AQUÍ ESTABA EL WARNING) ---

  // 1. Carga inicial masiva (Agregamos las dependencias aquí)
  useEffect(() => {
    const initData = async () => {
        setLoading(true);
        await Promise.all([cargarUsuarios(), cargarAutores(), cargarCategorias()]);
        await cargarLibros();
        setLoading(false);
    };
    initData();
  }, [cargarUsuarios, cargarAutores, cargarCategorias, cargarLibros]); // <--- ¡SOLUCIONADO!

  // 2. Refrescar libros si cambia el filtro (Este ya estaba bien)
  useEffect(() => {
      cargarLibros();
  }, [cargarLibros]);


  // --- BÚSQUEDA API ---
  useEffect(() => {
    const buscarEnApi = async () => {
        setLoading(true);
        try {
            let resultados;
            if (tipoBusquedaApi === 'titulo' && busquedaApi.length > 2) {
                resultados = await adminService.buscarLibroEnApi(busquedaApi);
            } else if (tipoBusquedaApi === 'idioma') {
                resultados = await adminService.buscarLibroPorIdiomaApi(idiomaApi);
            }
            if (resultados) setResultadosApi(resultados.results || resultados);
        } catch (error) {
            mostrarNotificacion("Error en la búsqueda externa", "error");
        }
        setLoading(false);
    };

    if (modoVistaLibros === 'api') {
        if (tipoBusquedaApi === 'idioma') {
            buscarEnApi(); 
        } else {
            const timer = setTimeout(() => {
                if (busquedaApi.length > 2) buscarEnApi();
            }, 600);
            return () => clearTimeout(timer);
        }
    }
  }, [busquedaApi, idiomaApi, tipoBusquedaApi, modoVistaLibros]);


  // --- HANDLERS ---
  const handleToggleLibro = async (id, estadoActual) => {
    try {
      await adminService.cambiarEstadoLibro(id, !estadoActual);
      mostrarNotificacion(estadoActual ? "Libro desactivado" : "Libro activado", "success");
      cargarLibros(); 
    } catch (e) { mostrarNotificacion("Error", "error"); }
  };

  const handleBanearUsuario = async (id, esParaBanear) => {
    try {
      await adminService.banearCliente(id, esParaBanear);
      mostrarNotificacion(esParaBanear ? "Usuario baneado 🚫" : "Usuario desbaneado ✅", "success");
      cargarUsuarios();
    } catch (e) { mostrarNotificacion("Error al gestionar usuario", "error"); }
  };

  const guardarCambiosLocal = async (e) => {
    e.preventDefault();
    try {
      await adminService.actualizarLibro(libroEditar.id, {
        precio: parseFloat(libroEditar.precio),
        stock: parseInt(libroEditar.stock)
      });
      setModalOpen(false);
      cargarLibros(); 
      mostrarNotificacion("¡Libro actualizado!", "success");
    } catch (e) { mostrarNotificacion("Error al actualizar", "error"); }
  };

  const guardarLibroApiEnBD = async (e) => {
    e.preventDefault();
    if (!libroApiSeleccionado) return;
    try {
        await adminService.guardarLibroEnBD(libroApiSeleccionado.id, {
            precio: parseFloat(datosGuardadoApi.precio),
            stock: parseInt(datosGuardadoApi.stock)
        });
        setLibroApiSeleccionado(null); 
        mostrarNotificacion("¡Libro importado exitosamente!", "success");
        cargarLibros(); 
    } catch (e) { mostrarNotificacion("Error al guardar (¿Ya existe?)", "error"); }
  };

  const handleRegistrarAdmin = async (e) => {
      e.preventDefault();
      try {
          await adminService.registrarNuevoAdmin(nuevoAdmin);
          mostrarNotificacion("¡Nuevo Admin creado exitosamente!", "success");
          setModalAdminOpen(false);
          setNuevoAdmin({ email: '', password: '' });
      } catch (error) {
          mostrarNotificacion("Error al crear Admin", "error");
      }
  };

  const handleVerCarrito = async (idUsuario) => {
      try {
          const carrito = await adminService.obtenerCarritoUsuario(idUsuario);
          setCarritoUsuario(carrito);
          setModalCarritoOpen(true);
      } catch (error) {
          mostrarNotificacion("El usuario no tiene carrito activo", "info");
      }
  };

  const handleVerOrdenes = async (idUsuario) => {
      try {
          setLoading(true);
          const ordenes = await adminService.obtenerOrdenesUsuario(idUsuario);
          setListaOrdenes(ordenes);
          setOrdenSeleccionada(null); 
          setModalOrdenesOpen(true);
          setLoading(false);
      } catch (error) {
          setLoading(false);
          mostrarNotificacion("No se encontraron órdenes para este usuario", "info");
      }
  };

  // Helpers de UI
  const abrirModalLocal = (libro) => {
    setLibroEditar({ id: libro.id, titulo: libro.titulo, precio: libro.precio || 0, stock: libro.stock || 0 });
    setModalOpen(true);
  };
  
  const seleccionarLibroApi = (libro) => {
    setLibroApiSeleccionado(libro);
    setDatosGuardadoApi({ precio: '', stock: '' }); 
  };

  const obtenerImagen = (libro) => libro.formats ? libro.formats['image/jpeg'] : 'https://via.placeholder.com/150';
  const obtenerCategorias = (libro) => libro.bookshelves ? libro.bookshelves.map(cat => cat.replace('Category:', '').trim()) : [];


  // --- PANELES ---

  const renderDashboardHome = () => (
    <div className="dashboard-welcome">
      <h2>Bienvenido al Centro de Comando, {user?.email}</h2>
      <div className="stats-container">
        <div className="stat-card">
            <h3>Usuarios</h3>
            <p className="stat-number">{usuarios.length}</p>
        </div>
        <div className="stat-card">
            <h3>Libros</h3>
            <p className="stat-number" style={{color:'#C9A66B'}}>{libros.length}</p>
        </div>
        <div className="stat-card">
            <h3>Autores</h3>
            <p className="stat-number" style={{color:'#3182ce'}}>{autores.length}</p>
        </div>
      </div>
    </div>
  );

  const renderLibrosPanel = () => (
    <div>
      <div className="header-container">
        <h2 className="panel-header">
            {modoVistaLibros === 'local' ? '📚 Base de Datos Local' : '🌐 Búsqueda Global (API)'}
        </h2>
        <div className="view-switch">
            <button className={`action-btn ${modoVistaLibros === 'local' ? 'btn-blue' : 'btn-transparent'}`} onClick={() => setModoVistaLibros('local')}>Base de Datos</button>
            <button className={`action-btn ${modoVistaLibros === 'api' ? 'btn-blue' : 'btn-transparent'}`} onClick={() => setModoVistaLibros('api')}>Buscar en API</button>
        </div>
      </div>

      {modoVistaLibros === 'api' && (
          <div>
              <div className="api-controls">
                  <select className="form-input api-select-type" value={tipoBusquedaApi} onChange={(e) => setTipoBusquedaApi(e.target.value)}>
                      <option value="titulo">🔤 Por Título/Autor</option>
                      <option value="idioma">🌍 Por Idioma</option>
                  </select>
                  {tipoBusquedaApi === 'titulo' ? (
                      <input type="text" className="search-bar api-input-search" placeholder="Escribe título o autor..." value={busquedaApi} onChange={(e) => setBusquedaApi(e.target.value)} autoFocus />
                  ) : (
                      <select className="form-input api-input-search" value={idiomaApi} onChange={(e) => setIdiomaApi(e.target.value)}>
                          {IDIOMAS.map(lang => (<option key={lang.codigo} value={lang.codigo}>{lang.nombre}</option>))}
                      </select>
                  )}
              </div>
              {loading && <p style={{textAlign:'center', color:'#666'}}>Consultando...</p>}
              <div className="api-results-grid">
                  {resultadosApi.map((libro) => (
                      <div key={libro.id} className="api-book-card" onClick={() => seleccionarLibroApi(libro)}>
                          <img src={obtenerImagen(libro)} alt={libro.title} className="api-book-cover"/>
                          <div className="api-book-info">
                            <div className="api-book-title" title={libro.title}>{libro.title}</div>
                            <small className="api-book-author">{libro.authors && libro.authors.length > 0 ? libro.authors[0].name : 'Anónimo'}</small>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {modoVistaLibros === 'local' && (
        <>
            <div className="controls-container" style={{marginBottom:'20px'}}>
                <button className={`action-btn ${filtroLibros === 'todos' ? 'btn-blue' : 'btn-transparent'}`} onClick={() => setFiltroLibros('todos')}>Todos</button>
                <button className={`action-btn ${filtroLibros === 'activados' ? 'btn-blue' : 'btn-transparent'}`} onClick={() => setFiltroLibros('activados')}>Activados</button>
                <button className={`action-btn ${filtroLibros === 'desactivados' ? 'btn-blue' : 'btn-transparent'}`} onClick={() => setFiltroLibros('desactivados')}>Desactivados</button>
            </div>
            {loading ? <p>Cargando...</p> : (
                <table className="admin-table">
                <thead><tr><th>ID</th><th>Título</th><th>Precio</th><th>Stock</th><th>Estado</th><th>Acciones</th></tr></thead>
                <tbody>
                    {libros.map((libro) => (
                    <tr key={libro.id}>
                        <td>{libro.id}</td>
                        <td>{libro.titulo}</td>
                        <td>${libro.precio ? parseFloat(libro.precio).toFixed(2) : '0.00'}</td>
                        <td>{libro.stock}</td>
                        <td><span className={`status-badge ${libro.estado ? 'status-active' : 'status-inactive'}`}>{libro.estado ? 'Activo' : 'Inactivo'}</span></td>
                        <td className="actions-cell">
                            <button className="action-btn btn-blue" onClick={() => abrirModalLocal(libro)} title="Editar">✏️</button>
                            <button className={libro.estado ? "action-btn btn-red" : "action-btn btn-green"} onClick={() => handleToggleLibro(libro.id, libro.estado)}>{libro.estado ? '🚫' : '✅'}</button>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            )}
        </>
      )}
    </div>
  );

  const renderUsuariosPanel = () => (
    <div>
      <div className="header-container">
          <h2 className="panel-header">👥 Gestión de Usuarios</h2>
          <button className="action-btn btn-blue" onClick={() => setModalAdminOpen(true)} style={{display: 'flex', alignItems: 'center', gap: '5px'}}>➕ Nuevo Admin</button>
      </div>

      {loading ? <p>Cargando...</p> : (
        <table className="admin-table">
          <thead><tr><th>Email</th><th>Nombre</th><th>Estado</th><th>Acciones</th></tr></thead>
          <tbody>
            {usuarios.map((cliente) => (
              <tr key={cliente.id}>
                <td>{cliente.email}</td>
                <td>{cliente.nombre}</td>
                
                {/* ESTADO CON COLOR */}
                <td>
                    <span className={`status-badge ${cliente.estado ? 'status-active' : 'status-inactive'}`}>
                        {cliente.estado ? 'Activo' : 'Baneado'}
                    </span>
                </td>

                <td className="actions-cell">
                  <button className="action-btn btn-blue" onClick={() => handleVerCarrito(cliente.id)} title="Ver Carrito">🛒</button>
                  <button className="action-btn btn-blue" onClick={() => handleVerOrdenes(cliente.id)} title="Ver Órdenes">📄</button>
                  
                  {/* BOTÓN DINÁMICO (BANEAR / DESBANEAR) */}
                  {cliente.estado ? (
                      <button className="action-btn btn-red" onClick={() => handleBanearUsuario(cliente.id, true)} title="Banear Usuario">🚫</button>
                  ) : (
                      <button className="action-btn btn-green" onClick={() => handleBanearUsuario(cliente.id, false)} title="Desbanear Usuario">✅</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  const renderAutoresPanel = () => (
    <div>
      <h2 className="panel-header" style={{marginBottom:'20px'}}>✍️ Gestión de Autores</h2>
      {loading ? <p>Cargando autores...</p> : (
        <table className="admin-table">
          <thead><tr><th>Nombre</th><th>Fecha Nacimiento</th><th>Fecha Fallecimiento</th></tr></thead>
          <tbody>
            {autores.map((autor) => (
              <tr key={autor.id || Math.random()}> 
                <td>{autor.nombre}</td>
                <td>{autor.fechaNacimiento || '-'}</td>
                <td>{autor.fechaFallecimiento || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  const renderCategoriasPanel = () => (
    <div>
      <h2 className="panel-header" style={{marginBottom:'20px'}}>🏷️ Gestión de Categorías</h2>
      {loading ? <p>Cargando categorías...</p> : (
        <table className="admin-table">
          <thead><tr><th>Nombre</th></tr></thead>
          <tbody>
            {categorias.map((cat) => (
              <tr key={cat.id || Math.random()}>
                <td>{cat.nombre}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  return (
    <div className="admin-container">
      {mensaje && <div className={`notification-toast ${mensaje.tipo === 'success' ? 'toast-success' : 'toast-error'}`}>{mensaje.tipo === 'success' ? '✅' : '⚠️'} {mensaje.texto}</div>}
      
      <aside className="admin-sidebar">
        <h2 className="sidebar-title">Admin Panel</h2>
        <nav className="sidebar-menu">
          <button className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>📊 Dashboard</button>
          <button className={activeTab === 'libros' ? 'active' : ''} onClick={() => setActiveTab('libros')}>📚 Libros</button>
          <button className={activeTab === 'usuarios' ? 'active' : ''} onClick={() => setActiveTab('usuarios')}>👥 Usuarios</button>
          <button className={activeTab === 'autores' ? 'active' : ''} onClick={() => setActiveTab('autores')}>✍️ Autores</button>
          <button className={activeTab === 'categorias' ? 'active' : ''} onClick={() => setActiveTab('categorias')}>🏷️ Categorías</button>
        </nav>
        <div style={{ marginTop: 'auto' }}>
          <button onClick={logout} className="btn-logout-sidebar">Cerrar Sesión</button>
        </div>
      </aside>

      <main className="admin-content">
        {activeTab === 'dashboard' && renderDashboardHome()}
        {activeTab === 'libros' && renderLibrosPanel()}
        {activeTab === 'usuarios' && renderUsuariosPanel()}
        {activeTab === 'autores' && renderAutoresPanel()}
        {activeTab === 'categorias' && renderCategoriasPanel()}
      </main>

      {/* --- MODALES --- */}

      {/* Modal Carrito */}
      {modalCarritoOpen && carritoUsuario && (
        <div className="modal-overlay">
            <div className="modal-content" style={{maxWidth: '600px'}}>
                <div className="modal-header">
                    <h3>🛒 Carrito de Usuario</h3>
                    <button onClick={() => setModalCarritoOpen(false)} className="close-modal-btn">✖</button>
                </div>
                {carritoUsuario.items && carritoUsuario.items.length > 0 ? (
                    <>
                        <table className="admin-table" style={{marginBottom: '20px'}}>
                            <thead><tr><th>Libro</th><th>Cant.</th><th>Precio U.</th><th>Subtotal</th></tr></thead>
                            <tbody>
                                {carritoUsuario.items.map((item, index) => {
                                    const libroInfo = libros.find(l => l.id === item.libroID);
                                    const titulo = libroInfo ? libroInfo.titulo : `ID: ${item.libroID}`;
                                    return (
                                        <tr key={index}>
                                            <td style={{fontSize:'0.9rem'}}>{titulo}</td>
                                            <td>{item.cantidad}</td>
                                            <td>${item.precioUnitario.toFixed(2)}</td>
                                            <td>${(item.precioUnitario * item.cantidad).toFixed(2)}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        <div style={{textAlign:'right', fontWeight:'bold'}}>Total: ${carritoUsuario.total ? carritoUsuario.total.toFixed(2) : '0.00'}</div>
                    </>
                ) : <p style={{textAlign:'center'}}>El carrito está vacío.</p>}
            </div>
        </div>
      )}

      {/* Modal de Órdenes */}
      {modalOrdenesOpen && (
        <div className="modal-overlay">
            <div className="modal-content" style={{maxWidth: '700px'}}>
                {!ordenSeleccionada ? (
                    <>
                        <div className="modal-header">
                            <h3>📄 Historial de Órdenes</h3>
                            <button onClick={() => setModalOrdenesOpen(false)} className="close-modal-btn">✖</button>
                        </div>
                        {listaOrdenes.length > 0 ? (
                            <table className="admin-table">
                                <thead><tr><th>ID Orden</th><th>Fecha</th><th>Estado</th><th>Total</th><th>Acción</th></tr></thead>
                                <tbody>
                                    {listaOrdenes.map((orden) => (
                                        <tr key={orden.id}>
                                            <td><small>{orden.id.substring(0, 8)}...</small></td>
                                            <td>{new Date(orden.fechaCreacion).toLocaleDateString()}</td>
                                            <td><span className="status-badge status-active">{orden.estado || 'Completado'}</span></td>
                                            <td>${orden.total.toFixed(2)}</td>
                                            <td>
                                                <button className="action-btn btn-blue" onClick={() => setOrdenSeleccionada(orden)}>Ver Detalle</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : <p style={{textAlign:'center'}}>Este usuario no tiene compras registradas.</p>}
                    </>
                ) : (
                    <>
                        <div className="modal-header">
                            <h3>📦 Detalle Orden #{ordenSeleccionada.id.substring(0, 6)}...</h3>
                            <button onClick={() => setOrdenSeleccionada(null)} className="action-btn">⬅ Volver a Lista</button>
                        </div>
                        <div style={{marginBottom:'20px'}}>
                            <p><strong>Fecha:</strong> {new Date(ordenSeleccionada.fechaCreacion).toLocaleString()}</p>
                            <p><strong>Estado:</strong> {ordenSeleccionada.estado || 'Finalizado'}</p>
                        </div>
                        <table className="admin-table">
                            <thead><tr><th>Libro</th><th>Cantidad</th><th>Precio Unit.</th><th>Subtotal</th></tr></thead>
                            <tbody>
                                {ordenSeleccionada.items.map((item, idx) => {
                                    const libroInfo = libros.find(l => l.id === item.libroID);
                                    return (
                                        <tr key={idx}>
                                            <td style={{fontSize:'0.9rem'}}>{libroInfo ? libroInfo.titulo : `Libro ID: ${item.libroID}`}</td>
                                            <td>{item.cantidad}</td>
                                            <td>${item.precioUnitario.toFixed(2)}</td>
                                            <td>${(item.precioUnitario * item.cantidad).toFixed(2)}</td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                        <h3 style={{textAlign:'right', marginTop:'20px', color:'#1C2A39'}}>Total: ${ordenSeleccionada.total.toFixed(2)}</h3>
                    </>
                )}
            </div>
        </div>
      )}

      {/* Modal Libro API */}
      {libroApiSeleccionado && (
          <div className="modal-overlay">
              <div className="modal-content">
                  <div className="modal-header">
                    <h3>Importar Libro</h3>
                    <button onClick={() => setLibroApiSeleccionado(null)} className="close-modal-btn">✖</button>
                  </div>
                  <div className="book-detail-layout">
                      <img src={obtenerImagen(libroApiSeleccionado)} alt="Cover" className="detail-cover"/>
                      <div className="detail-info">
                          <h4 style={{margin:'0 0 10px 0'}}>{libroApiSeleccionado.title}</h4>
                          <p><strong>Autor:</strong> {libroApiSeleccionado.authors?.map(a => a.name).join(', ')}</p>
                          <div style={{marginTop:'10px'}}>{obtenerCategorias(libroApiSeleccionado).map((cat, idx) => (<span key={idx} className="detail-tag">{cat}</span>))}</div>
                      </div>
                  </div>
                  <hr className="modal-divider"/>
                  <form onSubmit={guardarLibroApiEnBD} className="form-row">
                      <div style={{flex:1}}><label>Precio</label><input type="number" step="0.01" className="form-input" required value={datosGuardadoApi.precio} onChange={e => setDatosGuardadoApi({...datosGuardadoApi, precio: e.target.value})} /></div>
                      <div style={{flex:1}}><label>Stock</label><input type="number" className="form-input" required value={datosGuardadoApi.stock} onChange={e => setDatosGuardadoApi({...datosGuardadoApi, stock: e.target.value})} /></div>
                      <button type="submit" className="action-btn btn-blue" style={{height:'40px', marginTop:'auto'}}>Guardar</button>
                  </form>
              </div>
          </div>
      )}

      {/* Modal Edición Local */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Editar Libro Local</h3>
            <p style={{fontSize:'0.9rem', color:'#666'}}>{libroEditar.titulo}</p>
            <form onSubmit={guardarCambiosLocal}>
                <div className="form-group"><label>Precio</label><input type="number" step="0.01" className="form-input" value={libroEditar.precio} onChange={(e) => setLibroEditar({...libroEditar, precio: e.target.value})} required /></div>
                <div className="form-group"><label>Stock</label><input type="number" className="form-input" value={libroEditar.stock} onChange={(e) => setLibroEditar({...libroEditar, stock: e.target.value})} required /></div>
                <div className="modal-actions">
                    <button type="button" onClick={() => setModalOpen(false)} className="action-btn">Cancelar</button>
                    <button type="submit" className="action-btn btn-blue">Guardar</button>
                </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Registro Admin */}
      {modalAdminOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Registrar Nuevo Admin</h3>
            <p style={{fontSize:'0.9rem', color:'#666', marginBottom:'20px'}}>Crea una cuenta con privilegios de administrador.</p>
            <form onSubmit={handleRegistrarAdmin}>
                <div className="form-group">
                    <label>Correo Electrónico</label>
                    <input type="email" className="form-input" required value={nuevoAdmin.email} onChange={e => setNuevoAdmin({...nuevoAdmin, email: e.target.value})} />
                </div>
                <div className="form-group">
                    <label>Contraseña</label>
                    <input type="password" className="form-input" required value={nuevoAdmin.password} onChange={e => setNuevoAdmin({...nuevoAdmin, password: e.target.value})} />
                </div>
                <div className="modal-actions">
                    <button type="button" onClick={() => setModalAdminOpen(false)} className="action-btn">Cancelar</button>
                    <button type="submit" className="action-btn btn-blue">Registrar Admin</button>
                </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;