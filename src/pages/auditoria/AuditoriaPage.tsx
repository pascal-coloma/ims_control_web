import { useEffect, useMemo, useState } from "react";
import {
  ActionIcon,
  Anchor,
  Badge,
  Group,
  Loader,
  MultiSelect,
  ScrollArea,
  Skeleton,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
  Tooltip,
} from "@mantine/core";
import { IconRefresh } from "@tabler/icons-react";
import dayjs from "dayjs";
import { Link } from "react-router-dom";
import { streamLogs } from "../../api/logs";
import { ListPagination } from "../../components/ListPagination";
import { TableSkeleton } from "../../components/TableSkeleton";
import { usePagedData } from "../../hooks/usePagedData";
import type { LogEntry, LogTipo } from "../../types/api";

const COLUMN_COUNT = 6;

const TIPO_OPTIONS: { value: LogTipo; label: string }[] = [
  { value: "atencion", label: "Atención" },
  { value: "inventario", label: "Inventario" },
  { value: "ambulancia", label: "Ambulancia" },
  { value: "despacho", label: "Despacho" },
  { value: "grupo", label: "Grupo" },
  { value: "paciente", label: "Paciente" },
];

const TIPO_COLOR: Record<LogTipo, string> = {
  atencion: "blue",
  inventario: "teal",
  ambulancia: "grape",
  despacho: "orange",
  grupo: "indigo",
  paciente: "pink",
};

export function AuditoriaPage() {
  const [tipos, setTipos] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <Stack gap="md">
      <Group justify="space-between" align="flex-end">
        <Title order={2}>Auditoría</Title>
        <Tooltip label="Reiniciar feed">
          <ActionIcon
            variant="light"
            size="lg"
            onClick={() => setRefreshKey((k) => k + 1)}
          >
            <IconRefresh size={18} />
          </ActionIcon>
        </Tooltip>
      </Group>

      <Group align="flex-end">
        <MultiSelect
          label="Tipo"
          placeholder="Todos"
          data={TIPO_OPTIONS}
          value={tipos}
          onChange={setTipos}
          w={320}
          clearable
        />
        <TextInput
          label="Buscar"
          placeholder="Descripción o RUT"
          value={search}
          onChange={(event) => setSearch(event.currentTarget.value)}
          w={260}
        />
      </Group>

      <AuditLogFeed key={refreshKey} tipos={tipos} search={search} />
    </Stack>
  );
}

interface AuditLogFeedProps {
  tipos: string[];
  search: string;
}

function AuditLogFeed({ tipos, search }: AuditLogFeedProps) {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [streaming, setStreaming] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    streamLogs(
      (entry) => setEntries((current) => [...current, entry]),
      controller.signal,
    )
      .catch((err) => {
        if (!controller.signal.aborted)
          console.error("Error al transmitir logs", err);
      })
      .finally(() => {
        if (!controller.signal.aborted) setStreaming(false);
      });
    return () => controller.abort();
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const result = entries.filter((e) => {
      if (tipos.length > 0 && !tipos.includes(e.tipo)) return false;
      if (!term) return true;
      return (
        e.descripcion.toLowerCase().includes(term) ||
        e.rut.toLowerCase().includes(term)
      );
    });
    return result.reverse();
  }, [entries, tipos, search]);

  const { page, setPage, totalPages, pageItems } = usePagedData(filtered);

  useEffect(() => setPage(1), [tipos, search, setPage]);

  const initialLoad = streaming && entries.length === 0;

  return (
    <Stack gap="md">
      {initialLoad ? (
        <Skeleton height={12} width={120} radius="sm" />
      ) : streaming ? (
        <Group gap={6}>
          <Loader size="xs" />
          <Text size="xs" c="dimmed">
            Cargando feed…
          </Text>
        </Group>
      ) : (
        <Text size="xs" c="dimmed">
          {entries.length} registros
        </Text>
      )}

      <ScrollArea.Autosize mah="calc(100vh - 280px)">
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>ID</Table.Th>
              <Table.Th>Tipo</Table.Th>
              <Table.Th>Descripción</Table.Th>
              <Table.Th>RUT</Table.Th>
              <Table.Th>Fecha</Table.Th>
              <Table.Th>Atención</Table.Th>
            </Table.Tr>
          </Table.Thead>
          {initialLoad ? (
            <TableSkeleton columns={COLUMN_COUNT} />
          ) : (
            <Table.Tbody>
              {pageItems.map((e) => (
                <Table.Tr key={e.id}>
                  <Table.Td>{e.id}</Table.Td>
                  <Table.Td>
                    <Badge color={TIPO_COLOR[e.tipo]} variant="light">
                      {e.tipo}
                    </Badge>
                  </Table.Td>
                  <Table.Td>{e.descripcion}</Table.Td>
                  <Table.Td>{e.rut}</Table.Td>
                  <Table.Td>
                    {e.created_at
                      ? dayjs(e.created_at).format("DD/MM/YYYY HH:mm")
                      : "—"}
                  </Table.Td>
                  <Table.Td>
                    {e.atencion_id !== null ? (
                      <Anchor
                        component={Link}
                        to={`/atenciones/${e.atencion_id}`}
                      >
                        #{e.atencion_id}
                      </Anchor>
                    ) : (
                      "—"
                    )}
                  </Table.Td>
                </Table.Tr>
              ))}
              {filtered.length === 0 && !streaming && (
                <Table.Tr>
                  <Table.Td colSpan={COLUMN_COUNT}>
                    <Text c="dimmed" ta="center">
                      Sin registros
                    </Text>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          )}
        </Table>
      </ScrollArea.Autosize>
      <ListPagination page={page} totalPages={totalPages} onChange={setPage} />
    </Stack>
  );
}
