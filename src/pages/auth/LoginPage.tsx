import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Button,
  Card,
  Center,
  PasswordInput,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { login } from "../../api/auth";
import { ApiError } from "../../api/client";
import { useAuthStore } from "../../stores/authStore";
import { cleanRut, formatRut, validateRut } from "../../utils/rut";
import { AuthStepIndicator } from "./AuthStepIndicator";

export function LoginPage() {
  const navigate = useNavigate();
  const setPendingMfa = useAuthStore((state) => state.setPendingMfa);
  const sessionExpired = useAuthStore((state) => state.sessionExpired);
  const clearSessionExpired = useAuthStore(
    (state) => state.clearSessionExpired,
  );

  const [username, setUsername] = useState("");
  const [rutError, setRutError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function handleUsernameChange(value: string) {
    if (/^[\d.\-kK]*$/.test(value)) {
      setUsername(formatRut(value));
      const clean = cleanRut(value);
      setRutError(
        clean.length >= 8 && !validateRut(clean) ? "RUT inválido" : null,
      );
    } else {
      setUsername(value);
      setRutError(null);
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(username.replace(/\./g, ""), password);
      clearSessionExpired();
      setPendingMfa();
      navigate("/login/mfa");
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError("Usuario o contraseña incorrectos");
      } else {
        setError("Algo salió mal, intenta nuevamente");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Center mih="100vh">
      <Card withBorder shadow="sm" radius="md" p="xl" w={380}>
        <Stack gap="md">
          <Stack align="center" gap={4}>
            <img
              src="/logo_ims.webp"
              alt="IMS Ambulancias"
              style={{ width: "100%", maxWidth: 160 }}
            />
            <Text c="dimmed">Acceso control</Text>
          </Stack>

          <AuthStepIndicator step={1} />

          {sessionExpired && (
            <Alert color="yellow" title="Sesión expirada">
              Vuelve a iniciar sesión.
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Stack gap="sm">
              <TextInput
                label="Usuario"
                placeholder="Ingrese su RUT"
                value={username}
                onChange={(e) => handleUsernameChange(e.currentTarget.value)}
                error={rutError}
                required
                autoComplete="username"
              />
              <PasswordInput
                label="Contraseña"
                placeholder="Ingrese su contraseña"
                value={password}
                onChange={(event) => setPassword(event.currentTarget.value)}
                required
                autoComplete="current-password"
              />
              {error && (
                <Text c="red" size="sm">
                  {error}
                </Text>
              )}
              <Button type="submit" loading={submitting} fullWidth mt="xs">
                Continuar
              </Button>
            </Stack>
          </form>
        </Stack>
      </Card>
    </Center>
  );
}
