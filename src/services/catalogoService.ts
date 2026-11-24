import { httpRequest, CATALOGO_URL } from "./http";
import type { Producto } from "../data/productos";
import { normalizarRutaImagen } from "../utils/imagen";

export interface BackendServicio {
  id: number;
  tipo: string;
  nombre: string;
  duracion: string;
  modalidad: string;
  precio: number;
  descripcion: string;
  imagen: string;
}

export function mapServicio(s: BackendServicio): Producto {
  return {
    id: String(s.id),
    tipo: s.tipo,
    nombre: s.nombre,
    duracion: s.duracion,
    modalidad: s.modalidad,
    precio: Number(s.precio),
    descripcion: s.descripcion,
    imagen: normalizarRutaImagen(s.imagen),
  };
}

export interface ServicioPayload {
  tipo: string;
  nombre: string;
  duracion?: string;
  modalidad?: string;
  precio: number;
  descripcion: string;
  imagen?: string;
}

export async function listarServicios(tipo?: string, q?: string): Promise<Producto[]> {
  const params = new URLSearchParams();
  if (tipo) params.set("tipo", tipo);
  if (q) params.set("q", q);
  const qs = params.toString();
  const path = qs ? `/api/servicios?${qs}` : "/api/servicios";
  const data = await httpRequest<BackendServicio[]>(CATALOGO_URL, path, { method: "GET" });
  return data.map(mapServicio);
}

export async function obtenerServicio(id: string): Promise<Producto | null> {
  try {
    const data = await httpRequest<BackendServicio>(CATALOGO_URL, `/api/servicios/${id}`, { method: "GET" });
    return mapServicio(data);
  } catch {
    return null;
  }
}

export async function crearServicio(payload: ServicioPayload): Promise<Producto> {
  const body = {
    tipo: payload.tipo,
    nombre: payload.nombre,
    duracion: payload.duracion,
    modalidad: payload.modalidad,
    precio: payload.precio,
    descripcion: payload.descripcion,
    imagen: payload.imagen,
  };
  const data = await httpRequest<BackendServicio>(CATALOGO_URL, "/api/servicios", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return mapServicio(data);
}

export async function actualizarServicio(id: string, payload: Partial<ServicioPayload>): Promise<Producto> {
  const body: Record<string, unknown> = {};
  if (payload.tipo !== undefined) body.tipo = payload.tipo;
  if (payload.nombre !== undefined) body.nombre = payload.nombre;
  if (payload.duracion !== undefined) body.duracion = payload.duracion;
  if (payload.modalidad !== undefined) body.modalidad = payload.modalidad;
  if (payload.precio !== undefined) body.precio = payload.precio;
  if (payload.descripcion !== undefined) body.descripcion = payload.descripcion;
  if (payload.imagen !== undefined) body.imagen = payload.imagen;
  const data = await httpRequest<BackendServicio>(CATALOGO_URL, `/api/servicios/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
  return mapServicio(data);
}

export async function eliminarServicio(id: string): Promise<void> {
  await httpRequest(CATALOGO_URL, `/api/servicios/${id}`, { method: "DELETE" });
}
