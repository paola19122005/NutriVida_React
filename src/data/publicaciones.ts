export interface Publicacion{
    id: number;
    titulo: string;
    imagen: string;
    resumen: string;
    detalle: string;
}

export const publicaciones: Publicacion[] = [
    {id: 1, titulo: "Habitos simples para mejorar tu alimentación", imagen:"", resumen: "Pequeños cambios sostenibles pueden ayudarte a construit una rutina de alimentación más equilibrada.", detalle: "Organizar tus comidas, mantener horarios regulares y aumentar la variedad de alimentos son estrategias que pueden facilitar una alimentación quilibrada. En nutriVida trabajar objetivos realistas ya daptados a cada persona."},
    {id: 2, titulo: "¿Qué es la bioimpedanciometría?", imagen:"", resumen:"Conoce para qué sirve esta evaluación y cómo complementa el seguimiento nutricional.", detalle:"La bioimpedanciometría permite estimar distintos componentes de la composición corporal. En una evaluación nutricional se utiliza como una herramienta complementaria, junto con antecedentes, mediciones y objetivos personales."}
];