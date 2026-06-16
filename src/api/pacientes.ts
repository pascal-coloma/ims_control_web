import { get, post } from './client'
import type { Paciente } from '../types/api'

export function getPacientes(): Promise<Paciente[]> {
  return get<Paciente[]>('/ims/api/pacientes/get/')
}

export function getPaciente(rut: string): Promise<Paciente> {
  return get<Paciente>(`/ims/api/pacientes/get/?rut=${encodeURIComponent(rut)}`)
}

export function addPaciente(data: Paciente): Promise<{ success: string }> {
  return post<{ success: string }>('/ims/api/pacientes/add/', data)
}
