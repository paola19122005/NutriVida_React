import { Link } from "react-router-dom";

interface BotonProps {
    to: string;
    children: React.ReactNode;
    variante?: "primario" | "contorno" | "peligro";
    className?: string;
}

export default function Boton({to, children, variante = "primario", className = ""}: BotonProps) {
    const clase = variante === "primario" ? "btn btn-primary" : variante === "contorno" ? "btn btn-outline": "btn btn-danger";
    return ( 
        <Link to={to} className={`${clase} ${className}`.trim()}>
            {children}
        </Link>
    );
}