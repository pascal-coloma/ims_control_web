import { Badge, Button, Card, Group, Stack, Text } from '@mantine/core'
import { IconAlertTriangle } from '@tabler/icons-react'
import dayjs from 'dayjs'
import type { Despacho } from '../../../types/api'

const ESTADO_COLOR: Record<Despacho['estado'], string> = {
  recibido: 'blue',
  asignado: 'teal',
  programado: 'violet',
  emergencia: 'red',
  finalizado: 'gray',
  cancelado: 'gray',
}

interface DispatchCardProps {
  despacho: Despacho
  ambulanciaPatente?: string
  onClick: () => void
  onAssign: () => void
  onSchedule: () => void
}

export function DispatchCard({ despacho, ambulanciaPatente, onClick, onAssign, onSchedule }: DispatchCardProps) {
  const equipo = despacho.personal
    .map((p) => `${p.personal__first_name} ${p.personal__last_name}`)
    .join(', ')

  return (
    <Card withBorder radius="sm" padding="sm" onClick={onClick} style={{ cursor: 'pointer' }}>
      <Stack gap={4}>
        <Group justify="space-between" wrap="nowrap">
          <Text fw={700} size="sm">
            #{despacho.id}
          </Text>
          <Group gap={4} wrap="nowrap">
            {despacho.estado === 'emergencia' && <IconAlertTriangle size={16} color="var(--mantine-color-red-6)" />}
            <Badge color={ESTADO_COLOR[despacho.estado]} size="sm" variant="light">
              {despacho.estado}
            </Badge>
          </Group>
        </Group>

        <Text size="sm" fw={500}>
          {despacho.paciente?.nombre_completo ?? 'Sin paciente'}
        </Text>
        <Text size="xs" c="dimmed" lineClamp={1}>
          {despacho.direccion_origen}
        </Text>

        {despacho.estado === 'programado' && despacho.fecha_programada ? (
          <Text size="xs" c="dimmed">
            Programado: {dayjs(despacho.fecha_programada).format('DD/MM HH:mm')}
          </Text>
        ) : (
          <Text size="xs" c="dimmed">
            Llamado: {dayjs(despacho.fecha_llamado).format('DD/MM HH:mm')}
          </Text>
        )}

        {equipo && (
          <Text size="xs" c="dimmed" lineClamp={1}>
            Equipo: {equipo}
          </Text>
        )}
        {ambulanciaPatente && (
          <Text size="xs" c="dimmed">
            Ambulancia: {ambulanciaPatente}
          </Text>
        )}

        {despacho.estado === 'recibido' && (
          <Button
            size="xs"
            variant="light"
            mt={4}
            onClick={(event) => {
              event.stopPropagation()
              onAssign()
            }}
          >
            Asignar
          </Button>
        )}
        {despacho.estado === 'programado' && (
          <Button
            size="xs"
            variant="light"
            mt={4}
            onClick={(event) => {
              event.stopPropagation()
              onSchedule()
            }}
          >
            Reprogramar
          </Button>
        )}
      </Stack>
    </Card>
  )
}
