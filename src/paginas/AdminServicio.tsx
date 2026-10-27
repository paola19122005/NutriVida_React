import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { obtenerSesion } from "../data/usuarios";
import { cargarProductos, guardarProductos } from "../data/productos";
import type { Producto } from "../data/productos";
import { LIMITE_NOMBRE, LIMITE_COMENTARIO } from "../utils/validacion";
import { Toast } from "../utils/toast";
import { dinero } from "../utils/formato";

export default function AdminServicios() {
  const navigate = useNavigate();
  const [productos, setProductos] = useState<Producto[]>(() => cargarProductos());
  const [toast, setToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("Servicio guardado.");
  const [errores, setErrores] = useState<Record<string, string | undefined>>({});
  const [busqueda, setBusqueda] = useState("");

  const productosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    if (!texto) return productos;
    return productos.filter((p) =>
      [p.id, p.nombre, p.tipo, p.modalidad, p.descripcion].some((campo) =>
        String(campo).toLowerCase().includes(texto)
      )
    );
  }, [productos, busqueda]);

  const [idProducto, setIdProducto] = useState("");
  const [tipo, setTipo] = useState("Consulta");
  const [nombre, setNombre] = useState("");
  const [duracion, setDuracion] = useState("");
  const [modalidad, setModalidad] = useState("");
  const [precio, setPrecio] = useState("");
  const [imagen, setImagen] = useState("");
  const [descripcion, setDescripcion] = useState("");

  useEffect(() => {
    const u = obtenerSesion();
    if (!u || (u.rol !== "Administrador" && u.rol !== "Nutricionista")) {
      navigate("/login");
      return;
    }
    if (u.rol !== "Administrador") {
      alert("Esta sección requiere rol Administrador.");
      navigate("/");
      return;
    }
  }, [navigate]);

  const editarProducto = (id: string) => {
    const p = productos.find((x) => x.id === id);
    if (!p) return;
    setIdProducto(p.id);
    setTipo(p.tipo);
    setNombre(p.nombre);
    const duracionMatch = p.duracion?.match(/^(\d+)/);
    setDuracion(duracionMatch ? duracionMatch[1] : (p.duracion === "—" ? "" : (p.duracion ?? "")));
    setModalidad(p.modalidad);
    setPrecio(String(p.precio));
    setImagen(p.imagen);
    setDescripcion(p.descripcion);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const eliminarProducto = (id: string) => {
    if (!confirm("¿Eliminar este servicio?")) return;
    const nuevos = productos.filter((p) => p.id !== id);
    guardarProductos(nuevos);
    setProductos(nuevos);
  };

  const guardar = (e: React.FormEvent) => {
    e.preventDefault();
    const nuevosErrores: Record<string, string> = {};
    let ok = true;

    const id = idProducto.trim();
    const nombreLimpio = nombre.trim();
    const duracionLimpia = duracion.trim();
    const modalidadLimpia = modalidad.trim();
    const descripcionLimpia = descripcion.trim();
    const precioNumero = Number(precio);

    if (!id) { nuevosErrores.idProducto = "El código es obligatorio."; ok = false; }
    if (!nombreLimpio) { nuevosErrores.nombre = "El nombre es obligatorio."; ok = false; }
    else if (nombreLimpio.length > LIMITE_NOMBRE) { nuevosErrores.nombre = `Máximo ${LIMITE_NOMBRE} caracteres.`; ok = false; }

    const duracionObligatoria = tipo !== "Plan especializado";
    if (duracionObligatoria) {
      if (!duracionLimpia) { nuevosErrores.duracion = "La duración es obligatoria."; ok = false; }
      else if (!/^\d+$/.test(duracionLimpia) || !Number.isInteger(Number(duracionLimpia)) || Number(duracionLimpia) < 1) {
        nuevosErrores.duracion = "Ingresa un número entero válido (mínimo 1)."; ok = false;
      }
    } else if (duracionLimpia && (!/^\d+$/.test(duracionLimpia) || !Number.isInteger(Number(duracionLimpia)) || Number(duracionLimpia) < 1)) {
      nuevosErrores.duracion = "Ingresa un número entero válido (mínimo 1)."; ok = false;
    }

    if (modalidadLimpia && modalidadLimpia !== "Presencial" && modalidadLimpia !== "Online") {
      nuevosErrores.modalidad = "Selecciona Presencial u Online."; ok = false;
    }

    if (!descripcionLimpia) { nuevosErrores.descripcion = "La descripción es obligatoria."; ok = false; }
    else if (descripcionLimpia.length < 10) { nuevosErrores.descripcion = "Mínimo 10 caracteres."; ok = false; }
    else if (descripcionLimpia.length > LIMITE_COMENTARIO) { nuevosErrores.descripcion = `Máximo ${LIMITE_COMENTARIO} caracteres.`; ok = false; }

    if (precio === "" || Number.isNaN(precioNumero) || precioNumero < 0) {
      nuevosErrores.precio = "Ingresa un precio válido."; ok = false;
    }

    setErrores(nuevosErrores);
    if (!ok) return;

    const obj: Producto = {
      id,
      tipo,
      nombre: nombreLimpio,
      duracion: duracionLimpia ? String(Number(duracionLimpia)) : "—",
      modalidad: modalidadLimpia,
      precio: precioNumero,
      descripcion: descripcionLimpia,
      imagen: imagen.trim() || "img/consulta.svg",
    };
    const idx = productos.findIndex((p) => p.id === obj.id);
    let nuevos: Producto[];
    if (idx >= 0) {
      nuevos = [...productos];
      nuevos[idx] = obj;
    } else {
      nuevos = [...productos, obj];
    }
    guardarProductos(nuevos);
    setProductos(nuevos);
    setIdProducto("");
    setTipo("Consulta");
    setNombre("");
    setDuracion("");
    setModalidad("");
    setPrecio("");
    setImagen("");
    setDescripcion("");
    setErrores({});
    setToastMsg("Servicio guardado.");
    setToast(true);
  };

  return (
    <main>
      <section className="page-title">
        <div className="container">
          <h1>Mantenedor de Servicios</h1>
          <p>Los cambios se guardan en LocalStorage.</p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <form onSubmit={guardar}>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="idProducto">Código</label>
                <input id="idProducto" name="idProducto" value={idProducto} onChange={(e) => { setIdProducto(e.target.value); setErrores((prev) => ({ ...prev, idProducto: undefined })); }} required />
                <span className="error">{errores.idProducto ?? ""}</span>
              </div>
              <div className="form-group">
                <label htmlFor="tipo">Tipo</label>
                <select id="tipo" name="tipo" value={tipo} onChange={(e) => setTipo(e.target.value)}>
                  <option>Consulta</option>
                  <option>Plan especializado</option>
                  <option>Evaluación</option>
                  <option>Taller grupal</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="nombre">Nombre</label>
                <input id="nombre" name="nombre" value={nombre} onChange={(e) => { setNombre(e.target.value); setErrores((prev) => ({ ...prev, nombre: undefined })); }} maxLength={LIMITE_NOMBRE} required />
                <span className="error">{errores.nombre ?? ""}</span>
              </div>
              <div className="form-group">
                <label htmlFor="duracion">Duración</label>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <input id="duracion" name="duracion" type="number" step="1" min={1} value={duracion} onChange={(e) => { setDuracion(e.target.value); setErrores((prev) => ({ ...prev, duracion: undefined })); }} style={{ flex: "1" }} />
                  <span>min</span>
                </div>
                <span className="error">{errores.duracion ?? ""}</span>
              </div>
              <div className="form-group">
                <label htmlFor="modalidad">Modalidad</label>
                <select id="modalidad" name="modalidad" value={modalidad} onChange={(e) => { setModalidad(e.target.value); setErrores((prev) => ({ ...prev, modalidad: undefined })); }}>
                  <option value="">Sin modalidad</option>
                  <option value="Presencial">Presencial</option>
                  <option value="Online">Online</option>
                </select>
                <span className="error">{errores.modalidad ?? ""}</span>
              </div>
              <div className="form-group">
                <label htmlFor="precio">Precio CLP</label>
                <input id="precio" name="precio" type="number" min={0} value={precio} onChange={(e) => { setPrecio(e.target.value); setErrores((prev) => ({ ...prev, precio: undefined })); }} required />
                <span className="error">{errores.precio ?? ""}</span>
              </div>
              <div className="form-group full">
                <label htmlFor="imagen">Ruta de imagen</label>
                <input id="imagen" name="imagen" value={imagen} onChange={(e) => setImagen(e.target.value)} placeholder="img/consulta.svg" />
              </div>
              <div className="form-group full">
                <label htmlFor="descripcion">Descripción</label>
                <textarea id="descripcion" name="descripcion" value={descripcion} onChange={(e) => { setDescripcion(e.target.value); setErrores((prev) => ({ ...prev, descripcion: undefined })); }} maxLength={LIMITE_COMENTARIO} required />
                <span className="error">{errores.descripcion ?? ""}</span>
              </div>
              <div className="full">
                <button className="btn btn-primary" type="submit">Guardar servicio</button>
              </div>
            </div>
          </form>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="form-group" style={{ marginBottom: "16px" }}>
            <label htmlFor="busquedaServicios">Buscar servicios</label>
            <input id="busquedaServicios" type="text" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Código, nombre, tipo..." />
            {busqueda.trim() ? (
              <button className="btn btn-outline" type="button" onClick={() => setBusqueda("")} style={{ marginTop: "8px" }}>
                Limpiar filtro
              </button>
            ) : null}
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Nombre</th>
                  <th>Tipo</th>
                  <th>Precio</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody id="tbodyServicios">
                {productosFiltrados.map((p) => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td>{p.nombre}</td>
                    <td>{p.tipo}</td>
                    <td>{dinero(p.precio)}</td>
                    <td>
                      <button className="btn btn-outline" onClick={() => editarProducto(p.id)}>Editar</button>{" "}
                      <button className="btn btn-danger" onClick={() => eliminarProducto(p.id)}>Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
      <Toast mensaje={toastMsg} visible={toast} onCerrar={() => setToast(false)} />
    </main>
  );
}


