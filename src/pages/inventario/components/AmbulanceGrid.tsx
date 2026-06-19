import { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Button,
  Card,
  Group,
  List,
  Select,
  SimpleGrid,
  Text,
  TextInput,
} from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getAmbulancias } from "../../../api/ambulancias";
import { queryKeys } from "../../../api/queryKeys";
import { CardSkeleton } from "../../../components/CardSkeleton";
import { ListPagination } from "../../../components/ListPagination";
import { usePagedData } from "../../../hooks/usePagedData";
import type { AmbulanciaEstado } from "../../../types/api";
import { BODEGA_PATENTE, ESTADO_COLOR, ESTADO_LABEL } from "../../../constants/ambulancia";

const POLL_INTERVAL_MS = 120_000;

const ESTADO_OPTIONS: { value: AmbulanciaEstado; label: string }[] = (
  Object.entries(ESTADO_LABEL) as [AmbulanciaEstado, string][]
).map(([value, label]) => ({ value, label }));

export function AmbulanceGrid() {
  const navigate = useNavigate();
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

      {ambulancias.isLoading ? (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} lines={4} />
          ))}
        </SimpleGrid>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
          {pageItems.map((amb, i) => (
            <Card key={i} withBorder>
              <Group justify="space-between" mb="xs">
                <Text fw={700}>{amb.patente}</Text>
                <Badge color={ESTADO_COLOR[amb.estado]} variant="light">
                  {ESTADO_LABEL[amb.estado] ?? amb.estado}
                </Badge>
              </Group>
              <List size="sm" mb="sm">
                {amb.stock.slice(0, 5).map((item, i) => (
                  <List.Item key={i}>
                    {item.insumo_nombre}: {item.stock} {item.unidad_medida}
                  </List.Item>
                ))}
                {amb.stock.length === 0 && (
                  <Text size="sm" c="dimmed">
                    Sin stock registrado
                  </Text>
                )}
                {amb.stock.length > 5 && (
                  <Text size="xs" c="dimmed">
                    +{amb.stock.length - 5} más
                  </Text>
                )}
              </List>
              <Button
                size="xs"
                variant="light"
                onClick={() => navigate(`/inventario/${amb.ambulancia_id}`)}
              >
                Ver detalle
              </Button>
            </Card>
          ))}
        </SimpleGrid>
      )}

      {!ambulancias.isLoading && rows.length === 0 && (
        <Text c="dimmed" ta="center" mt="md">
          Sin resultados
        </Text>
      )}
      <ListPagination page={page} totalPages={totalPages} onChange={setPage} />
    </>
  );
}
