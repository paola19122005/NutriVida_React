import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CampoFormulario from "../moleculas/CampoFormulario";
import { validarCorreo, LIMITE_CORREO } from "../../utils/validacion";
import { cargarUsuarios, guardarSesion } from "../../data/usuarios";

export default function FormLogin() {
  const [correo, setCorreo] = useState("");
  const [clave, setClave] = useState("");
  const [errores, setErrores] = useState<{ correo?: string; clave?: string; general?: string }>({});
  const navigate = useNavigate();

  const enviar = (e: React.FormEvent) => {
    e.preventDefault();
    const nuevos: typeof errores = {};
    let ok = true;
    if (!correo.trim()) { nuevos.correo = "El correo es obligatorio."; ok = false; }
    else if (correo.length > LIMITE_CORREO) { nuevos.correo = `Máximo ${LIMITE_CORREO} caracteres.`; ok = false; }
    else if (!validarCorreo(correo)) { nuevos.correo = "Ingresa un correo válido."; ok = false; }
    if (!clave) { nuevos.clave = "La contraseña es obligatoria."; ok = false; }
    else if (clave.length < 4 || clave.length > 10) { nuevos.clave = "La contraseña debe tener entre 4 y 10 caracteres."; ok = false; }
    setErrores(nuevos);
    if (!ok) return;

    const usuarios = cargarUsuarios();
    const u = usuarios.find((x) => x.correo.toLowerCase() === correo.toLowerCase() && x.clave === clave && x.activo !== false);
    if (!u) {
      setErrores({ general: "Correo o contraseña incorrectos." });
      return;
    }
    guardarSesion(u);
    if (u.rol === "Administrador" || u.rol === "Nutricionista") navigate("/admin");
    else if (u.rol === "Paciente") navigate("/perfil-paciente");
    else navigate("/");
  };

  return (
    <form onSubmit={enviar} noValidate>
      <div className="logo" style={{ justifyContent: "center", marginBottom: "18px" }}>
        <img src="/img/logo.png" alt="NutriVida" style={{ width: "52px", height: "52px", objectFit: "contain" }} />
        <span>
          Clínica NutriVida
          <small>Salud integral</small>
        </span>
      </div>
      <h1 style={{ textAlign: "center", marginBottom: "18px" }}>Iniciar sesión</h1>
      <CampoFormulario etiqueta="Correo" nombre="correo" tipo="email" valor={correo} alCambiar={setCorreo} error={errores.correo} maxLength={LIMITE_CORREO} autoComplete="email" />
      <div className="form-group" style={{ marginTop: "12px" }}>
        <label htmlFor="clave">Contraseña</label>
        <input id="clave" name="clave" type="password" minLength={4} maxLength={10} autoComplete="current-password" value={clave} onChange={(e) => setClave(e.target.value)} />
        <span className="error">{errores.clave ?? ""}</span>
      </div>
      <p className="error" style={{ marginTop: "10px" }}>{errores.general ?? ""}</p>
      <button className="btn btn-primary" style={{ width: "100%", marginTop: "10px" }} type="submit">Ingresar</button>
      <p className="hint" style={{ marginTop: "14px" }}>Demo: admin@nutrivida.cl / Admin1234 · nutricionista@nutrivida.cl / Nutri1234 · maria@nutrivida.cl / 1234</p>
      <p style={{ textAlign: "center", marginTop: "12px" }}>
        <Link to="/registro">¿No tienes cuenta? Regístrate</Link>
      </p>
    </form>
  );
}
