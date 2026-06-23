import { useState } from "react";
import {
  Button,
  Group,
  Modal,
  Select,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { useMutation } from "@tanstack/react-query";
import { addPersonal } from "../../../api/personal";
import type { AddStaffResponse, PersonalListItem } from "../../../types/api";
import { cleanRut, formatRut } from "../../../utils/rut";

const ROLES = [
  { label: "Control", value: "1" },
  { label: "Médico", value: "2" },
  { label: "TENS", value: "3" },
  { label: "Chofer", value: "4" },
];

interface AddStaffModalProps {
  opened: boolean;
  onClose: () => void;
  onProvisioned: (result: AddStaffResponse) => void;
  existing: PersonalListItem[];
}

export function AddStaffModal({
  opened,
  onClose,
  onProvisioned,
  existing,
}: AddStaffModalProps) {
  const [rut, setRut] = useState("");
  const [username, setUsername] = useState("");
  const [usernameTouched, setUsernameTouched] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [rolId, setRolId] = useState<string | null>(null);

  // Backend stores RUTs without dots but with the dash (e.g. "12345678-9").
  const backendRut = rut.replace(/\./g, "");
  const duplicate = existing.find((p) => cleanRut(p.rut) === cleanRut(rut));

  const create = useMutation({
    mutationFn: () =>
      addPersonal({
        username: username || backendRut,
        first_name: firstName,
        last_name: lastName,
        rut: backendRut,
        rol_id: Number(rolId!),
      }),
    onSuccess: (result) => {
      onProvisioned(result);
      handleClose();
    },
  });

  function handleClose() {
    setRut("");
    setUsername("");
    setUsernameTouched(false);
    setFirstName("");
    setLastName("");
    setRolId(null);
    onClose();
  }

  const valid =
    rut.trim() &&
    firstName.trim() &&
    lastName.trim() &&
    rolId !== null &&
    !duplicate;

  return (
    <Modal opened={opened} onClose={handleClose} title="Agregar Personal">
      <Stack gap="sm">
        <TextInput
          label="RUT"
          value={rut}
          placeholder="11.222.333-4"
          error={
            duplicate &&
            `RUT ya registrado para ${duplicate.first_name} ${duplicate.last_name}`
          }
          onChange={(event) => {
            const value = formatRut(event.currentTarget.value);
            setRut(value);
            if (!usernameTouched) setUsername(value.replace(/\./g, ""));
          }}
          required
        />
        <TextInput
          label="Nombre de usuario"
          value={username}
          onChange={(event) => {
            setUsernameTouched(true);
            setUsername(event.currentTarget.value);
          }}
          description="Por defecto, igual al RUT"
          required
        />
        <TextInput
          label="Nombre"
          value={firstName}
          onChange={(event) => setFirstName(event.currentTarget.value)}
          required
        />
        <TextInput
          label="Apellido"
          value={lastName}
          onChange={(event) => setLastName(event.currentTarget.value)}
          required
        />
        <Select
          label="Rol"
          data={ROLES}
          value={rolId}
          onChange={setRolId}
          placeholder="Seleccione un rol"
          required
        />

        {create.isError && (
          <Text c="red" size="sm">
            Algo salió mal, intenta nuevamente
          </Text>
        )}

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
