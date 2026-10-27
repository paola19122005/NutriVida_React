import { cargarUsuarios, guardarUsuarios } from "./usuarios";
import { cargarServiciosPaciente, guardarServiciosPaciente } from "./serviciosPaciente";
import type { ServicioPaciente } from "./serviciosPaciente";

const PLANES_KEY = "planesNutricionista";
const CITAS_KEY = "citasNutricionista";

function cargarPlanes() {
  const raw = localStorage.getItem(PLANES_KEY);
  if (!raw) return [];
  try { const p = JSON.parse(raw); return Array.isArray(p) ? p : []; } catch { return []; }
}
function guardarPlanes(planes: unknown[]) { localStorage.setItem(PLANES_KEY, JSON.stringify(planes)); }
function cargarCitas() {
  const raw = localStorage.getItem(CITAS_KEY);
  if (!raw) return [];
  try { const c = JSON.parse(raw); return Array.isArray(c) ? c : []; } catch { return []; }
}
function guardarCitas(citas: unknown[]) { localStorage.setItem(CITAS_KEY, JSON.stringify(citas)); }

export function asegurarDemoPaciente() {
  const usuarios = cargarUsuarios();
  let paciente = usuarios.find((u) => u.id === 3);
  if (!paciente) {
    paciente = usuarios.find((u) => u.rol === "Paciente");
  }
  if (!paciente) {
    paciente = {
      id: 3,
      run: "12345678-5",
      nombre: "María",
      apellidos: "González",
      correo: "maria@nutrivida.cl",
      fechaNacimiento: "1995-05-10",
      rol: "Paciente",
      region: "La Araucanía",
      comuna: "Temuco",
      direccion: "Av. Principal 123",
      clave: "1234",
      activo: true,
    };
    usuarios.push(paciente);
  } else {
    paciente.nombre = "María";
    paciente.apellidos = "González";
    paciente.run = "12345678-5";
    paciente.correo = "maria@nutrivida.cl";
    paciente.clave = "1234";
    paciente.activo = true;
  }

  const otrosMaria = usuarios.filter((u) => u.id !== paciente.id && u.correo.toLowerCase() === "maria@nutrivida.cl");
  otrosMaria.forEach((u) => {
    const idx = usuarios.indexOf(u);
    if (idx >= 0) usuarios.splice(idx, 1);
  });

  guardarUsuarios(usuarios);

  const pacienteId = paciente.id;

  const planId = 9001;
  const planes = cargarPlanes().map((p) => (p.id === planId ? { ...p, pacienteId, pacienteNombre: "María González" } : p));
  const planExistente = planes.find((p) => p.id === planId);
  const planActualizado = {
    id: planId,
    pacienteId: 1001,
    pacienteNombre: "María González",
    tipoPlan: "Plan pérdida de peso (3 meses)",
    fechaInicio: "2026-09-10",
    duracionMeses: 3,
    objetivos: "Reducir peso de forma saludable y mejorar hábitos.",
    observaciones: "Paciente motivada, seguimiento quincenal.",
    proximaRevision: "2026-11-07",
    revisiones: [
      {
        fecha: "2026-10-18",
        nota: "Seguimiento de mitad de tratamiento — Carolina, nutricionista. Durante estas primeras seis semanas has mantenido una buena constancia con las recomendaciones del plan. Se observan avances en la organización de tus comidas y en la incorporación de hábitos más saludables. Para la siguiente etapa, continuaremos trabajando en la planificación de las comidas y en el seguimiento de los objetivos acordados. ¡Sigue así!",
      },
    ],
  };
  if (!planExistente) {
    planes.push(planActualizado);
    guardarPlanes(planes);
  } else {
    const idx = planes.findIndex((p) => p.id === planId);
    planes[idx] = { ...planExistente, ...planActualizado, revisiones: planExistente.revisiones?.length ? planExistente.revisiones : planActualizado.revisiones };
    guardarPlanes(planes);
  }

  const citas = cargarCitas().map((c) => ([9101, 9102].includes(c.id) ? { ...c, pacienteId, pacienteNombre: "María González" } : c));
  if (!citas.some((c) => c.id === 9101)) {
    citas.push({
      id: 9101,
      pacienteId: pacienteId,
      pacienteNombre: "María González",
      fecha: "2026-10-25",
      hora: "10:00",
      estado: "Programada",
      observaciones: "Control nutricional mensual.",
    });
  }
  if (!citas.some((c) => c.id === 9102)) {
    citas.push({
      id: 9102,
      pacienteId: pacienteId,
      pacienteNombre: "María González",
      fecha: "2026-09-15",
      hora: "09:30",
      estado: "Cancelada",
      observaciones: "Reprogramada por el paciente.",
    });
  }
  guardarCitas(citas);

  const servicios = cargarServiciosPaciente().map((s) => ([9201, 9202, 9203, 9204].includes(s.id) ? { ...s, pacienteId } : s));
  const base: ServicioPaciente[] = [
    {
      id: 9201,
      pacienteId: pacienteId,
      servicioId: "CN002",
      nombre: "Control nutricional (seguimiento)",
      tipo: "Consulta",
      fecha: "2026-10-25",
      hora: "10:00",
      estadoActividad: "Agendado",
      estadoPago: "Pendiente",
      importe: 25000,
      nutricionista: "Carolina Fuentes",
      citaId: 9101,
    },
    {
      id: 9202,
      pacienteId: pacienteId,
      servicioId: "TG003",
      nombre: "Taller nutrición para deportistas",
      tipo: "Taller grupal",
      fecha: "2026-09-10",
      estadoActividad: "Cancelado",
      fechaCancelacion: "2026-09-08",
      estadoPago: "Pendiente",
      importe: 18000,
      nutricionista: "Carolina Fuentes",
      citaId: 9102,
      observaciones: "Taller cancelado por incompatibilidad de horario.",
    },
    {
      id: 9203,
      pacienteId: pacienteId,
      servicioId: "PL002",
      nombre: "Plan pérdida de peso (3 meses)",
      tipo: "Plan especializado",
      fecha: "2026-09-10",
      estadoActividad: "Agendado",
      estadoPago: "Pagado",
      importe: 170000,
      fechaPago: "2026-09-09",
      nutricionista: "Carolina Fuentes",
      planId: planId,
      observaciones: "Plan activo con seguimiento quincenal.",
    },
    {
      id: 9204,
      pacienteId: pacienteId,
      servicioId: "EV001",
      nombre: "Antropometría completa",
      tipo: "Evaluación",
      fecha: "2026-10-20",
      estadoActividad: "Agendado",
      estadoPago: "Pendiente",
      importe: 18000,
      nutricionista: "Carolina Fuentes",
    },
  ];
  const nuevos = base.filter((s) => !servicios.some((x) => x.id === s.id));
  if (nuevos.length) {
    guardarServiciosPaciente([...servicios, ...nuevos]);
  }

  localStorage.setItem("demoPacienteNutriVida", "1");
}