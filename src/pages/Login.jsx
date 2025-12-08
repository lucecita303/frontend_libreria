import React, { useState } from "react";
import { Link } from "react-router-dom";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Intento de login:", email, password);

        // Aquí luego agregas tu API
        alert("Login enviado (falta conectar API)");
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>Iniciar sesión</h2>

                <form onSubmit={handleSubmit} style={styles.form}>
                    <label style={styles.label}>Correo electrónico</label>
                    <input
                        type="email"
                        style={styles.input}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <label style={styles.label}>Contraseña</label>
                    <input
                        type="password"
                        style={styles.input}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <button type="submit" style={styles.button}>
                        Entrar
                    </button>
                </form>

                <p style={styles.text}>
                    ¿No tienes cuenta?{" "}
                    <Link to="/register" style={styles.link}>Regístrate</Link>
                </p>
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "80vh",
        background: "#F8F1E5",
    },
    card: {
        background: "#FFF7E6",
        padding: "40px",
        borderRadius: "12px",
        width: "400px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
    },
    title: {
        textAlign: "center",
        marginBottom: "25px",
        fontSize: "1.8rem",
        color: "#1A2B3C",
    },
    form: {
        display: "flex",
        flexDirection: "column",
    },
    label: {
        marginBottom: "5px",
        fontWeight: "600",
    },
    input: {
        padding: "10px",
        borderRadius: "6px",
        border: "1px solid #ccc",
        marginBottom: "15px",
        fontSize: "1rem",
    },
    button: {
        padding: "12px",
        background: "#1A2B3C",
        color: "#fff",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "1rem",
    },
    text: {
        marginTop: "20px",
        textAlign: "center",
        fontSize: "0.9rem",
    },
    link: {
        color: "#1A2B3C",
        fontWeight: "bold",
        textDecoration: "none",
    },
};

export default Login;
