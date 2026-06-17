import type { EstadoSello } from "../../types/api";

export const SELLO_COLOR: Record<EstadoSello, string> = {
  Pendiente: "yellow",
  Firmado: "green",
};
