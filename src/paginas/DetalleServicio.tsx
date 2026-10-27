import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { cargarProductos } from "../data/productos";
import { dinero } from "../utils/formato";
import { agregarLista } from "../utils/lista";
import { Toast } from "../utils/toast";
import SelectorFecha from "../componentes/moleculas/SelectorFecha";

export default function DetalleServicio() {
  const { id } = useParams();
  const productos = cargarProductos();
  const p = productos.find((x) => x.id === id);
  const [toast, setToast] = useState(false);
  const [mostrarFecha, setMostrarFecha] = useState(false);

  if (!p) {
    return (
      <main>
        <section className="section">
          <div className="container">
            <div className="empty">No se encontró el servicio. Vuelve al catálogo.</div>
          </div>
        </section>
      </main>
    );
  }

  const handleAgregar = () => {
    setMostrarFecha(true);
  };

  const handleConfirmarFecha = (fecha: string) => {
    if (!p) return;
    agregarLista(p.id, fecha);
    setMostrarFecha(false);
    setToast(true);
  };

  return (
    <main>
      <section className="page-title">
        <div className="container">
          <h1>Detalle del servicio</h1>
          <p>Información ampliada del servicio seleccionado.</p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="detail-grid">
            <img className="detail-image" src={p.imagen} alt={p.nombre} />
            <div className="info-box">
              <span className="badge">{p.tipo}</span>
              <h1>{p.nombre}</h1>
              <p>{p.descripcion}</p>
              <ul className="list-clean" style={{ marginTop: "15px" }}>
                <li><strong>Código:</strong> {p.id}</li>
                <li><strong>Duración:</strong> {p.duracion && p.duracion !== "—" && !Number.isNaN(Number(p.duracion)) ? `${p.duracion} min` : (p.duracion || "—")}</li>
                <li><strong>Modalidad:</strong> {p.modalidad || "Sin modalidad"}</li>
                <li><strong>Profesional:</strong> Nutricionista</li>
              </ul>
              <p className="price">{dinero(p.precio)}</p>
              <div className="actions">
                <button className="btn btn-primary" onClick={handleAgregar}>Agregar a la lista</button>
                {mostrarFecha ? (
                  <SelectorFecha onConfirmar={handleConfirmarFecha} onCancelar={() => setMostrarFecha(false)} />
                ) : null}
                <Link className="btn btn-outline" to="/catalogo">Volver al catálogo</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Toast mensaje="Servicio agregado a tu lista." visible={toast} onCerrar={() => setToast(false)} />
    </main>
  );
}
