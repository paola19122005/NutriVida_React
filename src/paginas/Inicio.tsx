import { useState } from "react";
import { Link } from "react-router-dom";
import CardServicio from "../componentes/moleculas/CardServicio";
import { cargarProductos } from "../data/productos";
import { Toast } from "../utils/toast";

export default function Inicio() {
  const productos = cargarProductos().slice(0, 4);
  const [toast, setToast] = useState(false);

  return (
    <>
      <main>
        <section className="hero">
          <div className="container hero-grid">
            <div>
              <span className="badge">Nutrición personalizada</span>
              <h1>Tu bienestar comienza con una mejor relación con la alimentación.</h1>
              <p>En Clínica NutriVida acompañamos tus objetivos con evaluaciones, controles y planes nutricionales adaptados a tus necesidades.</p>
              <div className="actions">
                <Link className="btn btn-primary" to="/catalogo">Ver servicios</Link>
                <Link className="btn btn-outline" to="/registro">Crear cuenta</Link>
              </div>
            </div>
            <img src="/img/alimentos saludables.webp" alt="Alimentos saludables" />
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="section-title">
              <h2>Servicios destacados</h2>
              <p>Conoce algunas alternativas de atención.</p>
            </div>
            <div className="grid-4">
              {productos.map((p) => (
                <CardServicio key={p.id} {...p} onAgregado={() => setToast(true)} />
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container grid-2">
            <div className="info-box">
              <span className="badge">NutriVida</span>
              <h2>Atención centrada en ti</h2>
              <p>Contamos con profesionales orientados a distintas necesidades: control de peso, nutrición deportiva, alimentación vegetariana o vegana y nutrición pediátrica.</p>
              <Link className="btn btn-primary" to="/nosotros">Conócenos</Link>
            </div>
            <div className="info-box">
              <span className="badge">NutriVida</span>
              <h2>¿Quieres saber más?</h2>
              <p>Revisa nuestros contenidos sobre alimentación y evaluaciones nutricionales.</p>
              <Link className="btn btn-primary" to="/blog">Ir al Blog</Link>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="section-title">
              <h2>Video informativo</h2>
              <p>Elemento multimedia requerido por la pauta.</p>
            </div>
            <div className="video-box">
              <iframe width="560" height="315" src="https://www.youtube.com/embed/ETIwmxTAxB4?si=jai7J_VkPKypqZ5Z" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe>
            </div>
          </div>
        </section>
      </main>
      <Toast mensaje="Servicio agregado a tu lista." visible={toast} onCerrar={() => setToast(false)} />
    </>
  );
}
