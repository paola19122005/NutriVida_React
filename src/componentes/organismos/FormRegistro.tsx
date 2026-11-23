import { useState } from "react";
import { Link } from "react-router-dom";
import CampoFormulario from "../moleculas/CampoFormulario";
import { validarCorreo, validarRut, normalizarRut, LIMITE_NOMBRE, LIMITE_APELLIDOS, LIMITE_CORREO, LIMITE_DIRECCION } from "../../utils/validacion";
import { regiones } from "../../data/regiones";
// no local user persistence
import { registerUsuario } from "../../services/authService";
import { Toast } from "../../utils/toast";

export default function FormRegistro() {
  const [run, setRun] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [correo, setCorreo] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [rol, setRol] = useState("");
  const [region, setRegion] = useState("");
  const [comuna, setComuna] = useState("");
  const [direccion, setDireccion] = useState("");
  const [clave, setClave] = useState("");
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [mensaje, setMensaje] = useState("");
  const [toast, setToast] = useState(false);

  const comunas = region ? regiones[region] ?? [] : [];

  const handleRegion = (v: string) => {
    setRegion(v);
    setComuna("");
  };

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    const nuevos: Record<string, string> = {};
    let ok = true;
    if (!run.trim()) { nuevos.run = "El RUN es obligatorio."; ok = false; }
    else if (!validarRut(run.trim())) { nuevos.run = "RUN inválido. Usa formato 12.345.678-5."; ok = false; }
    if (!nombre.trim()) { nuevos.nombre = "El nombre es obligatorio."; ok = false; }
    else if (nombre.length > LIMITE_NOMBRE) { nuevos.nombre = `Máximo ${LIMITE_NOMBRE} caracteres.`; ok = false; }
    if (!apellidos.trim()) { nuevos.apellidos = "Los apellidos son obligatorios."; ok = false; }
    else if (apellidos.length > LIMITE_APELLIDOS) { nuevos.apellidos = `Máximo ${LIMITE_APELLIDOS} caracteres.`; ok = false; }
    if (!correo.trim()) { nuevos.correo = "El correo es obligatorio."; ok = false; }
    else if (correo.length > LIMITE_CORREO) { nuevos.correo = `Máximo ${LIMITE_CORREO} caracteres.`; ok = false; }
    else if (!validarCorreo(correo)) { nuevos.correo = "Correo inválido."; ok = false; }
    if (!rol) { nuevos.rol = "Selecciona un tipo de usuario."; ok = false; }
    if (!region) { nuevos.region = "Selecciona una región."; ok = false; }
    if (!comuna) { nuevos.comuna = "Selecciona una comuna."; ok = false; }
    if (!direccion.trim()) { nuevos.direccion = "La dirección es obligatoria."; ok = false; }
    else if (direccion.length > LIMITE_DIRECCION) { nuevos.direccion = `Máximo ${LIMITE_DIRECCION} caracteres.`; ok = false; }
    if (!clave) {nuevos.clave = "La contraseña es obligatoria.";ok = false;} else if (clave.length < 4 || clave.length > 10) {nuevos.clave = "La contraseña debe tener entre 4 y 10 caracteres.";ok = false;}
    setErrores(nuevos);
    if (!ok) return;

    const payload = {
      run: normalizarRut(run.trim()),
      nombre: nombre.trim(),
      apellidos: apellidos.trim(),
      correo: correo.trim(),
      fechaNacimiento,
      rol,
      region,
      comuna,
      direccion: direccion.trim(),
      clave,
      activo: true,
    };

    try {
      await registerUsuario(payload);
      setMensaje("Registro realizado correctamente. Ya puedes iniciar sesión.");
    } catch (e: unknown) {
      const msg = String((e as { message?: string })?.message || "");
      if (msg.toLowerCase().includes("run")) setErrores({ run: msg });
      else if (msg.toLowerCase().includes("correo")) setErrores({ correo: msg });
      else setErrores({ correo: msg || "No se pudo registrar. Intenta nuevamente." });
      return;
    }
    setRun("");
    setNombre("");
    setApellidos("");
    setCorreo("");
    setFechaNacimiento("");
    setRol("");
    setRegion("");
    setComuna("");
    setDireccion("");
    setClave("");
    setToast(true);
  };

  return (
    <>
      <form onSubmit={enviar} noValidate>
        <div className="form-grid">
          <CampoFormulario etiqueta="RUN" nombre="run" valor={run} alCambiar={setRun} error={errores.run} maxLength={12} placeholder="12.345.678-5" />
          <CampoFormulario etiqueta="Nombre" nombre="nombre" valor={nombre} alCambiar={setNombre} error={errores.nombre} maxLength={LIMITE_NOMBRE} autoComplete="given-name" />
          <CampoFormulario etiqueta="Apellidos" nombre="apellidos" valor={apellidos} alCambiar={setApellidos} error={errores.apellidos} maxLength={LIMITE_APELLIDOS} autoComplete="family-name" />
          <CampoFormulario etiqueta="Correo" nombre="correo" tipo="email" valor={correo} alCambiar={setCorreo} error={errores.correo} maxLength={LIMITE_CORREO} autoComplete="email" />
          <div className="form-group">
            <label htmlFor="fechaNacimiento">Fecha de nacimiento <span className="hint">(opcional)</span></label>
            <input id="fechaNacimiento" name="fechaNacimiento" type="date" value={fechaNacimiento} onChange={(e) => setFechaNacimiento(e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="rol">Tipo de usuario</label>
            <select id="rol" name="rol" value={rol} onChange={(e) => setRol(e.target.value)}>
              <option value="">Seleccionar</option>
              <option>Paciente</option>
              <option>Nutricionista</option>
            </select>
            <span className="error">{errores.rol ?? ""}</span>
          </div>
          <div className="form-group">
            <label htmlFor="region">Región</label>
            <select id="region" name="region" value={region} onChange={(e) => handleRegion(e.target.value)}>
              <option value="">Selecciona una región</option>
              {Object.keys(regiones).map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <span className="error">{errores.region ?? ""}</span>
          </div>
          <div className="form-group">
            <label htmlFor="comuna">Comuna</label>
            <select id="comuna" name="comuna" value={comuna} onChange={(e) => setComuna(e.target.value)}>
              <option value="">Selecciona una región primero</option>
              {comunas.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <span className="error">{errores.comuna ?? ""}</span>
          </div>
          <div className="form-group full">
            <CampoFormulario etiqueta="Dirección" nombre="direccion" valor={direccion} alCambiar={setDireccion} error={errores.direccion} maxLength={LIMITE_DIRECCION} autoComplete="street-address" />
          </div>
          <div className="form-group">
            <label htmlFor="clave">Contraseña</label>
            <input id="clave" name="clave" type="password" minLength={4} maxLength={10} value={clave} onChange={(e) => setClave(e.target.value)} />
            <span className="error">{errores.clave ?? ""}</span>
            <span className="hint">Debe tener entre 4 y 10 caracteres.</span>
          </div>
          <div className="full">
            <button className="btn btn-primary" type="submit">Registrarme</button>
            <p className="success">{mensaje}</p>
          </div>
        </div>
      </form>
      <Toast mensaje="Registro realizado." visible={toast} onCerrar={() => setToast(false)} />
      <p style={{ textAlign: "center", marginTop: "12px" }}>
        <Link to="/login">¿Ya tienes cuenta? Inicia sesión</Link>
      </p>
    </>
  );
}
