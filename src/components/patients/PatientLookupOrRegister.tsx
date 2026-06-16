import { useState } from "react";
import { Alert, Button, Group, Stack, Text, TextInput } from "@mantine/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "../../api/client";
import { addPaciente, getPaciente } from "../../api/pacientes";
import { queryKeys } from "../../api/queryKeys";
import type { Paciente } from "../../types/api";
import { PatientRegistrationFields } from "./PatientRegistrationFields";

interface PatientLookupOrRegisterProps {
  /** Called once a patient is found or successfully registered. */
  onResolved: (paciente: Paciente) => void;
  initialRut?: string;
}

/**
 * Shared RUT lookup-or-register flow (§2.2 NewDispatchModal and §2.5 Pacientes).
 * GET /pacientes/get/?rut= -> 404 surfaces a CTA to register inline via
 * POST /pacientes/add/.
 */
export function PatientLookupOrRegister({
  onResolved,
  initialRut = "",
}: PatientLookupOrRegisterProps) {
  const queryClient = useQueryClient();
  const [rut, setRut] = useState(initialRut);
  const [notFound, setNotFound] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [resolved, setResolved] = useState<Paciente | null>(null);

  const lookup = useMutation({
    mutationFn: (lookupRut: string) => getPaciente(lookupRut),
    onSuccess: (paciente) => {
      setNotFound(false);
      setRegistering(false);
      setResolved(paciente);
      onResolved(paciente);
    },
    onError: (err) => {
      setResolved(null);
      if (err instanceof ApiError && err.status === 404) {
        setNotFound(true);
      }
    },
  });

  const register = useMutation({
    mutationFn: (data: Paciente) => addPaciente(data),
    onSuccess: (_result, data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pacientes.list() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.pacientes.detail(data.rut),
      });
      setNotFound(false);
      setRegistering(false);
      setResolved(data);
      onResolved(data);
    },
  });

  function handleSearch() {
    setResolved(null);
    setNotFound(false);
    lookup.mutate(rut);
  }

  return (
    <Stack gap="xs">
      <Group align="flex-end" gap="xs">
        <TextInput
          label="RUT paciente"
          placeholder="11.222.333-4"
          value={rut}
          onChange={(event) => {
            setRut(event.currentTarget.value);
            setResolved(null);
            setNotFound(false);
            setRegistering(false);
          }}
          style={{ flex: 1 }}
        />
        <Button
          onClick={handleSearch}
          loading={lookup.isPending}
          disabled={!rut.trim()}
        >
          Buscar
        </Button>
      </Group>

      {resolved && (
        <Alert color="green" variant="light">
          ✓ Encontrado: {resolved.nombre_completo || resolved.rut}
        </Alert>
      )}

      {notFound && !registering && (
        <Alert color="yellow" variant="light">
          <Group justify="space-between" align="center">
            <Text size="sm">✗ No encontrado</Text>
            <Button
              size="xs"
              variant="light"
              onClick={() => setRegistering(true)}
            >
              + Registrar paciente
            </Button>
          </Group>
        </Alert>
      )}

      {registering && (
        <PatientRegistrationFields
          initialRut={rut}
          submitting={register.isPending}
          onSubmit={(data) => register.mutate(data)}
          onCancel={() => setRegistering(false)}
        />
      )}
    </Stack>
  );
}
