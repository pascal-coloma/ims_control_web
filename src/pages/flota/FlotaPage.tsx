import { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Button,
  Group,
  Select,
  Table,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cambiarEstadoAmbulancia, getAmbulancias } from "../../api/ambulancias";
import { queryKeys } from "../../api/queryKeys";
import { ListPagination } from "../../components/ListPagination";
import { TableSkeleton } from "../../components/TableSkeleton";
import {
  BODEGA_PATENTE,
  ESTADO_COLOR,
  ESTADO_LABEL,
  ESTADOS_EDITABLES,
} from "../../constants/ambulancia";
import { usePagedData } from "../../hooks/usePagedData";
import { showError } from "../../utils/notify";
import type { AmbulanciaEstado } from "../../types/api";
import { RegisterAmbulanceModal } from "./components/RegisterAmbulanceModal";

const COLUMN_COUNT = 3;
const POLL_INTERVAL_MS = 120_000;

const ESTADO_OPTIONS: { value: AmbulanciaEstado; label: string }[] = (
  Object.entries(ESTADO_LABEL) as [AmbulanciaEstado, string][]
).map(([value, label]) => ({ value, label }));

const ESTADO_EDITABLE_OPTIONS = ESTADO_OPTIONS.filter((o) =>
  ESTADOS_EDITABLES.includes(o.value),
);

export function FlotaPage() {
  const [search, setSearch] = useState("");
  const [estadoFilter, setEstadoFilter] = useState<string | null>(null);
  const [registerOpen, setRegisterOpen] = useState(false);

  const ambulancias = useQuery({
    queryKey: queryKeys.ambulancias.list(),
    queryFn: getAmbulancias,
    refetchInterval: POLL_INTERVAL_MS,
  });

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (ambulancias.data ?? []).filter((amb) => {
      if (amb.patente === BODEGA_PATENTE) return false;
      if (estadoFilter && amb.estado !== estadoFilter) return false;
      if (term && !amb.patente.toLowerCase().includes(term)) return false;
      return true;
    });
  }, [ambulancias.data, search, estadoFilter]);

  const { page, setPage, totalPages, pageItems } = usePagedData(rows);

  useEffect(() => setPage(1), [search, estadoFilter, setPage]);

  const queryClient = useQueryClient();
  const cambiarEstado = useMutation({
    mutationFn: (vars: { ambid: number; estado: AmbulanciaEstado }) =>
      cambiarEstadoAmbulancia(vars.ambid, vars.estado),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.ambulancias.list() }),
    onError: (err) => showError(err, "No se pudo cambiar el estado"),
  });

  return (
    <>
      <Group justify="space-between" mb="md">
        <Title order={2}>Flota</Title>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => setRegisterOpen(true)}
        >
          Agregar ambulancia
        </Button>
      </Group>

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

      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Patente</Table.Th>
            <Table.Th>Estado</Table.Th>
            <Table.Th>Cambiar estado</Table.Th>
          </Table.Tr>
        </Table.Thead>
        {ambulancias.isLoading ? (
          <TableSkeleton columns={COLUMN_COUNT} />
        ) : (
          <Table.Tbody>
            {pageItems.map((amb) => (
              <Table.Tr key={amb.ambulancia_id}>
                <Table.Td>{amb.patente}</Table.Td>
                <Table.Td>
                  <Badge color={ESTADO_COLOR[amb.estado]} variant="light">
                    {ESTADO_LABEL[amb.estado] ?? amb.estado}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Select
                    placeholder="Cambiar a..."
                    data={ESTADO_EDITABLE_OPTIONS}
                    value={null}
                    onChange={(value) =>
                      value &&
                      cambiarEstado.mutate({
                        ambid: amb.ambulancia_id,
                        estado: value as AmbulanciaEstado,
                      })
                    }
                    disabled={!ESTADOS_EDITABLES.includes(amb.estado)}
                    w={180}
                  />
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        )}
      </Table>

      {!ambulancias.isLoading && rows.length === 0 && (
        <Text c="dimmed" ta="center" mt="md">
          Sin resultados
        </Text>
      )}
      <ListPagination page={page} totalPages={totalPages} onChange={setPage} />

      <RegisterAmbulanceModal
        opened={registerOpen}
        onClose={() => setRegisterOpen(false)}
      />
    </>
  );
}
