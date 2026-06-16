import {
  AppShell,
  AppShellMain,
  AppShellNavbar,
  Button,
  Divider,
  NavLink,
  Stack,
  Text,
} from "@mantine/core";
import {
  IconAmbulance,
  IconClipboardText,
  IconHistory,
  IconLogout,
  IconTruck,
  IconUserHeart,
  IconUsers,
  IconUsersGroup,
} from "@tabler/icons-react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { logoutApi } from "../api/auth";
import { useAuthStore } from "../stores/authStore";

const NAV_ITEMS = [
  { to: "/despachos", label: "Despachos", icon: IconAmbulance },
  { to: "/personal", label: "Personal", icon: IconUsers },
  { to: "/grupos", label: "Grupos", icon: IconUsersGroup },
  { to: "/pacientes", label: "Pacientes", icon: IconUserHeart },
  { to: "/flota", label: "Flota & Inventario", icon: IconTruck },
  { to: "/atenciones", label: "Atenciones", icon: IconClipboardText },
  { to: "/auditoria", label: "Auditoría", icon: IconHistory },
];

export function AppLayout() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const location = useLocation();

  return (
    <AppShell navbar={{ width: 240, breakpoint: "sm" }} padding="md">
      <AppShellNavbar p="md">
        <Stack gap="xs" h="100%" justify="space-between">
          <Stack gap={4}>
            <Text fw={700} size="lg">
              IMS Ambulancias
            </Text>
            <Text size="xs" c="dimmed" mb="sm">
              Centro de Control
            </Text>
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                component={Link}
                to={item.to}
                label={item.label}
                leftSection={<item.icon size={18} />}
                active={location.pathname.startsWith(item.to)}
              />
            ))}
          </Stack>
          <div>
            <Divider mb="sm" />
            {user && (
              <Stack gap={0} mb="sm">
                <Text size="sm" fw={500}>
                  {user.first_name} {user.last_name}
                </Text>
                <Text size="xs" c="dimmed">
                  {user.role}
                </Text>
              </Stack>
            )}
            <Button
              variant="subtle"
              color="red"
              leftSection={<IconLogout size={16} />}
              onClick={() => logoutApi().finally(() => logout())}
              fullWidth
            >
              Cerrar sesión
            </Button>
          </div>
        </Stack>
      </AppShellNavbar>
      <AppShellMain>
        <Outlet />
      </AppShellMain>
    </AppShell>
  );
}
