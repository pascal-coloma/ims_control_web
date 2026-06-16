import {
  Alert,
  Button,
  CopyButton,
  Group,
  Modal,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { IconCheck, IconCopy, IconPrinter } from "@tabler/icons-react";
import { QRCodeSVG } from "qrcode.react";
import type { AddStaffResponse } from "../../../types/api";

interface ProvisioningResultModalProps {
  result: AddStaffResponse | null;
  onClose: () => void;
}

export function ProvisioningResultModal({
  result,
  onClose,
}: ProvisioningResultModalProps) {
  return (
    <Modal
      opened={result !== null}
      onClose={onClose}
      title="Personal creado"
      closeOnClickOutside={false}
      size="md"
    >
      {result && (
        <Stack gap="sm">
          <Alert color="yellow" title="Guarda esta información ahora">
            El código QR y la contraseña temporal no se pueden volver a mostrar.
            Entrégalos al nuevo funcionario de forma segura.
          </Alert>

          <Stack gap={4} align="center">
            <Text size="sm" fw={500}>
              Código QR (TOTP)
            </Text>
            <QRCodeSVG value={result.totp_uri} size={180} />
          </Stack>

          <Group align="flex-end" gap="xs">
            <TextInput
              label="Contraseña temporal"
              value={result.password}
              readOnly
              style={{ flex: 1 }}
            />
            <CopyButton value={result.password}>
              {({ copied, copy }) => (
                <Button
                  variant="light"
                  leftSection={
                    copied ? <IconCheck size={16} /> : <IconCopy size={16} />
                  }
                  onClick={copy}
                >
                  {copied ? "Copiado" : "Copiar"}
                </Button>
              )}
            </CopyButton>
          </Group>

          <Text size="xs" c="dimmed">
            ID de usuario: {result.usuario_id}
          </Text>

          <Group justify="flex-end">
            <Button
              variant="subtle"
              leftSection={<IconPrinter size={16} />}
              onClick={() => window.print()}
            >
              Imprimir
            </Button>
            <Button onClick={onClose}>Cerrar</Button>
          </Group>
        </Stack>
      )}
    </Modal>
  );
}
