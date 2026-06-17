import { useMemo, useState } from "react";
import {
  Alert,
  Button,
  Checkbox,
  Group,
  Modal,
  Select,
  Stack,
  Switch,
} from "@mantine/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAmbulancias } from "../../../api/ambulancias";
import { asignarDespacho } from "../../../api/despachos";
import { ApiError } from "../../../api/client";
import { getGrupos, toGrupoOptions } from "../../../api/grupos";
import { queryKeys } from "../../../api/queryKeys";

interface AssignDispatchModalProps {
  despachoId: number;
  opened: boolean;
  onClose: () => void;
}

export function AssignDispatchModal({
  despachoId,
  opened,
  onClose,
}: AssignDispatchModalProps) {
  const queryClient = useQueryClient();
  const [ambId, setAmbId] = useState<string | null>(null);
  const [grupoId, setGrupoId] = useState<string | null>(null);
  const [isEmergency, setIsEmergency] = useState(false);
  const [showAllAmbulances, setShowAllAmbulances] = useState(false);
  const [conflictError, setConflictError] = useState<string | null>(null);

  const ambulancias = useQuery({
    queryKey: queryKeys.ambulancias.list(),
    queryFn: getAmbulancias,
    enabled: opened,
  });
  const grupos = useQuery({
    queryKey: queryKeys.grupos.list(),
    queryFn: getGrupos,
    enabled: opened,
  });

  const ambulanceOptions = useMemo(() => {
    const data = ambulancias.data ?? [];
    const filtered = showAllAmbulances
      ? data
      : data.filter((a) => a.estado === "disponible");
    return filtered.map((a) => ({
      value: String(a.ambulancia_id),
      label: showAllAmbulances ? `${a.patente} (${a.estado})` : a.patente,
    }));
  }, [ambulancias.data, showAllAmbulances]);

  const grupoOptions = useMemo(
    () => toGrupoOptions(grupos.data ?? []),
    [grupos.data],
  );

  const assign = useMutation({
    mutationFn: () =>
      asignarDespacho({
        despacho_id: despachoId,
        amb_id: Number(ambId),
        grupo_id: Number(grupoId),
        is_emergency: isEmergency,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.despachos.list() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.despachos.detail(despachoId),
      });
      handleClose();
    },
    onError: (err) => {
      if (err instanceof ApiError && err.status === 409) {
        setConflictError(
          err.errorMessage ?? "Este grupo ya está asignado a este despacho",
        );
      }
    },
  });

  function handleClose() {
    setAmbId(null);
    setGrupoId(null);
    setIsEmergency(false);
    setConflictError(null);
    onClose();
  }

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={`Asignar Despacho #${despachoId}`}
    >
      <Stack gap="sm">
        <Switch
          label="Mostrar todas las ambulancias"
          checked={showAllAmbulances}
          onChange={(event) =>
            setShowAllAmbulances(event.currentTarget.checked)
          }
        />
        <Select
          label="Ambulancia"
          placeholder="Selecciona una ambulancia"
          data={ambulanceOptions}
          value={ambId}
          onChange={setAmbId}
          searchable
          required
        />
        <Select
          label="Grupo"
          placeholder="Selecciona un grupo"
          data={grupoOptions}
          value={grupoId}
          onChange={(value) => {
            setGrupoId(value);
            setConflictError(null);
          }}
          searchable
          required
        />
        <Checkbox
          label="Marcar como emergencia"
          checked={isEmergency}
          onChange={(event) => setIsEmergency(event.currentTarget.checked)}
        />

        {conflictError && (
          <Alert color="red" variant="light">
            {conflictError}
          </Alert>
        )}

        <Group justify="flex-end">
          <Button variant="subtle" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            onClick={() => assign.mutate()}
            loading={assign.isPending}
            disabled={!ambId || !grupoId}
          >
            Confirmar
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
