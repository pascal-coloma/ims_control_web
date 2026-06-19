import { useMemo, useState } from "react";
import {
  ActionIcon,
  Button,
  Card,
  Group,
  Modal,
  NumberInput,
  Select,
  Stack,
  Text,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAmbulancias } from "../../../api/ambulancias";
import { getInventario } from "../../../api/inventario";
import { queryKeys } from "../../../api/queryKeys";
import { addInventario } from "../../../api/inventario";

interface SupplyRow {
  key: number;
  nombreInsumo: string;
  categoriaId: number | "";
  unidadMedidaId: number | "";
  cantidad: number | "";
  stock: number | "";
  ambulanciaId: string | null;
}

let nextKey = 1;
function emptyRow(): SupplyRow {
  return {
    key: nextKey++,
    nombreInsumo: "",
    categoriaId: "",
    unidadMedidaId: "",
    cantidad: "",
    stock: "",
    ambulanciaId: null,
  };
}

function isComplete(row: SupplyRow): boolean {
  return (
    row.nombreInsumo.trim() !== "" &&
    row.categoriaId !== "" &&
    row.unidadMedidaId !== "" &&
    row.cantidad !== "" &&
    row.stock !== "" &&
    row.ambulanciaId !== null
  );
}

interface AddSuppliesModalProps {
  opened: boolean;
  onClose: () => void;
}

export function AddSuppliesModal({ opened, onClose }: AddSuppliesModalProps) {
  const queryClient = useQueryClient();
  const [rows, setRows] = useState<SupplyRow[]>([emptyRow()]);

  const inventario = useQuery({
    queryKey: queryKeys.inventario.list(),
    queryFn: getInventario,
    enabled: opened,
  });
  const ambulancias = useQuery({
    queryKey: queryKeys.ambulancias.list(),
    queryFn: getAmbulancias,
    enabled: opened,
  });

  const categoriaOptions = useMemo(() => {
    const seen = new Map<number, string>();
    for (const row of inventario.data ?? [])
      seen.set(row.presentacion.categoria_id, row.presentacion.categoria);
    return Array.from(seen.entries()).map(([id, nombre]) => ({
      value: String(id),
      label: `${nombre} (#${id})`,
    }));
  }, [inventario.data]);

  const unidadMedidaHint = useMemo(() => {
    const seen = new Set<string>();
    for (const row of inventario.data ?? [])
      seen.add(row.presentacion.unidad_medida);
    return Array.from(seen).join(", ");
  }, [inventario.data]);

  const ambulanciaOptions = useMemo(
    () =>
      (ambulancias.data ?? []).map((a) => ({
        value: String(a.ambulancia_id),
        label: a.patente,
      })),
    [ambulancias.data],
  );

  const save = useMutation({
    mutationFn: () =>
      addInventario(
        rows.map((row) => ({
          nombre_insumo: row.nombreInsumo.trim(),
          categoria_id: Number(row.categoriaId),
          cantidad: Number(row.cantidad),
          unidad_medida_id: Number(row.unidadMedidaId),
          stock: Number(row.stock),
          ambulancia_id: Number(row.ambulanciaId),
        })),
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventario.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.ambulancias.list() });
      handleClose();
    },
  });

  function updateRow(key: number, patch: Partial<SupplyRow>) {
    setRows((current) =>
      current.map((row) => (row.key === key ? { ...row, ...patch } : row)),
    );
  }

  function removeRow(key: number) {
    setRows((current) =>
      current.length > 1 ? current.filter((row) => row.key !== key) : current,
    );
  }

  function handleClose() {
    setRows([emptyRow()]);
    onClose();
  }

  const allComplete = rows.every(isComplete);

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Agregar insumos (lote)"
      size="xl"
    >
      <Stack gap="sm">
        <Text size="xs" c="dimmed">
          Unidades de medida existentes (referencia): {unidadMedidaHint || "—"}
        </Text>

        {rows.map((row) => (
          <Card key={row.key} withBorder padding="sm">
            <Group align="flex-end" gap="xs" wrap="wrap">
              <TextInput
                label="Nombre"
                value={row.nombreInsumo}
                onChange={(event) =>
                  updateRow(row.key, {
                    nombreInsumo: event.currentTarget.value,
                  })
                }
                style={{ flex: 2, minWidth: 160 }}
                required
              />
              <Select
                label="Categoría"
                placeholder="Existente"
                data={categoriaOptions}
                value={row.categoriaId === "" ? null : String(row.categoriaId)}
                onChange={(value) =>
                  updateRow(row.key, {
                    categoriaId: value ? Number(value) : "",
                  })
                }
                searchable
                style={{ flex: 1, minWidth: 140 }}
              />
              <NumberInput
                label="ID categoría"
                value={row.categoriaId}
                onChange={(value) =>
                  updateRow(row.key, {
                    categoriaId: typeof value === "number" ? value : "",
                  })
                }
                min={1}
                w={100}
                required
              />
              <Tooltip
                label={`Unidades existentes: ${unidadMedidaHint || "—"}`}
              >
                <NumberInput
                  label="ID unidad"
                  value={row.unidadMedidaId}
                  onChange={(value) =>
                    updateRow(row.key, {
                      unidadMedidaId: typeof value === "number" ? value : "",
                    })
                  }
                  min={1}
                  w={100}
                  required
                />
              </Tooltip>
              <NumberInput
                label="Cant/dosis"
                value={row.cantidad}
                onChange={(value) =>
                  updateRow(row.key, {
                    cantidad: typeof value === "number" ? value : "",
                  })
                }
                min={0}
                allowDecimal
                w={100}
                required
              />
              <NumberInput
                label="Stock inicial"
                value={row.stock}
                onChange={(value) =>
                  updateRow(row.key, {
                    stock: typeof value === "number" ? value : "",
                  })
                }
                min={0}
                allowDecimal
                w={110}
                required
              />
              <Select
                label="Ambulancia"
                placeholder="Selecciona"
                data={ambulanciaOptions}
                value={row.ambulanciaId}
                onChange={(value) =>
                  updateRow(row.key, { ambulanciaId: value })
                }
                searchable
                style={{ flex: 1, minWidth: 120 }}
                required
              />
              <ActionIcon
                color="red"
                variant="subtle"
                onClick={() => removeRow(row.key)}
                disabled={rows.length === 1}
              >
                <IconTrash size={16} />
              </ActionIcon>
            </Group>
          </Card>
        ))}

        <Button
          variant="light"
          leftSection={<IconPlus size={16} />}
          onClick={() => setRows((current) => [...current, emptyRow()])}
        >
          Agregar fila
        </Button>

        <Group justify="flex-end">
          <Button variant="subtle" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            onClick={() => save.mutate()}
            loading={save.isPending}
            disabled={!allComplete}
          >
            Guardar lote
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
