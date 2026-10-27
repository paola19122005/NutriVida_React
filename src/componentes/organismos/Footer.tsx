export default function Footer(){
    return (
        <footer>
            <div className="container footer-grid">
                <div>
                    <strong>Clínica NutriVida</strong>
                    <p className="muted">Asesoría nutricional personalizada para tu bienestar integral.</p>
                </div>
                <div>
                    <strong>Contacto</strong>
                    <p className="muted">
                        Av.Vitacura 2900, Las Condes 
                        <br/>
                        +56 9 1234 5678
                        <br/>
                        contacto@nutrivida.cl
                    </p>
                </div>
                <div>
                    <strong>Horario</strong>
                    <p className="muted">
                        Lun a Vie: 09:00 - 18:00
                        <br/>
                        Sáb: 09:00 - 14:00
                    </p>
                </div>
            </div>
            <div className="footer-bottom">Copyright © Clínica NutriVida.</div>
        </footer>
    );
}