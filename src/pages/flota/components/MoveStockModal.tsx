import { useMemo, useState } from "react";
import {
  Alert,
  Button,
  Group,
  Modal,
  NumberInput,
  Select,
  Stack,
  Text,
} from "@mantine/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAmbulancias } from "../../../api/ambulancias";
import { ApiError } from "../../../api/client";
import { moveInventario } from "../../../api/inventario";
import { queryKeys } from "../../../api/queryKeys";

export interface MoveStockTarget {
  presentacionId: number;
  insumoNombre: string;
  fromAmbulanciaId: number;
  fromPatente: string;
  fromStock: number;
}

interface MoveStockModalProps {
  target: MoveStockTarget | null;
  onClose: () => void;
}

export function MoveStockModal({ target, onClose }: MoveStockModalProps) {
  const queryClient = useQueryClient();
  const [toAmbulanciaId, setToAmbulanciaId] = useState<string | null>(null);
  const [cantidad, setCantidad] = useState<number | "">("");
  const [conflictError, setConflictError] = useState<string | null>(null);
  const [notFoundError, setNotFoundError] = useState(false);

  const ambulancias = useQuery({
    queryKey: queryKeys.ambulancias.list(),
    queryFn: getAmbulancias,
    enabled: target !== null,
  });

  const destinationOptions = useMemo(
    () =>
      (ambulancias.data ?? [])
        .filter((a) => a.ambulancia_id !== target?.fromAmbulanciaId)
        .map((a) => ({ value: String(a.ambulancia_id), label: a.patente })),
    [ambulancias.data, target],
  );

  const move = useMutation({
    mutationFn: () =>
      moveInventario({
        presentacion_id: (target as MoveStockTarget).presentacionId,
        ambulancia_from_id: (target as MoveStockTarget).fromAmbulanciaId,
        ambulancia_to_id: Number(toAmbulanciaId),
        cantidad: Number(cantidad),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventario.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.ambulancias.list() });
      handleClose();
    },
    onError: (err) => {
      if (err instanceof ApiError && err.status === 409) {
        setConflictError(
          err.errorMessage ?? `Stock insuficiente en ${target?.fromPatente}`,
        );
      } else if (err instanceof ApiError && err.status === 404) {
        setNotFoundError(true);
      }
    },
  });

  function handleClose() {
    setToAmbulanciaId(null);
    setCantidad("");
    setConflictError(null);
    setNotFoundError(false);
    onClose();
  }

  if (!target) return null;

  return (
    <Modal
      opened
      onClose={handleClose}
      title={`Mover stock — ${target.insumoNombre}`}
    >
      <Stack gap="sm">
        <Text size="sm">
          Desde: {target.fromPatente} ({target.fromStock} disponibles)
        </Text>
        <Select
          label="Hacia"
          placeholder="Selecciona ambulancia destino"
          data={destinationOptions}
          value={toAmbulanciaId}
          onChange={setToAmbulanciaId}
          searchable
          required
        />
        <NumberInput
          label="Cantidad"
          value={cantidad}
          onChange={(value) => {
            setCantidad(typeof value === "number" ? value : "");
            setConflictError(null);
          }}
          min={0}
          allowDecimal
          required
        />

        {conflictError && (
          <Alert color="red" variant="light">
            {conflictError}
          </Alert>
        )}
        {notFoundError && (
          <Alert color="red" variant="light">
            Presentación o ambulancia no encontrada
          </Alert>
        )}

        <Group justify="flex-end">
          <Button variant="subtle" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            onClick={() => move.mutate()}
            loading={move.isPending}
            disabled={!toAmbulanciaId || cantidad === "" || cantidad <= 0}
          >
            Mover
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
