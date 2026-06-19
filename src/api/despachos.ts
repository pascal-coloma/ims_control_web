import { get, patch, post } from "./client";
import type {
  AddDespachoResponse,
  AsignarDespachoResponse,
  CursorPage,
  Despacho,
} from "../types/api";

function cursorFromUrl(url: string | null): string | null {
  return url ? new URL(url).searchParams.get("cursor") : null;
}

const ESTADOS_ACTIVOS = new Set([
  "recibido",
  "asignado",
  "programado",
  "emergencia",
]);
// El backend ordena por -id (más nuevo primero) y no filtra estado, así que
// en teoría los activos quedan cerca del tope — pero en la práctica aparecen
// dispersos por toda la tabla, así que ese corte temprano no basta solo.
const PAGINAS_SIN_ACTIVOS_LIMITE = 3;
// Techo duro: sin esto, una tabla con miles de despachos históricos termina
// paginando cientos de requests secuenciales (page_size tope en 10 desde el
// backend, no se puede subir ni paralelizar por ser cursor-based). Un
// despacho activo más allá de este límite simplemente no aparecerá en el
// board hasta que el backend filtre por estado en el queryset.
const MAX_PAGINAS = 10;

// GET /api/despachos/all/ es paginado por cursor (10 por página, fijo en el
// backend). El board necesita el set completo para repartirlo en columnas,
// así que recorremos páginas acá adentro y exponemos un array plano.
export async function getDespachos(): Promise<Despacho[]> {
  const all: Despacho[] = [];
  let cursor: string | null = null;
  let paginasSinActivos = 0;
  let paginas = 0;
  do {
    const qs = cursor ? `?cursor=${encodeURIComponent(cursor)}` : "";
    const page = await get<CursorPage<Despacho>>(
      `/ims/api/despachos/all/${qs}`,
    );
    all.push(...page.results);
    paginas += 1;
    const tieneActivos = page.results.some((d) =>
      ESTADOS_ACTIVOS.has(d.estado),
    );
    paginasSinActivos = tieneActivos ? 0 : paginasSinActivos + 1;
    cursor = cursorFromUrl(page.next);
  } while (
    cursor &&
    paginasSinActivos < PAGINAS_SIN_ACTIVOS_LIMITE &&
    paginas < MAX_PAGINAS
  );
  return all;
}

export function getDespacho(despachoId: number): Promise<Despacho> {
  return get<Despacho>(`/ims/api/despachos/all/${despachoId}/`);
}

export function addDespacho(data: {
  direccion_origen: string;
  direccion_destino?: string;
  descripcion_llamado?: string;
  paciente_rut: string;
}): Promise<AddDespachoResponse> {
  return post<AddDespachoResponse>("/ims/api/despachos/add/", data);
}

export function asignarDespacho(data: {
  despacho_id: number;
  amb_id: number;
  grupo_id: number;
  is_emergency?: boolean;
}): Promise<AsignarDespachoResponse> {
  return patch<AsignarDespachoResponse>("/ims/api/despachos/asignar/", data);
}

export function programarDespacho(data: {
  despacho_id: number;
  fecha_programada: string;
  grupo_id: number;
}): Promise<unknown> {
  return patch("/ims/api/despachos/programar/", data);
}
