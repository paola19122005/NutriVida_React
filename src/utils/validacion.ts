export const LIMITE_NOMBRE = 100;
export const LIMITE_APELLIDOS = 100;
export const LIMITE_CORREO = 100;
export const LIMITE_COMENTARIO = 500;
export const LIMITE_DIRECCION = 300;

export function validarCorreo(correo: string): boolean {
    const valor = correo.trim();
    if(!valor || valor.length > LIMITE_CORREO) return false;
    if(/\s/.test(valor)) return false;
    if(/\.\./.test(valor)) return false;

    const partes = valor.split("@");
    if (partes.length !== 2) return false;
    const [local, dominio] = partes;
    if (!local || !dominio) return false;
    if (local.length > 64) return false;
    if (local.startsWith(".") || local.endsWith(".")) return false;
    
    if(dominio.startsWith(".") || dominio.endsWith(".") || dominio.includes("..")) return false;
    const etiquetas = dominio.split(".");
    if (etiquetas.length < 2) return false;
    if (etiquetas.some((etiqueta) => !etiqueta || !/^[A-Za-z0-9-]+$/.test(etiqueta) || etiqueta.startsWith("-") || etiqueta.endsWith("-"))) {
        return false;
    }

    const extension = etiquetas[etiquetas.length - 1];
    if (extension.length < 2 || !/^[A-Za-z]{2,}$/.test(extension)) return false;

    const regex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    return regex.test(valor);
}

export function normalizarRut(rut: string): string {
  const limpio = rut.replace(/\./g, "").replace(/\s+/g, "").toUpperCase();
  if (limpio.includes("-")) return limpio;
  if (/^\d{7,8}[0-9K]$/.test(limpio)) {
    return limpio.slice(0, -1) + "-" + limpio.slice(-1);
  }
  return limpio;
}

export function validarRut(rut: string): boolean {
  const normalizado = normalizarRut(rut);
  if (!/^\d{7,8}-[0-9K]$/.test(normalizado)) return false;
  const sinGuion = normalizado.replace("-", "");
  return validarRun(sinGuion);
}

export function validarRun(run: string): boolean {
  if (!/^\d{7,8}[0-9kK]$/.test(run)) return false;
  const cuerpo = run.slice(0, -1);
  const dv = run.slice(-1).toUpperCase();
  let suma = 0;
  let mul = 2;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += Number(cuerpo[i]) * mul;
    mul = mul === 7 ? 2 : mul + 1;
  }
  const resto = 11 - (suma % 11);
  const esperado = resto === 11 ? "0" : resto === 10 ? "K" : String(resto);
  return esperado === dv;
}