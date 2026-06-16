import { get } from './client'
import type { AtencionListItem } from '../types/api'

export function getAtenciones(): Promise<AtencionListItem[]> {
  return get<AtencionListItem[]>('/ims/api/atenciones/')
}

/** Returns a short-lived (1hr) presigned S3 URL for the signed clinical document. */
export function getAtencionDocUrl(atencionId: number): Promise<{ success: string }> {
  return get<{ success: string }>(`/ims/api/atenciones/?id=${atencionId}`)
}

/** Fetches the signed clinical document JSON from its presigned S3 URL. */
export async function fetchAtencionDoc(presignedUrl: string): Promise<unknown> {
  let response: Response
  try {
    response = await fetch(presignedUrl)
  } catch {
    // A thrown TypeError here (vs. an HTTP error status) means the browser blocked
    // the cross-origin request before it got a response — almost always a missing
    // CORS configuration on the S3 bucket (native apps don't enforce this).
    throw new Error('No se pudo descargar el documento desde S3 (bloqueado por CORS). Contacta al equipo de infraestructura para habilitar CORS en el bucket.')
  }
  if (!response.ok) {
    throw new Error(`Failed to fetch signed document (${response.status})`)
  }
  return response.json()
}

/** Returns the FHIR R4 Bundle for the given atencion as a JS object. */
export function getFhirBundle(atencionId: number): Promise<unknown> {
  return get(`/ims/api/fhir/?id=${atencionId}`)
}
