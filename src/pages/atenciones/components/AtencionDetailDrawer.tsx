import { useState } from "react";
import {
  Alert,
  Anchor,
  Badge,
  Button,
  Divider,
  Drawer,
  Group,
  Stack,
  Text,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useMutation } from "@tanstack/react-query";
import { IconFileTypePdf } from "@tabler/icons-react";
import dayjs from "dayjs";
import { Link } from "react-router-dom";
import { ApiError } from "../../../api/client";
import {
  fetchAtencionDoc,
  getAtencionDocUrl,
  getFhirBundle,
} from "../../../api/atenciones";
import { generatePDF } from "../../../utils/pdf";
import type { AtencionListItem, DocumentoAtencion } from "../../../types/api";
import { SELLO_COLOR } from "../constants";

interface AtencionDetailDrawerProps {
  atencion: AtencionListItem;
  opened: boolean;
  onClose: () => void;
}

export function AtencionDetailDrawer({
  atencion,
  opened,
  onClose,
}: AtencionDetailDrawerProps) {
  const [noDocument, setNoDocument] = useState(false);

  const viewDoc = useMutation({
    mutationFn: async () => {
      const { success } = await getAtencionDocUrl(atencion.atencion_id);
      const documento = (await fetchAtencionDoc(success)) as DocumentoAtencion;
      documento.atencion.estado_sello = atencion.estado_sello;
      documento.atencion.sello_electronico = atencion.firma_digital;
      generatePDF(documento);
    },
    onSuccess: () => {
      setNoDocument(false);
    },
    onError: (err) => {
      if (err instanceof ApiError && err.status === 404) {
        setNoDocument(true);
      } else if (err instanceof Error) {
        notifications.show({
          color: "red",
          title: "Error",
          message: err.message,
        });
      } else {
        notifications.show({
          color: "red",
          title: "Error",
          message: "Algo salió mal, intenta nuevamente",
        });
      }
    },
  });

  const fhirExport = useMutation({
    mutationFn: (mode: "download" | "copy") =>
      getFhirBundle(atencion.atencion_id).then((bundle) => ({ mode, bundle })),
    onSuccess: ({ mode, bundle }) => {
      const json = JSON.stringify(bundle, null, 2);
      if (mode === "download") {
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const anchor = window.document.createElement("a");
        anchor.href = url;
        anchor.download = `Bundle-atencion-${atencion.atencion_id}.json`;
        anchor.click();
        URL.revokeObjectURL(url);
      } else {
        void navigator.clipboard.writeText(json);
        notifications.show({
          color: "green",
          message: "Bundle FHIR copiado al portapapeles",
        });
      }
    },
    onError: () => {
      notifications.show({
        color: "red",
        title: "Error",
        message: "Algo salió mal, intenta nuevamente",
      });
    },
  });

  function handleClose() {
    setNoDocument(false);
    onClose();
  }

  const firma = atencion.firma_digital;
  const firmaTruncada = firma.length > 16 ? `${firma.slice(0, 16)}...` : firma;

  return (
    <Drawer
      opened={opened}
      onClose={handleClose}
      title={`Atención #${atencion.atencion_id}`}
      position="right"
      size="md"
    >
      <Stack gap="sm">
        <Text>
          <Text span fw={500}>
            Paciente:{" "}
          </Text>
          {atencion.despacho?.paciente
            ? `${atencion.despacho.paciente.nombre} (${atencion.despacho.paciente.rut})`
            : "—"}
        </Text>
        <Text>
          <Text span fw={500}>
            Despacho:{" "}
          </Text>
          {atencion.despacho ? (
            <Anchor
              component={Link}
              to={`/despachos/${atencion.despacho.despacho_id}`}
            >
              #{atencion.despacho.despacho_id}
            </Anchor>
          ) : (
            "—"
          )}
        </Text>
        <Text>
          <Text span fw={500}>
            Salida:{" "}
          </Text>
          {dayjs(atencion.hora_salida).format("DD/MM/YYYY HH:mm")}
        </Text>
        <Text>
          <Text span fw={500}>
            Llegada:{" "}
          </Text>
          {atencion.hora_llegada
            ? dayjs(atencion.hora_llegada).format("DD/MM/YYYY HH:mm")
            : "—"}
        </Text>
        <Group gap="xs">
          <Text fw={500}>Sello:</Text>
          <Badge color={SELLO_COLOR[atencion.estado_sello]} variant="light">
            {atencion.estado_sello}
          </Badge>
        </Group>
        <Text size="sm" c="dimmed">
          Firma digital: {firmaTruncada}
        </Text>

        <Divider />

        <Group>
          <Button
            variant="light"
            leftSection={<IconFileTypePdf size={18} />}
            onClick={() => viewDoc.mutate()}
            loading={viewDoc.isPending}
          >
            Generar PDF firmado
          </Button>
          <Button
            variant="light"
            onClick={() => fhirExport.mutate("download")}
            loading={fhirExport.isPending}
          >
            Exportar FHIR (JSON)
          </Button>
          <Button
            variant="subtle"
            onClick={() => fhirExport.mutate("copy")}
            loading={fhirExport.isPending}
          >
            Copiar FHIR
          </Button>
        </Group>

        {noDocument && (
          <Alert color="yellow" variant="light">
            Esta atención aún no tiene un documento firmado
          </Alert>
        )}
      </Stack>
    </Drawer>
  );
}
