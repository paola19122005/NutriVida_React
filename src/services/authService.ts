
import { httpRequest, HttpError, USUARIOS_URL } from "./http";

export interface BackendUsuario {
  id: number;
  run: string;
  nombre: string;
  apellidos: string;
  correo: string;
  fechaNacimiento: string;
  rol: string;
  region: string;
  comuna: string;
  direccion: string;
  activo: boolean;
}

export interface Usuario {
  id: number;
  run: string;
  nombre: string;
  apellidos: string;
  correo: string;
  fechaNacimiento: string;
  rol: string;
  region: string;
  comuna: string;
  direccion: string;
  clave: string;
  activo: boolean;
}

export function mapUsuario(u: BackendUsuario): Usuario {
  return {
    id: u.id,
    run: u.run,
    nombre: u.nombre,
    apellidos: u.apellidos,
    correo: u.correo,
    fechaNacimiento: u.fechaNacimiento ?? "",
    rol: u.rol,
    region: u.region ?? "",
    comuna: u.comuna ?? "",
    direccion: u.direccion ?? "",
    clave: "",
    activo: u.activo ?? true,
  };
}

export async function registerUsuario(payload: {
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
}): Promise<BackendUsuario> {
  const res = await httpRequest<{
    mensaje: string;
    usuario: BackendUsuario;
  }>(USUARIOS_URL, "/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return res.usuario;
}

export async function loginUsuario(
  correo: string,
  clave: string
): Promise<BackendUsuario> {
  const res = await httpRequest<{
    mensaje: string;
    usuario: BackendUsuario;
  }>(USUARIOS_URL, "/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ correo, clave }),
  });

  return res.usuario;
}

export async function logoutUsuario(): Promise<void> {
  await httpRequest(USUARIOS_URL, "/api/auth/logout", {
    method: "POST",
  });
}

export async function obtenerUsuarioActual(): Promise<{
  user: BackendUsuario | null;
  unauthorized: boolean;
  networkError: boolean;
}> {
  try {
    const user = await httpRequest<BackendUsuario>(
      USUARIOS_URL,
      "/api/auth/me",
      { method: "GET" }
    );

    return {
      user,
      unauthorized: false,
      networkError: false,
    };
  } catch (e: unknown) {
    if (e instanceof HttpError && e.status === 401) {
      return {
        user: null,
        unauthorized: true,
        networkError: false,
      };
    }

    return {
      user: null,
      unauthorized: false,
      networkError: true,
    };
  }
}
