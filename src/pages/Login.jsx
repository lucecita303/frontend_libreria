// src/pages/Login.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; 
import "./Login.css";
import { jwtDecode } from "jwt-decode";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

try {

        await login(email, password);
        
        const token = localStorage.getItem('token'); 
        const decoded = jwtDecode(token);
        
        const roles = decoded.authorities || [];
        
        const isAdmin = roles.includes('ADMIN') || roles.includes('ROLE_ADMIN') || roles.some(r => r.authority === 'ADMIN');

        if (isAdmin) {
            navigate("/admin");
        } else {
            navigate("/");
        }

    } catch (err) {
        console.error(err);
        setError("Credenciales incorrectas");
    }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h2 className="login-title">Iniciar sesión</h2>

                {error && <p className="error-msg">{error}</p>}

                <form onSubmit={handleSubmit} className="login-form">
                    <label className="login-label">Correo electrónico</label>
                    <input
                        type="email"
                        className="login-input"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="admin@email.com"
                    />

                    <label className="login-label">Contraseña</label>
                    <input
                        type="password"
                        className="login-input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="******"
                    />

                    <button type="submit" className="login-button">
                        Entrar
                    </button>
                </form>

                <p className="login-text">
                    ¿No tienes cuenta?{" "}
                    <Link to="/register" className="login-link">Regístrate</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;