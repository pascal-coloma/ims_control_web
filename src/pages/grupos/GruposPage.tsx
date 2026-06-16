import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Badge,
  Button,
  Card,
  Group,
  Loader,
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
import { AddMemberControl } from "./components/AddMemberControl";
import { CreateGroupModal } from "./components/CreateGroupModal";
import { RemoveMemberButton } from "./components/RemoveMemberButton";

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

  const rutToPersonalId = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of personal.data ?? []) map.set(p.rut, p.id);
    return map;
  }, [personal.data]);

  useEffect(() => {
    if (id && highlightRef.current) {
      highlightRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [id, grupos.data]);

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
        <Loader />
      ) : (
        <Stack gap="md">
          {(grupos.data ?? []).map((grupo) => (
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

      <CreateGroupModal
        opened={createOpen}
        onClose={() => setCreateOpen(false)}
      />
    </>
  );
}
