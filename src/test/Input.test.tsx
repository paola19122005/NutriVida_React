import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Input from "./Input";

describe("Input", () => {
  it("renderiza con props tipadas y valor", () => {
    render(<Input nombre="correo" valor="a@b.cl" alCambiar={() => {}} placeholder="correo" maxLength={10} minLength={3} required autoComplete="email" />);
    const input = screen.getByRole("textbox") as HTMLInputElement;
    expect(input.value).toBe("a@b.cl");
    expect(input.name).toBe("correo");
    expect(input.id).toBe("correo");
    expect(input.placeholder).toBe("correo");
    expect(input.required).toBe(true);
    expect(input.maxLength).toBe(10);
    expect(input.minLength).toBe(3);
    expect(input.autocomplete).toBe("email");
  });

  it("llama alCambiar al escribir", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Input nombre="nombre" valor="" alCambiar={onChange} />);
    await user.type(screen.getByRole("textbox"), "abc");
    expect(onChange).toHaveBeenCalled();
    expect(onChange).toHaveBeenLastCalledWith("c");
  });

  it("soporta tipo password", () => {
    render(<Input tipo="password" nombre="clave" valor="1234" alCambiar={() => {}} />);
    const input = screen.getByDisplayValue("1234") as HTMLInputElement; expect(input.getAttribute("type")).toBe("password");
  });
});

