import { httpRequest, PAGOS_URL } from "./http";

export type EstadoPago = "PENDIENTE" | "PAGADO" | "CANCELADO";

export interface BackendPago {
  id: number;
  usuarioId: number;
  servicioId?: number;
  servicioNombre?: string;
  monto: number;
  fecha: string;
  metodoPago?: string;
  estado: EstadoPago;
  comprobante?: string;
  folio?: string;
  fechaPago?: string;
  fechaRegistro: string;
  observaciones?: string;
}

export interface PagoPayload {
  usuarioId?: number;
  servicioId?: number;
  servicioNombre?: string;
  monto: number;
  fecha?: string;
  metodoPago?: string;
  observaciones?: string;
}

export interface ComprobantePayload {
  metodoPago?: string;
  comprobante?: string;
  folio?: string;
}

export async function listarPagos(): Promise<BackendPago[]> {
  return httpRequest<BackendPago[]>(PAGOS_URL, "/api/pagos", { method: "GET" });
}

export async function pagosPorUsuario(usuarioId: number): Promise<BackendPago[]> {
  return httpRequest<BackendPago[]>(PAGOS_URL, `/api/pagos/usuario/${usuarioId}`, { method: "GET" });
}

export async function pagosPorServicio(servicioId: number): Promise<BackendPago[]> {
  return httpRequest<BackendPago[]>(PAGOS_URL, `/api/pagos/servicio/${servicioId}`, { method: "GET" });
}

export async function obtenerPago(id: number): Promise<BackendPago> {
  return httpRequest<BackendPago>(PAGOS_URL, `/api/pagos/${id}`, { method: "GET" });
}

export async function historialPagos(): Promise<BackendPago[]> {
  return httpRequest<BackendPago[]>(PAGOS_URL, "/api/pagos/historial", { method: "GET" });
}

export async function historialPagosPorUsuario(usuarioId: number): Promise<BackendPago[]> {
  return httpRequest<BackendPago[]>(PAGOS_URL, `/api/pagos/historial/${usuarioId}`, { method: "GET" });
}

export async function crearPago(payload: PagoPayload): Promise<BackendPago> {
  return httpRequest<BackendPago>(PAGOS_URL, "/api/pagos", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function actualizarPago(id: number, payload: PagoPayload): Promise<BackendPago> {
  return httpRequest<BackendPago>(PAGOS_URL, `/api/pagos/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function cambiarEstadoPago(id: number, estado: EstadoPago): Promise<BackendPago> {
  return httpRequest<BackendPago>(PAGOS_URL, `/api/pagos/${id}/estado`, {
    method: "PATCH",
    body: JSON.stringify({ estado }),
  });
}

export async function marcarPagoPagado(id: number, payload?: ComprobantePayload): Promise<BackendPago> {
  return httpRequest<BackendPago>(PAGOS_URL, `/api/pagos/${id}/pagar`, {
    method: "PATCH",
    body: JSON.stringify(payload ?? {}),
  });
}

export async function registrarComprobante(id: number, payload: ComprobantePayload): Promise<BackendPago> {
  return httpRequest<BackendPago>(PAGOS_URL, `/api/pagos/${id}/comprobante`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function cancelarPago(id: number): Promise<BackendPago> {
  return httpRequest<BackendPago>(PAGOS_URL, `/api/pagos/${id}/cancelar`, { method: "PATCH" });
}

export async function eliminarPago(id: number): Promise<void> {
  await httpRequest(PAGOS_URL, `/api/pagos/${id}`, { method: "DELETE" });
}