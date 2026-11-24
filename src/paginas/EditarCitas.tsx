import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { obtenerSesion } from "../data/usuarios";
import { cargarUsuarios } from "../data/usuarios";
import { formatearFecha, fechaPasada, fechaISO } from "../utils/fechas";
import { citasPorNutricionista, agendarCita, modificarCita, cancelarCita as cancelarCitaBackend, marcarCitaRealizada } from "../services/atencionService";
import type { BackendCita } from "../services/atencionService";

interface Cita {
  id: number;
  backendId?: number;
  pacienteId: number;
  pacienteNombre: string;
  fecha: string;
  hora: string;
  estado: "Programada" | "Realizada" | "Cancelada";
  observaciones: string;
}

const KEY = "citasNutricionista";

function cargarCitas(): Cita[] {
  const raw = localStorage.getItem(KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function guardarCitas(citas: Cita[]) {
  localStorage.setItem(KEY, JSON.stringify(citas));
}

export default function EditarCitas() {
  const navigate = useNavigate();
  const [citas, setCitas] = useState<Cita[]>(() => cargarCitas());
  const [pacientes] = useState(() => cargarUsuarios().filter((u) => u.rol === "Paciente"));

  const [editId, setEditId] = useState<number | null>(null);
  const [pacienteId, setPacienteId] = useState("");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [estado, setEstado] = useState<Cita["estado"]>("Programada");
  const [observaciones, setObservaciones] = useState("");
  const [errores, setErrores] = useState<Record<string, string | undefined>>({});
  const [mensaje, setMensaje] = useState("");

  const [citasReales, setCitasReales] = useState<BackendCita[]>([]);
  const [cargandoCitasReales, setCargandoCitasReales] = useState(false);
  const [errorCitasReales, setErrorCitasReales] = useState("");

  useEffect(() => {
    const u = obtenerSesion();
    if (!u || u.rol !== "Nutricionista") {
      navigate("/login");
      return;
    }
    setCargandoCitasReales(true);
    setErrorCitasReales("");
    citasPorNutricionista(u.id)
      .then(setCitasReales)
      .catch(() => setErrorCitasReales("No se pudo conectar con Atención Nutricional."))
      .finally(() => setCargandoCitasReales(false));
  }, [navigate]);

  const resetForm = () => {
    setEditId(null);
    setPacienteId("");
    setFecha("");
    setHora("");
    setEstado("Programada");
    setObservaciones("");
    setErrores({});
  };

  const editar = (cita: Cita) => {
    setEditId(cita.id);
    setPacienteId(String(cita.pacienteId));
    setFecha(cita.fecha);
    setHora(cita.hora);
    setEstado(cita.estado);
    setObservaciones(cita.observaciones);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    const nuevos: Record<string, string> = {};
    let ok = true;
    if (!pacienteId) { nuevos.pacienteId = "Selecciona un paciente."; ok = false; }
    if (!fecha) { nuevos.fecha = "La fecha es obligatoria."; ok = false; }
    else if (fechaPasada(fecha)) { nuevos.fecha = "No se permiten fechas anteriores al día actual."; ok = false; }
    if (!hora) { nuevos.hora = "La hora es obligatoria."; ok = false; }
    setErrores(nuevos);
    if (!ok) return;

    const lista = cargarCitas();
    const conflicto = lista.some(
      (c) => c.fecha === fecha && c.hora === hora && c.id !== editId && c.estado !== "Cancelada"
    );
    if (conflicto) {
      setErrores({ hora: "Ya existe una cita en esa fecha y hora." });
      return;
    }

    const paciente = pacientes.find((p) => p.id === Number(pacienteId));
    const existente = editId ? lista.find((c) => c.id === editId) : undefined;
    const fechaHora = `${fecha}T${hora.length === 5 ? hora + ":00" : hora}`;
    const payload = {
      pacienteId: Number(pacienteId),
      nutricionistaId: obtenerSesion()?.id,
      fechaHora,
      motivo: "Cita nutricional",
      observaciones: observaciones.trim(),
    };

    try {
      let backendId = existente?.backendId;
      if (backendId) {
        await modificarCita(backendId, payload);
      } else {
        const creada = await agendarCita(payload);
        backendId = creada.id;
      }

      const cita: Cita = {
        id: editId ?? Date.now(),
        backendId,
        pacienteId: Number(pacienteId),
        pacienteNombre: paciente ? `${paciente.nombre} ${paciente.apellidos}` : "Paciente",
        fecha,
        hora,
        estado,
        observaciones: observaciones.trim(),
      };

      if (editId === null) {
        lista.push(cita);
      } else {
        const idx = lista.findIndex((c) => c.id === editId);
        if (idx >= 0) lista[idx] = cita;
      }
      guardarCitas(lista);
      setCitas(lista);
      setMensaje(editId === null ? "Cita guardada correctamente." : "Cita actualizada correctamente.");
      resetForm();
    } catch {
      setMensaje("No se pudo guardar la cita en Atención Nutricional.");
    }
  };

  const marcarRealizadaCita = async (backendId?: number) => {
    if (!backendId) return;
    try {
      await marcarCitaRealizada(backendId);
      const u = obtenerSesion();
      if (u) {
        const data = await citasPorNutricionista(u.id);
        setCitasReales(data);
      }
    } catch {
      setMensaje("No se pudo marcar la cita como realizada.");
    }
  };
  const cancelarCita = async (id: number) => {
    const lista = cargarCitas();
    const idx = lista.findIndex((c) => c.id === id);
    if (idx < 0) return;
    const backendId = lista[idx].backendId;
    if (backendId) {
      try {
        await cancelarCitaBackend(backendId);
      } catch {
        setMensaje("No se pudo cancelar la cita en Atención Nutricional.");
        return;
      }
    }
    lista[idx].estado = "Cancelada";
    guardarCitas(lista);
    setCitas(lista);
  };

  return (
    <main>
      <section className="page-title">
        <div className="container">
          <h1>Editar citas</h1>
          <p>Gestiona las citas agendadas de tus pacientes.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <form onSubmit={guardar}>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="pacienteId">Paciente</label>
                <select id="pacienteId" value={pacienteId} onChange={(e) => setPacienteId(e.target.value)}>
                  <option value="">Seleccionar</option>
                  {pacientes.map((p) => (
                    <option key={p.id} value={p.id}>{p.nombre} {p.apellidos}</option>
                  ))}
                </select>
                <span className="error">{errores.pacienteId ?? ""}</span>
              </div>
              <div className="form-group">
                <label htmlFor="fecha">Fecha</label>
                <input id="fecha" type="date" min={fechaISO()} value={fecha} onChange={(e) => setFecha(e.target.value)} />
                <span className="error">{errores.fecha ?? ""}</span>
              </div>
              <div className="form-group">
                <label htmlFor="hora">Hora</label>
                <input id="hora" type="time" value={hora} onChange={(e) => setHora(e.target.value)} />
                <span className="error">{errores.hora ?? ""}</span>
              </div>
              <div className="form-group">
                <label htmlFor="estado">Estado</label>
                <select id="estado" value={estado} onChange={(e) => setEstado(e.target.value as Cita["estado"])}>
                  <option value="Programada">Programada</option>
                  <option value="Realizada">Realizada</option>
                  <option value="Cancelada">Cancelada</option>
                </select>
              </div>
              <div className="form-group full">
                <label htmlFor="observaciones">Observaciones</label>
                <textarea id="observaciones" value={observaciones} onChange={(e) => setObservaciones(e.target.value)} />
              </div>
              <div className="full">
                <button className="btn btn-primary" type="submit">{editId === null ? "Guardar cita" : "Actualizar cita"}</button>
                {editId !== null ? (
                  <button className="btn btn-outline" type="button" onClick={resetForm} style={{ marginLeft: "8px" }}>Cancelar</button>
                ) : null}
                {mensaje ? <p className="success">{mensaje}</p> : null}
              </div>
            </div>
          </form>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-title">
            <h2>Citas registradas</h2>
            <p>Listado de citas agendadas.</p>
          </div>
          {citas.length === 0 ? (
            <div className="empty">Todavía no tienes citas programadas.</div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Paciente</th>
                    <th>Fecha</th>
                    <th>Hora</th>
                    <th>Estado</th>
                    <th>Observaciones</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {citas.map((c) => (
                    <tr key={c.id}>
                      <td>{c.pacienteNombre}</td>
                      <td>{formatearFecha(c.fecha)}</td>
                      <td>{c.hora}</td>
                      <td>{c.estado}</td>
                      <td>{c.observaciones}</td>
                      <td>
                        <button className="btn btn-outline" type="button" onClick={() => editar(c)}>Editar</button>{" "}
                        {c.estado !== "Cancelada" ? (
                          <button className="btn btn-danger" type="button" onClick={() => cancelarCita(c.id)}>Cancelar</button>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="section-title">
            <h2>Citas reales de Atención Nutricional</h2>
            <p>Listado obtenido del backend.</p>
          </div>
          {cargandoCitasReales ? (
            <div className="empty">Cargando citas...</div>
          ) : errorCitasReales ? (
            <div className="empty">{errorCitasReales}</div>
          ) : citasReales.length === 0 ? (
            <div className="empty">No hay citas reales registradas.</div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Paciente</th>
                    <th>Fecha y hora</th>
                    <th>Motivo</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {citasReales.map((c) => (
                    <tr key={c.id}>
                      <td>{c.id}</td>
                      <td>{c.pacienteId}</td>
                      <td>{c.fechaHora}</td>
                      <td>{c.motivo}</td>
                      <td>{c.estado}</td>
                      <td>
                        {c.estado === "PROGRAMADA" ? (
                          <button className="btn btn-outline" type="button" onClick={() => void marcarRealizadaCita(c.id)}>
                            Realizar
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}