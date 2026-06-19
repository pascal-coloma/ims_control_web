import { useState } from "react";
import {
  Alert,
  Button,
  Group,
  Modal,
  NumberInput,
  Stack,
  Text,
} from "@mantine/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "../../../api/client";
import { updateInventario } from "../../../api/inventario";
import { queryKeys } from "../../../api/queryKeys";

export interface AdjustStockTarget {
  presentacionId: number;
  ambulanciaId: number;
  insumoNombre: string;
  patente: string;
  currentStock: number;
}

interface AdjustStockModalProps {
  target: AdjustStockTarget | null;
  onClose: () => void;
}

export function AdjustStockModal({ target, onClose }: AdjustStockModalProps) {
  const queryClient = useQueryClient();
  const [delta, setDelta] = useState<number | "">("");
  const [notFoundError, setNotFoundError] = useState(false);

  const adjust = useMutation({
    mutationFn: () =>
      updateInventario({
        presentacion_id: (target as AdjustStockTarget).presentacionId,
        ambulancia_id: (target as AdjustStockTarget).ambulanciaId,
        cantidad: Number(delta),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventario.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.ambulancias.list() });
      handleClose();
    },
    onError: (err) => {
      if (err instanceof ApiError && err.status === 404) setNotFoundError(true);
    },
  });

  function handleClose() {
    setDelta("");
    setNotFoundError(false);
    onClose();
  }

  if (!target) return null;

  const result = target.currentStock + (typeof delta === "number" ? delta : 0);

  return (
    <Modal
      opened
      onClose={handleClose}
      title={`Ajustar stock — ${target.insumoNombre} @${target.patente}`}
    >
      <Stack gap="sm">
        <Text size="sm">Stock actual: {target.currentStock}</Text>
        <NumberInput
          label="Ajuste (± unidades)"
          value={delta}
          onChange={(value) => setDelta(typeof value === "number" ? value : "")}
          allowDecimal
          required
        />
        <Text size="sm" c="dimmed">
          Resultado previsto: {target.currentStock} + (
          {typeof delta === "number" ? delta : 0}) = {result}
        </Text>

        {notFoundError && (
          <Alert color="red" variant="light">
            No existe stock registrado para este insumo en esta ambulancia
          </Alert>
        )}

        <Group justify="flex-end">
          <Button variant="subtle" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            onClick={() => adjust.mutate()}
            loading={adjust.isPending}
            disabled={delta === ""}
          >
            Aplicar
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
