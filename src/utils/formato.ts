export function dinero(valor: number): string {
    return "$" + Number(valor).toLocaleString("es-CL") + "CLP";
}