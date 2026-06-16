import { Group, Text } from '@mantine/core'

const STEPS = [
  { n: 1, label: 'Credenciales' },
  { n: 2, label: 'Código TOTP' },
]

export function AuthStepIndicator({ step }: { step: 1 | 2 }) {
  return (
    <Group gap="xs" justify="center">
      {STEPS.map((s) => (
        <Text key={s.n} size="sm" fw={s.n === step ? 700 : 400} c={s.n === step ? undefined : 'dimmed'}>
          {s.n}. {s.label}
        </Text>
      ))}
    </Group>
  )
}
