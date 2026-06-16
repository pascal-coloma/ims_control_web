import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Card, Center, PinInput, Stack, Text, Title } from "@mantine/core";
import { ensureCsrfCookie, verifyTotp } from "../../api/auth";
import { ApiError } from "../../api/client";
import { useAuthStore } from "../../stores/authStore";
import { AuthStepIndicator } from "./AuthStepIndicator";

export function MfaPage() {
  const navigate = useNavigate();
  const status = useAuthStore((state) => state.status);
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated);

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [key, setKey] = useState(0); // remounts PinInput to clear it after a failed attempt

  useEffect(() => {
    // Fires once on mount to obtain the csrftoken cookie (ensure_csrf_cookie).
    void ensureCsrfCookie();
  }, []);

  // If the step-1 submission never happened (e.g. hard refresh), step 1 must
  // be re-submitted (the in-memory pending state is lost).
  if (status !== "pending_mfa") return <Navigate to="/login" replace />;

  async function handleComplete(totpCode: string) {
    setError(null);
    setSubmitting(true);
    try {
      const { user_data } = await verifyTotp(totpCode);
      setAuthenticated(user_data);
      navigate("/despachos");
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError("Código TOTP incorrecto");
      } else {
        setError("Algo salió mal, intenta nuevamente");
      }
      setKey((k) => k + 1);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Center mih="100vh">
      <Card withBorder shadow="sm" radius="md" p="xl" w={380}>
        <Stack gap="md" align="center">
          <div>
            <Title order={2} ta="center">
              imSystem
            </Title>
            <Text c="dimmed" ta="center">
              Control — Acceso operadores
            </Text>
          </div>

          <AuthStepIndicator step={2} />

          <Text size="sm" ta="center">
            Ingresa el código de 6 dígitos de tu app de autenticación.
          </Text>

          <PinInput
            key={key}
            length={6}
            type="number"
            disabled={submitting}
            onComplete={handleComplete}
            autoFocus
          />

          {error && (
            <Text c="red" size="sm">
              {error}
            </Text>
          )}
        </Stack>
      </Card>
    </Center>
  );
}
