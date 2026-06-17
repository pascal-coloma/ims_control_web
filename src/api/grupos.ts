import { get, patch, post } from "./client";
import type { Grupo } from "../types/api";

export function getGrupos(): Promise<Grupo[]> {
  return get<Grupo[]>("/ims/api/grupo/");
}

export function toGrupoOptions(grupos: Grupo[]) {
  return grupos.map((g) => ({
    value: String(g.grupo_id),
    label: `${g.grupo_nombre} (${g.miembros.length} miembros)`,
  }));
}

export function getGrupo(groupId: number): Promise<Grupo[]> {
  return get<Grupo[]>(`/ims/api/grupo/?group_id=${groupId}`);
}

export function crearGrupo(data: {
  nombre_grupo: string;
  personal: number[];
}): Promise<{ success: string; group_id: number }> {
  return post<{ success: string; group_id: number }>(
    "/ims/api/grupo/crear/",
    data,
  );
}

export function suscribir(data: {
  grupo_id: number;
  personal_id: number;
}): Promise<{ success: string }> {
  return post<{ success: string }>("/ims/api/grupo/suscribir/", data);
}

export function desuscribir(data: {
  group_id: number;
  personal_id: number;
}): Promise<{ success: string }> {
  return patch<{ success: string }>("/ims/api/grupo/desuscribir/", data);
}
