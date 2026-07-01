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
  TextInput,
} from "@mantine/core";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAmbulancias } from "../../../api/ambulancias";
import { getInventario } from "../../../api/inventario";
import { queryKeys } from "../../../api/queryKeys";
import { addInventario } from "../../../api/inventario";
import { showError } from "../../../utils/notify";

// ponytail: catálogo fijo de categorías (tabla `categoria`), porque /inventario
// puede llegar vacío (p.ej. inventario recién borrado) y ya no hay de dónde derivarlo.
const CATEGORIA_IDS: Record<string, number> = {
  ANALGESICOS: 1,
  SEDANTES: 2,
  ANTIARRITMICOS: 3,
  VASOACTIVOS: 4,
  SUEROS: 5,
  ANTIBIOTICOS: 6,
  ANTICONVULSIVANTES: 7,
  BRONCODILATADORES: 8,
  CORTICOIDES: 9,
  ANTIEMETICOS: 10,
  JERINGAS: 11,
  AGUJAS: 12,
  CATETERES: 13,
  GUANTES: 14,
  "GASAS Y APOSITOS": 15,
  VENDAS: 16,
  "VIA AEREA": 17,
  OXIGENOTERAPIA: 18,
  INMOVILIZACION: 19,
  SUTURA: 20,
};

// ponytail: /inventario no expone unidad_medida_id (solo el nombre), así que
// esta tabla es el único lugar que traduce el label elegido al id a enviar.
const UNIDAD_MEDIDA_IDS: Record<string, number> = {
  MG: 1,
  ML: 2,
  G: 3,
  UNIDAD: 4,
  AMPOLLA: 5,
  FRASCO: 6,
  CAJA: 7,
};

interface SupplyRow {
  key: number;
  nombreInsumo: string;
  categoria: string | null;
  unidadMedida: string | null;
  cantidad: number | "";
  stock: number | "";
  ambulanciaId: string | null;
}

let nextKey = 1;
function emptyRow(): SupplyRow {
  return {
    key: nextKey++,
    nombreInsumo: "",
    categoria: null,
    unidadMedida: null,
    cantidad: "",
    stock: "",
    ambulanciaId: null,
  };
}

function isComplete(row: SupplyRow): boolean {
  return (
    row.nombreInsumo.trim() !== "" &&
    row.categoria !== null &&
    row.unidadMedida !== null &&
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
    const seen = new Set<string>();
    for (const row of inventario.data ?? [])
      seen.add(row.presentacion.categoria);
    for (const label of Object.keys(CATEGORIA_IDS)) seen.add(label);
    return Array.from(seen).map((label) => ({ value: label, label }));
  }, [inventario.data]);

  const unidadMedidaOptions = useMemo(() => {
    const seen = new Set<string>();
    for (const row of inventario.data ?? [])
      seen.add(row.presentacion.unidad_medida);
    for (const label of Object.keys(UNIDAD_MEDIDA_IDS)) seen.add(label);
    return Array.from(seen).map((label) => ({ value: label, label }));
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
          categoria_id: CATEGORIA_IDS[row.categoria!],
          cantidad: Number(row.cantidad),
          unidad_medida_id: UNIDAD_MEDIDA_IDS[row.unidadMedida!],
          stock: Number(row.stock),
          ambulancia_id: Number(row.ambulanciaId),
        })),
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventario.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.ambulancias.list() });
      handleClose();
    },
    onError: (err) => showError(err),
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
                placeholder="Selecciona"
                data={categoriaOptions}
                value={row.categoria}
                onChange={(value) => updateRow(row.key, { categoria: value })}
                searchable
                required
                style={{ flex: 1, minWidth: 140 }}
              />
              <Select
                label="Unidad de medida"
                placeholder="Selecciona"
                data={unidadMedidaOptions}
                value={row.unidadMedida}
                onChange={(value) =>
                  updateRow(row.key, { unidadMedida: value })
                }
                searchable
                required
                style={{ flex: 1, minWidth: 140 }}
              />
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
