import { httpRequest, CONTACTO_URL } from "./http";

export type EstadoMensajeContacto = "PENDIENTE" | "REVISADO" | "RESPONDIDO" | "CERRADO";

export interface BackendMensajeContacto {
  id: number;
  usuarioId?: number;
  nombre: string;
  correo: string;
  asunto: string;
  mensaje: string;
  estado: EstadoMensajeContacto;
  respuesta?: string;
  fechaRespuesta?: string;
  fechaRegistro: string;
}

export interface MensajeContactoRequest {
  usuarioId?: number;
  nombre: string;
  correo: string;
  asunto: string;
  mensaje: string;
}

export interface RespuestaContactoRequest {
  respuesta: string;
}

export async function listarMensajesContacto(): Promise<BackendMensajeContacto[]> {
  return httpRequest<BackendMensajeContacto[]>(CONTACTO_URL, "/api/contactos", { method: "GET" });
}

export async function obtenerMensajeContacto(id: number): Promise<BackendMensajeContacto> {
  return httpRequest<BackendMensajeContacto>(CONTACTO_URL, `/api/contactos/${id}`, { method: "GET" });
}

export async function registrarMensajeContacto(payload: MensajeContactoRequest): Promise<BackendMensajeContacto> {
  return httpRequest<BackendMensajeContacto>(CONTACTO_URL, "/api/contactos", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function responderMensajeContacto(id: number, respuesta: string): Promise<BackendMensajeContacto> {
  return httpRequest<BackendMensajeContacto>(CONTACTO_URL, `/api/contactos/${id}/responder`, {
    method: "PATCH",
    body: JSON.stringify({ respuesta }),
  });
}

export async function cambiarEstadoMensajeContacto(id: number, estado: EstadoMensajeContacto): Promise<BackendMensajeContacto> {
  return httpRequest<BackendMensajeContacto>(CONTACTO_URL, `/api/contactos/${id}/estado`, {
    method: "PATCH",
    body: JSON.stringify({ estado }),
  });
}

export async function eliminarMensajeContacto(id: number): Promise<void> {
  await httpRequest(CONTACTO_URL, `/api/contactos/${id}`, { method: "DELETE" });
}