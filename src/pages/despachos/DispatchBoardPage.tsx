import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ActionIcon,
  Button,
  Group,
  ScrollArea,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
  Tooltip,
} from "@mantine/core";
import { IconPlus, IconRefresh } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { getAmbulancias } from "../../api/ambulancias";
import { getDespachos } from "../../api/despachos";
import { queryKeys } from "../../api/queryKeys";
import type { Despacho, DespachoEstado } from "../../types/api";
import { AssignDispatchModal } from "./components/AssignDispatchModal";
import { DispatchCard } from "./components/DispatchCard";
import { DispatchDetailDrawer } from "./components/DispatchDetailDrawer";
import { NewDispatchModal } from "./components/NewDispatchModal";
import { ScheduleDispatchModal } from "./components/ScheduleDispatchModal";

const COLUMNS: { estado: DespachoEstado; label: string }[] = [
  { estado: "recibido", label: "Recibido" },
  { estado: "asignado", label: "Asignado" },
  { estado: "programado", label: "Programado" },
  { estado: "emergencia", label: "Emergencia" },
];

const POLL_INTERVAL_MS = 120_000;

export function DispatchBoardPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const detailId = id ? Number(id) : null;

  const [search, setSearch] = useState("");
  const [newDispatchOpen, setNewDispatchOpen] = useState(false);
  const [assignDispatchId, setAssignDispatchId] = useState<number | null>(null);
  const [scheduleDispatchId, setScheduleDispatchId] = useState<number | null>(
    null,
  );

  const despachosQuery = useQuery({
    queryKey: queryKeys.despachos.list(),
    queryFn: getDespachos,
    refetchInterval: POLL_INTERVAL_MS,
  });

  const ambulanciasQuery = useQuery({
    queryKey: queryKeys.ambulancias.list(),
    queryFn: getAmbulancias,
  });

  const ambulanciaPatentes = useMemo(() => {
    const map = new Map<number, string>();
    for (const amb of ambulanciasQuery.data ?? [])
      map.set(amb.ambulancia_id, amb.patente);
    return map;
  }, [ambulanciasQuery.data]);

  const filtered = useMemo(() => {
    const all = despachosQuery.data ?? [];
    const term = search.trim().toLowerCase();
    const matches = term
      ? all.filter((d) => {
          const direccion = d.direccion_origen?.toLowerCase() ?? "";
          const paciente = d.paciente?.nombre_completo?.toLowerCase() ?? "";
          return direccion.includes(term) || paciente.includes(term);
        })
      : all;
    return matches
      .slice()
      .sort(
        (a, b) =>
          dayjs(b.fecha_llamado).valueOf() - dayjs(a.fecha_llamado).valueOf(),
      );
  }, [despachosQuery.data, search]);

  const columns = useMemo(() => {
    const byEstado = new Map<DespachoEstado, Despacho[]>();
    for (const col of COLUMNS) byEstado.set(col.estado, []);
    for (const despacho of filtered) {
      byEstado.get(despacho.estado)?.push(despacho);
    }
    return byEstado;
  }, [filtered]);

  return (
    <Stack gap="md">
      <Group justify="space-between" align="flex-end">
        <div>
          <Title order={2}>Despachos</Title>
          {despachosQuery.dataUpdatedAt > 0 && (
            <Text size="xs" c="dimmed">
              Última sincronización:{" "}
              {dayjs(despachosQuery.dataUpdatedAt).format("HH:mm:ss")}
            </Text>
          )}
        </div>
        <Group>
          <Tooltip label="Actualizar">
            <ActionIcon
              variant="light"
              size="lg"
              onClick={() => despachosQuery.refetch()}
              loading={despachosQuery.isFetching}
            >
              <IconRefresh size={18} />
            </ActionIcon>
          </Tooltip>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => setNewDispatchOpen(true)}
          >
            Nuevo
          </Button>
        </Group>
      </Group>

      <TextInput
        placeholder="Buscar dirección / paciente"
        value={search}
        onChange={(event) => setSearch(event.currentTarget.value)}
        w={320}
      />

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
        {COLUMNS.map((col) => {
          const items = columns.get(col.estado) ?? [];
          return (
            <Stack key={col.estado} gap="xs">
              <Text fw={700} size="sm">
                {col.label.toUpperCase()} ({items.length})
              </Text>
              <ScrollArea.Autosize mah="calc(100vh - 240px)">
                <Stack gap="xs">
                  {items.map((despacho) => (
                    <DispatchCard
                      key={despacho.id}
                      despacho={despacho}
                      ambulanciaPatente={
                        despacho.ambulancia_id
                          ? ambulanciaPatentes.get(despacho.ambulancia_id)
                          : undefined
                      }
                      onClick={() => navigate(`/despachos/${despacho.id}`)}
                      onAssign={() => setAssignDispatchId(despacho.id)}
                      onSchedule={() => setScheduleDispatchId(despacho.id)}
                    />
                  ))}
                </Stack>
              </ScrollArea.Autosize>
            </Stack>
          );
        })}
      </SimpleGrid>

      <NewDispatchModal
        opened={newDispatchOpen}
        onClose={() => setNewDispatchOpen(false)}
      />

      {detailId !== null && (
        <DispatchDetailDrawer
          despachoId={detailId}
          opened
          onClose={() => navigate("/despachos")}
          onAssign={() => setAssignDispatchId(detailId)}
          onSchedule={() => setScheduleDispatchId(detailId)}
        />
      )}

      {assignDispatchId !== null && (
        <AssignDispatchModal
          despachoId={assignDispatchId}
          opened
          onClose={() => setAssignDispatchId(null)}
        />
      )}
      {scheduleDispatchId !== null && (
        <ScheduleDispatchModal
          despachoId={scheduleDispatchId}
          opened
          onClose={() => setScheduleDispatchId(null)}
        />
      )}
    </Stack>
  );
}
