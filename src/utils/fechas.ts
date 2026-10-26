export function fechaISO(date: Date = new Date()): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

export function parseFechaISO(iso: string): Date {
    const partes = iso.split("-").map(Number);
    if (partes.length !== 3 || partes.some((n) => Number.isNaN(n))) {
        return new Date();
    }
    const [y, m, d] = partes;
    return new Date(y, m - 1, d);
}

export function fechaPasada(iso: string): boolean {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const f = parseFechaISO(iso);
  f.setHours(0, 0, 0, 0);
  return f.getTime() < hoy.getTime();
}

export function formatearFecha(iso: string): string {
  const f = parseFechaISO(iso);
  const d = String(f.getDate()).padStart(2, "0");
  const m = String(f.getMonth() + 1).padStart(2, "0");
  const y = f.getFullYear();
  return `${d}/${m}/${y}`;
}

export function addMonths(date: Date, months: number): Date {
  const y = date.getFullYear();
  const m = date.getMonth() + months;
  const targetYear = y + Math.floor(m / 12);
  const targetMonth = ((m % 12) + 12) % 12;
  const lastDay = new Date(targetYear, targetMonth + 1, 0).getDate();
  const day = Math.min(date.getDate(), lastDay);
  return new Date(targetYear, targetMonth, day);
}

export function estadoTaller(fechaISOStr: string): "Por cursar" | "Cursado" {
  return fechaPasada(fechaISOStr) ? "Cursado" : "Por cursar";
}

export function estadoPlan(fechaInicioISO: string, meses: number): "Por iniciar" | "En proceso" | "Terminado" {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const inicio = parseFechaISO(fechaInicioISO);
  inicio.setHours(0, 0, 0, 0);
  if (hoy.getTime() < inicio.getTime()) return "Por iniciar";
  const fin = addMonths(inicio, meses);
  fin.setHours(0, 0, 0, 0);
  if (hoy.getTime() >= fin.getTime()) return "Terminado";
  return "En proceso";
}

export function mesesPlan(nombre: string, duracion: string): number {
  const texto = `${nombre} ${duracion}`;
  const match = texto.match(/(\d+)\s*mes/i);
  if (match) return Number(match[1]);
  return 1;
}