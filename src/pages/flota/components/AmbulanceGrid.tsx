import { useMemo, useState } from 'react'
import { Badge, Button, Card, Group, List, Loader, Select, SimpleGrid, Text, TextInput } from '@mantine/core'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { getAmbulancias } from '../../../api/ambulancias'
import { queryKeys } from '../../../api/queryKeys'
import type { AmbulanciaEstado } from '../../../types/api'
import { BODEGA_PATENTE } from '../constants'

const ESTADO_COLOR: Record<AmbulanciaEstado, string> = {
  disponible: 'green',
  en_despacho: 'yellow',
  mantencion: 'red',
  fuera_servicio: 'gray',
}

const ESTADO_OPTIONS: { value: AmbulanciaEstado; label: string }[] = [
  { value: 'disponible', label: 'Disponible' },
  { value: 'en_despacho', label: 'En despacho' },
  { value: 'mantencion', label: 'Mantención' },
  { value: 'fuera_servicio', label: 'Fuera de servicio' },
]

export function AmbulanceGrid() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [estadoFilter, setEstadoFilter] = useState<string | null>(null)

  const ambulancias = useQuery({
    queryKey: queryKeys.ambulancias.list(),
    queryFn: getAmbulancias,
  })

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase()
    return (ambulancias.data ?? []).filter((amb) => {
      if (amb.patente === BODEGA_PATENTE) return false
      if (estadoFilter && amb.estado !== estadoFilter) return false
      if (term && !amb.patente.toLowerCase().includes(term)) return false
      return true
    })
  }, [ambulancias.data, search, estadoFilter])

  if (ambulancias.isLoading) return <Loader />

  return (
    <>
      <Group align="flex-end" mb="md">
        <TextInput
          label="Patente"
          placeholder="Buscar patente"
          value={search}
          onChange={(event) => setSearch(event.currentTarget.value)}
          w={220}
        />
        <Select
          label="Estado"
          placeholder="Todos"
          data={ESTADO_OPTIONS}
          value={estadoFilter}
          onChange={setEstadoFilter}
          clearable
          w={200}
        />
      </Group>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
        {rows.map((amb) => (
          <Card key={amb.ambulancia_id} withBorder>
            <Group justify="space-between" mb="xs">
              <Text fw={700}>{amb.patente}</Text>
              <Badge color={ESTADO_COLOR[amb.estado]} variant="light">
                {amb.estado}
              </Badge>
            </Group>
            <List size="sm" mb="sm">
              {amb.stock.slice(0, 5).map((item) => (
                <List.Item key={item.presentacion_id}>
                  {item.insumo_nombre}: {item.stock} {item.unidad_medida}
                </List.Item>
              ))}
              {amb.stock.length === 0 && <Text size="sm" c="dimmed">Sin stock registrado</Text>}
              {amb.stock.length > 5 && <Text size="xs" c="dimmed">+{amb.stock.length - 5} más</Text>}
            </List>
            <Button size="xs" variant="light" onClick={() => navigate(`/flota/${amb.ambulancia_id}`)}>
              Ver detalle
            </Button>
          </Card>
        ))}
      </SimpleGrid>

      {rows.length === 0 && (
        <Text c="dimmed" ta="center" mt="md">
          Sin resultados
        </Text>
      )}
    </>
  )
}
