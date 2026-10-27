import { useState } from "react";
import { Link } from "react-router-dom";
import { cargarProductos } from "../data/productos";
import { dinero } from "../utils/formato";
import { obtenerLista, marcarServiciosPagados, obtenerEstadoServicio } from "../utils/lista";
import { Toast } from "../utils/toast";
import CampoFormulario from "../componentes/moleculas/CampoFormulario";

export default function Pago() {
  const [ids] = useState<string[]>(obtenerLista());
  const productos = cargarProductos();
  const seleccionados = ids
    .map((id) => productos.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  const pendientes = seleccionados.filter((p) => obtenerEstadoServicio(p.id) !== "Pagado");
  const total = pendientes.reduce((acc, p) => acc + p.precio, 0);

  const [titular, setTitular] = useState("");
  const [numeroTarjeta, setNumeroTarjeta] = useState("");
  const [vencimiento, setVencimiento] = useState("");
  const [cvv, setCvv] = useState("");

  const [errores, setErrores] = useState<{
    titular?: string;
    numeroTarjeta?: string;
    vencimiento?: string;
    cvv?: string;
  }>({});
  const [procesando, setProcesando] = useState(false);
  const [exito, setExito] = useState(false);
  const [toast, setToast] = useState(false);

  const validar = () => {
    const nuevos: typeof errores = {};
    let ok = true;

    if (!titular.trim()) {
      nuevos.titular = "El nombre del titular es obligatorio.";
      ok = false;
    } else if (titular.trim().length < 3) {
      nuevos.titular = "Ingresa un nombre válido.";
      ok = false;
    }

    const numeroLimpio = numeroTarjeta.replace(/\s+/g, "");
    if (!numeroLimpio) {
      nuevos.numeroTarjeta = "El número de tarjeta es obligatorio.";
      ok = false;
    } else if (!/^\d{13,19}$/.test(numeroLimpio)) {
      nuevos.numeroTarjeta = "Ingresa un número de tarjeta válido.";
      ok = false;
    }

    if (!vencimiento.trim()) {
      nuevos.vencimiento = "La fecha de vencimiento es obligatoria.";
      ok = false;
    } else if (!/^(0[1-9]|1[0-2])\/(\d{2}|\d{4})$/.test(vencimiento.trim())) {
      nuevos.vencimiento = "Formato válido: MM/AA.";
      ok = false;
    }

    if (!cvv.trim()) {
      nuevos.cvv = "El código de seguridad es obligatorio.";
      ok = false;
    } else if (!/^\d{3,4}$/.test(cvv.trim())) {
      nuevos.cvv = "Ingresa un CVV válido.";
      ok = false;
    }

    setErrores(nuevos);
    return ok;
  };

  const pagar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validar()) return;
    if (pendientes.length === 0) return;
    marcarServiciosPagados(pendientes.map((p) => p.id));
    setProcesando(true);
    window.setTimeout(() => {
      setProcesando(false);
      setExito(true);
      setToast(true);
    }, 500);
  };

  return (
    <main>
      <section className="page-title">
        <div className="container">
          <h1>Pago del servicio</h1>
          <p>Completa los datos para simular el pago.</p>
        </div>
      </section>
      <section className="section">
        <div className="container grid-2">
          <div>
            <h2>Resumen de servicios</h2>
            {pendientes.length === 0 ? (
              <div className="empty">No hay servicios pendientes de pago.</div>
            ) : (
              <div className="grid-3">
                {pendientes.map((p) => (
                  <article className="card" key={p.id}>
                    <div className="card-body">
                      <h3>{p.nombre}</h3>
                      <p className="muted">{p.tipo} · {p.modalidad}</p>
                      <p className="price">{dinero(p.precio)}</p>
                      <p className="muted">Estado: {obtenerEstadoServicio(p.id)}</p>
                    </div>
                  </article>
                ))}
              </div>
            )}
            <div className="info-box" style={{ marginTop: "20px" }}>
              <h2>Total a pagar: <span id="totalPago"><span id="total">{dinero(total)}</span></span></h2>
            </div>
          </div>

          <div>
            {exito ? (
              <div className="info-box">
                <p className="success" style={{ fontSize: "1.2rem" }}>¡Pago realizado con éxito!</p>
                <div style={{ marginTop: "16px" }}>
                  <Link className="btn btn-primary" to="/lista">Volver a la lista</Link>
                </div>
              </div>
            ) : (
              <form onSubmit={pagar} noValidate>
                <div className="form-grid">
                  <div className="form-group full">
                    <CampoFormulario
                      etiqueta="Nombre del titular de la tarjeta"
                      nombre="titular"
                      tipo="text"
                      valor={titular}
                      alCambiar={setTitular}
                      error={errores.titular}
                      maxLength={100}
                      autoComplete="cc-name"
                    />
                  </div>
                  <div className="form-group full">
                    <CampoFormulario
                      etiqueta="Número de tarjeta"
                      nombre="numeroTarjeta"
                      tipo="text"
                      valor={numeroTarjeta}
                      alCambiar={setNumeroTarjeta}
                      error={errores.numeroTarjeta}
                      maxLength={19}
                      placeholder="1234 5678 9012 3456"
                      autoComplete="cc-number"
                    />
                  </div>
                  <div className="form-group">
                    <CampoFormulario
                      etiqueta="Fecha de vencimiento"
                      nombre="vencimiento"
                      tipo="text"
                      valor={vencimiento}
                      alCambiar={setVencimiento}
                      error={errores.vencimiento}
                      maxLength={7}
                      placeholder="MM/AA"
                      autoComplete="cc-exp"
                    />
                  </div>
                  <div className="form-group">
                    <CampoFormulario
                      etiqueta="Código de seguridad (CVV)"
                      nombre="cvv"
                      tipo="password"
                      valor={cvv}
                      alCambiar={setCvv}
                      error={errores.cvv}
                      maxLength={4}
                      placeholder="123"
                      autoComplete="cc-csc"
                    />
                  </div>
                  <div className="full">
                    <button className="btn btn-primary" type="submit" disabled={procesando || pendientes.length === 0}>
                      {procesando ? "Procesando..." : "Pagar"}
                    </button>
                    {pendientes.length === 0 && seleccionados.length > 0 ? (
                      <p className="hint">No hay servicios pendientes de pago.</p>
                    ) : null}
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
      <Toast mensaje="¡Pago realizado con éxito!" visible={toast} onCerrar={() => setToast(false)} />
    </main>
  );
}