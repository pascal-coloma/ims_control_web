import { useEffect, useMemo, useState } from "react";
import {
  Anchor,
  Badge,
  Group,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getAtenciones } from "../../api/atenciones";
import { queryKeys } from "../../api/queryKeys";
import { ListPagination } from "../../components/ListPagination";
import { TableSkeleton } from "../../components/TableSkeleton";
import { usePagedData } from "../../hooks/usePagedData";
import type { EstadoSello } from "../../types/api";
import { AtencionDetailDrawer } from "./components/AtencionDetailDrawer";

const COLUMN_COUNT = 6;

const SELLO_COLOR: Record<EstadoSello, string> = {
  Pendiente: "yellow",
  Firmado: "green",
};

const SELLO_OPTIONS = [
  { value: "todos", label: "Todos" },
  { value: "Pendiente", label: "Pendiente" },
  { value: "Firmado", label: "Firmado" },
];

export function AtencionesPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const detailId = id ? Number(id) : null;

  const [sello, setSello] = useState<string | null>("todos");
  const [search, setSearch] = useState("");

  const atenciones = useQuery({
    queryKey: queryKeys.atenciones.list(),
    queryFn: getAtenciones,
  });

  const filtered = useMemo(() => {
    const all = atenciones.data ?? [];
    const term = search.trim().toLowerCase();
    return all.filter((a) => {
      if (sello && sello !== "todos" && a.estado_sello !== sello) return false;
      if (!term) return true;
      const nombre = a.despacho?.paciente?.nombre.toLowerCase() ?? "";
      const rut = a.despacho?.paciente?.rut.toLowerCase() ?? "";
      return nombre.includes(term) || rut.includes(term);
    });
  }, [atenciones.data, sello, search]);

  const { page, setPage, totalPages, pageItems } = usePagedData(filtered);

  useEffect(() => setPage(1), [sello, search, setPage]);

  const selected = useMemo(
    () =>
      (atenciones.data ?? []).find((a) => a.atencion_id === detailId) ?? null,
    [atenciones.data, detailId],
  );

  return (
    <Stack gap="md">
      <Title order={2}>Atenciones (Registros Clínicos)</Title>

      <Group align="flex-end">
        <Select
          label="Sello"
          data={SELLO_OPTIONS}
          value={sello}
          onChange={setSello}
          w={160}
        />
        <TextInput
          label="Buscar paciente/RUT"
          placeholder="Nombre o RUT"
          value={search}
          onChange={(event) => setSearch(event.currentTarget.value)}
          w={260}
        />
      </Group>

      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>ID</Table.Th>
            <Table.Th>Paciente</Table.Th>
            <Table.Th>Salida</Table.Th>
            <Table.Th>Llegada</Table.Th>
            <Table.Th>Sello</Table.Th>
            <Table.Th>Despacho</Table.Th>
          </Table.Tr>
        </Table.Thead>
        {atenciones.isLoading ? (
          <TableSkeleton columns={COLUMN_COUNT} />
        ) : (
          <Table.Tbody>
            {pageItems.map((a) => (
              <Table.Tr
                key={a.atencion_id}
                onClick={() => navigate(`/atenciones/${a.atencion_id}`)}
                style={{ cursor: "pointer" }}
              >
                <Table.Td>#{a.atencion_id}</Table.Td>
                <Table.Td>
                  {a.despacho?.paciente
                    ? `${a.despacho.paciente.nombre} (${a.despacho.paciente.rut})`
                    : "—"}
                </Table.Td>
                <Table.Td>
                  {dayjs(a.hora_salida).format("DD/MM HH:mm")}
                </Table.Td>
                <Table.Td>
                  {a.hora_llegada
                    ? dayjs(a.hora_llegada).format("DD/MM HH:mm")
                    : "—"}
                </Table.Td>
                <Table.Td>
                  <Badge color={SELLO_COLOR[a.estado_sello]} variant="light">
                    {a.estado_sello}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  {a.despacho ? (
                    <Anchor
                      component={Link}
                      to={`/despachos/${a.despacho.despacho_id}`}
                      onClick={(event) => event.stopPropagation()}
                    >
                      #{a.despacho.despacho_id}
                    </Anchor>
                  ) : (
                    "—"
                  )}
                </Table.Td>
              </Table.Tr>
            ))}
            {filtered.length === 0 && (
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
      <ListPagination page={page} totalPages={totalPages} onChange={setPage} />

      {selected && (
        <AtencionDetailDrawer
          atencion={selected}
          opened
          onClose={() => navigate("/atenciones")}
        />
      )}
    </Stack>
  );
}
