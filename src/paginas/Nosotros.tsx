export default function Nosotros() {
  return (
    <main>
      <section className="page-title">
        <div className="container">
          <h1>Nosotros</h1>
          <p>Conoce la clínica y el equipo detrás de la solución.</p>
        </div>
      </section>

      <section className="section">
        <div className="container grid-2">
          <article className="info-box">
            <h2>Clínica NutriVida</h2>
            <p>NutriVida es una clínica de nutrición y dietética fundada en 2016 en Temuco, Región de La Araucanía. Está formada por 4 nutricionistas que atienden pacientes con distintos objetivos.</p>
            <p>El proyecto busca facilitar el acceso a servicios nutricionales y mejorar la gestión de la atención mediante una plataforma web.</p>
            <ul className="list-clean">
              <li>• Atención personalizada</li>
              <li>• Seguimiento nutricional</li>
              <li>• Modalidad presencial y online</li>
            </ul>
          </article>

          <article className="info-box">
            <h2>Equipo Profesionales</h2>
            <ul className="list-clean">
              <li><strong>Especializada en obesidad:</strong> Carolina Fuentes</li>
              <li><strong>Especializado en deporte: </strong> Rodrigo Sepúlveda</li>
              <li><strong>Especializada en TCA:</strong> Daniela Morales</li>
              <li><strong>Especializado en nutrición pediátrica:</strong> Felipe Araya</li>
            </ul>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-title">
            <h2>Profesionales</h2>
          </div>
          <div className="grid-4">
            <article className="card">
              <img className="card-img nosotros-img nosotros-img-1" src="/img/nutri1.avif" alt="Nutricionista" />
              <div className="card-body">
                <h3>Nut. Carolina Fuentes M.</h3>
                <p className="muted">Obesidad y síndrome metabólico<br />Lun, Mié y Vie · 09:00–17:00</p>
              </div>
            </article>
            <article className="card">
              <img className="card-img nosotros-img nosotros-img-2" src="/img/nutri2.avif" alt="Nutricionista" />
              <div className="card-body">
                <h3>Nut. Rodrigo Sepúlveda A.</h3>
                <p className="muted">Nutrición deportiva y rendimiento<br />Mar, Jue y Sáb · 09:00–14:00</p>
              </div>
            </article>
            <article className="card">
              <img className="card-img nosotros-img nosotros-img-3" src="/img/nutri3.avif" alt="Nutricionista" />
              <div className="card-body">
                <h3>Nut. Daniela Morales C.</h3>
                <p className="muted">Vegetariana, vegana y TCA<br />Lun a Vie · 08:00–13:00</p>
              </div>
            </article>
            <article className="card">
              <img className="card-img nosotros-img nosotros-img-4" src="/img/nutri4.avif" alt="Nutricionista" />
              <div className="card-body">
                <h3>Nut. Felipe Araya R.</h3>
                <p className="muted">Nutrición pediátrica y familiar<br />Mar a Vie · 14:00–19:00</p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-title">
            <h2>Ubicación</h2>
            <p>Mapa de referencia para la clínica.</p>
          </div>
          <div className="map-box">
            <iframe src="https://www.openstreetmap.org/export/embed.html?bbox=-70.61%2C-33.42%2C-70.56%2C-33.40&layer=mapnik" title="Mapa de ubicación"></iframe>
          </div>
        </div>
      </section>
    </main>
  );
}
