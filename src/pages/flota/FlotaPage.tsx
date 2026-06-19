import { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Group,
  Select,
  Table,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { getAmbulancias } from "../../api/ambulancias";
import { queryKeys } from "../../api/queryKeys";
import { ListPagination } from "../../components/ListPagination";
import { TableSkeleton } from "../../components/TableSkeleton";
import {
  BODEGA_PATENTE,
  ESTADO_COLOR,
  ESTADO_LABEL,
} from "../../constants/ambulancia";
import { usePagedData } from "../../hooks/usePagedData";
import type { AmbulanciaEstado } from "../../types/api";

const COLUMN_COUNT = 2;
const POLL_INTERVAL_MS = 120_000;

const ESTADO_OPTIONS: { value: AmbulanciaEstado; label: string }[] = (
  Object.entries(ESTADO_LABEL) as [AmbulanciaEstado, string][]
).map(([value, label]) => ({ value, label }));

export function FlotaPage() {
  const [search, setSearch] = useState("");
  const [estadoFilter, setEstadoFilter] = useState<string | null>(null);

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

  return (
    <>
      <Title order={2} mb="md">
        Flota
      </Title>

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
    </>
  );
}
