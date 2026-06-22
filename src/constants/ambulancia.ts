import type { AmbulanciaEstado } from "../types/api";

export const BODEGA_PATENTE = "BODEGA";

export const ESTADO_DISPONIBLE: AmbulanciaEstado =
  "Lista para un nuevo despacho";

export const ESTADO_COLOR: Record<AmbulanciaEstado, string> = {
  "Lista para un nuevo despacho": "green",
  "Actualmente en despacho": "yellow",
  "Preparación previa para operar": "orange",
  "En mantención": "red",
  "Fuera de servicio temporalmente": "gray",
};

export const ESTADO_LABEL: Record<AmbulanciaEstado, string> = {
  "Lista para un nuevo despacho": "Disponible",
  "Actualmente en despacho": "En despacho",
  "Preparación previa para operar": "En preparación",
  "En mantención": "Mantención",
  "Fuera de servicio temporalmente": "Fuera de servicio",
};

// "En despacho" y "En preparación" los fija el flujo de despachos, no se
// editan a mano. Control solo puede sacar una ambulancia de servicio (o
// devolverla a disponible).
export const ESTADOS_EDITABLES: AmbulanciaEstado[] = [
  ESTADO_DISPONIBLE,
  "En mantención",
  "Fuera de servicio temporalmente",
];
