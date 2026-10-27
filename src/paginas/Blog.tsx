import CardBlog from "../componentes/moleculas/CardBlog";
import { publicaciones } from "../data/publicaciones";

export default function Blog(){
    return(
        <main>
            <section className="page-title">
                <div className="container">
                    <h1>Blog NutriVida</h1>
                    <p>Consejos y contenidos relacionados con la nutrición.</p>
                </div>
            </section>
            <section className="section">
                <div className="container">
                    <div className="grid-2">
                        {publicaciones.map((p) => (
                            <CardBlog key={p.id} id={p.id} titulo={p.titulo} resumen={p.resumen} imagen={p.imagen}/>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
}