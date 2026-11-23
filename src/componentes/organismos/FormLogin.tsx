
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import CampoFormulario from "../moleculas/CampoFormulario";
import { validarCorreo, LIMITE_CORREO } from "../../utils/validacion";
import { useAuth } from "../../contexto/AuthContext";
import { HttpError } from "../../services/http";

export default function FormLogin() {
  const [correo, setCorreo] = useState("");
  const [clave, setClave] = useState("");
  const [cargando, setCargando] = useState(false);

  const [errores, setErrores] = useState<{
    correo?: string;
    clave?: string;
    general?: string;
  }>({});

  const navigate = useNavigate();
  const { login } = useAuth();

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();

    const nuevos: typeof errores = {};
    let ok = true;

    const correoNormalizado = correo.trim().toLowerCase();

    if (!correoNormalizado) {
      nuevos.correo = "El correo es obligatorio.";
      ok = false;
    } else if (correoNormalizado.length > LIMITE_CORREO) {
      nuevos.correo = `Máximo ${LIMITE_CORREO} caracteres.`;
      ok = false;
    } else if (!validarCorreo(correoNormalizado)) {
      nuevos.correo = "Ingresa un correo válido.";
      ok = false;
    }

    if (!clave) {
      nuevos.clave = "La contraseña es obligatoria.";
      ok = false;
    } else if (clave.length < 4 || clave.length > 10) {
      nuevos.clave =
        "La contraseña debe tener entre 4 y 10 caracteres.";
      ok = false;
    }

    setErrores(nuevos);

    if (!ok) return;

    try {
      setCargando(true);

      const usuario = await login(correoNormalizado, clave);

      if (
        usuario.rol === "Administrador" ||
        usuario.rol === "Nutricionista"
      ) {
        navigate("/admin");
      } else if (usuario.rol === "Paciente") {
        navigate("/perfil-paciente");
      } else {
        navigate("/");
      }
    } catch (e: unknown) {
      if (e instanceof HttpError && e.status === 401) {
        setErrores({
          general: "Correo o contraseña incorrectos.",
        });
      } else {
        setErrores({
          general:
            "No se pudo conectar con el servidor. Intenta nuevamente.",
        });
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <form onSubmit={enviar} noValidate>
      <div
        className="logo"
        style={{ justifyContent: "center", marginBottom: "18px" }}
      >
        <img
          src="/img/logo.png"
          alt="NutriVida"
          style={{
            width: "52px",
            height: "52px",
            objectFit: "contain",
          }}
        />

        <span>
          Clínica NutriVida
          <small>Salud integral</small>
        </span>
      </div>

      <h1 style={{ textAlign: "center", marginBottom: "18px" }}>
        Iniciar sesión
      </h1>

      <CampoFormulario
        etiqueta="Correo"
        nombre="correo"
        tipo="email"
        valor={correo}
        alCambiar={setCorreo}
        error={errores.correo}
        maxLength={LIMITE_CORREO}
        autoComplete="email"
      />

      <div className="form-group" style={{ marginTop: "12px" }}>
        <label htmlFor="clave">Contraseña</label>

        <input
          id="clave"
          name="clave"
          type="password"
          minLength={4}
          maxLength={10}
          autoComplete="current-password"
          value={clave}
          onChange={(e) => setClave(e.target.value)}
        />

        <span className="error">{errores.clave ?? ""}</span>
      </div>

      <p className="error" style={{ marginTop: "10px" }}>
        {errores.general ?? ""}
      </p>

      <button
        className="btn btn-primary"
        style={{ width: "100%", marginTop: "10px" }}
        type="submit"
        disabled={cargando}
      >
        {cargando ? "Ingresando..." : "Ingresar"}
      </button>

      <p style={{ textAlign: "center", marginTop: "12px" }}>
        <Link to="/registro">¿No tienes cuenta? Regístrate</Link>
      </p>
    </form>
  );
}
