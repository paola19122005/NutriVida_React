export interface SolicitudEnvioRespuestaContacto {
  mensajeId: number;
  destinatario: string;
  asunto: string;
  contenido: string;
  fecha: string;
}

export interface ResultadoEnvioRespuestaContacto {
  ok: boolean;
  modo: "local";
  enviado: false;
  detalle: string;
  contratoFuturo: {
    metodo: "POST";
    ruta: string;
    cuerpo: SolicitudEnvioRespuestaContacto;
  };
}

export async function enviarRespuestaContacto(solicitud: SolicitudEnvioRespuestaContacto): Promise<ResultadoEnvioRespuestaContacto> {
  // Contrato preparado para futura integración con el microservicio de contacto.
  // Mientras no exista integración real, solo se registra localmente y no se envía correo.
  return {
    ok: true,
    modo: "local",
    enviado: false,
    detalle: "Respuesta registrada localmente. Envío de correo pendiente de integración con microservicio.",
    contratoFuturo: {
      metodo: "POST",
      ruta: `/api/contacto/mensajes/${solicitud.mensajeId}/respuestas`,
      cuerpo: solicitud,
    },
  };
}