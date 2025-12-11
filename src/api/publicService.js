import api from './axiosClient';

export const listarLibrosDisponibles = async () => {
    const response = await api.get('/libros/disponibles');
    return response.data; 
};

export const buscarLibrosPorTitulo = async (titulo) => {
    const response = await api.get(`/libros/buscar?titulo=${titulo}`);
    return response.data;
};

export const buscarLibrosPorAutor = async (autorId) => {
    const response = await api.get(`/libros/autor/${autorId}`);
    return response.data;
};

export const buscarLibrosPorCategoria = async (categoriaId) => {
    const response = await api.get(`/libros/categoria/${categoriaId}`);
    return response.data;
};

export const obtenerDetalleLibro = async (id) => {
    const response = await api.get(`/libros/${id}`);
    return response.data;
};

export const registrarCliente = async (datosRegistro) => {
    const response = await api.post('/auth/register', datosRegistro);
    return response.data;
};