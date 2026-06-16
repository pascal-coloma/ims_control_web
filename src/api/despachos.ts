import { get, patch, post } from './client'
import type { AddDespachoResponse, AsignarDespachoResponse, Despacho } from '../types/api'

export function getDespachos(): Promise<Despacho[]> {
  return get<Despacho[]>('/ims/api/despachos/getall/')
}

export function getDespacho(despachoId: number): Promise<Despacho> {
  return get<Despacho>(`/ims/api/despachos/getall/?despacho_id=${despachoId}`)
}

export function addDespacho(data: {
  direccion_origen: string
  direccion_destino?: string
  descripcion_llamado?: string
  paciente_rut: string
}): Promise<AddDespachoResponse> {
  return post<AddDespachoResponse>('/ims/api/despachos/add/', data)
}

export function asignarDespacho(data: {
  despacho_id: number
  amb_id: number
  grupo_id: number
  is_emergency?: boolean
}): Promise<AsignarDespachoResponse> {
  return patch<AsignarDespachoResponse>('/ims/api/despachos/asignar/', data)
}

export function programarDespacho(data: {
  despacho_id: number
  fecha_programada: string
  grupo_id: number
}): Promise<unknown> {
  return patch('/ims/api/despachos/programar/', data)
}
