import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { obtenerSesion } from "../data/usuarios";
import { asegurarDemoPaciente } from "../data/demoPaciente";
import { cargarServiciosPaciente, type ServicioPaciente } from "../data/serviciosPaciente";


import { historialPagosPorUsuario } from "../services/pagosService";
import type { BackendPago } from "../services/pagosService";
import { formatearFecha, estadoPlan, parseFechaISO, addMonths, fechaPasada, fechaISO } from "../utils/fechas";
import { dinero } from "../utils/formato";
import { planesPorPaciente } from "../services/atencionService";
import { listarSeguimientos } from "../services/atencionService";
import type { BackendPlanNutricional, BackendSeguimiento } from "../services/atencionService";

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

type Categoria = "agendados" | "enProceso" | "completados" | "cancelados" | "pendientes" | "pagos";

export default function PanelPaciente() {
  const navigate = useNavigate();
  const sesion = obtenerSesion();
  const [detalleId, setDetalleId] = useState<number | null>(null);
  const [planesAtencion, setPlanesAtencion] = useState<BackendPlanNutricional[]>([]);
  const [seguimientosPorPlan, setSeguimientosPorPlan] = useState<Record<number, BackendSeguimiento[]>>({});
  const [cargandoPlanesAtencion, setCargandoPlanesAtencion] = useState(false);
  const [errorPlanesAtencion, setErrorPlanesAtencion] = useState("");

  useEffect(() => {
    const u = obtenerSesion();
    if (u?.rol === "Paciente") {
      setCargandoPlanesAtencion(true);
      setErrorPlanesAtencion("");
      planesPorPaciente(u.id)
        .then(async (planes) => {
          setPlanesAtencion(planes);
          const entries = await Promise.all(planes.map(async (p) => [p.id, await listarSeguimientos(p.id)] as const));
          setSeguimientosPorPlan(Object.fromEntries(entries));
        })
        .catch(() => setErrorPlanesAtencion("No se pudo conectar con Atención Nutricional."))
        .finally(() => setCargandoPlanesAtencion(false));
    }
  }, []);
  useEffect(() => {
    const u = obtenerSesion();
    if (u?.rol !== "Paciente") return;
    setCargandoPagos(true);
    setErrorPagos("");
    historialPagosPorUsuario(u.id)
      .then((data) => setPagos(data))
      .catch(() => setErrorPagos("No se pudo conectar con Pagos."))
      .finally(() => setCargandoPagos(false));
  }, []);

  const [categoriaActiva, setCategoriaActiva] = useState<Categoria>("agendados");
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
  const [pagos, setPagos] = useState<BackendPago[]>([]);
  const [cargandoPagos, setCargandoPagos] = useState(false);
  const [errorPagos, setErrorPagos] = useState("");

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

  const agendados = servicios.filter((s) => s.estadoActividad === "Agendado" && !esEnProceso(s) && !esCompletado(s));
  const enProcesoLista = servicios.filter((s) => esEnProceso(s));
  const completadosLista = servicios.filter((s) => esCompletado(s));
  const cancelados = servicios.filter((s) => s.estadoActividad === "Cancelado");
  const pagadosServicios = servicios.filter((s) => s.estadoPago === "Pagado");
  const porPagarServicios = servicios.filter((s) => s.estadoPago === "Pendiente");

  function esEnProceso(s: ServicioPaciente): boolean {
    if (s.estadoActividad !== "Agendado") return false;
    if (s.planId) {
      const plan = planes.find((p) => p.id === s.planId);
      if (plan) return estadoPlan(plan.fechaInicio, plan.duracionMeses) === "En proceso";
    }
    return !fechaPasada(s.fecha);
  }

  function esCompletado(s: ServicioPaciente): boolean {
    if (s.estadoActividad === "Realizado") return true;
    if (s.planId) {
      const plan = planes.find((p) => p.id === s.planId);
      if (plan) return estadoPlan(plan.fechaInicio, plan.duracionMeses) === "Terminado";
    }
    return s.estadoActividad === "Agendado" && fechaPasada(s.fecha);
  }

  const totalPendiente = porPagarServicios.reduce((acc, s) => acc + s.importe, 0);
  const totalPagado = pagos.filter((p) => p.estado === "PAGADO").reduce((acc, p) => acc + p.monto, 0);

  const planDetalle = detalleId ? planes.find((p) => p.id === detalleId) : null;
  const abrirDetallePlan = (planId: number) => setDetalleId(planId);

  const seguimientoDe = (s: ServicioPaciente) => {
    if (s.planId) {
      const plan = planes.find((p) => p.id === s.planId);
      if (plan) {
        return (
          <>
            <p className="muted">Plan: {plan.tipoPlan} ({estadoPlan(plan.fechaInicio, plan.duracionMeses)})</p>
            <p className="muted">Progreso: {progresoPlan(plan)}%</p>
            {plan.proximaRevision ? <p className="muted">Próxima revisión: {formatearFecha(plan.proximaRevision)}</p> : null}
            {plan.revisiones.length > 0 ? (
              <p className="muted">Último seguimiento: {plan.revisiones[plan.revisiones.length - 1].nota.slice(0, 80)}...</p>
            ) : null}
          </>
        );
      }
    }
    if (s.observaciones) return <p className="muted">Seguimiento: {s.observaciones}</p>;
    return null;
  };

  const renderServicioCard = (s: ServicioPaciente, estadoVisual: string) => (
    <article className="card" key={s.id}>
      <div className="card-body">
        <h3>{s.nombre}</h3>
        <p className="muted">{s.tipo}</p>
        <p className="muted">Fecha: {formatearFecha(s.fecha)}{s.hora ? ` · ${s.hora}` : ""}</p>
        <p className="muted">Estado: {estadoVisual}</p>
        <p className="muted">Precio: {dinero(s.importe)}</p>
        <p className="muted">Pago: {s.estadoPago}</p>
        <p className="muted">Nutricionista: {s.nutricionista}</p>
        {seguimientoDe(s)}
        <div className="actions">
          {s.planId ? (
            <button className="btn btn-outline" type="button" onClick={() => abrirDetallePlan(s.planId!)}>Ver detalle</button>
          ) : (
            <button className="btn btn-outline" type="button" onClick={() => alert(`Cita: ${formatearFecha(s.fecha)} ${s.hora ?? ""}`)}>Ver cita</button>
          )}
        </div>
      </div>
    </article>
  );

  const renderDetalle = () => {
    switch (categoriaActiva) {
      case "agendados":
        return agendados.length === 0 ? (
          <div className="empty">No tienes servicios agendados.</div>
        ) : (
          <div className="grid-3">{agendados.map((s) => renderServicioCard(s, "Agendado"))}</div>
        );
      case "enProceso":
        return enProcesoLista.length === 0 ? (
          <div className="empty">No tienes servicios en curso.</div>
        ) : (
          <div className="grid-3">{enProcesoLista.map((s) => renderServicioCard(s, "En curso"))}</div>
        );
      case "completados":
        return completadosLista.length === 0 ? (
          <div className="empty">No tienes servicios completados.</div>
        ) : (
          <div className="grid-3">{completadosLista.map((s) => renderServicioCard(s, "Completado"))}</div>
        );
      case "cancelados":
        return cancelados.length === 0 ? (
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
                  <p className="muted">Precio: {dinero(s.importe)}</p>
                  <p className="muted">Pago: {s.estadoPago}</p>
                  {s.observaciones ? <p className="muted">Motivo: {s.observaciones}</p> : null}
                </div>
              </article>
            ))}
          </div>
        );
      case "pendientes":
        return porPagarServicios.length === 0 ? (
          <div className="empty">No tienes pagos pendientes.</div>
        ) : (
          <div className="grid-3">
            {porPagarServicios.map((s) => (
              <article className="card" key={s.id}>
                <div className="card-body">
                  <h3>{s.nombre}</h3>
                  <p className="muted">{s.tipo}</p>
                  <p className="muted">Monto pendiente: {dinero(s.importe)}</p>
                  <p className="muted">Pago: Pendiente</p>
                  <Link className="btn btn-primary" to="/pago" state={{ servicios: [s] }}>Pagar</Link>
                </div>
              </article>
            ))}
          </div>
        );
      case "pagos":
        return (
          <>
            <h3>Servicios pagados</h3>
            {pagadosServicios.length === 0 ? (
              <div className="empty">No tienes servicios pagados.</div>
            ) : (
              <div className="grid-3">
                {pagadosServicios.map((s) => (
                  <article className="card" key={s.id}>
                    <div className="card-body">
                      <h3>{s.nombre}</h3>
                      <p className="muted">{s.tipo}</p>
                      {s.fechaPago ? <p className="muted">Fecha de pago: {formatearFecha(s.fechaPago)}</p> : null}
                      <p className="muted">Monto: {dinero(s.importe)}</p>
                      <p className="muted">Método de pago: {s.metodoPago || "No informado"}</p>
                      {s.numeroTransaccion ? <p className="muted">Número de transacción: {s.numeroTransaccion}</p> : null}
                      {s.comprobante ? <p className="muted">Comprobante: {s.comprobante}</p> : null}
                      <p className="muted">Pago: Pagado</p>
                    </div>
                  </article>
                ))}
              </div>
            )}

            <h3 style={{ marginTop: "20px" }}>Transacciones registradas</h3>
            {cargandoPagos ? (
              <div className="empty">Cargando pagos...</div>
            ) : errorPagos ? (
              <div className="empty">{errorPagos}</div>
            ) : pagos.length === 0 ? (
              <div className="empty">No hay transacciones registradas.</div>
            ) : (
              <div className="grid-3">
                {pagos.map((p) => (
                  <article className="card" key={p.id}>
                    <div className="card-body">
                      <h3>{p.servicioNombre || "Servicio"}</h3>
                      <p className="muted">Fecha: {formatearFecha(p.fecha)}</p>
                      <p className="muted">Monto: {dinero(p.monto)}</p>
                      <p className="muted">MǸtodo de pago: {p.metodoPago || "No informado"}</p>
                      {p.folio ? <p className="muted">Nǧmero de transacci��n: {p.folio}</p> : null}
                      {p.comprobante ? <p className="muted">Comprobante: {p.comprobante}</p> : null}
                      {p.fechaPago ? <p className="muted">Fecha de pago: {formatearFecha(p.fechaPago)}</p> : null}
                      <p className="muted">Estado: {p.estado === "PAGADO" ? "Pagado" : p.estado === "CANCELADO" ? "Cancelado" : "Pendiente"}</p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        );
      default:
        return null;
    }
  };

  const cards: { key: Categoria; label: string; count: number; total?: string; color: string }[] = [
    { key: "agendados", label: "Servicios agendados", count: agendados.length, color: "#2563eb" },
    { key: "enProceso", label: "Servicios en curso", count: enProcesoLista.length, color: "#d97706" },
    { key: "completados", label: "Servicios completados", count: completadosLista.length, color: "#059669" },
    { key: "cancelados", label: "Servicios cancelados", count: cancelados.length, color: "#dc2626" },
    { key: "pendientes", label: "Pagos pendientes", count: porPagarServicios.length, total: dinero(totalPendiente), color: "#7c3aed" },
    { key: "pagos", label: "Historial de pagos", count: pagos.length, total: dinero(totalPagado), color: "#0891b2" },
  ];

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
          <h2>Planes nutricionales reales</h2>
          {cargandoPlanesAtencion ? (
            <div className="empty">Cargando planes...</div>
          ) : errorPlanesAtencion ? (
            <div className="empty">{errorPlanesAtencion}</div>
          ) : planesAtencion.length === 0 ? (
            <div className="empty">No tienes planes nutricionales registrados.</div>
          ) : (
            <div className="grid-3">
              {planesAtencion.map((p) => (
                <article className="card" key={p.id}>
                  <div className="card-body">
                    <h3>{p.nombre}</h3>
                    <p className="muted">Estado: {p.estado}</p>
                    <p className="muted">Progreso: {p.progreso}%</p>
                    <p className="muted">Inicio: {p.fechaInicio}</p>
                    <p className="muted">Término: {p.fechaTermino}</p>
                    {p.descripcion ? <p className="muted">{p.descripcion}</p> : null}
                    {seguimientosPorPlan[p.id]?.length ? (
                      <div>
                        <strong>Seguimientos:</strong>
                        <ul className="list-clean">
                          {seguimientosPorPlan[p.id].map((s) => (
                            <li key={s.id} className="muted">{s.fechaRegistro}: {s.comentario} ({s.progreso}%)</li>
                          ))}
                        </ul>
                      </div>
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
          <h2>Resumen de servicios</h2>
          <div className="summary-grid">
            {cards.map((card) => (
              <button
                key={card.key}
                type="button"
                className={`summary-card ${categoriaActiva === card.key ? "summary-card-active" : ""}`}
                onClick={() => setCategoriaActiva(card.key)}
                style={{ borderColor: categoriaActiva === card.key ? card.color : undefined }}
              >
                <span className="summary-count" style={{ color: card.color }}>{card.count}</span>
                <strong>{card.label}</strong>
                {card.total ? <span className="summary-total">{card.total}</span> : null}
              </button>
            ))}
          </div>

          <div className="info-box">
            <h3>{cards.find((c) => c.key === categoriaActiva)?.label}</h3>
            {renderDetalle()}
          </div>
        </div>
      </section>

      {planDetalle ? (
        <div className="modal-overlay" onClick={() => setDetalleId(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h2>Detalle del plan: {planDetalle.tipoPlan}</h2>
            <p className="muted">Paciente: {planDetalle.pacienteNombre}</p>
            <p className="muted">Nutricionista: Carolina Fuentes</p>
            <p className="muted">Inicio: {formatearFecha(planDetalle.fechaInicio)}</p>
            <p className="muted">Finalización: {formatearFecha(fechaISO(addMonths(parseFechaISO(planDetalle.fechaInicio), planDetalle.duracionMeses)))}</p>
            <p className="muted">Duración total: {planDetalle.duracionMeses} mes(es)</p>
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
              <button className="btn btn-outline" type="button" onClick={() => setDetalleId(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}