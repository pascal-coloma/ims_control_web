import { Button, Card, Group, Table, Title } from "@mantine/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { addPaciente, getPacientes } from "../../api/pacientes";
import { queryKeys } from "../../api/queryKeys";
import { ListPagination } from "../../components/ListPagination";
import { PatientLookupOrRegister } from "../../components/patients/PatientLookupOrRegister";
import { PatientRegistrationFields } from "../../components/patients/PatientRegistrationFields";
import { TableSkeleton } from "../../components/TableSkeleton";
import { usePagedData } from "../../hooks/usePagedData";

const COLUMN_COUNT = 6;

export function PacientesPage() {
  const queryClient = useQueryClient();
  const [showRegister, setShowRegister] = useState(false);

  const pacientes = useQuery({
    queryKey: queryKeys.pacientes.list(),
    queryFn: getPacientes,
  });

  const register = useMutation({
    mutationFn: addPaciente,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pacientes.list() });
      setShowRegister(false);
    },
  });

  const { page, setPage, totalPages, pageItems } = usePagedData(
    pacientes.data ?? [],
  );

  return (
    <>
      <Group justify="space-between" mb="md">
        <Title order={2}>Pacientes</Title>
        <Button onClick={() => setShowRegister((v) => !v)}>
          + Registrar paciente
        </Button>
      </Group>

      {showRegister && (
        <Card withBorder mb="md">
          <Title order={4} mb="sm">
            Registrar paciente
          </Title>
          <PatientRegistrationFields
            initialRut=""
            submitting={register.isPending}
            onSubmit={(data) => register.mutate(data)}
            onCancel={() => setShowRegister(false)}
          />
        </Card>
      )}

      <Card withBorder mb="md">
        <Title order={4} mb="sm">
          Buscar / registrar paciente
        </Title>
        <PatientLookupOrRegister
          onResolved={() =>
            queryClient.invalidateQueries({
              queryKey: queryKeys.pacientes.list(),
            })
          }
        />
      </Card>

      <Title order={4} mb="sm">
        Registro de pacientes
      </Title>
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
        {pacientes.isLoading ? (
          <TableSkeleton columns={COLUMN_COUNT} />
        ) : (
          <Table.Tbody>
            {pageItems.map((paciente) => (
              <Table.Tr key={paciente.rut}>
                <Table.Td>{paciente.rut}</Table.Td>
                <Table.Td>{paciente.nombre_completo || "—"}</Table.Td>
                <Table.Td>{paciente.fecha_nacimiento || "—"}</Table.Td>
                <Table.Td>{paciente.comuna || "—"}</Table.Td>
                <Table.Td>{paciente.telefono || "—"}</Table.Td>
                <Table.Td>{paciente.condicion_paciente || "—"}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        )}
      </Table>
      <ListPagination page={page} totalPages={totalPages} onChange={setPage} />
    </>
  );
}
