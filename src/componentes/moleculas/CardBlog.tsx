import { Link } from "react-router-dom";

interface CardBlogProps{
    id: number;
    titulo: string;
    resumen: string;
    imagen: string;
}

export default function CardBlog({id, titulo, resumen, imagen}: CardBlogProps){
    return(
        <article className="card">
            <img className="card-img" src={imagen} alt={titulo}/>
            <div className="card-body">
                <h3>{titulo}</h3>
                <p className="muted">{resumen}</p>
                <div className="actions">
                    <Link to={`/blog/${id}`} className="btn btn-primary">Leer más</Link>
                </div>
            </div>
        </article>
    );
}