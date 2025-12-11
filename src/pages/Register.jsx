import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as authService from "../api/publicService";
import "./Register.css";

const Register = () => {
    const navigate = useNavigate();
    
    // Estado del formulario
    const [formData, setFormData] = useState({
        usuario: "",
        email: "",
        password: ""
    });

    // Estados de UI
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [mensajeExito, setMensajeExito] = useState(null);

    // Manejar cambios en los inputs
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // Enviar formulario
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setMensajeExito(null);
        setLoading(true);

        try {
            // Llamada al backend
            await authService.registrarCliente(formData);
            
            // Éxito: Mensaje visual y redirección
            setMensajeExito("¡Cuenta creada con éxito! Redirigiendo...");
            
            setTimeout(() => {
                navigate("/login");
            }, 2000);
            
        } catch (err) {
            console.error("Error en registro:", err);
            // Manejo de errores visual
            if (err.response && err.response.status === 400) {
                setError("Datos inválidos. Verifica que el correo o usuario no existan.");
            } else {
                setError("Ocurrió un error al registrarse. Intenta nuevamente.");
            }
            setLoading(false); // Solo quitamos loading si hubo error para que el usuario pueda reintentar
        }
    };

    return (
        <div className="register-container">
            <div className="register-card">
                <h2 className="register-title">Crear Cuenta</h2>

                {/* Mensajes de Estado (Sin alertas) */}
                {error && (
                    <div style={{
                        backgroundColor: "#fee2e2", 
                        color: "#b91c1c", 
                        padding: "10px", 
                        borderRadius: "6px", 
                        marginBottom: "15px",
                        textAlign: "center",
                        fontSize: "0.9rem",
                        border: "1px solid #fca5a5"
                    }}>
                        {error}
                    </div>
                )}

                {mensajeExito && (
                    <div style={{
                        backgroundColor: "#dcfce7", 
                        color: "#166534", 
                        padding: "10px", 
                        borderRadius: "6px", 
                        marginBottom: "15px",
                        textAlign: "center",
                        fontSize: "0.9rem",
                        fontWeight: "bold",
                        border: "1px solid #86efac"
                    }}>
                        {mensajeExito}
                    </div>
                )}

                <form className="register-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Usuario</label>
                        <input 
                            type="text" 
                            name="usuario"
                            value={formData.usuario}
                            onChange={handleChange}
                            required
                            placeholder="Ej. JuanPerez"
                            disabled={loading || mensajeExito}
                        />
                    </div>

                    <div className="form-group">
                        <label>Correo electrónico</label>
                        <input 
                            type="email" 
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="ejemplo@correo.com"
                            disabled={loading || mensajeExito}
                        />
                    </div>

                    <div className="form-group">
                        <label>Contraseña</label>
                        <input 
                            type="password" 
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            placeholder="********"
                            disabled={loading || mensajeExito}
                        />
                    </div>

                    <button 
                        className="register-btn" 
                        type="submit" 
                        disabled={loading || mensajeExito}
                        style={loading || mensajeExito ? {opacity: 0.7, cursor: 'not-allowed'} : {}}
                    >
                        {loading ? "Creando cuenta..." : "Crear cuenta"}
                    </button>
                </form>

                <p className="register-footer">
                    ¿Ya tienes cuenta?{" "}
                    <Link to="/login">Inicia sesión</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;