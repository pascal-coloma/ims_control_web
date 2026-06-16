import { Badge, Button, Divider, Drawer, Group, List, Loader, Stack, Text } from '@mantine/core'
import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { getDespacho } from '../../../api/despachos'
import { queryKeys } from '../../../api/queryKeys'

interface DispatchDetailDrawerProps {
  despachoId: number
  opened: boolean
  onClose: () => void
  onAssign: () => void
  onSchedule: () => void
}

export function DispatchDetailDrawer({ despachoId, opened, onClose, onAssign, onSchedule }: DispatchDetailDrawerProps) {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.despachos.detail(despachoId),
    queryFn: () => getDespacho(despachoId),
    enabled: opened,
  })

  const despacho = data

  return (
    <Drawer opened={opened} onClose={onClose} title={`Despacho #${despachoId}`} position="right" size="md">
      {isLoading || !despacho ? (
        <Group justify="center" mt="xl">
          <Loader />
        </Group>
      ) : (
        <Stack gap="sm">
          <Group>
            <Text fw={500}>Estado:</Text>
            <Badge variant="light">{despacho.estado}</Badge>
          </Group>

          <Text>
            <Text span fw={500}>Paciente: </Text>
            {despacho.paciente
              ? `${despacho.paciente.nombre_completo} (${despacho.paciente.rut})`
              : 'Sin paciente'}
          </Text>

          <Text>
            <Text span fw={500}>Origen: </Text>
            {despacho.direccion_origen}
          </Text>
          <Text>
            <Text span fw={500}>Destino: </Text>
            {despacho.direccion_destino || '—'}
          </Text>
          <Text>
            <Text span fw={500}>Descripción: </Text>
            {despacho.descripcion_llamado || '—'}
          </Text>
          <Text>
            <Text span fw={500}>Llamado: </Text>
            {dayjs(despacho.fecha_llamado).format('DD/MM/YYYY HH:mm')}
          </Text>
          {despacho.fecha_programada && (
            <Text>
              <Text span fw={500}>Programado: </Text>
              {dayjs(despacho.fecha_programada).format('DD/MM/YYYY HH:mm')}
            </Text>
          )}
          {despacho.creado_por_id !== undefined && (
            <Text>
              <Text span fw={500}>Creado por: </Text>#{despacho.creado_por_id}
            </Text>
          )}
          {despacho.asignado_por_id !== undefined && (
            <Text>
              <Text span fw={500}>Asignado por: </Text>#{despacho.asignado_por_id}
            </Text>
          )}

          {despacho.personal.length > 0 && (
            <>
              <Divider label="Personal asignado" />
              <List size="sm">
                {despacho.personal.map((p) => (
                  <List.Item key={p.personal__id}>
                    {p.personal__first_name} {p.personal__last_name}
                    {p.personal__rol__nombre_rol ? ` — ${p.personal__rol__nombre_rol}` : ''}
                  </List.Item>
                ))}
              </List>
            </>
          )}

          {(despacho.estado === 'recibido' || despacho.estado === 'programado') && (
            <Group mt="md">
              <Button onClick={onAssign}>Asignar</Button>
              <Button variant="light" onClick={onSchedule}>
                {despacho.estado === 'programado' ? 'Reprogramar' : 'Programar'}
              </Button>
            </Group>
          )}
        </Stack>
      )}
    </Drawer>
  )
}
