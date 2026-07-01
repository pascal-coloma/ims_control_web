import { useState } from "react";
import { Button, Group, Modal, Select, Stack, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { registrarAmbulancia } from "../../../api/ambulancias";
import { queryKeys } from "../../../api/queryKeys";
import { ESTADO_DISPONIBLE, ESTADO_LABEL } from "../../../constants/ambulancia";
import type { AmbulanciaEstado } from "../../../types/api";
import { showError } from "../../../utils/notify";

const ESTADO_INICIAL_OPTIONS: AmbulanciaEstado[] = [
  ESTADO_DISPONIBLE,
  "Preparación previa para operar",
  "En mantención",
];

const ESTADO_OPTIONS: { value: AmbulanciaEstado; label: string }[] =
  ESTADO_INICIAL_OPTIONS.map((value) => ({
    value,
    label: ESTADO_LABEL[value],
  }));

interface RegisterAmbulanceModalProps {
  opened: boolean;
  onClose: () => void;
}

export function RegisterAmbulanceModal({
  opened,
  onClose,
}: RegisterAmbulanceModalProps) {
  const queryClient = useQueryClient();
  const [patente, setPatente] = useState("");
  const [modelo, setModelo] = useState("");
  const [estado, setEstado] = useState<AmbulanciaEstado>(ESTADO_DISPONIBLE);

  const create = useMutation({
    mutationFn: () =>
      registrarAmbulancia({
        patente,
        modelo,
        estado_disponibilidad: estado,
      }),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.ambulancias.list() });
      notifications.show({
        color: "green",
        title: "Ambulancia registrada",
        message: `Ambulancia #${result.ambulancia_id} creada correctamente`,
      });
      handleClose();
    },
    onError: (err) => showError(err),
  });

  function handleClose() {
    setPatente("");
    setModelo("");
    setEstado(ESTADO_DISPONIBLE);
    onClose();
  }

  const valid = patente.trim() !== "" && modelo.trim() !== "";

  return (
    <Modal opened={opened} onClose={handleClose} title="Agregar Ambulancia">
      <Stack gap="sm">
        <TextInput
          label="Patente"
          value={patente}
          maxLength={10}
          onChange={(event) =>
            setPatente(event.currentTarget.value.toUpperCase())
          }
          required
        />
        <TextInput
          label="Modelo"
          value={modelo}
          maxLength={100}
          onChange={(event) => setModelo(event.currentTarget.value)}
          required
        />
        <Select
          label="Estado inicial"
          data={ESTADO_OPTIONS}
          value={estado}
          onChange={(value) => value && setEstado(value as AmbulanciaEstado)}
          required
        />

        <Group justify="flex-end">
          <Button variant="subtle" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            onClick={() => create.mutate()}
            loading={create.isPending}
            disabled={!valid}
          >
            Crear
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
