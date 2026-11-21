import { useState } from "react";
import { fechaISO, fechaPasada } from "../../utils/fechas";

interface SelectorFechaProps {
  onConfirmar: (fecha: string) => void;
  onCancelar: () => void;
}

export default function SelectorFecha({ onConfirmar, onCancelar }: SelectorFechaProps) {
  const [fecha, setFecha] = useState("");

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        className="info-box"
        style={{ width: "320px", maxWidth: "90vw" }}
      >
        <h3 style={{ marginBottom: "12px" }}>Selecciona la fecha</h3>
        <div className="form-group">
          <label htmlFor="fechaServicio">Fecha del servicio</label>
          <input
            id="fechaServicio"
            type="date"
            min={fechaISO()}
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
          />
          {fecha && fechaPasada(fecha) ? <span className="error">No se permiten fechas anteriores al día actual.</span> : null}
        </div>
        <div className="actions" style={{ marginTop: "12px" }}>
          <button
            className="btn btn-primary"
            type="button"
            onClick={() => {
              if (!fecha || fechaPasada(fecha)) return;
              onConfirmar(fecha);
            }}
            disabled={!fecha || fechaPasada(fecha)}
          >
            Agregar
          </button>
          <button className="btn btn-outline" type="button" onClick={onCancelar}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}