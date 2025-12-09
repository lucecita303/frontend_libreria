import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext"; // <--- 1. IMPORTANTE: Importar esto

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
    <React.StrictMode>
        {/* 2. IMPORTANTE: Envolver toda la app con AuthProvider */}
        <AuthProvider>
            <CartProvider>
                <App />
            </CartProvider>
        </AuthProvider>
    </React.StrictMode>
);

reportWebVitals();