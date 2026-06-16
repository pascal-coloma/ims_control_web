import { Button, Card, Center, Stack, Text, Title } from "@mantine/core";
import { useAuthStore } from "../../stores/authStore";

/** Shown when an authenticated session belongs to a non-"control" role (§1.3). */
export function RoleBlockedPage() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  return (
    <Center mih="100vh">
      <Card withBorder shadow="sm" radius="md" p="xl" w={420}>
        <Stack gap="md" align="center">
          <Title order={3} ta="center">
            Este cliente es solo para personal de control
          </Title>
          <Text ta="center" c="dimmed">
            {user
              ? `Tu cuenta tiene el rol "${user.role}".`
              : "Tu cuenta no tiene el rol requerido."}{" "}
            Esta interfaz web es exclusiva para operadores del centro de
            despacho (rol "control").
          </Text>
          <Button onClick={() => logout()} variant="light">
            Volver a iniciar sesión
          </Button>
        </Stack>
      </Card>
    </Center>
  );
}
