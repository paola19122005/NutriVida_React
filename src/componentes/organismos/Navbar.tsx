
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../../contexto/AuthContext";

export default function Navbar() {
  const [abierto, setAbierto] = useState(false);
  const [errorLogout, setErrorLogout] = useState("");

  const location = useLocation();
  const navigate = useNavigate();

  const { usuario, cargando, logout } = useAuth();

  const esAdmin =
    location.pathname.startsWith("/admin") &&
    usuario?.rol === "Administrador";

  const esNutricionista = usuario?.rol === "Nutricionista";
  const esPaciente = usuario?.rol === "Paciente";

  const handleCerrar = async () => {
    setErrorLogout("");

    try {
      await logout();
      setAbierto(false);
      navigate("/login");
    } catch {
      setErrorLogout(
        "No se pudo cerrar la sesión en el servidor. Intenta nuevamente."
      );
    }
  };

  const cerrarMenu = () => {
    setAbierto(false);
  };

  return (
    <header className={`site-header ${esAdmin ? "admin-header" : ""}`}>
      <div className="container navbar">
        <Link
          className="logo"
          to={esAdmin ? "/admin" : "/"}
          onClick={cerrarMenu}
        >
          <img src="/img/logo.png" alt="Logo NutriVida" />
          <span>
            Clínica NutriVida
            <small>Salud integral</small>
          </span>
        </Link>

        <button
          className="menu-toggle"
          aria-label="Abrir menú"
          aria-expanded={abierto}
          onClick={() => setAbierto((v) => !v)}
        >
          ☰
        </button>

        <nav aria-label="Navegación principal">
          <ul
            className={`nav-links ${abierto ? "open" : ""} ${
              esAdmin ? "admin-nav" : ""
            }`}
            id="navLinks"
          >
            {esAdmin ? (
              <>
                <li>
                  <Link to="/admin" onClick={cerrarMenu}>
                    Panel
                  </Link>
                </li>

                <li>
                  <Link to="/admin/servicios" onClick={cerrarMenu}>
                    Servicios
                  </Link>
                </li>

                <li>
                  <Link to="/admin/usuarios" onClick={cerrarMenu}>
                    Usuarios
                  </Link>
                </li>

                <li>
                  <button className="btn btn-danger" onClick={handleCerrar}>
                    Cerrar sesión
                  </button>
                </li>
              </>
            ) : esNutricionista ? (
              <>
                <li>
                  <Link
                    className={location.pathname === "/" ? "active" : ""}
                    to="/"
                    onClick={cerrarMenu}
                  >
                    Inicio
                  </Link>
                </li>

                <li>
                  <Link
                    className={
                      location.pathname === "/editar-plan" ? "active" : ""
                    }
                    to="/editar-plan"
                    onClick={cerrarMenu}
                  >
                    Editar plan
                  </Link>
                </li>

                <li>
                  <Link
                    className={
                      location.pathname === "/editar-citas" ? "active" : ""
                    }
                    to="/editar-citas"
                    onClick={cerrarMenu}
                  >
                    Editar citas
                  </Link>
                </li>

                <li>
                  {location.pathname === "/admin" ? (
                    <button
                      className="btn btn-danger"
                      onClick={handleCerrar}
                    >
                      Cerrar sesión
                    </button>
                  ) : (
                    <Link
                      className="btn btn-outline"
                      to="/admin"
                      onClick={cerrarMenu}
                    >
                      Perfil
                    </Link>
                  )}
                </li>
              </>
            ) : esPaciente ? (
              <>
                <li>
                  <Link
                    className={location.pathname === "/" ? "active" : ""}
                    to="/"
                    onClick={cerrarMenu}
                  >
                    Inicio
                  </Link>
                </li>

                <li>
                  <Link
                    className={
                      location.pathname === "/perfil-paciente" ? "active" : ""
                    }
                    to="/perfil-paciente"
                    onClick={cerrarMenu}
                  >
                    Mi perfil
                  </Link>
                </li>

                <li>
                  <button className="btn btn-danger" onClick={handleCerrar}>
                    Cerrar sesión
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/" onClick={cerrarMenu}>
                    Inicio
                  </Link>
                </li>

                <li>
                  <Link to="/catalogo" onClick={cerrarMenu}>
                    Servicios
                  </Link>
                </li>

                <li>
                  <Link to="/nosotros" onClick={cerrarMenu}>
                    Nosotros
                  </Link>
                </li>

                <li>
                  <Link to="/blog" onClick={cerrarMenu}>
                    Blog
                  </Link>
                </li>

                <li>
                  <Link to="/contacto" onClick={cerrarMenu}>
                    Contacto
                  </Link>
                </li>

                <li>
                  <Link to="/lista" onClick={cerrarMenu}>
                    Mi lista
                  </Link>
                </li>

                <li>
                  {!cargando && usuario ? (
                    <Link
                      className="btn btn-outline"
                      to={
                        usuario.rol === "Administrador" ||
                        usuario.rol === "Nutricionista"
                          ? "/admin"
                          : usuario.rol === "Paciente"
                            ? "/perfil-paciente"
                            : "/"
                      }
                      onClick={cerrarMenu}
                    >
                      Hola, {usuario.nombre}
                    </Link>
                  ) : (
                    <Link
                      className="btn btn-primary"
                      to="/login"
                      onClick={cerrarMenu}
                    >
                      Iniciar sesión
                    </Link>
                  )}
                </li>
              </>
            )}
          </ul>
        </nav>

        {errorLogout && (
          <p className="error" role="alert">
            {errorLogout}
          </p>
        )}
      </div>
    </header>
  );
}
