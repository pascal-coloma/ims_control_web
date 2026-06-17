import {
  Badge,
  Button,
  Group,
  Loader,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { getAmbulancias } from "../../../api/ambulancias";
import { queryKeys } from "../../../api/queryKeys";
import { ESTADO_COLOR } from "../constants";
import { InventoryTable } from "./InventoryTable";

interface AmbulanceDetailProps {
  ambulanciaId: number;
  onBack: () => void;
}

export function AmbulanceDetail({
  ambulanciaId,
  onBack,
}: AmbulanceDetailProps) {
  const ambulancias = useQuery({
    queryKey: queryKeys.ambulancias.list(),
    queryFn: getAmbulancias,
  });

  if (ambulancias.isLoading) return <Loader />;

  const ambulancia = ambulancias.data?.find(
    (a) => a.ambulancia_id === ambulanciaId,
  );

  return (
    <Stack gap="md">
      <Group>
        <Button
          leftSection={<IconArrowLeft size={16} />}
          variant="subtle"
          onClick={onBack}
        >
          Volver a la flota
        </Button>
        {ambulancia && (
          <>
            <Title order={2}>Ambulancia {ambulancia.patente}</Title>
            <Badge color={ESTADO_COLOR[ambulancia.estado]} variant="light">
              {ambulancia.estado}
            </Badge>
          </>
        )}
      </Group>

      {ambulancia ? (
        <InventoryTable lockedAmbulanciaPatente={ambulancia.patente} />
      ) : (
        <Text c="dimmed">Ambulancia no encontrada</Text>
      )}
    </Stack>
  );
}
