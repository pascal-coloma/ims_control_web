import { useEffect, useMemo, useState } from "react";
import { Alert, Autocomplete, Button, Group, Stack, Text } from "@mantine/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "../../api/client";
import { addPaciente, getPaciente, getPacientes } from "../../api/pacientes";
import { queryKeys } from "../../api/queryKeys";
import type { Paciente } from "../../types/api";
import { cleanRut, formatRut } from "../../utils/rut";
import { PatientRegistrationFields } from "./PatientRegistrationFields";

interface PatientLookupOrRegisterProps {
  /** Called once a patient is found or successfully registered. */
  onResolved: (paciente: Paciente) => void;
  /** Called on every keystroke with the input's digits/K only (no dots/dash), for substring filtering. */
  onRutChange?: (rut: string) => void;
  initialRut?: string;
}

const RUT_FORMAT = /^\d{7,8}-[0-9kK]$/;

/**
 * Shared RUT lookup-or-register flow (§2.2 NewDispatchModal and §2.5 Pacientes).
 * GET /pacientes/get/?rut= -> 404 surfaces a CTA to register inline via
 * POST /pacientes/add/.
 */
export function PatientLookupOrRegister({
  onResolved,
  onRutChange,
  initialRut = "",
}: PatientLookupOrRegisterProps) {
  const queryClient = useQueryClient();
  const [rut, setRut] = useState(formatRut(initialRut));
  const [notFound, setNotFound] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [resolved, setResolved] = useState<Paciente | null>(null);

  const pacientes = useQuery({
    queryKey: queryKeys.pacientes.list(),
    queryFn: getPacientes,
  });

  const options = useMemo(() => {
    const seen = new Map<string, { value: string; label: string }>();
    for (const p of pacientes.data ?? []) {
      const value = formatRut(p.rut);
      seen.set(value, {
        value,
        label: p.nombre_completo ? `${value} — ${p.nombre_completo}` : value,
      });
    }
    return Array.from(seen.values());
  }, [pacientes.data]);

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

  // El backend guarda el RUT con puntos y guión (formatRut), así que se
  // busca con ese mismo formato, pero espera el dígito verificador "k" en
  // minúscula.
  const backendRut = rut;
  const searchRut = backendRut.replace(/K$/, "k");

  function handleSearch() {
    lookup.mutate(searchRut);
  }

  useEffect(() => {
    if (RUT_FORMAT.test(backendRut.replace(/\./g, ""))) handleSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backendRut]);

  return (
    <Stack gap="xs">
      <Group align="flex-end" gap="xs">
        <Autocomplete
          label="RUT paciente"
          placeholder="11.222.333-4"
          data={options}
          value={rut}
          onChange={(value) => {
            setRut(formatRut(value));
            onRutChange?.(cleanRut(value));
            setResolved(null);
            setNotFound(false);
            setRegistering(false);
          }}
          onOptionSubmit={(value) => {
            const match = pacientes.data?.find(
              (p) => formatRut(p.rut) === value,
            );
            if (match) {
              setNotFound(false);
              setRegistering(false);
              setResolved(match);
              onResolved(match);
            }
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
          initialRut={backendRut}
          submitting={register.isPending}
          onSubmit={(data) => register.mutate(data)}
          onCancel={() => setRegistering(false)}
        />
      )}
    </Stack>
  );
}
