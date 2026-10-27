import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cargarProductos } from "../data/productos";
import type { Producto } from "../data/productos";
import { dinero } from "../utils/formato";
import { obtenerItemsLista, quitarLista, obtenerEstadoServicio } from "../utils/lista";
import { fechaPasada, formatearFecha, estadoTaller, estadoPlan, mesesPlan } from "../utils/fechas";
import { Toast } from "../utils/toast";

export default function Lista() {
  const navigate = useNavigate();
  const [items, setItems] = useState(obtenerItemsLista());
  const [toast, setToast] = useState(false);
  const productos = cargarProductos();

  const handleQuitar = (id: string) => {
    if (obtenerEstadoServicio(id) === "Pagado") return;
    quitarLista(id);
    setItems(obtenerItemsLista());
    setToast(true);
  };

  let total = 0;
  const seleccionados = items
    .map((item) => {
      const p = productos.find((prod) => prod.id === item.id);
      if (!p) return null;
      return { ...p, fecha: item.fecha };
    })
    .filter((p): p is (Producto & { fecha: string }) => Boolean(p));

  seleccionados.forEach((p) => {
    if (obtenerEstadoServicio(p.id) === "Pendiente") total += p.precio;
  });

  const hayPendientes = seleccionados.some((p) => obtenerEstadoServicio(p.id) === "Pendiente");

  return (
    <main>
      <section className="page-title">
        <div className="container">
          <h1>Mi lista de servicios</h1>
          <p>Tu selección ha sido guardada</p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          {seleccionados.length === 0 ? (
            <div className="empty">No has agregado servicios todavía.</div>
          ) : (
            <div className="grid-3">
               {seleccionados.map((p) => {
              const estadoPago = obtenerEstadoServicio(p.id);
              const pasado = fechaPasada(p.fecha);
              const colorFecha = pasado ? "#c0392b" : "#1e7e34";
              let segundoEstado: string | null = null;
              if (p.tipo === "Taller grupal") {
                segundoEstado = estadoTaller(p.fecha);
              } else if (p.tipo === "Plan especializado") {
                segundoEstado = estadoPlan(p.fecha, mesesPlan(p.nombre, p.duracion));
              }
              return (
                <article className="card" key={p.id}>
                  <div className="card-body">
                    <h3>{p.nombre}</h3>
                    <p className="muted">{p.tipo} · {p.modalidad}</p>
                    <p className="price">{dinero(p.precio)}</p>
                    <p style={{ color: colorFecha, fontWeight: 700 }}>
                      Fecha programada: {formatearFecha(p.fecha)}
                    </p>
                    <p className="muted">Pago: {estadoPago}</p>
                    {segundoEstado ? (
                      <p className="muted">
                        {p.tipo === "Taller grupal" ? "Estado del taller" : "Estado del plan"}: {segundoEstado}
                      </p>
                    ) : null}
                    {estadoPago === "Pendiente" ? (
                      <button className="btn btn-danger" onClick={() => handleQuitar(p.id)}>Quitar</button>
                    ) : null}
                  </div>
                </article>
              );
            })}
            </div>
          )}
          <div className="info-box" style={{ marginTop: "20px" }}>
            <h2>Total referencial: <span id="totalLista">{dinero(total)}</span></h2>
            <p className="hint">La lista es una selección preliminar; la cita se confirma posteriormente.</p>
          </div>
          <div style={{ marginTop: "20px" }}>
            <button className="btn btn-primary" disabled={!hayPendientes} onClick={() => navigate("/pago")}>Continuar con el pago</button>
          </div>
        </div>
      </section>
      <Toast mensaje="Servicio quitado." visible={toast} onCerrar={() => setToast(false)} />
    </main>
  );
}
