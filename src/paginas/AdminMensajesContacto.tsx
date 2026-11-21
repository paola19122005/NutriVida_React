import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { obtenerSesion } from "../data/usuarios";
import {
  cargarMensajesContacto,
  marcarMensajeContacto,
  agregarRespuestaContacto,
  type MensajeContacto,
  type RespuestaContacto,
} from "../data/contactos";
import { enviarRespuestaContacto } from "../services/contacto";

export default function AdminMensajesContacto() {
  const navigate = useNavigate();
  const [mensajes, setMensajes] = useState<MensajeContacto[]>(() => cargarMensajesContacto());
  const [seleccionadoId, setSeleccionadoId] = useState<number | null>(null);
  const [respuesta, setRespuesta] = useState("");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [resultadoEnvio, setResultadoEnvio] = useState("");

  useEffect(() => {
    const u = obtenerSesion();
    if (!u || u.rol !== "Administrador") {
      if (u) window.alert("Esta sección requiere rol Administrador.");
      navigate(u ? "/" : "/login");
    }
  }, [navigate]);

  const recargar = () => setMensajes(cargarMensajesContacto());

  const seleccionado = mensajes.find((m) => m.id === seleccionadoId) ?? null;
  const yaRespondido = (seleccionado?.respuestas.length ?? 0) > 0;
  const puedeResponder = !!seleccionado && seleccionado.estado === "Pendiente" && !yaRespondido;

  const enviar = async () => {
    if (!seleccionado) return;
    if (!respuesta.trim()) {
      setError("La respuesta no puede estar vacía.");
      return;
    }
    setError("");
    setEnviando(true);
    const nueva = agregarRespuestaContacto(seleccionado.id, respuesta.trim());
    if (nueva) {
      marcarMensajeContacto(seleccionado.id, "Revisado");
      const resultado = await enviarRespuestaContacto({
        mensajeId: seleccionado.id,
        destinatario: seleccionado.correo,
        asunto: seleccionado.asunto,
        contenido: respuesta.trim(),
        fecha: nueva.fecha,
      });
      setResultadoEnvio(resultado.detalle);
    } else {
      setError("Este mensaje ya fue respondido.");
    }
    setRespuesta("");
    recargar();
    setEnviando(false);
  };

  const marcar = (id: number) => {
    marcarMensajeContacto(id, "Revisado");
    recargar();
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
            {mensajes.length === 0 ? (
              <div className="empty">No hay mensajes de contacto.</div>
            ) : (
              <div className="chat-items">
                {mensajes
                  .slice()
                  .sort((a, b) => (a.fecha < b.fecha ? 1 : -1))
                  .map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      aria-label={m.remitente}
                      className={`chat-item ${seleccionadoId === m.id ? "chat-item-active" : ""}`}
                      onClick={() => setSeleccionadoId(m.id)}
                    >
                      <strong>{m.remitente}</strong>
                      <span className="muted">{m.correo}</span>
                      <span className="muted">{m.asunto}</span>
                      <span className={`status ${m.estado === "Revisado" ? "status-ok" : "status-off"}`}>{m.estado}</span>
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
                  <h2>{seleccionado.remitente}</h2>
                  <p className="muted">Correo: {seleccionado.correo}</p>
                  <p className="muted">Asunto: {seleccionado.asunto}</p>
                  <p className="muted">Recibido: {new Date(seleccionado.fecha).toLocaleString("es-CL")}</p>
                  <p className="muted">
                    Estado: <span className={`status ${seleccionado.estado === "Revisado" ? "status-ok" : "status-off"}`}>{seleccionado.estado}</span>
                  </p>
                  <div className="actions">
                    {seleccionado.estado === "Pendiente" ? (
                      <button className="btn btn-primary" type="button" onClick={() => marcar(seleccionado.id)}>Marcar como revisado</button>
                    ) : null}
                  </div>
                </div>

                <div className="chat-messages">
                  <div className="chat-bubble chat-bubble-user">
                    <strong>{seleccionado.remitente}</strong>
                    <p>{seleccionado.contenido}</p>
                    <small>{new Date(seleccionado.fecha).toLocaleString("es-CL")}</small>
                  </div>
                  {seleccionado.respuestas.map((r: RespuestaContacto) => (
                    <div key={r.id} className="chat-bubble chat-bubble-admin">
                      <strong>{r.autor}</strong>
                      <p>{r.contenido}</p>
                      <small>
                        {new Date(r.fecha).toLocaleString("es-CL")} · {r.estadoEnvio === "Simulado" ? "Envío simulado" : r.estadoEnvio}
                      </small>
                    </div>
                  ))}
                </div>

                <div className="chat-composer">
                  <textarea
                    value={respuesta}
                    onChange={(e) => setRespuesta(e.target.value)}
                    placeholder="Escribe una respuesta..."
                    rows={3}
                    disabled={!puedeResponder}
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