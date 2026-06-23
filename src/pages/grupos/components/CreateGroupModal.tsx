import { useMemo, useState } from "react";
import {
  Button,
  Group,
  Modal,
  MultiSelect,
  Stack,
  TextInput,
} from "@mantine/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { crearGrupo } from "../../../api/grupos";
import { getPersonal } from "../../../api/personal";
import { queryKeys } from "../../../api/queryKeys";
import { showError } from "../../../utils/notify";

interface CreateGroupModalProps {
  opened: boolean;
  onClose: () => void;
}

export function CreateGroupModal({ opened, onClose }: CreateGroupModalProps) {
  const queryClient = useQueryClient();
  const [nombre, setNombre] = useState("");
  const [personalIds, setPersonalIds] = useState<string[]>([]);

  const personal = useQuery({
    queryKey: queryKeys.personal.list(),
    queryFn: getPersonal,
    enabled: opened,
  });

  const personalOptions = useMemo(
    () =>
      (personal.data ?? []).map((p) => ({
        value: String(p.id),
        label: `${p.first_name} ${p.last_name} (${p.rut})${p.rol_nombre ? ` — ${p.rol_nombre}` : ""}`,
      })),
    [personal.data],
  );

  const create = useMutation({
    mutationFn: () =>
      crearGrupo({ nombre_grupo: nombre, personal: personalIds.map(Number) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.grupos.list() });
      handleClose();
    },
    onError: (err) => showError(err),
  });

  function handleClose() {
    setNombre("");
    setPersonalIds([]);
    onClose();
  }

  return (
    <Modal opened={opened} onClose={handleClose} title="Crear Grupo">
      <Stack gap="sm">
        <TextInput
          label="Nombre del grupo"
          value={nombre}
          onChange={(event) => setNombre(event.currentTarget.value)}
          required
        />
        <MultiSelect
          label="Miembros"
          placeholder="Selecciona el personal"
          data={personalOptions}
          value={personalIds}
          onChange={setPersonalIds}
          searchable
          required
        />
        <Group justify="flex-end">
          <Button variant="subtle" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            onClick={() => create.mutate()}
            loading={create.isPending}
            disabled={!nombre.trim() || personalIds.length === 0}
          >
            Crear
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
