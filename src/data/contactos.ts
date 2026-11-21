export interface RespuestaContacto {
  id: number;
  fecha: string;
  autor: string;
  destinatario: string;
  contenido: string;
  estadoEnvio: "Simulado" | "Pendiente" | "Enviado";
}

export interface MensajeContacto {
  id: number;
  remitente: string;
  correo: string;
  asunto: string;
  contenido: string;
  fecha: string;
  estado: "Pendiente" | "Revisado";
  respuestas: RespuestaContacto[];
}

const KEY = "mensajesContactoNutriVida";

export function cargarMensajesContacto(): MensajeContacto[] {
  const raw = localStorage.getItem(KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((m) => ({
      ...m,
      respuestas: Array.isArray(m?.respuestas) ? m.respuestas : [],
    }));
  } catch {
    return [];
  }
}

export function guardarMensajesContacto(mensajes: MensajeContacto[]): void {
  localStorage.setItem(KEY, JSON.stringify(mensajes));
}

export function agregarMensajeContacto(mensaje: Omit<MensajeContacto, "id" | "fecha" | "estado" | "respuestas"> & Partial<Pick<MensajeContacto, "fecha" | "estado" | "respuestas">>): MensajeContacto {
  const lista = cargarMensajesContacto();
  const nuevo: MensajeContacto = {
    id: Date.now(),
    remitente: mensaje.remitente,
    correo: mensaje.correo,
    asunto: mensaje.asunto || "Sin asunto",
    contenido: mensaje.contenido,
    fecha: mensaje.fecha || new Date().toISOString(),
    estado: mensaje.estado || "Pendiente",
    respuestas: [],
  };
  lista.push(nuevo);
  guardarMensajesContacto(lista);
  return nuevo;
}

export function marcarMensajeContacto(id: number, estado: "Pendiente" | "Revisado"): void {
  const lista = cargarMensajesContacto();
  const idx = lista.findIndex((m) => m.id === id);
  if (idx < 0) return;
  // Solo se permite la transición Pendiente -> Revisado.
  if (estado !== "Revisado") return;
  lista[idx].estado = "Revisado";
  guardarMensajesContacto(lista);
}

export function agregarRespuestaContacto(mensajeId: number, contenido: string, autor = "Administrador NutriVida"): RespuestaContacto | null {
  const lista = cargarMensajesContacto();
  const idx = lista.findIndex((m) => m.id === mensajeId);
  if (idx < 0) return null;
  if (lista[idx].respuestas.length > 0) return null;
  const respuesta: RespuestaContacto = {
    id: Date.now(),
    fecha: new Date().toISOString(),
    autor,
    destinatario: lista[idx].correo,
    contenido: contenido.trim(),
    estadoEnvio: "Simulado",
  };
  lista[idx].respuestas = [...lista[idx].respuestas, respuesta];
  guardarMensajesContacto(lista);
  return respuesta;
}

// Aliases de compatibilidad
export const cargarMensajes = cargarMensajesContacto;
export const guardarMensajes = guardarMensajesContacto;
export const cargarContactos = cargarMensajesContacto;
export const guardarContactos = guardarMensajesContacto;
export const marcarMensajeRevisado = (id: number) => marcarMensajeContacto(id, "Revisado");
