import { Button, Group, Stack, TextInput } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import type { Paciente } from "../../types/api";

interface PatientRegistrationFieldsProps {
  initialRut: string;
  submitting: boolean;
  onSubmit: (data: Paciente) => void;
  onCancel: () => void;
}

interface FormValues {
  rut: string;
  nombre_completo: string;
  fecha_nacimiento: Date | null;
  direccion: string;
  condicion_paciente: string;
  telefono: string;
  comuna: string;
}

export function PatientRegistrationFields({
  initialRut,
  submitting,
  onSubmit,
  onCancel,
}: PatientRegistrationFieldsProps) {
  const form = useForm<FormValues>({
    initialValues: {
      rut: initialRut,
      nombre_completo: "",
      fecha_nacimiento: null,
      direccion: "",
      condicion_paciente: "",
      telefono: "",
      comuna: "",
    },
    validate: {
      rut: (value) => (value.trim() ? null : "RUT requerido"),
    },
  });

  function handleSubmit(values: FormValues) {
    const data: Paciente = { rut: values.rut.trim() };
    if (values.nombre_completo.trim())
      data.nombre_completo = values.nombre_completo.trim();
    if (values.fecha_nacimiento)
      data.fecha_nacimiento = values.fecha_nacimiento
        .toISOString()
        .slice(0, 10);
    if (values.direccion.trim()) data.direccion = values.direccion.trim();
    if (values.condicion_paciente.trim())
      data.condicion_paciente = values.condicion_paciente.trim();
    if (values.telefono.trim()) data.telefono = values.telefono.trim();
    if (values.comuna.trim()) data.comuna = values.comuna.trim();
    onSubmit(data);
  }

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="xs">
        <TextInput label="RUT" required {...form.getInputProps("rut")} />
        <TextInput
          label="Nombre completo"
          {...form.getInputProps("nombre_completo")}
        />
        <DateInput
          label="Fecha de nacimiento"
          valueFormat="DD/MM/YYYY"
          {...form.getInputProps("fecha_nacimiento")}
        />
        <TextInput label="Dirección" {...form.getInputProps("direccion")} />
        <TextInput label="Comuna" {...form.getInputProps("comuna")} />
        <TextInput label="Teléfono" {...form.getInputProps("telefono")} />
        <TextInput
          label="Condición del paciente"
          {...form.getInputProps("condicion_paciente")}
        />
        <Group justify="flex-end">
          <Button variant="subtle" onClick={onCancel} type="button">
            Cancelar
          </Button>
          <Button type="submit" loading={submitting}>
            Registrar paciente
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
