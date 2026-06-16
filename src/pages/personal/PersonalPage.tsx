import { useState } from "react";
import { Badge, Button, Group, Loader, Table, Title } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getPersonal } from "../../api/personal";
import { queryKeys } from "../../api/queryKeys";
import type { AddStaffResponse } from "../../types/api";
import { AddStaffModal } from "./components/AddStaffModal";
import { ProvisioningResultModal } from "./components/ProvisioningResultModal";

export function PersonalPage() {
  const queryClient = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [provisioned, setProvisioned] = useState<AddStaffResponse | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.personal.list(),
    queryFn: getPersonal,
  });

  function handleProvisioningClose() {
    setProvisioned(null);
    queryClient.invalidateQueries({ queryKey: queryKeys.personal.list() });
  }

  return (
    <>
      <Group justify="space-between" mb="md">
        <Title order={2}>Personal</Title>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => setAddOpen(true)}
        >
          Agregar personal
        </Button>
      </Group>

      {isLoading ? (
        <Loader />
      ) : (
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Nombre</Table.Th>
              <Table.Th>RUT</Table.Th>
              <Table.Th>Rol</Table.Th>
              <Table.Th>Estado</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {(data ?? []).map((person) => (
              <Table.Tr key={person.id}>
                <Table.Td>
                  {person.first_name} {person.last_name}
                </Table.Td>
                <Table.Td>{person.rut}</Table.Td>
                <Table.Td>{person.rol_nombre ?? "—"}</Table.Td>
                <Table.Td>
                  <Badge
                    color={person.is_active ? "green" : "gray"}
                    variant="light"
                  >
                    {person.is_active ? "Activo" : "Inactivo"}
                  </Badge>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}

      <AddStaffModal
        opened={addOpen}
        onClose={() => setAddOpen(false)}
        onProvisioned={setProvisioned}
      />
      <ProvisioningResultModal
        result={provisioned}
        onClose={handleProvisioningClose}
      />
    </>
  );
}
