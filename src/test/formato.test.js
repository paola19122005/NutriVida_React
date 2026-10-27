import { describe, it, expect } from "vitest";
import { dinero } from "../utils/formato";

describe("formato", () => {
    it("formatea un número como moneda CLP", () => {
        expect(dinero(18000)).toContain("18.000");
    });

    it("formatea cero correctamente", () => {
        expect(dinero(0)).toContain("0");
    });
});
