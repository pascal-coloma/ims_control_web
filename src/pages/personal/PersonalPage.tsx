import { useMemo, useState } from "react";
import {
  ActionIcon,
  Badge,
  Button,
  Group,
  Modal,
  Stack,
  Text,
  Table,
  TextInput,
  Title,
} from "@mantine/core";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { deletePersonal, getPersonal } from "../../api/personal";
import { queryKeys } from "../../api/queryKeys";
import { ListPagination } from "../../components/ListPagination";
import { TableSkeleton } from "../../components/TableSkeleton";
import { usePagedData } from "../../hooks/usePagedData";
import type { AddStaffResponse, PersonalListItem } from "../../types/api";
import { cleanRut, formatRutDash } from "../../utils/rut";
import { AddStaffModal } from "./components/AddStaffModal";
import { ProvisioningResultModal } from "./components/ProvisioningResultModal";

const COLUMN_COUNT = 6;

export function PersonalPage() {
  const queryClient = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [provisioned, setProvisioned] = useState<AddStaffResponse | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<PersonalListItem | null>(
    null,
  );
  const [rutFilter, setRutFilter] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.personal.list(),
    queryFn: getPersonal,
  });

  const filteredData = useMemo(() => {
    const term = cleanRut(rutFilter);
    if (!term) return data ?? [];
    return (data ?? []).filter((p) => cleanRut(p.rut).includes(term));
  }, [data, rutFilter]);

  const { page, setPage, totalPages, pageItems } = usePagedData(filteredData);

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deletePersonal(id),
    onSuccess: () => {
      setConfirmDelete(null);
      queryClient.invalidateQueries({ queryKey: queryKeys.personal.list() });
    },
  });

  function handleProvisioningClose() {
    setProvisioned(null);
    queryClient.invalidateQueries({ queryKey: queryKeys.personal.list() });
  }

  function handleCancelDelete() {
    setConfirmDelete(null);
    deleteMutation.reset();
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

      <TextInput
        label="Buscar por RUT"
        placeholder="12345678-9"
        value={rutFilter}
        onChange={(event) =>
          setRutFilter(formatRutDash(event.currentTarget.value))
        }
        mb="md"
        maw={260}
      />

      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Nombre</Table.Th>
            <Table.Th>RUT</Table.Th>
            <Table.Th>Rol</Table.Th>
            <Table.Th>Estado</Table.Th>
            <Table.Th>Último inicio de sesión</Table.Th>
            <Table.Th />
          </Table.Tr>
        </Table.Thead>
        {isLoading ? (
          <TableSkeleton columns={COLUMN_COUNT} />
        ) : (
          <Table.Tbody>
            {pageItems.map((person) => (
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
                <Table.Td>
                  {person.last_login
                    ? dayjs(person.last_login).format("DD/MM/YYYY HH:mm")
                    : "Nunca"}
                </Table.Td>
                <Table.Td>
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    onClick={() => setConfirmDelete(person)}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        )}
      </Table>
      <ListPagination page={page} totalPages={totalPages} onChange={setPage} />

      <AddStaffModal
        opened={addOpen}
        onClose={() => setAddOpen(false)}
        onProvisioned={setProvisioned}
        existing={data ?? []}
      />
      <ProvisioningResultModal
        result={provisioned}
        onClose={handleProvisioningClose}
      />

      <Modal
        opened={confirmDelete !== null}
        onClose={handleCancelDelete}
        title="Eliminar personal"
        closeOnClickOutside={!deleteMutation.isPending}
        closeOnEscape={!deleteMutation.isPending}
      >
        {confirmDelete && (
          <Stack gap="md">
            <Text>
              ¿Eliminar a{" "}
              <Text span fw={700}>
                {confirmDelete.first_name} {confirmDelete.last_name}
              </Text>{" "}
              ({confirmDelete.rut})? Se eliminarán también sus suscripciones a
              grupos.
            </Text>

            {deleteMutation.isError && (
              <Text c="red" size="sm">
                {(deleteMutation.error as { errorMessage?: string })
                  ?.errorMessage ??
                  "No se pudo eliminar. Puede tener despachos o atenciones asociadas."}
              </Text>
            )}

            <Group justify="flex-end">
              <Button
                variant="subtle"
                onClick={handleCancelDelete}
                disabled={deleteMutation.isPending}
              >
                Cancelar
              </Button>
              <Button
                color="red"
                loading={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(confirmDelete.id)}
              >
                Eliminar
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </>
  );
}
