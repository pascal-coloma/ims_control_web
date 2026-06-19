import { get } from "../api/client";
import { useResource } from "./useResource";

export interface Detalle {
  id: string;
  campos: Record<string, string>;
  historial: { fecha: string; nota: string }[];
}

export function useDetalleResource(cursor: string): Promise<Detalle> {
  return useResource(`detalle:${cursor}`, (signal) =>
    get<Detalle>(`/api/items/${cursor}/detalle`, signal),
  );
}
