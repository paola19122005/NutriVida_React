import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { cargarUsuarios, guardarUsuarios, obtenerSesion } from "../data/usuarios";
import type { Usuario } from "../data/usuarios";
import { Toast } from "../utils/toast";
import { validarCorreo, validarRut, normalizarRut, LIMITE_NOMBRE, LIMITE_APELLIDOS, LIMITE_CORREO } from "../utils/validacion";

export default function AdminUsuarios() {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState<Usuario[]>(() => cargarUsuarios());
  const [toast, setToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("Usuario guardado.");
  const [busqueda, setBusqueda] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [run, setRun] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [correo, setCorreo] = useState("");
  const [rol, setRol] = useState("Paciente");

  const [errores, setErrores] = useState<Record<string, string | undefined>>({});

  const usuariosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    if (!texto) return usuarios;
    return usuarios.filter((u) =>
      [u.id, u.run, u.nombre, u.apellidos, u.correo, u.rol].some((campo) =>
        String(campo).toLowerCase().includes(texto)
      )
    );
  }, [usuarios, busqueda]);

  const eliminarUsuario = (id: number) => {
    if (!window.confirm("¿Eliminar este usuario?")) return;
    const lista = cargarUsuarios().filter((u) => u.id !== id);
    guardarUsuarios(lista);
    setUsuarios(lista);
    setToastMsg("Usuario eliminado.");
    setToast(true);
  };

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

  const resetForm = () => {
    setEditingId(null);
    setRun("");
    setNombre("");
    setApellidos("");
    setCorreo("");
    setRol("Paciente");
    setErrores({});
  };

  const editarUsuario = (id: number) => {
    const u = usuarios.find((x) => x.id === id);
    if (!u) return;
    setEditingId(u.id);
    setRun(u.run);
    setNombre(u.nombre);
    setApellidos(u.apellidos);
    setCorreo(u.correo);
    setRol(u.rol);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const guardar = (e: React.FormEvent) => {
    e.preventDefault();
    const nuevosErrores: Record<string, string> = {};
    let ok = true;

    const runNorm = normalizarRut(run);
    const runLimpio = run.trim();
    const nombreLimpio = nombre.trim();
    const apellidosLimpio = apellidos.trim();
    const correoLimpio = correo.trim();
    const correoNorm = correoLimpio.toLowerCase();

    if (!runLimpio) { nuevosErrores.run = "El RUN es obligatorio."; ok = false; }
    else if (!validarRut(runLimpio)) { nuevosErrores.run = "RUN inválido. Usa formato 12.345.678-5."; ok = false; }

    if (!nombreLimpio) { nuevosErrores.nombre = "El nombre es obligatorio."; ok = false; }
    else if (nombreLimpio.length > LIMITE_NOMBRE) { nuevosErrores.nombre = `Máximo ${LIMITE_NOMBRE} caracteres.`; ok = false; }

    if (!apellidosLimpio) { nuevosErrores.apellidos = "Los apellidos son obligatorios."; ok = false; }
    else if (apellidosLimpio.length > LIMITE_APELLIDOS) { nuevosErrores.apellidos = `Máximo ${LIMITE_APELLIDOS} caracteres.`; ok = false; }

    if (!correoLimpio) { nuevosErrores.correo = "El correo es obligatorio."; ok = false; }
    else if (correoLimpio.length > LIMITE_CORREO) { nuevosErrores.correo = `Máximo ${LIMITE_CORREO} caracteres.`; ok = false; }
    else if (!validarCorreo(correoLimpio)) { nuevosErrores.correo = "Correo inválido."; ok = false; }

    if (!rol) { nuevosErrores.rol = "Selecciona un rol."; ok = false; }

    const listaActual = cargarUsuarios();

    if (ok && runLimpio) {
      const duplicadoRun = listaActual.some((u) => normalizarRut(u.run) === runNorm && u.id !== editingId);
      if (duplicadoRun) { nuevosErrores.run = "Ese RUN ya está registrado."; ok = false; }
    }
    if (ok && correoLimpio) {
      const duplicadoCorreo = listaActual.some((u) => u.correo.trim().toLowerCase() === correoNorm && u.id !== editingId);
      if (duplicadoCorreo) { nuevosErrores.correo = "Ese correo ya está registrado."; ok = false; }
    }

    setErrores(nuevosErrores);
    if (!ok) return;

    if (editingId === null) {
      const nuevo: Usuario = {
        id: Date.now(),
        run: runNorm,
        nombre: nombreLimpio,
        apellidos: apellidosLimpio,
        correo: correoLimpio,
        fechaNacimiento: "",
        rol,
        region: "",
        comuna: "",
        direccion: "",
        clave: "1234",
        activo: true,
      };
      const nuevaLista = [...listaActual, nuevo];
      guardarUsuarios(nuevaLista);
      setUsuarios(nuevaLista);
      setToastMsg("Usuario guardado.");
    } else {
      const idx = listaActual.findIndex((u) => u.id === editingId);
      if (idx < 0) return;
      listaActual[idx] = {
        ...listaActual[idx],
        run: runNorm,
        nombre: nombreLimpio,
        apellidos: apellidosLimpio,
        correo: correoLimpio,
        rol,
      };
      guardarUsuarios(listaActual);
      setUsuarios(listaActual);
      setToastMsg("Usuario actualizado.");
    }

    resetForm();
    setToast(true);
  };

  const toggleUsuario = (id: number) => {
    const lista = cargarUsuarios();
    const u = lista.find((x) => x.id === id);
    if (!u) return;
    u.activo = u.activo === false;
    guardarUsuarios(lista);
    setUsuarios(lista);
  };

  return (
    <main>
      <section className="page-title">
        <div className="container">
          <h1>Mantenedor de Usuarios</h1>
          <p>Crear, editar, asignar roles y desactivar usuarios.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <form onSubmit={guardar}>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="run">RUN</label>
                <input id="run" name="run" value={run} onChange={(e) => { setRun(e.target.value); setErrores((prev) => { const c = { ...prev }; delete c.run; return c; }); }} required />
                <span className="error">{errores.run ?? ""}</span>
              </div>
              <div className="form-group">
                <label htmlFor="nombre">Nombre</label>
                <input id="nombre" name="nombre" value={nombre} onChange={(e) => { setNombre(e.target.value); setErrores((prev) => { const c = { ...prev }; delete c.nombre; return c; }); }} maxLength={LIMITE_NOMBRE} required />
                <span className="error">{errores.nombre ?? ""}</span>
              </div>
              <div className="form-group">
                <label htmlFor="apellidos">Apellidos</label>
                <input id="apellidos" name="apellidos" value={apellidos} onChange={(e) => { setApellidos(e.target.value); setErrores((prev) => { const c = { ...prev }; delete c.apellidos; return c; }); }} maxLength={LIMITE_APELLIDOS} required />
                <span className="error">{errores.apellidos ?? ""}</span>
              </div>
              <div className="form-group">
                <label htmlFor="correo">Correo</label>
                <input id="correo" name="correo" type="email" value={correo} onChange={(e) => { setCorreo(e.target.value); setErrores((prev) => { const c = { ...prev }; delete c.correo; return c; }); }} maxLength={LIMITE_CORREO} required />
                <span className="error">{errores.correo ?? ""}</span>
              </div>
              <div className="form-group">
                <label htmlFor="rol">Rol</label>
                <select id="rol" name="rol" value={rol} onChange={(e) => setRol(e.target.value)}>
                  <option>Administrador</option>
                  <option>Nutricionista</option>
                  <option>Paciente</option>
                </select>
                <span className="error">{errores.rol ?? ""}</span>
              </div>
              <div className="full">
                <button className="btn btn-primary" type="submit">{editingId === null ? "Guardar usuario" : "Guardar edición"}</button>
                {editingId !== null ? (
                  <button className="btn btn-outline" type="button" onClick={resetForm} style={{ marginLeft: "8px" }}>Cancelar</button>
                ) : null}
              </div>
            </div>
          </form>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="form-group" style={{ marginBottom: "16px" }}>
            <label htmlFor="busquedaUsuarios">Buscar usuarios</label>
            <input id="busquedaUsuarios" type="text" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="RUN, nombre, correo o rol..." />
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
                  <th>RUN</th>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody id="tbodyUsuarios">
                {usuariosFiltrados.map((u) => (
                  <tr key={u.id}>
                    <td>{u.run}</td>
                    <td>{u.nombre} {u.apellidos}</td>
                    <td>{u.correo}</td>
                    <td>{u.rol}</td>
                    <td>
                      <span className={`status ${u.activo === false ? "status-off" : "status-ok"}`}>
                        {u.activo === false ? "Inactivo" : "Activo"}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-outline" onClick={() => editarUsuario(u.id)}>Editar</button>{" "}
                      <button className="btn btn-danger" onClick={() => toggleUsuario(u.id)}>
                        {u.activo === false ? "Activar" : "Desactivar"}
                      </button>{" "}
                      <button className="btn btn-danger" onClick={() => eliminarUsuario(u.id)}>Eliminar</button>
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