import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { obtenerSesion } from "../data/usuarios";
import {
  listarMensajesContacto,
  responderMensajeContacto,
  cambiarEstadoMensajeContacto,
  eliminarMensajeContacto,
  type BackendMensajeContacto,
} from "../services/contacto";

export default function AdminMensajesContacto() {
  const navigate = useNavigate();
  const [mensajes, setMensajes] = useState<BackendMensajeContacto[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [seleccionadoId, setSeleccionadoId] = useState<number | null>(null);
  const [respuesta, setRespuesta] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [resultadoEnvio, setResultadoEnvio] = useState("");

  useEffect(() => {
    const u = obtenerSesion();
    if (!u || u.rol !== "Administrador") {
      if (u) window.alert("Esta sección requiere rol Administrador.");
      navigate(u ? "/" : "/login");
      return;
    }
    cargarMensajes();
  }, [navigate]);

  const cargarMensajes = async () => {
    setCargando(true);
    setError("");
    try {
      const data = await listarMensajesContacto();
      setMensajes(data);
    } catch (e: unknown) {
      setError(String((e as { message?: string })?.message || "No se pudo cargar los mensajes."));
    } finally {
      setCargando(false);
    }
  };

  const seleccionado = mensajes.find((m) => m.id === seleccionadoId) ?? null;
  const yaRespondido = Boolean(seleccionado?.respuesta);
  const puedeResponder = !!seleccionado && seleccionado.estado === "PENDIENTE" && !yaRespondido;

  const enviar = async () => {
    if (!seleccionado) return;
    if (!respuesta.trim()) {
      setError("La respuesta no puede estar vacía.");
      return;
    }
    setError("");
    setEnviando(true);
    try {
      const actualizado = await responderMensajeContacto(seleccionado.id, respuesta.trim());
      setMensajes((prev) => prev.map((m) => (m.id === actualizado.id ? actualizado : m)));
      setResultadoEnvio("Respuesta registrada correctamente.");
    } catch (e: unknown) {
      const msg = String((e as { message?: string })?.message || "");
      setError(msg || "No se pudo enviar la respuesta.");
    } finally {
      setRespuesta("");
      setEnviando(false);
    }
  };

  const marcar = async (id: number) => {
    try {
      const actualizado = await cambiarEstadoMensajeContacto(id, "REVISADO");
      setMensajes((prev) => prev.map((m) => (m.id === actualizado.id ? actualizado : m)));
    } catch (e: unknown) {
      setError(String((e as { message?: string })?.message || "No se pudo actualizar el mensaje."));
    }
  };

  const eliminar = async (id: number) => {
    if (!window.confirm("¿Eliminar este mensaje?")) return;
    try {
      await eliminarMensajeContacto(id);
      setMensajes((prev) => prev.filter((m) => m.id !== id));
      if (seleccionadoId === id) setSeleccionadoId(null);
    } catch (e: unknown) {
      setError(String((e as { message?: string })?.message || "No se pudo eliminar el mensaje."));
    }
  };

  return (
    <main>
      <section className="page-title">
        <div className="container">
          <h1>Mensajes de contacto</h1>
          <p>Consulta y responde los mensajes recibidos desde el formulario de contacto.</p>
        </div>
      </section>

      <section className="section">
        <div className="container chat-layout">
          <div className="chat-list">
            <h2>Bandeja de entrada</h2>
            {cargando ? (
              <div className="empty">Cargando mensajes...</div>
            ) : error ? (
              <div className="empty">{error}</div>
            ) : mensajes.length === 0 ? (
              <div className="empty">No hay mensajes de contacto.</div>
            ) : (
              <div className="chat-items">
                {mensajes
                  .slice()
                  .sort((a, b) => (a.fechaRegistro < b.fechaRegistro ? 1 : -1))
                  .map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      aria-label={m.nombre}
                      className={`chat-item ${seleccionadoId === m.id ? "chat-item-active" : ""}`}
                      onClick={() => setSeleccionadoId(m.id)}
                    >
                      <strong>{m.nombre}</strong>
                      <span className="muted">{m.correo}</span>
                      <span className="muted">{m.asunto}</span>
                      <span className={`status ${m.estado === "REVISADO" || m.estado === "RESPONDIDO" ? "status-ok" : "status-off"}`}>{m.estado}</span>
                    </button>
                  ))}
              </div>
            )}
          </div>

          <div className="chat-conversation">
            {!seleccionado ? (
              <div className="empty">Selecciona un mensaje para ver la conversación.</div>
            ) : (
              <>
                <div className="chat-header">
                  <h2>{seleccionado.nombre}</h2>
                  <p className="muted">Correo: {seleccionado.correo}</p>
                  <p className="muted">Asunto: {seleccionado.asunto}</p>
                  <p className="muted">Recibido: {new Date(seleccionado.fechaRegistro).toLocaleString("es-CL")}</p>
                  <p className="muted">
                    Estado: <span className={`status ${seleccionado.estado === "REVISADO" || seleccionado.estado === "RESPONDIDO" ? "status-ok" : "status-off"}`}>{seleccionado.estado}</span>
                  </p>
                  <div className="actions">
                    {seleccionado.estado === "PENDIENTE" ? (
                      <button className="btn btn-primary" type="button" onClick={() => marcar(seleccionado.id)}>Marcar como revisado</button>
                    ) : null}
                    <button className="btn btn-danger" type="button" onClick={() => eliminar(seleccionado.id)}>Eliminar</button>
                  </div>
                </div>

                <div className="chat-messages">
                  <div className="chat-bubble chat-bubble-user">
                    <strong>{seleccionado.nombre}</strong>
                    <p>{seleccionado.mensaje}</p>
                    <small>{new Date(seleccionado.fechaRegistro).toLocaleString("es-CL")}</small>
                  </div>
                  {seleccionado.respuesta ? (
                    <div className="chat-bubble chat-bubble-admin">
                      <strong>Administrador</strong>
                      <p>{seleccionado.respuesta}</p>
                      <small>{seleccionado.fechaRespuesta ? new Date(seleccionado.fechaRespuesta).toLocaleString("es-CL") : ""} · Enviado</small>
                    </div>
                  ) : null}
                </div>

                <div className="chat-composer">
                  <textarea
                    value={respuesta}
                    onChange={(e) => setRespuesta(e.target.value)}
                    placeholder="Escribe una respuesta..."
                    rows={3}
                    disabled={!puedeResponder || enviando}
                  />
                  {error ? <span className="error">{error}</span> : null}
                  {resultadoEnvio ? <p className="hint">{resultadoEnvio}</p> : null}
                  <div className="actions">
                    <button className="btn btn-primary" type="button" onClick={enviar} disabled={!puedeResponder || enviando}>
                      {enviando ? "Enviando..." : "Enviar respuesta"}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}