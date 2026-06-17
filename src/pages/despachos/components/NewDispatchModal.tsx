import { useMemo, useState } from "react";
import {
  Button,
  Group,
  Modal,
  Select,
  Stack,
  Switch,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAmbulancias } from "../../../api/ambulancias";
import {
  addDespacho,
  asignarDespacho,
  programarDespacho,
} from "../../../api/despachos";
import { getGrupos, toGrupoOptions } from "../../../api/grupos";
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
  const [ambId, setAmbId] = useState<string | null>(null);
  const [grupoId, setGrupoId] = useState<string | null>(null);
  const [fecha, setFecha] = useState<Date | null>(null);

  const ambulancias = useQuery({
    queryKey: queryKeys.ambulancias.list(),
    queryFn: getAmbulancias,
    enabled: opened && isEmergency,
  });

  const grupos = useQuery({
    queryKey: queryKeys.grupos.list(),
    queryFn: getGrupos,
    enabled: opened,
  });

  const ambulanciaOptions = useMemo(
    () =>
      (ambulancias.data ?? [])
        .filter((a) => a.estado === "disponible")
        .map((a) => ({ value: String(a.ambulancia_id), label: a.patente })),
    [ambulancias.data],
  );

  const grupoOptions = useMemo(
    () => toGrupoOptions(grupos.data ?? []),
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

      const despachoId = response.despacho.id;

      if (isEmergency) {
        if (ambId && grupoId) {
          await asignarDespacho({
            despacho_id: despachoId,
            amb_id: Number(ambId),
            grupo_id: Number(grupoId),
            is_emergency: true,
          });
        }
        // Sin amb/grupo → queda en 'recibido'
      } else {
        await programarDespacho({
          despacho_id: despachoId,
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
    setAmbId(null);
    setGrupoId(null);
    setFecha(null);
    create.reset();
    onClose();
  }

  function handleEmergencyToggle(val: boolean) {
    setIsEmergency(val);
    setAmbId(null);
    setGrupoId(null);
    setFecha(null);
  }

  const canSubmit =
    !!paciente &&
    !!direccionOrigen.trim() &&
    (isEmergency || (!!fecha && !!grupoId));

  const noAmbulances =
    isEmergency && !ambulancias.isLoading && ambulanciaOptions.length === 0;

  const noGrupos = !grupos.isLoading && grupoOptions.length === 0;

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
          onChange={(e) => setDireccionOrigen(e.currentTarget.value)}
          required
        />
        <TextInput
          label="Dirección destino"
          value={direccionDestino}
          onChange={(e) => setDireccionDestino(e.currentTarget.value)}
        />
        <Textarea
          label="Descripción"
          value={descripcion}
          onChange={(e) => setDescripcion(e.currentTarget.value)}
          minRows={2}
        />

        <Switch
          label="Es una emergencia"
          checked={isEmergency}
          onChange={(e) => handleEmergencyToggle(e.currentTarget.checked)}
        />

        {isEmergency ? (
          <Stack gap="xs">
            <Text size="sm" c="dimmed">
              Ambulancia y equipo opcionales — si no se asignan el despacho
              queda en <strong>recibido</strong>.
            </Text>

            {noAmbulances ? (
              <Text size="sm" c="orange">
                No hay ambulancias disponibles en este momento.
              </Text>
            ) : (
              <Select
                label="Ambulancia (opcional)"
                placeholder="Sin asignar"
                data={ambulanciaOptions}
                value={ambId}
                onChange={setAmbId}
                searchable
                clearable
                disabled={ambulancias.isLoading}
              />
            )}

            {noGrupos ? (
              <Text size="sm" c="orange">
                No hay grupos disponibles en este momento.
              </Text>
            ) : (
              <Select
                label="Equipo (opcional)"
                placeholder="Sin asignar"
                data={grupoOptions}
                value={grupoId}
                onChange={setGrupoId}
                searchable
                clearable
                disabled={grupos.isLoading}
              />
            )}

            {ambId && !grupoId && (
              <Text size="xs" c="dimmed">
                Para asignar ambulancia también debes seleccionar un equipo.
              </Text>
            )}
            {!ambId && grupoId && (
              <Text size="xs" c="dimmed">
                Para asignar equipo también debes seleccionar una ambulancia.
              </Text>
            )}
          </Stack>
        ) : (
          <Stack gap="xs">
            <DateTimePicker
              label="Fecha y hora programada"
              placeholder="Selecciona fecha y hora"
              value={fecha}
              onChange={(value) => setFecha(value ? new Date(value) : null)}
              minDate={new Date()}
              required
            />
            {noGrupos ? (
              <Text size="sm" c="orange">
                No hay grupos disponibles. Crea un grupo antes de programar.
              </Text>
            ) : (
              <Select
                label="Grupo"
                placeholder="Selecciona un grupo"
                data={grupoOptions}
                value={grupoId}
                onChange={setGrupoId}
                searchable
                disabled={grupos.isLoading}
                required
              />
            )}
          </Stack>
        )}

        {create.isError && (
          <Text size="sm" c="red">
            Error al crear el despacho. Intenta nuevamente.
          </Text>
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
