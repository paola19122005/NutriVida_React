import Input from "../atomos/Input";

interface CampoFormularioProps {
    etiqueta: string;
    tipo?: string;
    nombre: string;
    valor: string;
    alCambiar: (valor: string) => void;
    error?: string;
    placeholder?: string;
    maxLength?: number;
    minLength?: number;
    required?: boolean;
    autoComplete?: string;
    hint?: string;
    style?: React.CSSProperties;
}

export default function CampoFromulario({etiqueta, tipo, nombre, valor, alCambiar, error, placeholder, maxLength, minLength, required, autoComplete, hint, style}: CampoFormularioProps) {
    return (
        <div className="form-group">
            <label htmlFor={nombre}>{etiqueta}</label>
            <Input
            tipo={tipo}
            nombre={nombre}
            valor={valor}
            alCambiar={alCambiar}
            placeholder={placeholder}
            maxLength={maxLength}
            minLength={minLength}
            required={required}
            autoComplete={autoComplete}
            style={{borderColor:error ? "#c0392b":undefined, ...style}}
            />
            {hint ? <span className="hint">{hint}</span>:null}
            <span className="error">{error??""}</span>
        </div>
    );
}