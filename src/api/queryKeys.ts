// Centralized query key factory per §3.2 of CONTROL_WEB_INTERFACE_DESIGN.md

export const queryKeys = {
  despachos: {
    list: () => ['despachos', 'list'] as const,
    detail: (id: number) => ['despachos', 'detail', id] as const,
  },
  personal: {
    list: () => ['personal', 'list'] as const,
  },
  pacientes: {
    list: () => ['pacientes', 'list'] as const,
    detail: (rut: string) => ['pacientes', 'detail', rut] as const,
  },
  grupos: {
    list: () => ['grupos', 'list'] as const,
    detail: (id: number) => ['grupos', 'detail', id] as const,
  },
  ambulancias: {
    list: () => ['ambulancias', 'list'] as const,
    detail: (id: number) => ['ambulancias', 'detail', id] as const,
  },
  inventario: {
    list: () => ['inventario', 'list'] as const,
    detail: (insumoId: number) => ['inventario', 'detail', insumoId] as const,
  },
  atenciones: {
    list: () => ['atenciones', 'list'] as const,
    doc: (id: number) => ['atenciones', 'doc', id] as const,
  },
}
