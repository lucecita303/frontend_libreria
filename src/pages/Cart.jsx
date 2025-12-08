import React, { useContext } from "react";
import { CartContext } from "../context/CartContext";

function Cart() {
  const { cart, removeFromCart, clearCart } = useContext(CartContext);

  return (
    <div
      style={{
        padding: "40px",
        backgroundColor: "#EFE5D2",
        minHeight: "100vh",
        fontFamily: "'Times New Roman', serif",
      }}
    >
      <h1 style={{ color: "#3B2F2F", marginBottom: "20px" }}>🛒 Carrito</h1>

      {cart.length === 0 ? (
        <p style={{ color: "#5A4A42" }}>Tu carrito está vacío…</p>
      ) : (
        <>
          {cart.map((item) => (
            <div
              key={item.id}
              style={{
                backgroundColor: "#F4E8D5",
                border: "1px solid #CBB892",
                borderRadius: "10px",
                padding: "20px",
                marginBottom: "20px",
                boxShadow: "0 4px 6px rgba(0,0,0,0.15)",
              }}
            >
              <h3 style={{ marginBottom: "8px" }}>{item.title}</h3>
              <p style={{ fontStyle: "italic" }}>{item.author}</p>

              <button
                onClick={() => removeFromCart(item.id)}
                style={{
                  marginTop: "10px",
                  padding: "10px",
                  backgroundColor: "#CBB892",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontFamily: "'Times New Roman', serif",
                  fontWeight: "bold",
                }}
              >
                Quitar
              </button>
            </div>
          ))}

          <button
            onClick={clearCart}
            style={{
              padding: "12px",
              backgroundColor: "#BFA67A",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontFamily: "'Times New Roman', serif",
              fontWeight: "bold",
            }}
          >
            Vaciar carrito
          </button>
        </>
      )}
    </div>
  );
}

export default Cart;
