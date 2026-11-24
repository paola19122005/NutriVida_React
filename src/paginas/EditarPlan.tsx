import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { obtenerSesion } from "../data/usuarios";
import { cargarUsuarios } from "../data/usuarios";
import { cargarProductos } from "../data/productos";

import { fechaISO, formatearFecha, estadoPlan, fechaPasada, addMonths, parseFechaISO } from "../utils/fechas";
import { planesPorNutricionista, crearPlan, actualizarPlan, registrarSeguimiento, listarSeguimientos } from "../services/atencionService";
import type { BackendPlanNutricional, BackendSeguimiento } from "../services/atencionService";

interface Revision {
  fecha: string;
  nota: string;
}

interface PlanNutricional {
  id: number;
  backendId?: number;
  pacienteId: number;
  pacienteNombre: string;
  tipoPlan: string;
  fechaInicio: string;
  duracionMeses: number;
  objetivos: string;
  observaciones: string;
  proximaRevision: string;
  revisiones: Revision[];
}

const KEY = "planesNutricionista";

function cargarPlanes(): PlanNutricional[] {
  const raw = localStorage.getItem(KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function guardarPlanes(planes: PlanNutricional[]) {
  localStorage.setItem(KEY, JSON.stringify(planes));
}

export default function EditarPlan() {
  const navigate = useNavigate();
  const [planes, setPlanes] = useState<PlanNutricional[]>(() => cargarPlanes());
  const [pacientes] = useState(() => cargarUsuarios().filter((u) => u.rol === "Paciente"));
  const [planesCatalogo] = useState(() => cargarProductos().filter((p) => p.tipo === "Plan especializado"));

  const [editId, setEditId] = useState<number | null>(null);
  const [pacienteId, setPacienteId] = useState("");
  const [tipoPlan, setTipoPlan] = useState("");
  const [fechaInicio, setFechaInicio] = useState(fechaISO());
  const [duracionMeses, setDuracionMeses] = useState("1");
  const [objetivos, setObjetivos] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [proximaRevision, setProximaRevision] = useState("");
  const [nuevaRevision, setNuevaRevision] = useState("");
  const [errores, setErrores] = useState<Record<string, string | undefined>>({});
  const [mensaje, setMensaje] = useState("");

  const [planesReales, setPlanesReales] = useState<BackendPlanNutricional[]>([]);
  const [seguimientosPorPlan, setSeguimientosPorPlan] = useState<Record<number, BackendSeguimiento[]>>({});
  const [seguimientoPlanId, setSeguimientoPlanId] = useState("");
  const [seguimientoComentario, setSeguimientoComentario] = useState("");
  const [seguimientoProgreso, setSeguimientoProgreso] = useState("");
  const [mensajeSeguimiento, setMensajeSeguimiento] = useState("");
  const [cargandoPlanesReales, setCargandoPlanesReales] = useState(false);
  const [errorPlanesReales, setErrorPlanesReales] = useState("");

  useEffect(() => {
    const u = obtenerSesion();
    if (!u || u.rol !== "Nutricionista") {
      navigate("/login");
      return;
    }
    setCargandoPlanesReales(true);
    setErrorPlanesReales("");
    planesPorNutricionista(u.id)
      .then(setPlanesReales)
      .catch(() => setErrorPlanesReales("No se pudo conectar con Atención Nutricional."))
      .finally(() => setCargandoPlanesReales(false));
  }, [navigate]);

  const resetForm = () => {
    setEditId(null);
    setPacienteId("");
    setTipoPlan("");
    setFechaInicio(fechaISO());
    setDuracionMeses("1");
    setObjetivos("");
    setObservaciones("");
    setProximaRevision("");
    setNuevaRevision("");
    setErrores({});
  };

  const editar = (plan: PlanNutricional) => {
    setEditId(plan.id);
    setPacienteId(String(plan.pacienteId));
    setTipoPlan(plan.tipoPlan);
    setFechaInicio(plan.fechaInicio);
    setDuracionMeses(String(plan.duracionMeses));
    setObjetivos(plan.objetivos);
    setObservaciones(plan.observaciones);
    setProximaRevision(plan.proximaRevision);
    setNuevaRevision("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    const nuevos: Record<string, string> = {};
    let ok = true;
    if (!pacienteId) { nuevos.pacienteId = "Selecciona un paciente."; ok = false; }
    if (!tipoPlan.trim()) { nuevos.tipoPlan = "Indica el plan."; ok = false; }
    if (!fechaInicio) { nuevos.fechaInicio = "La fecha de inicio es obligatoria."; ok = false; }
    else if (fechaPasada(fechaInicio)) { nuevos.fechaInicio = "No se permiten fechas anteriores al día actual."; ok = false; }
    const meses = Number(duracionMeses);
    if (!duracionMeses || !Number.isInteger(meses) || meses < 1) { nuevos.duracionMeses = "Duración inválida."; ok = false; }
    if (proximaRevision && fechaPasada(proximaRevision)) {
      nuevos.proximaRevision = "No se permiten fechas anteriores al día actual.";
      ok = false;
    }
    setErrores(nuevos);
    if (!ok) return;

    const paciente = pacientes.find((p) => p.id === Number(pacienteId));
    const existente = editId ? planes.find((p) => p.id === editId) : undefined;
    const fechaTermino = fechaISO(addMonths(parseFechaISO(fechaInicio), meses));
    const payload = {
      nombre: tipoPlan.trim(),
      descripcion: [objetivos.trim(), observaciones.trim()].filter(Boolean).join(" | "),
      pacienteId: Number(pacienteId),
      nutricionistaId: obtenerSesion()?.id,
      fechaInicio,
      fechaTermino,
    };

    try {
      let backendId = existente?.backendId;
      if (backendId) {
        await actualizarPlan(backendId, payload);
      } else {
        const creado = await crearPlan(payload);
        backendId = creado.id;
      }

      const plan: PlanNutricional = {
        id: editId ?? Date.now(),
        backendId,
        pacienteId: Number(pacienteId),
        pacienteNombre: paciente ? `${paciente.nombre} ${paciente.apellidos}` : "Paciente",
        tipoPlan: tipoPlan.trim(),
        fechaInicio,
        duracionMeses: meses,
        objetivos: objetivos.trim(),
        observaciones: observaciones.trim(),
        proximaRevision: proximaRevision.trim(),
        revisiones: editId ? (planes.find((p) => p.id === editId)?.revisiones ?? []) : [],
      };

      if (nuevaRevision.trim()) {
        plan.revisiones = [...plan.revisiones, { fecha: fechaISO(), nota: nuevaRevision.trim() }];
      }

      const lista = cargarPlanes();
      if (editId === null) {
        lista.push(plan);
      } else {
        const idx = lista.findIndex((p) => p.id === editId);
        if (idx >= 0) lista[idx] = plan;
      }
      guardarPlanes(lista);
      setPlanes(lista);
      setMensaje(editId === null ? "Plan guardado correctamente." : "Plan actualizado correctamente.");
      resetForm();
    } catch {
      setMensaje("No se pudo guardar el plan en Atención Nutricional.");
    }
  };

  const cargarSeguimientos = async (planId: number) => {
    try {
      const data = await listarSeguimientos(planId);
      setSeguimientosPorPlan((prev) => ({ ...prev, [planId]: data }));
    } catch {
      setMensajeSeguimiento("No se pudieron cargar los seguimientos.");
    }
  };

  const guardarSeguimiento = async (e: React.FormEvent) => {
    e.preventDefault();
    const planId = Number(seguimientoPlanId);
    if (!planId) {
      setMensajeSeguimiento("Selecciona un plan.");
      return;
    }
    const comentario = seguimientoComentario.trim();
    if (!comentario) {
      setMensajeSeguimiento("El comentario es obligatorio.");
      return;
    }
    const progreso = Number(seguimientoProgreso);
    if (Number.isNaN(progreso) || progreso < 0 || progreso > 100) {
      setMensajeSeguimiento("El progreso debe estar entre 0 y 100.");
      return;
    }
    try {
      await registrarSeguimiento(planId, comentario, progreso);
      setSeguimientoComentario("");
      setSeguimientoProgreso("");
      setMensajeSeguimiento("Seguimiento registrado correctamente.");
      await cargarSeguimientos(planId);
    } catch {
      setMensajeSeguimiento("No se pudo registrar el seguimiento.");
    }
  };
  const agregarRevision = (planId: number) => {
    const nota = window.prompt("Ingresa el feedback de la revisión:");
    if (!nota || !nota.trim()) return;
    const lista = cargarPlanes();
    const idx = lista.findIndex((p) => p.id === planId);
    if (idx < 0) return;
    lista[idx].revisiones = [...lista[idx].revisiones, { fecha: fechaISO(), nota: nota.trim() }];
    guardarPlanes(lista);
    setPlanes(lista);
  };

  return (
    <main>
      <section className="page-title">
        <div className="container">
          <h1>Editar plan</h1>
          <p>Gestiona los planes nutricionales y el seguimiento de tus pacientes.</p>
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
                <label htmlFor="tipoPlan">Plan</label>
                <select id="tipoPlan" value={tipoPlan} onChange={(e) => setTipoPlan(e.target.value)}>
                  <option value="">Seleccionar</option>
                  {planesCatalogo.map((p) => (
                    <option key={p.id} value={p.nombre}>{p.nombre}</option>
                  ))}
                </select>
                <span className="error">{errores.tipoPlan ?? ""}</span>
              </div>
              <div className="form-group">
                <label htmlFor="fechaInicio">Fecha de inicio</label>
                <input id="fechaInicio" type="date" min={fechaISO()} value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
                <span className="error">{errores.fechaInicio ?? ""}</span>
              </div>
              <div className="form-group">
                <label htmlFor="duracionMeses">Duración (meses)</label>
                <input id="duracionMeses" type="number" min={1} step={1} value={duracionMeses} onChange={(e) => setDuracionMeses(e.target.value)} />
                <span className="error">{errores.duracionMeses ?? ""}</span>
              </div>
              <div className="form-group full">
                <label htmlFor="objetivos">Objetivos nutricionales</label>
                <textarea id="objetivos" value={objetivos} onChange={(e) => setObjetivos(e.target.value)} />
              </div>
              <div className="form-group full">
                <label htmlFor="observaciones">Observaciones de seguimiento</label>
                <textarea id="observaciones" value={observaciones} onChange={(e) => setObservaciones(e.target.value)} />
              </div>
              <div className="form-group full">
                <label htmlFor="proximaRevision">Próxima revisión</label>
                <input id="proximaRevision" type="date" min={fechaISO()} value={proximaRevision} onChange={(e) => setProximaRevision(e.target.value)} />
              </div>
              <div className="form-group full">
                <label htmlFor="nuevaRevision">Nueva revisión / feedback</label>
                <textarea id="nuevaRevision" value={nuevaRevision} onChange={(e) => setNuevaRevision(e.target.value)} placeholder="Escribe el feedback del paciente..." />
              </div>
              <div className="full">
                <button className="btn btn-primary" type="submit">{editId === null ? "Guardar plan" : "Actualizar plan"}</button>
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
            <h2>Planes registrados</h2>
            <p>Historial de planes y revisiones.</p>
          </div>
          {planes.length === 0 ? (
            <div className="empty">Todavía no hay planes registrados.</div>
          ) : (
            <div className="grid-3">
              {planes.map((plan) => (
                <article className="card" key={plan.id}>
                  <div className="card-body">
                    <h3>{plan.pacienteNombre}</h3>
                    <p className="muted">{plan.tipoPlan}</p>
                    <p className="muted">Inicio: {formatearFecha(plan.fechaInicio)}</p>
                    <p className="muted">Duración: {plan.duracionMeses} mes(es)</p>
                    <p className="muted">Estado: {estadoPlan(plan.fechaInicio, plan.duracionMeses)}</p>
                    {plan.objetivos ? <p className="muted">Objetivos: {plan.objetivos}</p> : null}
                    {plan.observaciones ? <p className="muted">Observaciones: {plan.observaciones}</p> : null}
                    {plan.proximaRevision ? <p className="muted">Próxima revisión: {formatearFecha(plan.proximaRevision)}</p> : null}
                    {plan.revisiones.length > 0 ? (
                      <div>
                        <strong>Revisiones:</strong>
                        <ul className="list-clean">
                          {plan.revisiones.map((r, i) => (
                            <li key={i} className="muted">{formatearFecha(r.fecha)}: {r.nota}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                    <div className="actions">
                      <button className="btn btn-outline" type="button" onClick={() => editar(plan)}>Editar</button>
                      <button className="btn btn-primary" type="button" onClick={() => agregarRevision(plan.id)}>Agregar revisión</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="section-title">
            <h2>Seguimientos nutricionales</h2>
            <p>Registrar observaciones y progreso en MySQL.</p>
          </div>
          <form onSubmit={guardarSeguimiento}>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="segPlan">Plan</label>
                <select id="segPlan" value={seguimientoPlanId} onChange={(e) => setSeguimientoPlanId(e.target.value)}>
                  <option value="">Seleccionar</option>
                  {planesReales.map((p) => (
                    <option key={p.id} value={p.id}>{p.nombre} (Paciente {p.pacienteId})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="segProgreso">Progreso (%)</label>
                <input id="segProgreso" type="number" min={0} max={100} value={seguimientoProgreso} onChange={(e) => setSeguimientoProgreso(e.target.value)} />
              </div>
              <div className="form-group full">
                <label htmlFor="segComentario">Comentario</label>
                <textarea id="segComentario" value={seguimientoComentario} onChange={(e) => setSeguimientoComentario(e.target.value)} />
              </div>
              <div className="full">
                <button className="btn btn-primary" type="submit">Registrar seguimiento</button>
                {mensajeSeguimiento ? <p className="success">{mensajeSeguimiento}</p> : null}
              </div>
            </div>
          </form>

          {planesReales.map((p) => (
            <div key={p.id} style={{ marginTop: "16px" }}>
              <button className="btn btn-outline" type="button" onClick={() => void cargarSeguimientos(p.id)}>
                Ver seguimientos de {p.nombre}
              </button>
              {seguimientosPorPlan[p.id] ? (
                seguimientosPorPlan[p.id].length === 0 ? (
                  <p className="muted">Sin seguimientos.</p>
                ) : (
                  <ul className="list-clean">
                    {seguimientosPorPlan[p.id].map((s) => (
                      <li key={s.id} className="muted">{s.fechaRegistro}: {s.comentario} ({s.progreso}%)</li>
                    ))}
                  </ul>
                )
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-title">
            <h2>Planes reales de Atención Nutricional</h2>
            <p>Listado obtenido del backend.</p>
          </div>
          {cargandoPlanesReales ? (
            <div className="empty">Cargando planes...</div>
          ) : errorPlanesReales ? (
            <div className="empty">{errorPlanesReales}</div>
          ) : planesReales.length === 0 ? (
            <div className="empty">No hay planes reales registrados.</div>
          ) : (
            <div className="grid-3">
              {planesReales.map((p) => (
                <article className="card" key={p.id}>
                  <div className="card-body">
                    <h3>{p.nombre}</h3>
                    <p className="muted">Paciente ID: {p.pacienteId}</p>
                    <p className="muted">Estado: {p.estado}</p>
                    <p className="muted">Progreso: {p.progreso}%</p>
                    <p className="muted">Inicio: {p.fechaInicio}</p>
                    <p className="muted">Término: {p.fechaTermino}</p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}