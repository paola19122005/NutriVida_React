interface InputProps{
    tipo?: string;
    nombre: string;
    valor: string;
    alCambiar: (valor: string) => void;
    placeholder?: string;
    maxLength?: number;
    minLength?: number;
    required?: boolean;
    autoComplete?: string;
    style?: React.CSSProperties;
}

export default function Input({tipo = "text", nombre, valor, alCambiar, placeholder, maxLength, minLength, required, autoComplete, style}: InputProps){
    return (
        <input
        type={tipo}
        name={nombre}
        id={nombre}
        value={valor}
        placeholder={placeholder}
        maxLength={maxLength}
        minLength={minLength}
        required={required}
        autoComplete={autoComplete}
        style={style}
        onChange={(e) => alCambiar(e.target.value)}
        />
    );
}