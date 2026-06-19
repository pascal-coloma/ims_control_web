import { useState } from "react";
import { Button, Group, Tabs, Title } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { AddSuppliesModal } from "./components/AddSuppliesModal";
import { AmbulanceDetail } from "./components/AmbulanceDetail";
import { AmbulanceGrid } from "./components/AmbulanceGrid";
import { InventoryTable } from "./components/InventoryTable";
import { BODEGA_PATENTE } from "../../constants/ambulancia";

export function InventarioPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [addModalOpen, setAddModalOpen] = useState(false);

  const tabParam = searchParams.get("tab");
  const tab =
    tabParam === "ambulancias" || tabParam === "global" ? tabParam : "bodega";

  function handleTabChange(value: string | null) {
    setSearchParams(value && value !== "bodega" ? { tab: value } : {});
  }

  if (id) {
    return (
      <AmbulanceDetail
        ambulanciaId={Number(id)}
        onBack={() => navigate("/inventario")}
      />
    );
  }

  return (
    <>
      <Group justify="space-between" mb="md">
        <Title order={2}>Inventario</Title>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => setAddModalOpen(true)}
        >
          Agregar insumos
        </Button>
      </Group>

      <Tabs value={tab} onChange={handleTabChange}>
        <Tabs.List mb="md">
          <Tabs.Tab value="bodega">Bodega</Tabs.Tab>
          <Tabs.Tab value="ambulancias">Por Ambulancia</Tabs.Tab>
          <Tabs.Tab value="global">Global</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="bodega">
          <InventoryTable lockedAmbulanciaPatente={BODEGA_PATENTE} />
        </Tabs.Panel>

        <Tabs.Panel value="ambulancias">
          <AmbulanceGrid />
        </Tabs.Panel>

        <Tabs.Panel value="global">
          <InventoryTable />
        </Tabs.Panel>
      </Tabs>

      <AddSuppliesModal
        opened={addModalOpen}
        onClose={() => setAddModalOpen(false)}
      />
    </>
  );
}
