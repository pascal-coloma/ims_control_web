import { useMemo, useState } from "react";
import { Button, Group, Modal, Select, Stack } from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { programarDespacho } from "../../../api/despachos";
import { getGrupos, toGrupoOptions } from "../../../api/grupos";
import { queryKeys } from "../../../api/queryKeys";

interface ScheduleDispatchModalProps {
  despachoId: number;
  opened: boolean;
  onClose: () => void;
}

export function ScheduleDispatchModal({
  despachoId,
  opened,
  onClose,
}: ScheduleDispatchModalProps) {
  const queryClient = useQueryClient();
  const [grupoId, setGrupoId] = useState<string | null>(null);
  const [fecha, setFecha] = useState<Date | null>(null);

  const grupos = useQuery({
    queryKey: queryKeys.grupos.list(),
    queryFn: getGrupos,
    enabled: opened,
  });

  const grupoOptions = useMemo(
    () => toGrupoOptions(grupos.data ?? []),
    [grupos.data],
  );

  const schedule = useMutation({
    mutationFn: () =>
      programarDespacho({
        despacho_id: despachoId,
        fecha_programada: (fecha as Date).toISOString(),
        grupo_id: Number(grupoId),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.despachos.list() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.despachos.detail(despachoId),
      });
      handleClose();
    },
  });

  function handleClose() {
    setGrupoId(null);
    setFecha(null);
    onClose();
  }

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={`Programar Despacho #${despachoId}`}
    >
      <Stack gap="sm">
        <DateTimePicker
          label="Fecha y hora programada"
          placeholder="Selecciona fecha y hora"
          value={fecha}
          onChange={(value) => setFecha(value ? new Date(value) : null)}
          minDate={new Date()}
          required
        />
        <Select
          label="Grupo"
          placeholder="Selecciona un grupo"
          data={grupoOptions}
          value={grupoId}
          onChange={setGrupoId}
          searchable
          required
        />
        <Group justify="flex-end">
          <Button variant="subtle" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            onClick={() => schedule.mutate()}
            loading={schedule.isPending}
            disabled={!fecha || !grupoId}
          >
            Confirmar
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
