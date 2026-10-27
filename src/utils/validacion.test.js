import { describe, it, expect } from "vitest";
import { validarRut } from "./validacion";

describe("validarRut", () => {
  it("acepta un RUT válido sin formato", () => {
    expect(validarRut("11111111-1")).toBe(true);
  });

  it("acepta un RUT válido con puntos y guion", () => {
    expect(validarRut("11.111.111-1")).toBe(true);
  });

  it("acepta un RUT válido que termina en K", () => {
    expect(validarRut("1000005-K")).toBe(true);
    expect(validarRut("1000005-k")).toBe(true);
  });

  it("rechaza un RUT con dígito verificador incorrecto", () => {
    expect(validarRut("11111111-2")).toBe(false);
  });

  it("rechaza un RUT incompleto o mal formado", () => {
    expect(validarRut("123")).toBe(false);
    expect(validarRut("")).toBe(false);
    expect(validarRut("12345678")).toBe(false);
  });
});