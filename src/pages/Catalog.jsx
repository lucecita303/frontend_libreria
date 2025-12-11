import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import * as publicService from "../api/publicService";
import "./Catalog.css";

function Catalog() {
  
  // --- ESTADOS DE DATOS ---
  const [todosLosLibros, setTodosLosLibros] = useState([]); // Copia de respaldo total
  const [resultadosBackend, setResultadosBackend] = useState([]); // Resultados de búsqueda (sin filtro idioma)
  const [librosMostrados, setLibrosMostrados] = useState([]); // Lo que se ve en pantalla (con filtro idioma)
  const [loading, setLoading] = useState(true);

  // --- ESTADOS PARA LISTAS DE FILTROS ---
  const [listaAutores, setListaAutores] = useState([]);
  const [listaCategorias, setListaCategorias] = useState([]);
  const [listaIdiomas, setListaIdiomas] = useState([]);

  // --- ESTADOS DE INPUTS SELECCIONADOS ---
  const [busqueda, setBusqueda] = useState("");
  const [autorSeleccionado, setAutorSeleccionado] = useState("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("");
  const [idiomaSeleccionado, setIdiomaSeleccionado] = useState("");

  // --- PAGINACIÓN ---
  const [paginaActual, setPaginaActual] = useState(1);
  const librosPorPagina = 20;

  // ---------------------------------------------------------
  // 1. FUNCIONES AUXILIARES (useCallback)
  // ---------------------------------------------------------

  // Filtra localmente por idioma usando los resultados del backend como base
  const aplicarFiltrosLocales = useCallback((listaBase) => {
      let filtrados = listaBase;
      if (idiomaSeleccionado) {
          filtrados = filtrados.filter(libro => 
              libro.idiomas && libro.idiomas.includes(idiomaSeleccionado)
          );
      }
      setLibrosMostrados(filtrados);
  }, [idiomaSeleccionado]);

  const extraerFiltros = (libros) => {
    const autoresMap = new Map();
    const categoriasMap = new Map();
    const idiomasSet = new Set();

    libros.forEach(libro => {
        libro.autores?.forEach(autor => autoresMap.set(autor.id, autor.nombre));
        libro.categorias?.forEach(cat => categoriasMap.set(cat.id, cat.nombre));
        libro.idiomas?.forEach(idioma => idiomasSet.add(idioma));
    });

    setListaAutores(Array.from(autoresMap, ([id, nombre]) => ({ id, nombre })));
    setListaCategorias(Array.from(categoriasMap, ([id, nombre]) => ({ id, nombre })));
    setListaIdiomas(Array.from(idiomasSet));
  };

  // ---------------------------------------------------------
  // 2. EFECTOS
  // ---------------------------------------------------------

  // CARGA INICIAL
  useEffect(() => {
    const cargarLibrosIniciales = async () => {
        setLoading(true);
        try {
          const data = await publicService.listarLibrosDisponibles();
          setTodosLosLibros(data);
          setResultadosBackend(data); // Inicializamos backend results
          aplicarFiltrosLocales(data); // Aplicamos filtros (idioma vacio al inicio)
          extraerFiltros(data); 
        } catch (error) {
          console.error("Error cargando catálogo", error);
        }
        setLoading(false);
    };
    cargarLibrosIniciales();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  // BÚSQUEDA (Debounce)
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
        if (busqueda.length > 2) {
            setLoading(true);
            try {
                const resultados = await publicService.buscarLibrosPorTitulo(busqueda);
                setResultadosBackend(resultados); // Actualizamos la base
                aplicarFiltrosLocales(resultados); // Reaplicamos idioma si hay
                setPaginaActual(1);
            } catch (error) { console.error(error); }
            setLoading(false);
        } 
        else if (busqueda.length === 0 && !autorSeleccionado && !categoriaSeleccionada) {
            // Si limpia búsqueda, volvemos a todos
            setResultadosBackend(todosLosLibros);
            aplicarFiltrosLocales(todosLosLibros);
        }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [busqueda, autorSeleccionado, categoriaSeleccionada, todosLosLibros, aplicarFiltrosLocales]); 

  // CAMBIO DE IDIOMA
  useEffect(() => {
      // Cuando cambia el idioma, filtramos sobre la base actual (resultadosBackend)
      // NO sobre librosMostrados, para evitar el bucle infinito y perdida de datos
      aplicarFiltrosLocales(resultadosBackend);
      setPaginaActual(1);
  }, [idiomaSeleccionado, resultadosBackend, aplicarFiltrosLocales]);


  // ---------------------------------------------------------
  // 3. HANDLERS
  // ---------------------------------------------------------

  const handleFiltroBackend = async (tipo, id) => {
      setBusqueda("");
      setPaginaActual(1);

      if (tipo === 'autor') {
          setAutorSeleccionado(id);
          setCategoriaSeleccionada(""); 
          
          if (!id) {
              setResultadosBackend(todosLosLibros);
              aplicarFiltrosLocales(todosLosLibros);
              return;
          }
          
          setLoading(true);
          try {
            const data = await publicService.buscarLibrosPorAutor(id);
            setResultadosBackend(data);
            aplicarFiltrosLocales(data);
          } catch(e) { console.error(e); }
          setLoading(false);
      } 
      else if (tipo === 'categoria') {
          setCategoriaSeleccionada(id);
          setAutorSeleccionado("");
          
          if (!id) {
              setResultadosBackend(todosLosLibros);
              aplicarFiltrosLocales(todosLosLibros);
              return;
          }

          setLoading(true);
          try {
            const data = await publicService.buscarLibrosPorCategoria(id);
            setResultadosBackend(data);
            aplicarFiltrosLocales(data);
          } catch(e) { console.error(e); }
          setLoading(false);
      }
  };

  const resetearVista = () => {
      setBusqueda("");
      setAutorSeleccionado("");
      setCategoriaSeleccionada("");
      setIdiomaSeleccionado("");
      
      setResultadosBackend(todosLosLibros);
      aplicarFiltrosLocales(todosLosLibros);
      setPaginaActual(1);
  };

  // Paginación
  const indiceUltimo = paginaActual * librosPorPagina;
  const indicePrimero = indiceUltimo - librosPorPagina;
  const librosPaginados = librosMostrados.slice(indicePrimero, indiceUltimo);
  const totalPaginas = Math.ceil(librosMostrados.length / librosPorPagina);

  const cambiarPagina = (dir) => {
      if (dir === 'next' && paginaActual < totalPaginas) {
          setPaginaActual(p => p + 1);
          window.scrollTo(0,0);
      }
      if (dir === 'prev' && paginaActual > 1) {
          setPaginaActual(p => p - 1);
          window.scrollTo(0,0);
      }
  };

  return (
    <div className="catalog-container">
      <div style={{textAlign:'center'}}>
        <h1 className="catalog-title">Catálogo de Tesoros</h1>
      </div>

      <div className="filters-container">
        <input
          type="text"
          className="filter-input"
          placeholder="Título..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />

        <select className="filter-select" value={autorSeleccionado} onChange={(e) => handleFiltroBackend('autor', e.target.value)}>
          <option value="">Autores</option>
          {listaAutores.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
        </select>

        <select className="filter-select" value={categoriaSeleccionada} onChange={(e) => handleFiltroBackend('categoria', e.target.value)}>
          <option value="">Categorías</option>
          {listaCategorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>

        <select className="filter-select" value={idiomaSeleccionado} onChange={(e) => setIdiomaSeleccionado(e.target.value)}>
          <option value="">Idiomas</option>
          {listaIdiomas.map(idioma => <option key={idioma} value={idioma}>{idioma}</option>)}
        </select>

        <button className="btn-reset" onClick={resetearVista}>Limpiar Filtros</button>
      </div>

      {loading ? (
          <p style={{textAlign:'center', fontSize:'1.2rem'}}>Cargando biblioteca...</p>
      ) : (
          <>
            <div className="catalog-grid">
                {librosPaginados.map((book) => {
                    const sinStock = book.stock === 0;
                    
                    return (
                        <div key={book.id} className="catalog-card">
                            <Link to={`/libro/${book.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                                <div className="card-image-container">
                                    {book.portadaUrl ? (
                                        <img src={book.portadaUrl} alt={book.titulo} className="card-img" />
                                    ) : (
                                        <span style={{color: '#FFF9E6', fontWeight:'bold'}}>Portada</span>
                                    )}
                                </div>
                                <div className="card-info">
                                    <h3>{book.titulo}</h3>
                                    <p className="card-author">
                                        {book.autores && book.autores.length > 0 ? book.autores[0].nombre : "Anónimo"}
                                    </p>
                                    
                                    <div className="card-meta">
                                        {book.categorias && book.categorias.slice(0,2).map(c => (
                                            <span key={c.id}>{c.nombre}</span>
                                        ))}
                                    </div>

                                    <p className="card-price">${book.precio ? book.precio.toFixed(2) : "0.00"}</p>
                                    
                                    {book.stock > 0 && book.stock < 5 && (
                                        <p className="card-stock-warning">¡Solo quedan {book.stock}!</p>
                                    )}
                                </div>
                            </Link>

                            {/* LOGICA DEL BOTÓN: AHORA ES "VER DETALLES" */}
                            {sinStock ? (
                                <button className="btn-details btn-disabled" disabled>
                                    Agotado
                                </button>
                            ) : (
                                <Link to={`/libro/${book.id}`} style={{textDecoration: 'none'}}>
                                    <button className="btn-details">
                                        Ver detalles
                                    </button>
                                </Link>
                            )}
                        </div>
                    );
                })}
            </div>

            {(librosMostrados.length > librosPorPagina) && (
                <div className="pagination">
                    <button className="page-btn" onClick={() => cambiarPagina('prev')} disabled={paginaActual === 1}>Anterior</button>
                    <span className="page-info">Página {paginaActual} de {totalPaginas}</span>
                    <button className="page-btn" onClick={() => cambiarPagina('next')} disabled={paginaActual === totalPaginas}>Siguiente</button>
                </div>
            )}

            {librosMostrados.length === 0 && (
                <p style={{textAlign:'center', marginTop:'50px', fontSize:'1.2rem', color:'#666'}}>
                    No encontramos libros con esos criterios. Intenta limpiar los filtros.
                </p>
            )}
          </>
      )}
    </div>
  );
}

export default Catalog;