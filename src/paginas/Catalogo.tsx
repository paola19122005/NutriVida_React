import { useEffect, useState } from "react";
import CardServicio from "../componentes/moleculas/CardServicio";
import { cargarProductos } from "../data/productos";
import { listarServicios } from "../services/catalogoService";
import { Toast } from "../utils/toast";

export default function Catalogo(){
    const [productos, setProductos] = useState(() => cargarProductos());
    const [toast, setToast] = useState(false);
    const [busqueda, setBusqueda] = useState("");
    const [tipo, setTipo] = useState("");
    const [debouncedQ, setDebouncedQ] = useState("");

    useEffect(() => {
      const t = setTimeout(() => setDebouncedQ(busqueda.trim()), 300);
      return () => clearTimeout(t);
    }, [busqueda]);

    useEffect(() => {
      listarServicios(tipo || undefined, debouncedQ || undefined)
        .then((data) => setProductos(data))
        .catch(() => {});
    }, [tipo, debouncedQ]);

    const filtrados = productos;

    return (
        <main>
            <section className="page-title">
                <div className="container">
                    <h1>Catálogo de Servicios de Nutrición</h1>
                    <p>Encuentra el plan de nutrición perfecto para tu bienestar integral.</p>
                </div>
            </section>
            <section className="section">
                <div className="container">
                    <div className="form-group" style={{marginBottom: "20px"}}>
                        <label htmlFor="tipoCatalogo">Tipo</label>
                        <select id="tipoCatalogo" value={tipo} onChange={(e) => setTipo(e.target.value)} style={{marginBottom:"8px"}}>
                            <option value="">Todos</option>
                            <option value="Consulta">Consulta</option>
                            <option value="Plan especializado">Plan especializado</option>
                            <option value="Evaluación">Evaluación</option>
                            <option value="Taller grupal">Taller grupal</option>
                        </select>
                        <label htmlFor="busquedaCatalogo">Buscar servicios</label>
                        <input
                            id="busquedaCatalogo"
                            type="text"
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            placeholder="Nombre, tipo, modalidad..."
                        />
                        {busqueda.trim() ? (
                            <button className="btn btn-outline" type="button" onClick={() => setBusqueda("")} style={{marginTop:"8px"}}>
                                Limpiar filtro
                            </button>
                        ) : null}
                    </div>
                    {filtrados.length === 0 ? (
            <div className="empty">No se encontraron servicios.</div>
          ) : (
            <div className="grid-4">
              {filtrados.map((p) => (
                <CardServicio key={p.id} {...p} onAgregado={() => setToast(true)} />
              ))}
            </div>
          )}
        </div>
      </section>
      <Toast mensaje="Servicio agregado a tu lista." visible={toast} onCerrar={() => setToast(false)} />
    </main>
  );
}
