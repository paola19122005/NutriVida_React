export interface PagoPaciente {
  id: number;
  pacienteId: number;
  servicioIds: string[];
  servicios: string[];
  fecha: string;
  monto: number;
  metodoPago: string;
  numeroTransaccion?: string;
  comprobante?: string;
  estado: "Pagado" | "Pendiente";
}

const KEY = "pagosPacienteNutriVida";

export function cargarPagosPaciente(): PagoPaciente[] {
  const raw = localStorage.getItem(KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function guardarPagosPaciente(pagos: PagoPaciente[]): void {
  localStorage.setItem(KEY, JSON.stringify(pagos));
}

export function agregarPagoPaciente(pago: Omit<PagoPaciente, "id">): PagoPaciente {
  const lista = cargarPagosPaciente();
  const nuevo: PagoPaciente = { id: Date.now(), ...pago };
  lista.push(nuevo);
  guardarPagosPaciente(lista);
  return nuevo;
}

export function actualizarEstadoPagoServicioPaciente(): void {}

// Aliases de compatibilidad
export const cargarPagos = cargarPagosPaciente;
export const guardarPagos = guardarPagosPaciente;
export const agregarPago = agregarPagoPaciente;
export const cargarHistorialPagos = cargarPagosPaciente;
export const guardarHistorialPagos = guardarPagosPaciente;
