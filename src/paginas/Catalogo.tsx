import { useMemo, useState } from "react";
import CardServicio from "../componentes/moleculas/CardServicio";
import { cargarProductos } from "../data/productos";
import { Toast } from "../utils/toast";

export default function Catalogo(){
    const productos = cargarProductos();
    const [toast, setToast] = useState(false);
    const [busqueda, setBusqueda] = useState("");

    const filtrados = useMemo(() => {
        const texto = busqueda.trim().toLowerCase();
        if (!texto) return productos;
        return productos.filter((p) =>
            [p.id, p.nombre, p.tipo, p.modalidad, p.descripcion].some((campo) =>
                String(campo).toLowerCase().includes(texto)
            )
        );
  
    }, [productos, busqueda]);

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
