import React from "react";
import "./Register.css";

const Register = () => {
    return (
        <div className="register-container">
            <div className="register-card">
                <h2 className="register-title">Crear Cuenta</h2>

                <form className="register-form">
                    <div className="form-group">
                        <label>Nombre completo</label>
                        <input type="text" />
                    </div>

                    <div className="form-group">
                        <label>Correo electrónico</label>
                        <input type="email" />
                    </div>

                    <div className="form-group">
                        <label>Contraseña</label>
                        <input type="password" />
                    </div>

                    <button className="register-btn" type="submit">
                        Crear cuenta
                    </button>
                </form>

                <p className="register-footer">
                    ¿Ya tienes cuenta?{" "}
                    <a href="/login">Inicia sesión</a>
                </p>
            </div>
        </div>
    );
};

export default Register;
