import { Card, Loader, Table, Title } from '@mantine/core'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getPacientes } from '../../api/pacientes'
import { queryKeys } from '../../api/queryKeys'
import { PatientLookupOrRegister } from '../../components/patients/PatientLookupOrRegister'

export function PacientesPage() {
  const queryClient = useQueryClient()

  const pacientes = useQuery({
    queryKey: queryKeys.pacientes.list(),
    queryFn: getPacientes,
  })

  return (
    <>
      <Title order={2} mb="md">Pacientes</Title>

      <Card withBorder mb="md">
        <Title order={4} mb="sm">Buscar / registrar paciente</Title>
        <PatientLookupOrRegister
          onResolved={() => queryClient.invalidateQueries({ queryKey: queryKeys.pacientes.list() })}
        />
      </Card>

      <Title order={4} mb="sm">Registro de pacientes</Title>
      {pacientes.isLoading ? (
        <Loader />
      ) : (
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>RUT</Table.Th>
              <Table.Th>Nombre completo</Table.Th>
              <Table.Th>Fecha nacimiento</Table.Th>
              <Table.Th>Comuna</Table.Th>
              <Table.Th>Teléfono</Table.Th>
              <Table.Th>Condición</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {(pacientes.data ?? []).map((paciente) => (
              <Table.Tr key={paciente.rut}>
                <Table.Td>{paciente.rut}</Table.Td>
                <Table.Td>{paciente.nombre_completo || '—'}</Table.Td>
                <Table.Td>{paciente.fecha_nacimiento || '—'}</Table.Td>
                <Table.Td>{paciente.comuna || '—'}</Table.Td>
                <Table.Td>{paciente.telefono || '—'}</Table.Td>
                <Table.Td>{paciente.condicion_paciente || '—'}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}
    </>
  )
}
