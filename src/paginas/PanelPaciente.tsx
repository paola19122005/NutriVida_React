import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { obtenerSesion } from "../data/usuarios";
import { asegurarDemoPaciente } from "../data/demoPaciente";
import { cargarServiciosPaciente, type ServicioPaciente } from "../data/serviciosPaciente";
import { formatearFecha, estadoPlan, parseFechaISO, addMonths } from "../utils/fechas";
import { dinero } from "../utils/formato";

interface PlanNutricional {
  id: number;
  pacienteId: number;
  pacienteNombre: string;
  tipoPlan: string;
  fechaInicio: string;
  duracionMeses: number;
  objetivos: string;
  observaciones: string;
  proximaRevision: string;
  revisiones: { fecha: string; nota: string }[];
}

const PLANES_KEY = "planesNutricionista";
function cargarPlanes(): PlanNutricional[] {
  const raw = localStorage.getItem(PLANES_KEY);
  if (!raw) return [];
  try { const p = JSON.parse(raw); return Array.isArray(p) ? p : []; } catch { return []; }
}

export default function PanelPaciente() {
  const navigate = useNavigate();
  const sesion = obtenerSesion();
  const [detalleId, setDetalleId] = useState<number | null>(null);
  const [servicios] = useState<ServicioPaciente[]>(() => {
    const u = obtenerSesion();
    if (u?.rol === "Paciente") {
      asegurarDemoPaciente();
      return cargarServiciosPaciente().filter((s) => s.pacienteId === u.id);
    }
    return [];
  });
  const [planes] = useState<PlanNutricional[]>(() => {
    const u = obtenerSesion();
    if (u?.rol === "Paciente") {
      return cargarPlanes().filter((p) => p.pacienteId === u.id);
    }
    return [];
  });

  useEffect(() => {
    const u = obtenerSesion();
    if (!u || u.rol !== "Paciente") {
      navigate("/login");
    }
  }, [navigate]);

  const progresoPlan = (plan: PlanNutricional) => {
    const inicio = parseFechaISO(plan.fechaInicio);
    const fin = addMonths(inicio, plan.duracionMeses);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const total = fin.getTime() - inicio.getTime();
    const transcurrido = hoy.getTime() - inicio.getTime();
    const pct = total > 0 ? (transcurrido / total) * 100 : 0;
    return Math.min(100, Math.max(0, Math.round(pct)));
  };

  const agendados = servicios.filter((s) => s.estadoActividad === "Agendado");
  const cancelados = servicios.filter((s) => s.estadoActividad === "Cancelado");
  const pagados = servicios.filter((s) => s.estadoPago === "Pagado");
  const porPagar = servicios.filter((s) => s.estadoPago === "Pendiente");

  const planDetalle = detalleId ? planes.find((p) => p.id === detalleId) : null;

  const abrirDetallePlan = (planId: number) => setDetalleId(planId);

  return (
    <main>
      <section className="page-title">
        <div className="container">
          <h1>Mi perfil</h1>
          <p>Bienvenido/a, {sesion?.nombre}. Aquí puedes consultar tus servicios y seguimiento.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2>Plan nutricional</h2>
          {planes.length === 0 ? (
            <div className="empty">No tienes un plan nutricional asignado.</div>
          ) : (
            <div className="grid-3">
              {planes.map((plan) => (
                <article className="card" key={plan.id}>
                  <div className="card-body">
                    <h3>{plan.tipoPlan}</h3>
                    <p className="muted">Nutricionista: Carolina Fuentes</p>
                    <p className="muted">Inicio: {formatearFecha(plan.fechaInicio)}</p>
                    <p className="muted">Duración: {plan.duracionMeses} mes(es)</p>
                    <p className="muted">Estado: {estadoPlan(plan.fechaInicio, plan.duracionMeses)}</p>
                    <p className="muted">Progreso: {progresoPlan(plan)}%</p>
                    <p className="muted">Próxima revisión: {plan.proximaRevision ? formatearFecha(plan.proximaRevision) : "Sin fecha"}</p>
                    <button className="btn btn-outline" type="button" onClick={() => setDetalleId(plan.id)}>Ver detalle</button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section" id="servicios">
        <div className="container">
          <h2>Servicios agendados</h2>
          {agendados.length === 0 ? (
            <div className="empty">No tienes servicios agendados.</div>
          ) : (
            <div className="grid-3">
              {agendados.map((s) => (
                <article className="card" key={s.id}>
                  <div className="card-body">
                    <h3>{s.nombre}</h3>
                    <p className="muted">{s.tipo}</p>
                    <p className="muted">Fecha: {formatearFecha(s.fecha)}{s.hora ? ` · ${s.hora}` : ""}</p>
                    <p className="muted">Estado: {s.estadoActividad}</p>
                    <p className="muted">Pago: {s.estadoPago}</p>
                    <p className="muted">Nutricionista: {s.nutricionista}</p>
                    {s.planId ? (
                      <button className="btn btn-outline" type="button" onClick={() => abrirDetallePlan(s.planId!)}>Ver detalle</button>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2>Servicios cancelados</h2>
          {cancelados.length === 0 ? (
            <div className="empty">No tienes servicios cancelados.</div>
          ) : (
            <div className="grid-3">
              {cancelados.map((s) => (
                <article className="card" key={s.id}>
                  <div className="card-body">
                    <h3>{s.nombre}</h3>
                    <p className="muted">{s.tipo}</p>
                    <p className="muted">Fecha original: {formatearFecha(s.fecha)}</p>
                    {s.fechaCancelacion ? <p className="muted">Cancelado: {formatearFecha(s.fechaCancelacion)}</p> : null}
                    <p className="muted">Estado: Cancelado</p>
                    <p className="muted">Pago: {s.estadoPago}</p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2>Servicios pagados</h2>
          {pagados.length === 0 ? (
            <div className="empty">No tienes servicios pagados.</div>
          ) : (
            <div className="grid-3">
              {pagados.map((s) => (
                <article className="card" key={s.id}>
                  <div className="card-body">
                    <h3>{s.nombre}</h3>
                    <p className="muted">{s.tipo}</p>
                    {s.fechaPago ? <p className="muted">Pagado: {formatearFecha(s.fechaPago)}</p> : null}
                    <p className="muted">Importe: {dinero(s.importe)}</p>
                    <p className="muted">Pago: Pagado</p>
                    {s.planId ? (
                      <button className="btn btn-outline" type="button" onClick={() => abrirDetallePlan(s.planId!)}>Ver detalle</button>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2>Servicios por pagar</h2>
          {porPagar.length === 0 ? (
            <div className="empty">No tienes servicios por pagar.</div>
          ) : (
            <div className="grid-3">
              {porPagar.map((s) => (
                <article className="card" key={s.id}>
                  <div className="card-body">
                    <h3>{s.nombre}</h3>
                    <p className="muted">{s.tipo}</p>
                    <p className="muted">Importe pendiente: {dinero(s.importe)}</p>
                    <p className="muted">Pago: Pendiente</p>
                    <Link className="btn btn-primary" to="/pago">Pagar</Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {planDetalle ? (
        <section className="section">
          <div className="container">
            <div className="info-box">
              <h2>Detalle del plan: {planDetalle.tipoPlan}</h2>
              <p className="muted">Paciente: {planDetalle.pacienteNombre}</p>
              <p className="muted">Nutricionista: Carolina Fuentes</p>
              <p className="muted">Inicio: {formatearFecha(planDetalle.fechaInicio)}</p>
              <p className="muted">Duración: {planDetalle.duracionMeses} mes(es)</p>
              <p className="muted">Estado: {estadoPlan(planDetalle.fechaInicio, planDetalle.duracionMeses)}</p>
              <p className="muted">Progreso: {progresoPlan(planDetalle)}%</p>
              {planDetalle.objetivos ? <p className="muted">Objetivos: {planDetalle.objetivos}</p> : null}
              {planDetalle.observaciones ? <p className="muted">Observaciones: {planDetalle.observaciones}</p> : null}
              {planDetalle.proximaRevision ? <p className="muted">Próxima revisión: {formatearFecha(planDetalle.proximaRevision)}</p> : null}
              <h3>Revisiones y feedback</h3>
              {planDetalle.revisiones.length === 0 ? (
                <p className="muted">Sin revisiones registradas.</p>
              ) : (
                <ul className="list-clean">
                  {planDetalle.revisiones
                    .slice()
                    .sort((a, b) => (a.fecha < b.fecha ? 1 : -1))
                    .map((r, i) => (
                      <li key={i} className="muted">{formatearFecha(r.fecha)}: {r.nota}</li>
                    ))}
                </ul>
              )}
              <div className="actions">
                <button className="btn btn-outline" type="button" onClick={() => setDetalleId(null)}>Cerrar detalle</button>
              </div>
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}