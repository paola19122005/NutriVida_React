import FormContacto from "../componentes/organismos/FormContacto";

export default function Contacto(){
    return (
        <main>
            <section className="page-title">
                <div className="container">
                    <h1>Contacto</h1>
                    <p>Envíanos tu consulta.</p>
                </div>
            </section>
            <section className="section">
                <div className="container grid-2">
                    <FormContacto/>
                    <div className="info-box">
                        <h2>Información</h2>
                        <p><strong>Dirección:</strong> Av. Viatcura 2900, Las Condes </p>
                        <p><strong>Teléfono:</strong> +56 9 1234 5678</p>
                        <p><strong>Correo:</strong> Contacto@nutrivida.cl </p>
                        <p><strong>Horario:</strong> Lun a Vie 09:00 - 18:00</p>
                    </div>
                </div>
            </section>
        </main>
    );
}