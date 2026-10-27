import { useParams, Link } from "react-router-dom";
import { publicaciones } from "../data/publicaciones";

export default function DetalleBlog() {
  const { id } = useParams();
  const p = publicaciones.find((x) => x.id === Number(id));

  if (!p) {
    return (
      <main>
        <section className="section">
          <div className="container">
            <div className="empty">No se encontró la publicación.</div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main>
      <section className="page-title">
        <div className="container">
          <h1>Artículo</h1>
          <p>Contenido completo.</p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <article className="info-box">
            <img className="detail-image" src={p.imagen} alt={p.titulo} style={{ marginBottom: "20px" }} />
            <span className="badge">NutriVida Blog</span>
            <h1>{p.titulo}</h1>
            <p style={{ marginTop: "15px" }}>{p.detalle}</p>
            <div className="actions">
              <Link className="btn btn-primary" to="/blog">Volver al blog</Link>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
