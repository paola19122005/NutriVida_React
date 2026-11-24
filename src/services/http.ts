
export const USUARIOS_URL =
  (import.meta as { env?: Record<string, string> }).env?.VITE_USUARIOS_URL ||
  "http://localhost:8091";

export const CATALOGO_URL =
  (import.meta as { env?: Record<string, string> }).env?.VITE_CATALOGO_URL ||
  "http://localhost:8092";

export const ATENCION_URL =
  (import.meta as { env?: Record<string, string> }).env?.VITE_ATENCION_URL ||
  "http://localhost:8093";

export const PAGOS_URL =
  (import.meta as { env?: Record<string, string> }).env?.VITE_PAGOS_URL ||
  "http://localhost:8094";

export const CONTACTO_URL =
  (import.meta as { env?: Record<string, string> }).env?.VITE_CONTACTO_URL ||
  "http://localhost:8095";

export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
}

export async function httpRequest<T>(
  base: string,
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(base + path, {
    credentials: "include",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    let mensaje = res.statusText || "Error en la solicitud";

    try {
      const texto = await res.text();
      if (texto) mensaje = texto;
    } catch {
      // Se conserva el mensaje original si no se puede leer la respuesta.
    }

    throw new HttpError(res.status, mensaje);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const texto = await res.text();

  if (!texto) {
    return undefined as T;
  }

  try {
    return JSON.parse(texto) as T;
  } catch {
    return texto as unknown as T;
  }
}
