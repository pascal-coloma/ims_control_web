import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert, Button, Card, Center, PasswordInput, Stack, Text, TextInput, Title } from '@mantine/core'
import { login } from '../../api/auth'
import { ApiError } from '../../api/client'
import { useAuthStore } from '../../stores/authStore'
import { AuthStepIndicator } from './AuthStepIndicator'

export function LoginPage() {
  const navigate = useNavigate()
  const setPendingMfa = useAuthStore((state) => state.setPendingMfa)
  const sessionExpired = useAuthStore((state) => state.sessionExpired)
  const clearSessionExpired = useAuthStore((state) => state.clearSessionExpired)

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login(username, password)
      clearSessionExpired()
      setPendingMfa()
      navigate('/login/mfa')
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError('Usuario o contraseña incorrectos')
      } else {
        setError('Algo salió mal, intenta nuevamente')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Center mih="100vh">
      <Card withBorder shadow="sm" radius="md" p="xl" w={380}>
        <Stack gap="md">
          <div>
            <Title order={2}>imSystem</Title>
            <Text c="dimmed">Control — Acceso operadores</Text>
          </div>

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
                placeholder="rut o nombre de usuario"
                value={username}
                onChange={(event) => setUsername(event.currentTarget.value)}
                required
                autoComplete="username"
              />
              <PasswordInput
                label="Contraseña"
                value={password}
                onChange={(event) => setPassword(event.currentTarget.value)}
                required
                autoComplete="current-password"
              />
              {error && <Text c="red" size="sm">{error}</Text>}
              <Button type="submit" loading={submitting} fullWidth mt="xs">
                Continuar
              </Button>
            </Stack>
          </form>
        </Stack>
      </Card>
    </Center>
  )
}
