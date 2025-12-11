import api from './axiosClient';

export const crearOrden = async (datosDireccion) => {
    const response = await api.post('/ordenes/crear', datosDireccion);
    return response.data;
};

export const confirmarPago = async (ordenID) => {
    const response = await api.put(`/ordenes/confirmarPago/${ordenID}`);
    return response.data;
};

export const cancelarOrden = async (ordenID) => {
    const response = await api.put(`/ordenes/cancelar/${ordenID}`);
    return response.data;
};

export const obtenerMisOrdenes = async () => {
    const response = await api.get('/ordenes');
    return response.data;
};