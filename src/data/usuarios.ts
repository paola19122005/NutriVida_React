import { normalizarRut, validarRut } from "../utils/validacion";

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

const STORAGE_KEY = "usuariosNutriVida";

export function inicializarUsuarios(): void {
  if (localStorage.getItem(STORAGE_KEY)) return;
  const iniciales: Usuario[] = [
    { id: 1, run: "111111111", nombre: "Admin", apellidos: "NutriVida", correo: "admin@nutrivida.cl", fechaNacimiento: "", rol: "Administrador", region: "La Araucanía", comuna: "Temuco", direccion: "Av. Vitacura 2900", clave: "Admin1234", activo: true },
    { id: 2, run: "222222222", nombre: "Carolina", apellidos: "Fuentes M.", correo: "nutricionista@nutrivida.cl", fechaNacimiento: "", rol: "Nutricionista", region: "La Araucanía", comuna: "Temuco", direccion: "Av. Vitacura 2900", clave: "Nutri1234", activo: true },
    { id: 3, run: "333333333", nombre: "Maria", apellidos: "Gonzales", correo: "maria@nutrivida.cl", fechaNacimiento: "2000-01-01", rol: "Paciente", region: "La Araucanía", comuna: "Temuco", direccion: "Av. Vitacura 2900", clave: "1234", activo: true },
  ];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(iniciales));
}

export function cargarUsuarios(): Usuario[] {
  const guardados = localStorage.getItem(STORAGE_KEY);
  if (guardados) {
    try {
      const parsed = JSON.parse(guardados) as Usuario[];
      return parsed.map((u) => ({
        ...u,
        run: validarRut(u.run) ? normalizarRut(u.run) : u.run,
        correo: typeof u.correo === "string" ? u.correo.trim() : u.correo,
      }));
    } catch {
      return [];
    }
  }
  return [];
}

export function guardarUsuarios(usuarios: Usuario[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(usuarios));
}

export function obtenerSesion(): Usuario | null {
  const raw = localStorage.getItem("usuarioSesion");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Usuario;
  } catch {
    return null;
  }
}

export function guardarSesion(usuario: Usuario): void {
  localStorage.setItem("usuarioSesion", JSON.stringify(usuario));
}

export function cerrarSesion(): void {
  localStorage.removeItem("usuarioSesion");
}
