import { useState } from 'react'
import { Button, Group, Modal, NumberInput, Stack, Text, TextInput } from '@mantine/core'
import { useMutation } from '@tanstack/react-query'
import { addPersonal } from '../../../api/personal'
import type { AddStaffResponse } from '../../../types/api'

interface AddStaffModalProps {
  opened: boolean
  onClose: () => void
  onProvisioned: (result: AddStaffResponse) => void
}

export function AddStaffModal({ opened, onClose, onProvisioned }: AddStaffModalProps) {
  const [rut, setRut] = useState('')
  const [username, setUsername] = useState('')
  const [usernameTouched, setUsernameTouched] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [rolId, setRolId] = useState<number | ''>('')

  const create = useMutation({
    mutationFn: () =>
      addPersonal({
        username: username || rut,
        first_name: firstName,
        last_name: lastName,
        rut,
        rol_id: Number(rolId),
      }),
    onSuccess: (result) => {
      onProvisioned(result)
      handleClose()
    },
  })

  function handleClose() {
    setRut('')
    setUsername('')
    setUsernameTouched(false)
    setFirstName('')
    setLastName('')
    setRolId('')
    onClose()
  }

  const valid = rut.trim() && firstName.trim() && lastName.trim() && rolId !== ''

  return (
    <Modal opened={opened} onClose={handleClose} title="Agregar Personal">
      <Stack gap="sm">
        <TextInput
          label="RUT"
          value={rut}
          onChange={(event) => {
            const value = event.currentTarget.value
            setRut(value)
            if (!usernameTouched) setUsername(value)
          }}
          required
        />
        <TextInput
          label="Nombre de usuario"
          value={username}
          onChange={(event) => {
            setUsernameTouched(true)
            setUsername(event.currentTarget.value)
          }}
          description="Por defecto, igual al RUT"
          required
        />
        <TextInput label="Nombre" value={firstName} onChange={(event) => setFirstName(event.currentTarget.value)} required />
        <TextInput label="Apellido" value={lastName} onChange={(event) => setLastName(event.currentTarget.value)} required />
        <NumberInput
          label="Rol ID"
          value={rolId}
          onChange={(value) => setRolId(typeof value === 'number' ? value : '')}
          min={1}
          description="ID numérico del rol en el catálogo de roles del backend"
          required
        />

        {create.isError && <Text c="red" size="sm">Algo salió mal, intenta nuevamente</Text>}

        <Group justify="flex-end">
          <Button variant="subtle" onClick={handleClose}>
            Cancelar
          </Button>
          <Button onClick={() => create.mutate()} loading={create.isPending} disabled={!valid}>
            Crear
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}
