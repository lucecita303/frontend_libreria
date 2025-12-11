import api from './axiosClient';

export const obtenerMiCarrito = async () => {
    const response = await api.get('/carrito/miCarrito');
    return response.data;
};

export const agregarItem = async (libroID, cantidad) => {
    const response = await api.post('/carrito/agregarItem', { libroID, cantidad });
    return response.data;
};

export const actualizarCantidad = async (libroID, cantidad) => {
    const response = await api.put('/carrito', { libroID, cantidad });
    return response.data;
};

export const eliminarItem = async (libroID, cantidad) => {
    const response = await api.put(`/carrito/eliminarItem`, { libroID, cantidad });
    return response.data;
};

export const limpiarCarrito = async () => {
    const response = await api.put(`/carrito/limpiarCarrito`);
    return response.data;
};