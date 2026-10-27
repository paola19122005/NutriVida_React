import FormRegistro from "../componentes/organismos/FormRegistro";

export default function Registro() {
    return (
        <main>
            <section className="page-title">
                <div className="container">
                    <h1>Registro de usuario</h1>
                    <p>Completa tus datos para crear una cuenta.</p>
                </div>
            </section>
            <section className="section">
                <div className="container">
                    <FormRegistro/>
                </div>
            </section>
        </main>
    );
}