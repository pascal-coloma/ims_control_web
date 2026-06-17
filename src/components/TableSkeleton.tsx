import { Skeleton, Table } from "@mantine/core";

interface TableSkeletonProps {
  columns: number;
  rows?: number;
}

/** Placeholder rows matching a Table's column count, shown while its data is loading. */
export function TableSkeleton({ columns, rows = 10 }: TableSkeletonProps) {
  return (
    <Table.Tbody>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <Table.Tr key={rowIndex}>
          {Array.from({ length: columns }).map((__, colIndex) => (
            <Table.Td key={colIndex}>
              <Skeleton height={14} radius="sm" />
            </Table.Td>
          ))}
        </Table.Tr>
      ))}
    </Table.Tbody>
  );
}
