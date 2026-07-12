import { Solicitud } from "@/models/Solicitud";

declare global {
  var solicitudes: Solicitud[] | undefined;
}

if (!global.solicitudes) {
  global.solicitudes = [];
}

export const solicitudes = global.solicitudes;