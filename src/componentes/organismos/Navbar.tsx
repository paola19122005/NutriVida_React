import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { obtenerSesion, cerrarSesion } from "../../data/usuarios";

export default function Navbar() {
  const [abierto, setAbierto] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const usuario = obtenerSesion();
  const esAdmin = location.pathname.startsWith("/admin") && usuario?.rol === "Administrador";
  const esNutricionista = usuario?.rol === "Nutricionista";
  const esPaciente = usuario?.rol === "Paciente";

  const handleCerrar = () => {
    cerrarSesion();
    navigate("/login");
  };

  return (
    <header className={`site-header ${esAdmin ? "admin-header" : ""}`}>
      <div className="container navbar">
        <Link className="logo" to={esAdmin ? "/admin" : "/"}>
          <img src="/img/logo.png" alt="Logo NutriVida" />
          <span>
            Clínica NutriVida
            <small>Salud integral</small>
          </span>
        </Link>

        <button className="menu-toggle" aria-label="Abrir menú" onClick={() => setAbierto((v) => !v)}>
          ☰
        </button>

        <nav aria-label="Navegación principal">
          <ul className={`nav-links ${abierto ? "open" : ""} ${esAdmin ? "admin-nav" : ""}`} id="navLinks">
            {esAdmin ? (
              <>
                <li><Link to="/admin">Panel</Link></li>
                <li><Link to="/admin/servicios">Servicios</Link></li>
                <li><Link to="/admin/usuarios">Usuarios</Link></li>
                <li><button className="btn btn-danger" onClick={handleCerrar}>Cerrar sesión</button></li>
              </>
            ) : esNutricionista ? (
              <>
                <li><Link className={location.pathname === "/" ? "active" : ""} to="/">Inicio</Link></li>
                <li><Link className={location.pathname === "/editar-plan" ? "active" : ""} to="/editar-plan">Editar plan</Link></li>
                <li><Link className={location.pathname === "/editar-citas" ? "active" : ""} to="/editar-citas">Editar citas</Link></li>
                <li>
                  {location.pathname === "/admin" ? (
                    <button className="btn btn-danger" onClick={handleCerrar}>Cerrar sesión</button>
                  ) : (
                    <Link className="btn btn-outline" to="/admin">Perfil</Link>
                  )}
                </li>
              </>
            ) : esPaciente ? (
              <>
                <li><Link className={location.pathname === "/" ? "active" : ""} to="/">Inicio</Link></li>
                <li><Link className={location.pathname === "/perfil-paciente" ? "active" : ""} to="/perfil-paciente">Mi perfil</Link></li>
                <li><button className="btn btn-danger" onClick={handleCerrar}>Cerrar sesión</button></li>
              </>
            ) : (
              <>
                <li><Link to="/">Inicio</Link></li>
                <li><Link to="/catalogo">Servicios</Link></li>
                <li><Link to="/nosotros">Nosotros</Link></li>
                <li><Link to="/blog">Blog</Link></li>
                <li><Link to="/contacto">Contacto</Link></li>
                <li><Link to="/lista">Mi lista</Link></li>
                <li>
                  {usuario ? (
                    <Link className="btn btn-outline" to={usuario.rol === "Administrador" || usuario.rol === "Nutricionista" ? "/admin" : "/"}>
                      Hola, {usuario.nombre}
                    </Link>
                  ) : (
                    <Link className="btn btn-primary" to="/login">Iniciar sesión</Link>
                  )}
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}
