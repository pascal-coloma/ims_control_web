import { notifications } from "@mantine/notifications";
import { ApiError } from "../api/client";

export function showError(
  err: unknown,
  fallback = "Algo salió mal, intenta nuevamente",
) {
  const message =
    err instanceof ApiError
      ? (err.errorMessage ?? err.message)
      : err instanceof Error
        ? err.message
        : fallback;
  notifications.show({
    color: "red",
    title: "Error",
    message,
    autoClose: 8000,
  });
}
