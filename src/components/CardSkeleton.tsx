import { Card, Group, Skeleton, Stack } from "@mantine/core";

interface CardSkeletonProps {
  lines?: number;
  header?: boolean;
}

/** Placeholder card matching a header (title + badge) plus a few text lines, shown while loading. */
export function CardSkeleton({ lines = 3, header = true }: CardSkeletonProps) {
  return (
    <Card withBorder radius="sm" padding="sm">
      <Stack gap={6}>
        {header && (
          <Group justify="space-between" wrap="nowrap">
            <Skeleton height={14} width="50%" radius="sm" />
            <Skeleton height={14} width={50} radius="sm" />
          </Group>
        )}
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} height={10} width={`${85 - i * 10}%`} radius="sm" />
        ))}
      </Stack>
    </Card>
  );
}
