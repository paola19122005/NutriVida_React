import FormLogin from "../componentes/organismos/FormLogin";

export default function Login(){
    return (
        <main>
            <section className="auth-wrap">
                <div className="container">
                    <div className="auth-card">
                        <FormLogin/>
                    </div>
                </div>
            </section>
        </main>
    );
}