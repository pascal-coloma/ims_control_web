import {
  ActionIcon,
  AppShell,
  AppShellHeader,
  AppShellMain,
  AppShellNavbar,
  Button,
  Divider,
  Drawer,
  Group,
  Indicator,
  Modal,
  NavLink,
  Stack,
  Text,
  UnstyledButton,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconAmbulance,
  IconBell,
  IconBoxSeam,
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
import { useNotificationStore } from "../stores/notificationStore";
import { useFcmNotifications } from "../hooks/useFcmNotifications";

const NAV_ITEMS = [
  { to: "/despachos", label: "Despachos", icon: IconAmbulance },
  { to: "/personal", label: "Personal", icon: IconUsers },
  { to: "/grupos", label: "Grupos", icon: IconUsersGroup },
  { to: "/pacientes", label: "Pacientes", icon: IconUserHeart },
  { to: "/flota", label: "Flota", icon: IconTruck },
  { to: "/inventario", label: "Inventario", icon: IconBoxSeam },
  { to: "/atenciones", label: "Atenciones", icon: IconClipboardText },
  { to: "/auditoria", label: "Auditoría", icon: IconHistory },
];

export function AppLayout() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const location = useLocation();

  const notifications = useNotificationStore((state) => state.notifications);
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const dismissNotification = useNotificationStore(
    (state) => state.dismissNotification,
  );
  const markAllRead = useNotificationStore((state) => state.markAllRead);
  const selected = useNotificationStore((state) => state.selected);
  const clearSelected = useNotificationStore((state) => state.clearSelected);
  const [notifOpen, { open: openNotif, close: closeNotif }] =
    useDisclosure(false);
  useFcmNotifications();

  return (
    <AppShell
      navbar={{ width: 240, breakpoint: "sm" }}
      header={{ height: 64 }}
      padding="md"
    >
      <AppShellHeader px="md" py="sm">
        <Group h="100%" justify="flex-end">
          <Indicator
            label={unreadCount}
            disabled={unreadCount === 0}
            size={14}
            color="red"
          >
            <ActionIcon
              variant="subtle"
              size="lg"
              onClick={() => {
                openNotif();
                markAllRead();
              }}
            >
              <IconBell size={20} />
            </ActionIcon>
          </Indicator>
        </Group>
      </AppShellHeader>
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
      <Drawer
        opened={notifOpen}
        onClose={closeNotif}
        position="right"
        title="Notificaciones"
        size="sm"
      >
        {notifications.length === 0 ? (
          <Text c="dimmed" ta="center" mt="xl">
            Sin notificaciones
          </Text>
        ) : (
          <Stack gap="xs">
            {notifications.map((n) => (
              <UnstyledButton
                key={n.id}
                onClick={() => dismissNotification(n.id)}
              >
                <Stack
                  gap={2}
                  p="xs"
                  style={{
                    borderRadius: 8,
                    backgroundColor: n.read ? undefined : "#eff6ff",
                  }}
                >
                  <Text size="sm" fw={n.read ? 400 : 600}>
                    {n.title}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {n.body}
                  </Text>
                </Stack>
              </UnstyledButton>
            ))}
          </Stack>
        )}
      </Drawer>
      <Modal opened={!!selected} onClose={clearSelected} title={selected?.title}>
        <Text>{selected?.body}</Text>
      </Modal>
    </AppShell>
  );
}
