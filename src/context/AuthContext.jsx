import React, { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from "jwt-decode"; 
import api from '../api/axiosClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    const decodificarYGuardar = (token) => {
        try {
            const decoded = jwtDecode(token);
            
            // Buscamos roles en authorities (Spring) o roles (Genérico)
            const rolesEncontrados = decoded.authorities || decoded.roles || [];

            setUser({ 
                email: decoded.sub, 
                roles: rolesEncontrados 
            });
            setIsAuthenticated(true);
        } catch (error) {
            console.error("Error sesión:", error);
            localStorage.removeItem('token');
            setUser(null);
            setIsAuthenticated(false);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            decodificarYGuardar(token);
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            const { token } = response.data; 
            
            if (token) {
                localStorage.setItem('token', token);
                decodificarYGuardar(token);
                return true; 
            }
        } catch (error) {
            console.error("Error login:", error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setUser(null);
    };

    if (loading) return null;

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);