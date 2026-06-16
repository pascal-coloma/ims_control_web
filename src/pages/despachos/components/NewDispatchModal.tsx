import { useMemo, useState } from "react";
import {
  Button,
  Group,
  Modal,
  Select,
  Stack,
  Switch,
  Textarea,
  TextInput,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addDespacho, programarDespacho } from "../../../api/despachos";
import { getGrupos } from "../../../api/grupos";
import { queryKeys } from "../../../api/queryKeys";
import { PatientLookupOrRegister } from "../../../components/patients/PatientLookupOrRegister";
import type { Paciente } from "../../../types/api";

interface NewDispatchModalProps {
  opened: boolean;
  onClose: () => void;
}

export function NewDispatchModal({ opened, onClose }: NewDispatchModalProps) {
  const queryClient = useQueryClient();
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [direccionOrigen, setDireccionOrigen] = useState("");
  const [direccionDestino, setDireccionDestino] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [isEmergency, setIsEmergency] = useState(true);
  const [fecha, setFecha] = useState<Date | null>(null);
  const [grupoId, setGrupoId] = useState<string | null>(null);

  const grupos = useQuery({
    queryKey: queryKeys.grupos.list(),
    queryFn: getGrupos,
    enabled: opened && !isEmergency,
  });

  const grupoOptions = useMemo(
    () =>
      (grupos.data ?? []).map((g) => ({
        value: String(g.grupo_id),
        label: `${g.grupo_nombre} (${g.miembros.length} miembros)`,
      })),
    [grupos.data],
  );

  const create = useMutation({
    mutationFn: async () => {
      const response = await addDespacho({
        direccion_origen: direccionOrigen,
        direccion_destino: direccionDestino || undefined,
        descripcion_llamado: descripcion || undefined,
        paciente_rut: (paciente as Paciente).rut,
      });
      if (!isEmergency) {
        await programarDespacho({
          despacho_id: response.despacho.id,
          fecha_programada: (fecha as Date).toISOString(),
          grupo_id: Number(grupoId),
        });
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.despachos.list() });
      handleClose();
    },
  });

  function handleClose() {
    setPaciente(null);
    setDireccionOrigen("");
    setDireccionDestino("");
    setDescripcion("");
    setIsEmergency(true);
    setFecha(null);
    setGrupoId(null);
    onClose();
  }

  const canSubmit =
    !!paciente &&
    !!direccionOrigen.trim() &&
    (isEmergency || (!!fecha && !!grupoId));

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Nuevo Despacho"
      size="lg"
    >
      <Stack gap="sm">
        <PatientLookupOrRegister onResolved={setPaciente} />

        <TextInput
          label="Dirección origen"
          value={direccionOrigen}
          onChange={(event) => setDireccionOrigen(event.currentTarget.value)}
          required
        />
        <TextInput
          label="Dirección destino"
          value={direccionDestino}
          onChange={(event) => setDireccionDestino(event.currentTarget.value)}
        />
        <Textarea
          label="Descripción"
          value={descripcion}
          onChange={(event) => setDescripcion(event.currentTarget.value)}
          minRows={2}
        />

        <Switch
          label="Es una emergencia"
          checked={isEmergency}
          onChange={(event) => setIsEmergency(event.currentTarget.checked)}
        />

        {!isEmergency && (
          <>
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
          </>
        )}

        <Group justify="flex-end">
          <Button variant="subtle" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            onClick={() => create.mutate()}
            loading={create.isPending}
            disabled={!canSubmit}
          >
            Crear
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
