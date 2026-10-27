import { useState } from "react";
import CampoFormulario from "../moleculas/CampoFormulario";
import { validarCorreo, LIMITE_NOMBRE, LIMITE_CORREO, LIMITE_COMENTARIO } from "../../utils/validacion";
import { Toast } from "../../utils/toast";

export default function FormContacto() {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [comentario, setComentario] = useState("");
  const [errores, setErrores] = useState<{ nombre?: string; correo?: string; comentario?: string }>({});
  const [mensaje, setMensaje] = useState("");
  const [toast, setToast] = useState(false);

  const enviar = (e: React.FormEvent) => {
    e.preventDefault();
    const nuevos: typeof errores = {};
    let ok = true;
    if (!nombre.trim()) { nuevos.nombre = "El nombre es obligatorio."; ok = false; }
    else if (nombre.length > LIMITE_NOMBRE) { nuevos.nombre = `Máximo ${LIMITE_NOMBRE} caracteres.`; ok = false; }
    if (!correo.trim()) { nuevos.correo = "El correo es obligatorio."; ok = false; }
    else if (correo.length > LIMITE_CORREO) { nuevos.correo = `Máximo ${LIMITE_CORREO} caracteres.`; ok = false; }
    else if (!validarCorreo(correo)) { nuevos.correo = "Ingresa un correo válido."; ok = false; }
    if (!comentario.trim()) { nuevos.comentario = "El comentario es obligatorio."; ok = false; }
    else if (comentario.length > LIMITE_COMENTARIO) { nuevos.comentario = `Máximo ${LIMITE_COMENTARIO} caracteres.`; ok = false; }
    setErrores(nuevos);
    if (!ok) return;
    setNombre("");
    setCorreo("");
    setComentario("");
    setMensaje("Consulta enviada correctamente.");
    setToast(true);
  };

  return (
    <>
      <form onSubmit={enviar} noValidate>
        <div className="form-grid">
          <div className="form-group full">
            <CampoFormulario etiqueta="Nombre" nombre="nombre" tipo="text" valor={nombre} alCambiar={(v) => { setNombre(v); setErrores((prev) => ({ ...prev, nombre: undefined })); }} error={errores.nombre} maxLength={LIMITE_NOMBRE} autoComplete="name" />
          </div>
          <div className="form-group full">
            <CampoFormulario etiqueta="Correo electrónico" nombre="correo" tipo="email" valor={correo} alCambiar={(v) => { setCorreo(v); setErrores((prev) => ({ ...prev, correo: undefined })); }} error={errores.correo} maxLength={LIMITE_CORREO} autoComplete="email" />
          </div>
          <div className="form-group full">
            <label htmlFor="comentario">Comentario</label>
            <textarea id="comentario" name="comentario" maxLength={LIMITE_COMENTARIO} value={comentario} onChange={(e) => { setComentario(e.target.value); setErrores((prev) => ({ ...prev, comentario: undefined })); }} />
            <span className="error">{errores.comentario ?? ""}</span>
          </div>
          <div className="full">
            <button className="btn btn-primary" type="submit">Enviar consulta</button>
            <p className="success">{mensaje}</p>
          </div>
        </div>
      </form>
      <Toast mensaje="Mensaje enviado." visible={toast} onCerrar={() => setToast(false)} />
    </>
  );
}
