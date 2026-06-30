import {
  Alert,
  Badge,
  Button,
  Divider,
  Drawer,
  Group,
  List,
  Skeleton,
  Stack,
  Text,
} from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { getAmbulancia } from "../../../api/ambulancias";
import { ApiError } from "../../../api/client";
import { getDespacho } from "../../../api/despachos";
import { getPersonal } from "../../../api/personal";
import { queryKeys } from "../../../api/queryKeys";

interface DispatchDetailDrawerProps {
  despachoId: number;
  opened: boolean;
  onClose: () => void;
  onAssign: () => void;
  onSchedule: () => void;
}

/** Placeholder con la forma real del detalle (badge + líneas + lista), mostrado mientras carga. */
function DetailSkeleton() {
  return (
    <Stack gap="sm">
      <Group>
        <Skeleton height={14} width={50} radius="sm" />
        <Skeleton height={20} width={80} radius="sm" />
      </Group>
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} height={12} width={`${85 - i * 8}%`} radius="sm" />
      ))}
      <Divider />
      <Skeleton height={12} width="60%" radius="sm" />
      <Skeleton height={12} width="55%" radius="sm" />
    </Stack>
  );
}

export function DispatchDetailDrawer({
  despachoId,
  opened,
  onClose,
  onAssign,
  onSchedule,
}: DispatchDetailDrawerProps) {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: queryKeys.despachos.detail(despachoId),
    queryFn: () => getDespacho(despachoId),
    enabled: opened,
  });

  const despacho = data;

  const { data: ambulancias } = useQuery({
    queryKey: queryKeys.ambulancias.detail(despacho?.ambulancia_id ?? 0),
    queryFn: () => getAmbulancia(despacho!.ambulancia_id!),
    enabled: opened && !!despacho?.ambulancia_id,
  });
  const patente = ambulancias?.[0]?.patente;

  const { data: personal } = useQuery({
    queryKey: queryKeys.personal.list(),
    queryFn: getPersonal,
    enabled: opened,
  });
  const nombrePersonal = (id?: number) => {
    const p = personal?.find((p) => p.id === id);
    return p
      ? `${p.first_name} ${p.last_name}`
      : id !== undefined
        ? `#${id}`
        : null;
  };

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title={`Despacho #${despachoId}`}
      position="right"
      size="md"
    >
      {isError ? (
        <Alert
          color="red"
          variant="light"
          icon={<IconAlertCircle size={18} />}
          title="No se pudo cargar el despacho"
        >
          <Stack gap="xs">
            <Text size="sm">
              {error instanceof ApiError
                ? (error.errorMessage ?? error.message)
                : "Error desconocido"}
            </Text>
            <Button size="xs" variant="light" onClick={() => refetch()}>
              Reintentar
            </Button>
          </Stack>
        </Alert>
      ) : isLoading || !despacho ? (
        <DetailSkeleton />
      ) : (
        <Stack gap="sm">
          <Group>
            <Text fw={500}>Estado:</Text>
            <Badge variant="light">{despacho.estado}</Badge>
          </Group>

          <Text>
            <Text span fw={500}>
              Paciente:{" "}
            </Text>
            {despacho.paciente
              ? `${despacho.paciente.nombre_completo} (${despacho.paciente.rut})`
              : "Sin paciente"}
          </Text>

          <Text>
            <Text span fw={500}>
              Origen:{" "}
            </Text>
            {despacho.direccion_origen}
          </Text>
          <Text>
            <Text span fw={500}>
              Destino:{" "}
            </Text>
            {despacho.direccion_destino || "—"}
          </Text>
          <Text>
            <Text span fw={500}>
              Descripción:{" "}
            </Text>
            {despacho.descripcion_llamado || "—"}
          </Text>
          <Text>
            <Text span fw={500}>
              Llamado:{" "}
            </Text>
            {dayjs(despacho.fecha_llamado).format("DD/MM/YYYY HH:mm")}
          </Text>
          {despacho.fecha_programada && (
            <Text>
              <Text span fw={500}>
                Programado:{" "}
              </Text>
              {dayjs(despacho.fecha_programada).format("DD/MM/YYYY HH:mm")}
            </Text>
          )}
          {despacho.creado_por_id !== undefined && (
            <Text>
              <Text span fw={500}>
                Creado por:{" "}
              </Text>
              {nombrePersonal(despacho.creado_por_id)}
            </Text>
          )}
          {despacho.asignado_por_id !== undefined && (
            <Text>
              <Text span fw={500}>
                Asignado por:{" "}
              </Text>
              {nombrePersonal(despacho.asignado_por_id)}
            </Text>
          )}

          {despacho.personal.length > 0 && (
            <>
              <Divider label="Personal asignado" />
              <List size="sm">
                {despacho.personal.map((p) => (
                  <List.Item key={p.id}>
                    {p.first_name} {p.last_name}
                    {p.rol ? ` — ${p.rol}` : ""}
                  </List.Item>
                ))}
              </List>
              <Divider label="Ambulancia asignada" />

              {despacho.ambulancia_id && (
                <Text size="sm">
                  <Text span fw={500}>
                    Ambulancia:{" "}
                  </Text>
                  {patente ?? `#${despacho.ambulancia_id}`}
                </Text>
              )}
            </>
          )}

          {(despacho.estado === "recibido" ||
            despacho.estado === "programado") && (
            <Group mt="md">
              <Button onClick={onAssign}>Asignar</Button>
              <Button variant="light" onClick={onSchedule}>
                {despacho.estado === "programado" ? "Reprogramar" : "Programar"}
              </Button>
            </Group>
          )}
        </Stack>
      )}
    </Drawer>
  );
}
