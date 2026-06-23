import { get, patch } from "./client";
import type { Ambulancia, AmbulanciaEstado } from "../types/api";

export function getAmbulancias(): Promise<Ambulancia[]> {
  return get<Ambulancia[]>("/ims/api/ambulancias/");
}

// El endpoint lee request.query_params (no JSON body), ver
// toolbox/Ambulancia_package/cambiar_estado.py en el backend.
export function cambiarEstadoAmbulancia(
  ambid: number,
  estado: AmbulanciaEstado,
): Promise<unknown> {
  const qs = new URLSearchParams({ ambid: String(ambid), estado });
  return patch(`/ims/api/ambulancias/estados/?${qs}`);
}

export function getAmbulancia(ambulanciaId: number): Promise<Ambulancia[]> {
  return get<Ambulancia[]>(
    `/ims/api/ambulancias/?ambulancia_id=${ambulanciaId}`,
  );
}
