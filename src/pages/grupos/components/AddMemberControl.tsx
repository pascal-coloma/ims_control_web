import { useMemo, useState } from "react";
import { Alert, Button, Group, Select } from "@mantine/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "../../../api/client";
import { suscribir } from "../../../api/grupos";
import { getPersonal } from "../../../api/personal";
import { queryKeys } from "../../../api/queryKeys";

interface AddMemberControlProps {
  grupoId: number;
  currentMemberRuts: Set<string>;
}

export function AddMemberControl({
  grupoId,
  currentMemberRuts,
}: AddMemberControlProps) {
  const queryClient = useQueryClient();
  const [personalId, setPersonalId] = useState<string | null>(null);
  const [conflictError, setConflictError] = useState<string | null>(null);

  const personal = useQuery({
    queryKey: queryKeys.personal.list(),
    queryFn: getPersonal,
  });

  const options = useMemo(
    () =>
      (personal.data ?? [])
        .filter((p) => !currentMemberRuts.has(p.rut))
        .map((p) => ({
          value: String(p.id),
          label: `${p.first_name} ${p.last_name} (${p.rut})${p.rol_nombre ? ` — ${p.rol_nombre}` : ""}`,
        })),
    [personal.data, currentMemberRuts],
  );

  const add = useMutation({
    mutationFn: () =>
      suscribir({ grupo_id: grupoId, personal_id: Number(personalId) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.grupos.list() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.grupos.detail(grupoId),
      });
      setPersonalId(null);
      setConflictError(null);
    },
    onError: (err) => {
      if (err instanceof ApiError && err.status === 409) {
        setConflictError(
          err.errorMessage ?? "Esta persona ya pertenece a un grupo activo",
        );
      }
    },
  });

  return (
    <Group align="flex-end" gap="xs">
      <Select
        placeholder="+ agregar miembro"
        data={options}
        value={personalId}
        onChange={(value) => {
          setPersonalId(value);
          setConflictError(null);
        }}
        searchable
        style={{ flex: 1, maxWidth: 320 }}
      />
      <Button
        size="sm"
        onClick={() => add.mutate()}
        loading={add.isPending}
        disabled={!personalId}
      >
        Agregar
      </Button>
      {conflictError && (
        <Alert color="red" variant="light" py={4}>
          {conflictError}
        </Alert>
      )}
    </Group>
  );
}
