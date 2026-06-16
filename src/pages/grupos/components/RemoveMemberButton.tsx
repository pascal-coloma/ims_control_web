import { useState } from 'react'
import { ActionIcon, Button, Group, Popover, Text, Tooltip } from '@mantine/core'
import { IconX } from '@tabler/icons-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { desuscribir } from '../../../api/grupos'
import { queryKeys } from '../../../api/queryKeys'

interface RemoveMemberButtonProps {
  groupId: number
  personalId: number | undefined
  memberName: string
}

export function RemoveMemberButton({ groupId, personalId, memberName }: RemoveMemberButtonProps) {
  const queryClient = useQueryClient()
  const [opened, setOpened] = useState(false)

  const remove = useMutation({
    mutationFn: () => desuscribir({ group_id: groupId, personal_id: personalId as number }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.grupos.list() })
      queryClient.invalidateQueries({ queryKey: queryKeys.grupos.detail(groupId) })
      setOpened(false)
    },
  })

  return (
    <Popover opened={opened} onChange={setOpened} withArrow position="bottom-end">
      <Popover.Target>
        <Tooltip label={personalId === undefined ? 'No se pudo resolver el ID de personal' : 'Quitar del grupo'}>
          <ActionIcon variant="subtle" color="red" disabled={personalId === undefined} onClick={() => setOpened((o) => !o)}>
            <IconX size={16} />
          </ActionIcon>
        </Tooltip>
      </Popover.Target>
      <Popover.Dropdown>
        <Text size="sm" mb="xs">¿Quitar a {memberName} del grupo?</Text>
        <Group justify="flex-end">
          <Button size="xs" variant="subtle" onClick={() => setOpened(false)}>
            Cancelar
          </Button>
          <Button size="xs" color="red" onClick={() => remove.mutate()} loading={remove.isPending}>
            Quitar
          </Button>
        </Group>
      </Popover.Dropdown>
    </Popover>
  )
}
