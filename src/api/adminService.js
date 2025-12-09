import api from './axiosClient';

// --- GESTIÓN DE ADMINS ---
export const registrarNuevoAdmin = async (datosAdmin) => {
    // datosAdmin: { nombre, email, usuario, clave }
    const response = await api.post('/admin/register', datosAdmin);
    return response.data;
};

// --- GESTIÓN DE LIBROS ---
export const listarLibrosBD = async () => {
    const response = await api.get('/libros/admin');
    return response.data; 
};

export const buscarLibroEnApi = async (titulo) => {
    const response = await api.get(`/libros/admin/api/buscar?titulo=${titulo}`);
    return response.data;
};

export const guardarLibroEnBD = async (idLibroApi, datosExtra) => {
    const response = await api.post(`/libros/admin/${idLibroApi}`, datosExtra);
    return response.data;
};

export const cambiarEstadoLibro = async (id, activar) => {
    const ruta = activar ? `/libros/admin/activar/${id}` : `/libros/admin/desactivar/${id}`;
    return await api.put(ruta);
};

// Listar libros desactivados
export const listarLibrosDesactivados = async () => {
    const response = await api.get('/libros/admin/desactivados');
    return response.data.content || response.data;
};

// Listar libros activados
export const listarLibrosActivados = async () => {
    const response = await api.get('/libros/admin/activados');
    return response.data.content || response.data;
};

// Actualizar Stock y Precio
export const actualizarLibro = async (id, datosExtra) => {
    const response = await api.put(`/libros/admin/actualizar/${id}`, datosExtra);
    return response.data;
};

// Buscar libros por idioma en API
export const buscarLibroPorIdiomaApi = async (idioma) => {
    const response = await api.get(`/libros/admin/api/idioma?idioma=${idioma}`);
    return response.data;
};

// --- AUTORES ---
export const listarAutores = async () => {
    // Asumo que la ruta es /autores basada en convenciones
    const response = await api.get('/autores'); 
    return response.data; 
};

// --- CATEGORÍAS ---
export const listarCategorias = async () => {
    const response = await api.get('/categorias');
    return response.data;
};

// --- GESTIÓN DE USUARIOS ---
export const listarClientes = async () => {
    const response = await api.get('/admin/clientes');
    return response.data;
};

export const banearCliente = async (id, banear) => {
    const ruta = banear ? `/admin/clientes/banear/${id}` : `/admin/clientes/desbanear/${id}`;
    return await api.put(ruta);
};

// --- CARRITO DE USUARIO ---
export const obtenerCarritoUsuario = async (usuarioID) => {
    // Ajusta '/carrito' si tu @RequestMapping del controller es diferente
    const response = await api.get(`/carrito/usuario/${usuarioID}`);
    return response.data;
};

// --- VENTAS / ORDENES ---
export const obtenerOrdenesUsuario = async (usuarioID) => {
    const response = await api.get(`/ordenes/admin/usuario/${usuarioID}`);
    return response.data;
};