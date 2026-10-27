import { describe, it, expect } from "vitest";
import {estadoPlan, fechaPasada, formatearFecha, mesesPlan} from "../utils/fechas";

describe("fechas", () => {
    it("calcula Por iniciar antes de la fecha de inicio", () => {
        expect(estadoPlan("2026-12-01", 1)).toBe("Por iniciar");
    });

    it("calcula En proceso dentro de la duración", () => {
        expect(estadoPlan("2026-10-01", 1)).toBe("En proceso");
    });

    it("calcula Terminado al cumplir la duración", () => {
        expect(estadoPlan("2025-01-01", 1)).toBe("Terminado");
    });

    it("extrae meses del nombre del plan", () => {
        expect(mesesPlan("Plan pérdida de peso (3 meses)", "-")).toBe(3);
        expect(mesesPlan("Plan pérdida de peso (1 mes", "-")).toBe(1);
    });

    it("formatea fechas ISO a DD/MM/YYYY", () => {
        expect(formatearFecha("2026-10-22")).toBe("22/10/2026");
    });
});
