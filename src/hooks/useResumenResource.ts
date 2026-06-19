import { get } from "../api/client";
import { useResource } from "./useResource";

export interface Resumen {
  id: string;
  titulo: string;
  estado: string;
}

export function useResumenResource(cursor: string): Promise<Resumen> {
  return useResource(`resumen:${cursor}`, (signal) =>
    get<Resumen>(`/api/items/${cursor}/resumen`, signal),
  );
}
