import { get, patch, post } from "./client";
import type { AddInventarioItem, InventarioRow } from "../types/api";

export function getInventario(): Promise<InventarioRow[]> {
  return get<InventarioRow[]>("/ims/api/inv/");
}

export function addInventario(items: AddInventarioItem[]): Promise<unknown> {
  return post("/ims/api/inv/add/", { items });
}

export function updateInventario(data: {
  presentacion_id: number;
  ambulancia_id: number;
  cantidad: number;
}): Promise<unknown> {
  return patch("/ims/api/inv/update/", data);
}

export function moveInventario(data: {
  presentacion_id: number;
  ambulancia_from_id: number;
  ambulancia_to_id: number;
  cantidad: number;
}): Promise<unknown> {
  return patch("/ims/api/inv/move/", data);
}
