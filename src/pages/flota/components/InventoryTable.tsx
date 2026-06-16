import { useMemo, useState } from 'react'
import { Button, Group, Loader, Select, Table, Text, TextInput } from '@mantine/core'
import { useQuery } from '@tanstack/react-query'
import { getAmbulancias } from '../../../api/ambulancias'
import { getInventario } from '../../../api/inventario'
import { queryKeys } from '../../../api/queryKeys'
import { AdjustStockModal, type AdjustStockTarget } from './AdjustStockModal'
import { MoveStockModal, type MoveStockTarget } from './MoveStockModal'

interface InventoryTableProps {
  lockedAmbulanciaPatente?: string
}

export function InventoryTable({ lockedAmbulanciaPatente }: InventoryTableProps = {}) {
  const [search, setSearch] = useState('')
  const [categoriaFilter, setCategoriaFilter] = useState<string | null>(null)
  const [ambulanciaFilter, setAmbulanciaFilter] = useState<string | null>(null)
  const [adjustTarget, setAdjustTarget] = useState<AdjustStockTarget | null>(null)
  const [moveTarget, setMoveTarget] = useState<MoveStockTarget | null>(null)

  const inventario = useQuery({
    queryKey: queryKeys.inventario.list(),
    queryFn: getInventario,
  })
  const ambulancias = useQuery({
    queryKey: queryKeys.ambulancias.list(),
    queryFn: getAmbulancias,
  })

  const patenteToAmbulanciaId = useMemo(() => {
    const map = new Map<string, number>()
    for (const a of ambulancias.data ?? []) map.set(a.patente, a.ambulancia_id)
    return map
  }, [ambulancias.data])

  const categoriaOptions = useMemo(() => {
    const seen = new Map<number, string>()
    for (const row of inventario.data ?? []) seen.set(row.presentacion.categoria_id, row.presentacion.categoria)
    return Array.from(seen.entries()).map(([id, nombre]) => ({ value: String(id), label: nombre }))
  }, [inventario.data])

  const ambulanciaOptions = useMemo(
    () => (ambulancias.data ?? []).map((a) => ({ value: a.patente, label: a.patente })),
    [ambulancias.data],
  )

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase()
    const patenteFilter = lockedAmbulanciaPatente ?? ambulanciaFilter
    return (inventario.data ?? []).filter((row) => {
      if (patenteFilter && row.ambulancia.patente !== patenteFilter) return false
      if (categoriaFilter && String(row.presentacion.categoria_id) !== categoriaFilter) return false
      if (term && !row.presentacion.nombre.toLowerCase().includes(term)) return false
      return true
    })
  }, [inventario.data, search, categoriaFilter, ambulanciaFilter, lockedAmbulanciaPatente])

  if (inventario.isLoading) return <Loader />

  return (
    <>
      <Group align="flex-end" mb="sm">
        <TextInput
          label="Insumo"
          placeholder="Buscar insumo"
          value={search}
          onChange={(event) => setSearch(event.currentTarget.value)}
          w={260}
        />
        <Select
          label="Categoría"
          placeholder="Todas"
          data={categoriaOptions}
          value={categoriaFilter}
          onChange={setCategoriaFilter}
          clearable
          searchable
          w={200}
        />
        {!lockedAmbulanciaPatente && (
          <Select
            label="Ambulancia"
            placeholder="Todas"
            data={ambulanciaOptions}
            value={ambulanciaFilter}
            onChange={setAmbulanciaFilter}
            clearable
            searchable
            w={160}
          />
        )}
      </Group>

      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Insumo</Table.Th>
            <Table.Th>Categoría</Table.Th>
            <Table.Th>Unidad</Table.Th>
            <Table.Th>Cant/dosis</Table.Th>
            {!lockedAmbulanciaPatente && <Table.Th>Ambulancia</Table.Th>}
            <Table.Th>Stock</Table.Th>
            <Table.Th />
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {rows.map((row) => {
            const ambulanciaId = patenteToAmbulanciaId.get(row.ambulancia.patente)
            return (
              <Table.Tr key={`${row.presentacion.id}-${row.ambulancia.patente}`}>
                <Table.Td>{row.presentacion.nombre}</Table.Td>
                <Table.Td>{row.presentacion.categoria}</Table.Td>
                <Table.Td>{row.presentacion.unidad_medida}</Table.Td>
                <Table.Td>{row.presentacion.cantidad}</Table.Td>
                {!lockedAmbulanciaPatente && <Table.Td>{row.ambulancia.patente}</Table.Td>}
                <Table.Td>{row.ambulancia.stock}</Table.Td>
                <Table.Td>
                  <Group gap="xs" wrap="nowrap">
                    <Button
                      size="xs"
                      variant="light"
                      disabled={ambulanciaId === undefined}
                      onClick={() =>
                        setAdjustTarget({
                          presentacionId: row.presentacion.id,
                          ambulanciaId: ambulanciaId as number,
                          insumoNombre: row.presentacion.nombre,
                          patente: row.ambulancia.patente,
                          currentStock: row.ambulancia.stock,
                        })
                      }
                    >
                      Ajustar
                    </Button>
                    <Button
                      size="xs"
                      variant="light"
                      disabled={ambulanciaId === undefined}
                      onClick={() =>
                        setMoveTarget({
                          presentacionId: row.presentacion.id,
                          insumoNombre: row.presentacion.nombre,
                          fromAmbulanciaId: ambulanciaId as number,
                          fromPatente: row.ambulancia.patente,
                          fromStock: row.ambulancia.stock,
                        })
                      }
                    >
                      Mover
                    </Button>
                  </Group>
                </Table.Td>
              </Table.Tr>
            )
          })}
          {rows.length === 0 && (
            <Table.Tr>
              <Table.Td colSpan={lockedAmbulanciaPatente ? 6 : 7}>
                <Text c="dimmed" ta="center">
                  Sin resultados
                </Text>
              </Table.Td>
            </Table.Tr>
          )}
        </Table.Tbody>
      </Table>

      <AdjustStockModal target={adjustTarget} onClose={() => setAdjustTarget(null)} />
      <MoveStockModal target={moveTarget} onClose={() => setMoveTarget(null)} />
    </>
  )
}
