import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { obtenerSesion } from "../data/usuarios";
import { cargarUsuarios } from "../data/usuarios";
import { cargarProductos } from "../data/productos";
import { obtenerLista } from "../utils/lista";
import PanelNutricionista from "./PanelNutricionista";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [nombre] = useState(() => obtenerSesion()?.nombre ?? "Administrador");
  const [stats] = useState(() => ({
    usuarios: cargarUsuarios().length,
    servicios: cargarProductos().length,
    lista: obtenerLista().length,
  }));

  useEffect(() => {
    const u = obtenerSesion();
    if (!u || (u.rol !== "Administrador" && u.rol !== "Nutricionista")) {
      navigate("/login");
    }
  }, [navigate]);

  if (obtenerSesion()?.rol === "Nutricionista") {
    return <PanelNutricionista />;
  }

  return (
    <main>
      <section className="admin-hero">
        <div className="container">
          <span className="badge">Área administrativa</span>
          <h1>Bienvenida/o, <span id="nombreAdmin">{nombre}</span></h1>
          <p>Gestiona servicios y usuarios del sistema.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="stats">
            <div className="stat">
              <span>Usuarios</span>
              <strong id="statUsuarios">{stats.usuarios}</strong>
            </div>
            <div className="stat">
              <span>Servicios</span>
              <strong id="statServicios">{stats.servicios}</strong>
            </div>
            <div className="stat">
              <span>En mi lista</span>
              <strong id="statLista">{stats.lista}</strong>
            </div>
            <div className="stat">
              <span>Estado</span>
              <strong>OK</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container grid-3">
          <div className="info-box">
            <h2>Servicios</h2>
            <p className="muted">Crear, editar y eliminar servicios del catálogo.</p>
            <Link className="btn btn-primary" to="/admin/servicios">Mantenedor</Link>
          </div>
          <div className="info-box">
            <h2>Usuarios</h2>
            <p className="muted">Gestionar usuarios, roles y estado.</p>
            <Link className="btn btn-primary" to="/admin/usuarios">Mantenedor</Link>
          </div>
          <div className="info-box">
            <h2>Ver sitio público</h2>
            <p className="muted">Revisa cómo verá el contenido un paciente.</p>
            <Link className="btn btn-outline" to="/">Ir al sitio</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
