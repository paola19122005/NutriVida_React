import { useState } from "react";
import { Link } from "react-router-dom";
import { dinero } from "../../utils/formato";
import { agregarLista } from "../../utils/lista";
import SelectorFecha from "./SelectorFecha";

interface CardServicioProps {
    id: string;
    tipo: string;
    nombre: string;
    descripcion: string;
    precio: number;
    duracion: string;
    modalidad: string;
    imagen: string;
    onAgregado?: () => void;
}

export default function CardServicio({id, tipo, nombre, descripcion, precio, duracion, modalidad, imagen, onAgregado}: CardServicioProps){
    const [mostrarFecha, setMostrarFecha] = useState(false);

    const handleConfirmar = (fecha: string) => {
        agregarLista(id, fecha);
        setMostrarFecha(false);
        if(onAgregado) onAgregado();
    };

    return (
        <>
        <article className="card card-servicio">
            <img className={`card-img servicio-img servicio-img-${id.toLowerCase()}`} src={imagen} alt={nombre}/>
                <div className="card-body">
                    <span className="badge">{tipo}</span>
                    <h3>{nombre}</h3>
                    <p className="muted">{descripcion}</p>
                    <p className="muted">{modalidad ? modalidad : "Sin modalidad"} · {duracion && duracion !== "—" && !Number.isNaN(Number(duracion)) ? `${duracion}min`:(duracion || "—")}</p>
                    <p className="price">{dinero(precio)}</p>
                        <div className="actions">
                            <Link to={`/servicio/${id}`} className="btn btn-primary">Ver detalle</Link>
                            <button className="btn btn-outline" onClick={() => setMostrarFecha(true)}>Agregar a la lista</button>
                        </div>
                </div>
        </article>
        {mostrarFecha ? (
            <SelectorFecha onConfirmar={handleConfirmar} onCancelar={() => setMostrarFecha(false)}/>
        ) : null}
        </>
    );
}