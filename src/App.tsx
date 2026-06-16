import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { MantineProvider } from "@mantine/core";
import { Notifications, notifications } from "@mantine/notifications";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/notifications/styles.css";

import { setAuthHandlers } from "./api/client";
import { useAuthStore } from "./stores/authStore";
import { AppLayout } from "./layout/AppLayout";
import { AuthGuard, GuestGuard, RoleGuard } from "./routes/AuthGuard";
import { LoginPage } from "./pages/auth/LoginPage";
import { MfaPage } from "./pages/auth/MfaPage";
import { RoleBlockedPage } from "./pages/auth/RoleBlockedPage";
import { DispatchBoardPage } from "./pages/despachos/DispatchBoardPage";
import { PersonalPage } from "./pages/personal/PersonalPage";
import { GruposPage } from "./pages/grupos/GruposPage";
import { PacientesPage } from "./pages/pacientes/PacientesPage";
import { FlotaPage } from "./pages/flota/FlotaPage";
import { AtencionesPage } from "./pages/atenciones/AtencionesPage";
import { AuditoriaPage } from "./pages/auditoria/AuditoriaPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    setAuthHandlers({
      onUnauthorized: () => logout({ sessionExpired: true }),
      onForbidden: () =>
        notifications.show({
          color: "red",
          title: "Permiso denegado",
          message: "Tu sesión no tiene acceso a este recurso.",
        }),
    });
  }, [logout]);

  return (
    <MantineProvider defaultColorScheme="light">
      <Notifications />
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route element={<GuestGuard />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/login/mfa" element={<MfaPage />} />
            </Route>

            <Route path="/role-blocked" element={<RoleBlockedPage />} />

            <Route element={<AuthGuard />}>
              <Route element={<RoleGuard />}>
                <Route element={<AppLayout />}>
                  <Route index element={<Navigate to="/despachos" replace />} />
                  <Route path="despachos" element={<DispatchBoardPage />} />
                  <Route path="despachos/:id" element={<DispatchBoardPage />} />
                  <Route path="personal" element={<PersonalPage />} />
                  <Route path="grupos" element={<GruposPage />} />
                  <Route path="grupos/:id" element={<GruposPage />} />
                  <Route path="pacientes" element={<PacientesPage />} />
                  <Route path="flota" element={<FlotaPage />} />
                  <Route path="flota/:id" element={<FlotaPage />} />
                  <Route path="atenciones" element={<AtencionesPage />} />
                  <Route path="atenciones/:id" element={<AtencionesPage />} />
                  <Route path="auditoria" element={<AuditoriaPage />} />
                </Route>
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </MantineProvider>
  );
}

export default App;
