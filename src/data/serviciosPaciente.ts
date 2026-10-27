export interface ServicioPaciente {
  id: number;
  pacienteId: number;
  servicioId: string;
  nombre: string;
  tipo: string;
  fecha: string;
  hora?: string;
  estadoActividad: "Agendado" | "Cancelado" | "Realizado";
  fechaCancelacion?: string;
  estadoPago: "Pendiente" | "Pagado";
  importe: number;
  fechaPago?: string;
  nutricionista: string;
  planId?: number;
  tallerId?: number;
  citaId?: number;
  observaciones?: string;
}

const KEY = "serviciosPaciente";

export function cargarServiciosPaciente(): ServicioPaciente[] {
  const raw = localStorage.getItem(KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function guardarServiciosPaciente(servicios: ServicioPaciente[]) {
  localStorage.setItem(KEY, JSON.stringify(servicios));
}