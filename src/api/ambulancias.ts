import { get } from './client'
import type { Ambulancia } from '../types/api'

export function getAmbulancias(): Promise<Ambulancia[]> {
  return get<Ambulancia[]>('/ims/api/ambulancias/')
}

export function getAmbulancia(ambulanciaId: number): Promise<Ambulancia[]> {
  return get<Ambulancia[]>(`/ims/api/ambulancias/?ambulancia_id=${ambulanciaId}`)
}
