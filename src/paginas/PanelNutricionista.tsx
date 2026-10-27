import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { obtenerSesion } from "../data/usuarios";
import { cargarUsuarios } from "../data/usuarios";
import { cargarProductos } from "../data/productos";
import { asegurarDemoPaciente } from "../data/demoPaciente";
import { dinero } from "../utils/formato";

export default function PanelNutricionista() {
  const navigate = useNavigate();
  const [nombre] = useState(() => obtenerSesion()?.nombre ?? "Carolina");
  const [pacientes] = useState(() => cargarUsuarios().filter((u) => u.rol === "Paciente"));
  const [planes] = useState(() => cargarProductos().filter((p) => ["PL001", "PL002", "PL004"].includes(p.id)));

  useEffect(() => {
    const u = obtenerSesion();
    if (!u || u.rol !== "Nutricionista") {
      navigate("/login");
      return;
    }
    asegurarDemoPaciente();
  }, [navigate]);

  const irA = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main>
      <section className="admin-hero">
        <div className="container">
          <span className="badge">Panel nutricional</span>
          <h1>¡Hola, {nombre}!</h1>
          <p>Nutricionista. Gestiona sus pacientes, planes nutricionales y citas.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="stats">
            <div className="stat">
              <span>Pacientes</span>
              <strong>{pacientes.length}</strong>
            </div>
            <div className="stat">
              <span>Citas programadas</span>
              <strong>0</strong>
            </div>
            <div className="stat">
              <span>Planes nutricionales</span>
              <strong>{planes.length}</strong>
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
            <h2>Mis pacientes</h2>
            <p className="muted">Consulta los pacientes asignados.</p>
            <button className="btn btn-primary" type="button" onClick={() => irA("pacientes")}>Ver pacientes</button>
          </div>
          <div className="info-box">
            <h2>Planes nutricionales</h2>
            <p className="muted">Revisa los planes disponibles.</p>
            <button className="btn btn-primary" type="button" onClick={() => irA("planes")}>Ver planes</button>
          </div>
          <div className="info-box">
            <h2>Citas programadas</h2>
            <p className="muted">Revisa tus próximas citas.</p>
            <button className="btn btn-primary" type="button" onClick={() => irA("citas")}>Ver citas</button>
          </div>
        </div>
      </section>

      <section className="section" id="pacientes">
        <div className="container">
          <div className="section-title">
            <h2>Mis pacientes</h2>
            <p>Pacientes registrados en el sistema.</p>
          </div>
          {pacientes.length === 0 ? (
            <div className="empty">Todavía no tienes pacientes asignados.</div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Correo</th>
                    <th>Región</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {pacientes.map((p) => (
                    <tr key={p.id}>
                      <td>{p.nombre} {p.apellidos}</td>
                      <td>{p.correo}</td>
                      <td>{p.region || "Sin región"}</td>
                      <td>{p.activo === false ? "Inactivo" : "Activo"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <section className="section" id="planes">
        <div className="container">
          <div className="section-title">
            <h2>Planes nutricionales</h2>
            <p>Planes disponibles en el catálogo.</p>
          </div>
          {planes.length === 0 ? (
            <div className="empty">Todavía no hay planes nutricionales registrados.</div>
          ) : (
            <div className="grid-3">
              {planes.map((p) => (
                <article className="card card-servicio" key={p.id}>
                  <div className="card-body">
                    <h3>{p.nombre}</h3>
                    <p className="muted">{p.tipo} · {p.modalidad || "Sin modalidad"}</p>
                    <p className="price">{dinero(p.precio)}</p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section" id="citas">
        <div className="container">
          <div className="section-title">
            <h2>Citas programadas</h2>
            <p>Próximas atenciones.</p>
          </div>
          <div className="empty">Todavía no tienes citas programadas.</div>
        </div>
      </section>
    </main>
  );
}