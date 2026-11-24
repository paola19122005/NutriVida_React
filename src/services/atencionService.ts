import { httpRequest, ATENCION_URL } from "./http";

export interface BackendPlanNutricional {
  id: number;
  nombre: string;
  descripcion?: string;
  pacienteId: number;
  nutricionistaId: number;
  fechaInicio: string;
  fechaTermino: string;
  estado: string;
  progreso: number;
}

export interface BackendSeguimiento {
  id: number;
  planId: number;
  comentario: string;
  progreso: number;
  fechaRegistro: string;
}

export interface BackendCita {
  id: number;
  pacienteId: number;
  nutricionistaId: number;
  fechaHora: string;
  motivo: string;
  estado: string;
  observaciones?: string;
}

export interface PlanPayload {
  nombre: string;
  descripcion?: string;
  pacienteId: number;
  nutricionistaId?: number;
  fechaInicio: string;
  fechaTermino: string;
}

export interface CitaPayload {
  pacienteId?: number;
  nutricionistaId?: number;
  fechaHora: string;
  motivo: string;
  observaciones?: string;
}

export async function listarPlanes(): Promise<BackendPlanNutricional[]> {
  return httpRequest<BackendPlanNutricional[]>(ATENCION_URL, "/api/planes", { method: "GET" });
}

export async function planesPorPaciente(pacienteId: number): Promise<BackendPlanNutricional[]> {
  return httpRequest<BackendPlanNutricional[]>(ATENCION_URL, `/api/planes/paciente/${pacienteId}`, { method: "GET" });
}

export async function planesPorNutricionista(nutricionistaId: number): Promise<BackendPlanNutricional[]> {
  return httpRequest<BackendPlanNutricional[]>(ATENCION_URL, `/api/planes/nutricionista/${nutricionistaId}`, { method: "GET" });
}

export async function obtenerPlan(id: number): Promise<BackendPlanNutricional> {
  return httpRequest<BackendPlanNutricional>(ATENCION_URL, `/api/planes/${id}`, { method: "GET" });
}

export async function crearPlan(payload: PlanPayload): Promise<BackendPlanNutricional> {
  return httpRequest<BackendPlanNutricional>(ATENCION_URL, "/api/planes", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function actualizarPlan(id: number, payload: PlanPayload): Promise<BackendPlanNutricional> {
  return httpRequest<BackendPlanNutricional>(ATENCION_URL, `/api/planes/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function eliminarPlan(id: number): Promise<void> {
  await httpRequest(ATENCION_URL, `/api/planes/${id}`, { method: "DELETE" });
}

export async function cambiarEstadoPlan(id: number, estado: string): Promise<void> {
  await httpRequest(ATENCION_URL, `/api/planes/${id}/estado`, {
    method: "PATCH",
    body: JSON.stringify({ estado }),
  });
}

export async function registrarSeguimiento(planId: number, comentario: string, progreso: number): Promise<BackendSeguimiento> {
  return httpRequest<BackendSeguimiento>(ATENCION_URL, `/api/planes/${planId}/seguimientos`, {
    method: "POST",
    body: JSON.stringify({ comentario, progreso }),
  });
}

export async function listarSeguimientos(planId: number): Promise<BackendSeguimiento[]> {
  return httpRequest<BackendSeguimiento[]>(ATENCION_URL, `/api/planes/${planId}/seguimientos`, { method: "GET" });
}

export async function listarCitas(): Promise<BackendCita[]> {
  return httpRequest<BackendCita[]>(ATENCION_URL, "/api/citas", { method: "GET" });
}

export async function citasPorPaciente(pacienteId: number): Promise<BackendCita[]> {
  return httpRequest<BackendCita[]>(ATENCION_URL, `/api/citas/paciente/${pacienteId}`, { method: "GET" });
}

export async function citasPorNutricionista(nutricionistaId: number): Promise<BackendCita[]> {
  return httpRequest<BackendCita[]>(ATENCION_URL, `/api/citas/nutricionista/${nutricionistaId}`, { method: "GET" });
}

export async function agendarCita(payload: CitaPayload): Promise<BackendCita> {
  return httpRequest<BackendCita>(ATENCION_URL, "/api/citas", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function modificarCita(id: number, payload: CitaPayload): Promise<BackendCita> {
  return httpRequest<BackendCita>(ATENCION_URL, `/api/citas/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function cancelarCita(id: number): Promise<BackendCita> {
  return httpRequest<BackendCita>(ATENCION_URL, `/api/citas/${id}/cancelar`, { method: "PATCH" });
}

export async function marcarCitaRealizada(id: number): Promise<BackendCita> {
  return httpRequest<BackendCita>(ATENCION_URL, `/api/citas/${id}/realizar`, { method: "PATCH" });
}