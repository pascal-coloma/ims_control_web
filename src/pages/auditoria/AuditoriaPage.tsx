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
import { getLogsPage, LOGS_URL } from "../../api/logs";
import { ListPagination } from "../../components/ListPagination";
import { TableSkeleton } from "../../components/TableSkeleton";
import { DEFAULT_PAGE_SIZE } from "../../hooks/usePagedData";
import type { LogEntry, LogTipo } from "../../types/api";

const COLUMN_COUNT = 6;

const TIPO_OPTIONS: { value: LogTipo; label: string }[] = [
  { value: "atencion", label: "Atención" },
  { value: "inventario", label: "Inventario" },
  { value: "ambulancia", label: "Ambulancia" },
  { value: "despacho", label: "Despacho" },
  { value: "grupo", label: "Grupo" },
  { value: "paciente", label: "Paciente" },
  { value: "informacion", label: "Información" },
];

const TIPO_COLOR: Record<LogTipo, string> = {
  atencion: "blue",
  inventario: "teal",
  ambulancia: "grape",
  despacho: "orange",
  grupo: "indigo",
  paciente: "pink",
  informacion: "grey",
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
  // Backend uses CursorPagination (no count/offset), so pages are fetched
  // on demand as the selector reaches them, then kept around — picking an
  // earlier page never refetches.
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [nextUrl, setNextUrl] = useState<string | null>(LOGS_URL);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return entries.filter((e) => {
      if (tipos.length > 0 && !tipos.includes(e.tipo)) return false;
      if (!term) return true;
      return (
        e.descripcion.toLowerCase().includes(term) ||
        e.rut_usuario.toLowerCase().includes(term)
      );
    });
  }, [entries, tipos, search]);

  const hasMore = nextUrl !== null;
  // totalPages reflects only what's loaded so far; +1 (selectable below)
  // is the "fetch the next batch" affordance — usePagedData's clamp would
  // otherwise snap that selection straight back to the last loaded page.
  const totalPages = Math.max(
    1,
    Math.ceil(filtered.length / DEFAULT_PAGE_SIZE),
  );
  const maxPage = hasMore ? totalPages + 1 : totalPages;
  const clampedPage = Math.min(page, maxPage);
  const pageItems = filtered.slice(
    (clampedPage - 1) * DEFAULT_PAGE_SIZE,
    clampedPage * DEFAULT_PAGE_SIZE,
  );

  useEffect(() => setPage(1), [tipos, search]);

  // Keep fetching backend pages until enough (filtered) entries exist to
  // fill the currently selected page, or the feed is exhausted.
  useEffect(() => {
    if (filtered.length >= clampedPage * DEFAULT_PAGE_SIZE || !nextUrl) return;
    const controller = new AbortController();
    setLoading(true);
    getLogsPage(nextUrl, controller.signal)
      .then((data) => {
        setEntries((current) => [...current, ...data.results]);
        setNextUrl(data.next);
      })
      .catch((err) => {
        if (!controller.signal.aborted)
          console.error("Error al cargar logs", err);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [filtered.length, clampedPage, nextUrl]);

  const initialLoad = loading && entries.length === 0;

  return (
    <Stack gap="md">
      {initialLoad ? (
        <Skeleton height={12} width={120} radius="sm" />
      ) : loading ? (
        <Group gap={6}>
          <Loader size="xs" />
          <Text size="xs" c="dimmed">
            Cargando más registros…
          </Text>
        </Group>
      ) : (
        <Text size="xs" c="dimmed">
          {entries.length} registros cargados
        </Text>
      )}

      <ScrollArea.Autosize mah="calc(100vh - 280px)">
        <Table.ScrollContainer minWidth={700}>
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
                    <Table.Td>{e.rut_usuario}</Table.Td>
                    <Table.Td>
                      {dayjs(e.timestamp).format("DD/MM/YYYY HH:mm")}
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
                {filtered.length === 0 && !loading && (
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
        </Table.ScrollContainer>
      </ScrollArea.Autosize>
      <ListPagination
        page={clampedPage}
        totalPages={maxPage}
        onChange={setPage}
      />
    </Stack>
  );
}
