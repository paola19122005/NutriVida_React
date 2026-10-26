const KEY = "listaSeleccion";
const ESTADOS_KEY = "estadosServicios";
const PAGADOS_KEY = "serviciosPagados";

export type EstadoServicio = "Pendiente" | "Pagado";

export interface ItemLista {
  id: string;
  fecha: string;
}

function hoyISO(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function normalizarItems(raw: string | null): ItemLista[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const resultado: ItemLista[] = [];
    const vistos = new Set<string>();
    parsed.forEach((x) => {
      const id = typeof x === "string" ? x : (x && typeof x.id === "string" ? x.id : null);
      if (!id || vistos.has(id)) return;
      vistos.add(id);
      const fecha = typeof x === "string" ? hoyISO() : (typeof x?.fecha === "string" && x.fecha ? x.fecha : hoyISO());
      resultado.push({ id, fecha });
    });
    return resultado;
  } catch {
    return [];
  }
}

export function obtenerItemsLista(): ItemLista[] {
  return normalizarItems(localStorage.getItem(KEY));
}

export function guardarItemsLista(items: ItemLista[]): void {
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function obtenerLista(): string[] {
  return obtenerItemsLista().map((item) => item.id);
}

export function guardarLista(ids: string[]): void {
  const actuales = obtenerItemsLista();
  const items = ids.map((id) => {
    const existente = actuales.find((item) => item.id === id);
    return existente ?? { id, fecha: hoyISO() };
  });
  guardarItemsLista(items);
}

export function obtenerFechaServicio(id: string): string | undefined {
  return obtenerItemsLista().find((item) => item.id === id)?.fecha;
}

export function obtenerEstados(): Record<string, EstadoServicio> {
  const raw = localStorage.getItem(ESTADOS_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, EstadoServicio>;
  } catch {
    return {};
  }
}

export function guardarEstados(estados: Record<string, EstadoServicio>): void {
  localStorage.setItem(ESTADOS_KEY, JSON.stringify(estados));
}

export function obtenerEstadoServicio(id: string): EstadoServicio {
  return obtenerEstados()[id] ?? "Pendiente";
}

export function obtenerServiciosPagados(): string[] {
  const raw = localStorage.getItem(PAGADOS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function marcarServiciosPagados(ids: string[]): void {
  const estados = obtenerEstados();
  const pagados = new Set(obtenerServiciosPagados());
  ids.forEach((id) => {
    if (!id) return;
    estados[id] = "Pagado";
    pagados.add(id);
  });
  guardarEstados(estados);
  localStorage.setItem(PAGADOS_KEY, JSON.stringify([...pagados]));
}

export function agregarLista(id: string, fecha?: string): void {
  const items = obtenerItemsLista();
  if (!items.some((item) => item.id === id)) {
    items.push({ id, fecha: fecha && fecha.trim() ? fecha.trim() : hoyISO() });
    guardarItemsLista(items);
  }
  const estados = obtenerEstados();
  if (!Object.prototype.hasOwnProperty.call(estados, id)) {
    estados[id] = "Pendiente";
    guardarEstados(estados);
  }
}

export function quitarLista(id: string): void {
  guardarItemsLista(obtenerItemsLista().filter((item) => item.id !== id));
}