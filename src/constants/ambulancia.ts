import type { AmbulanciaEstado } from "../types/api";

export const BODEGA_PATENTE = "BODEGA";

export const ESTADO_COLOR: Record<AmbulanciaEstado, string> = {
  disponible: "green",
  en_despacho: "yellow",
  mantencion: "red",
  fuera_servicio: "gray",
};
