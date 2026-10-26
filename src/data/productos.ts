export interface Producto {
    id: string;
    tipo: string;
    nombre: string;
    duracion: string;
    modalidad: string;
    precio: number;
    descripcion: string;
    imagen: string;
}

export const productosIniciales: Producto[] = [
  { id: "CN001", tipo: "Consulta", nombre: "Primera consulta nutricional", duracion: "50 min", modalidad: "Presencial", precio: 35000, descripcion: "Evaluación inicial: anamnesis, antropometría completa y diseño del primer plan alimenticio.", imagen: "/img/primera consulta.jpg" },
  { id: "CN002", tipo: "Consulta", nombre: "Control nutricional (seguimiento)", duracion: "30 min", modalidad: "Presencial", precio: 25000, descripcion: "Seguimiento mensual: medición de indicadores y ajuste del plan vigente.", imagen: "/img/seguimientomensual.jpg" },
  { id: "CN003", tipo: "Consulta", nombre: "Control nutricional quincenal", duracion: "30 min", modalidad: "Presencial", precio: 22000, descripcion: "Seguimiento intensivo cada 15 días. Recomendado en los primeros 2 meses.", imagen: "/img/quincenal.avif" },
  { id: "CN004", tipo: "Consulta", nombre: "Teleconsulta nutricional", duracion: "30 min", modalidad: "Online (video)", precio: 20000, descripcion: "Consulta de seguimiento vía videollamada. Requiere contar con consulta presencial previa.", imagen: "/img/teleconsulta.jpg" },
  { id: "PL001", tipo: "Plan especializado", nombre: "Plan pérdida de peso (1 mes)", duracion: "—", modalidad: "Presencial", precio: 65000, descripcion: "Incluye primera consulta + 1 control quincenal + plan alimenticio personalizado + seguimiento por WhatsApp.", imagen: "/img/peso.jpg" },
  { id: "PL002", tipo: "Plan especializado", nombre: "Plan pérdida de peso (3 meses)", duracion: "—", modalidad: "Presencial", precio: 170000, descripcion: "Incluye primera consulta + 5 controles + 3 planes mensuales + seguimiento continuo.", imagen: "/img/peso3.jpg" },
  { id: "PL003", tipo: "Plan especializado", nombre: "Plan nutrición deportiva (1 mes)", duracion: "—", modalidad: "Presencial", precio: 70000, descripcion: "Para deportistas y personas con actividad física frecuente. Cálculo de requerimientos energéticos y proteicos.", imagen: "/img/deporte.avif" },
  { id: "PL004", tipo: "Plan especializado", nombre: "Plan control diabetes / hipertensión", duracion: "—", modalidad: "Presencial", precio: 75000, descripcion: "Plan adaptado para patologías metabólicas. Coordinación con médico tratante si aplica.", imagen: "/img/diabete.jpg" },
  { id: "PL005", tipo: "Plan especializado", nombre: "Plan alimentación vegetariana/vegana", duracion: "—", modalidad: "Presencial", precio: 68000, descripcion: "Diseñado para garantizar aporte adecuado de proteínas, hierro, vitamina B12 y calcio sin productos animales.", imagen: "/img/vegano.jpg" },
  { id: "PL006", tipo: "Plan especializado", nombre: "Plan alimentación infantil (2-12 años)", duracion: "—", modalidad: "Presencial", precio: 65000, descripcion: "Evaluación nutricional pediátrica y diseño de plan adaptado a la etapa de desarrollo del niño.", imagen: "/img/infantil.jpg" },
  { id: "EV001", tipo: "Evaluación", nombre: "Antropometría completa", duracion: "20 min", modalidad: "Presencial", precio: 18000, descripcion: "Peso, talla, IMC, circunferencia de cintura, cadera, brazo y % de grasa corporal con bioimpedanciometría.", imagen: "/img/antro.jpg" },
  { id: "EV002", tipo: "Evaluación", nombre: "Bioimpedanciometría", duracion: "15 min", modalidad: "Presencial", precio: 12000, descripcion: "Medición de composición corporal: masa grasa, masa muscular, agua corporal y edad metabólica.", imagen: "/img/Bioimpedanciometría .jpg" },
  { id: "EV003", tipo: "Evaluación", nombre: "Encuesta de hábitos alimentarios", duracion: "20 min", modalidad: "Presencial", precio: 10000, descripcion: "Análisis del patrón alimentario actual. Identificación de déficit y excesos nutricionales.", imagen: "/img/habito.avif" },
  { id: "EV004", tipo: "Evaluación", nombre: "Análisis de exámenes de laboratorio", duracion: "20 min", modalidad: "Presencial", precio: 15000, descripcion: "Interpretación de hemograma, perfil bioquímico y lipídico en contexto nutricional.", imagen: "/img/examen.webp" },
  { id: "TG001", tipo: "Taller grupal", nombre: "Taller de alimentación saludable", duracion: "90 min", modalidad: "Presencial (grupo)", precio: 15000, descripcion: "Máx. 10 personas. Conceptos básicos de alimentación equilibrada y lectura de etiquetas.", imagen: "/img/taller saludable.jpg" },
  { id: "TG002", tipo: "Taller grupal", nombre: "Taller de cocina nutritiva", duracion: "120 min", modalidad: "Presencial (grupo)", precio: 20000, descripcion: "Preparación de recetas saludables. Incluye degustación. Máx. 8 personas.", imagen: "/img/taller cocina.jpg" },
  { id: "TG003", tipo: "Taller grupal", nombre: "Taller nutrición para deportistas", duracion: "90 min", modalidad: "Presencial (grupo)", precio: 18000, descripcion: "Hidratación, nutrición pre y post entrenamiento, suplementación básica. Máx. 12 personas.", imagen: "/img/taller deportivo.jpg" },
];

const STORAGE_KEY = "productosNutriVida;"

export function cargarProductos(): Producto[]{
    const guardados = localStorage.getItem(STORAGE_KEY);
    if(guardados){
        try {
            return JSON.parse(guardados) as Producto[];
        }catch {
            return [...productosIniciales];
        }
    }
    return [...productosIniciales];
}

export function guardarProductos(productos: Producto[]): void{
    localStorage.setItem(STORAGE_KEY, JSON.stringify(productos));
}