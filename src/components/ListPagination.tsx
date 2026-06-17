import { Group, Pagination } from "@mantine/core";

interface ListPaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export function ListPagination({
  page,
  totalPages,
  onChange,
}: ListPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <Group justify="center" mt="md">
      <Pagination value={page} onChange={onChange} total={totalPages} />
    </Group>
  );
}
