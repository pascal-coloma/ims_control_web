import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Badge,
  Button,
  Card,
  Group,
  Skeleton,
  Stack,
  Table,
  Title,
} from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { getGrupos } from "../../api/grupos";
import { getPersonal } from "../../api/personal";
import { queryKeys } from "../../api/queryKeys";
import { ListPagination } from "../../components/ListPagination";
import { TableSkeleton } from "../../components/TableSkeleton";
import { DEFAULT_PAGE_SIZE, usePagedData } from "../../hooks/usePagedData";
import { AddMemberControl } from "./components/AddMemberControl";
import { CreateGroupModal } from "./components/CreateGroupModal";
import { RemoveMemberButton } from "./components/RemoveMemberButton";

const GROUP_COLUMN_COUNT = 5;

export function GruposPage() {
  const { id } = useParams<{ id: string }>();
  const [createOpen, setCreateOpen] = useState(false);
  const highlightRef = useRef<HTMLDivElement | null>(null);

  const grupos = useQuery({
    queryKey: queryKeys.grupos.list(),
    queryFn: getGrupos,
  });
  const personal = useQuery({
    queryKey: queryKeys.personal.list(),
    queryFn: getPersonal,
  });

  const { page, setPage, totalPages, pageItems } = usePagedData(
    grupos.data ?? [],
  );

  const rutToPersonalId = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of personal.data ?? []) map.set(p.rut, p.id);
    return map;
  }, [personal.data]);

  useEffect(() => {
    if (!id || !grupos.data) return;
    const idx = grupos.data.findIndex((g) => g.grupo_id === Number(id));
    if (idx !== -1) setPage(Math.floor(idx / DEFAULT_PAGE_SIZE) + 1);
  }, [id, grupos.data, setPage]);

  useEffect(() => {
    if (id && highlightRef.current) {
      highlightRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [id, page]);

  return (
    <>
      <Group justify="space-between" mb="md">
        <Title order={2}>Grupos</Title>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => setCreateOpen(true)}
        >
          Crear grupo
        </Button>
      </Group>

      {grupos.isLoading ? (
        <Stack gap="md">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i} withBorder>
              <Group justify="space-between" mb="sm">
                <Skeleton height={20} width={160} radius="sm" />
                <Skeleton height={18} width={90} radius="sm" />
              </Group>
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Nombre</Table.Th>
                    <Table.Th>RUT</Table.Th>
                    <Table.Th>Rol</Table.Th>
                    <Table.Th>Ingreso</Table.Th>
                    <Table.Th />
                  </Table.Tr>
                </Table.Thead>
                <TableSkeleton columns={GROUP_COLUMN_COUNT} rows={3} />
              </Table>
            </Card>
          ))}
        </Stack>
      ) : (
        <Stack gap="md">
          {pageItems.map((grupo) => (
            <Card
              key={grupo.grupo_id}
              withBorder
              ref={
                id && Number(id) === grupo.grupo_id ? highlightRef : undefined
              }
              style={
                id && Number(id) === grupo.grupo_id
                  ? {
                      borderColor: "var(--mantine-color-blue-5)",
                      borderWidth: 2,
                    }
                  : undefined
              }
            >
              <Group justify="space-between" mb="sm">
                <Title order={4}>{grupo.grupo_nombre}</Title>
                <Badge variant="light">{grupo.miembros.length} miembros</Badge>
              </Group>

              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Nombre</Table.Th>
                    <Table.Th>RUT</Table.Th>
                    <Table.Th>Rol</Table.Th>
                    <Table.Th>Ingreso</Table.Th>
                    <Table.Th />
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {grupo.miembros.map((m) => (
                    <Table.Tr key={m.rut}>
                      <Table.Td>{m.nombre}</Table.Td>
                      <Table.Td>{m.rut}</Table.Td>
                      <Table.Td>{m.rol ?? "—"}</Table.Td>
                      <Table.Td>
                        {dayjs(m.dia_ingresado).format("DD/MM/YYYY")}
                      </Table.Td>
                      <Table.Td>
                        <RemoveMemberButton
                          groupId={grupo.grupo_id}
                          personalId={rutToPersonalId.get(m.rut)}
                          memberName={m.nombre}
                        />
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>

              <Group mt="sm">
                <AddMemberControl
                  grupoId={grupo.grupo_id}
                  currentMemberRuts={new Set(grupo.miembros.map((m) => m.rut))}
                />
              </Group>
            </Card>
          ))}
        </Stack>
      )}
      <ListPagination page={page} totalPages={totalPages} onChange={setPage} />

      <CreateGroupModal
        opened={createOpen}
        onClose={() => setCreateOpen(false)}
      />
    </>
  );
}
