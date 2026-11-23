import { httpRequest, USUARIOS_URL } from "./http";
import { mapUsuario, type BackendUsuario } from "./authService";
import type { Usuario } from "../data/usuarios";

export async function listarUsuarios(): Promise<Usuario[]> {
  const data = await httpRequest<BackendUsuario[]>(USUARIOS_URL, "/api/usuarios", { method: "GET" });
  return data.map(mapUsuario);
}

export interface UsuarioCreatePayload {
  run: string;
  nombre: string;
  apellidos: string;
  correo: string;
  fechaNacimiento?: string;
  rol: string;
  region?: string;
  comuna?: string;
  direccion?: string;
  clave: string;
  activo?: boolean;
}

export async function crearUsuario(payload: UsuarioCreatePayload): Promise<Usuario> {
  const data = await httpRequest<BackendUsuario>(USUARIOS_URL, "/api/usuarios", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return mapUsuario(data);
}

export async function actualizarUsuario(id: number, payload: Partial<UsuarioCreatePayload> & { activo?: boolean }): Promise<Usuario> {
  const body: Record<string, unknown> = { ...payload };
  const data = await httpRequest<BackendUsuario>(USUARIOS_URL, `/api/usuarios/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
  return mapUsuario(data);
}

export async function eliminarUsuario(id: number): Promise<void> {
  await httpRequest(USUARIOS_URL, `/api/usuarios/${id}`, { method: "DELETE" });
}
