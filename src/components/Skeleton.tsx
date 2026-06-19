interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return <div className={`skeleton-pulse ${className ?? ""}`} />;
}

export function SkeletonRow() {
  return (
    <div className="skeleton-row" role="status" aria-label="Cargando">
      <Skeleton className="skeleton-row__bar" />
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="skeleton-card" role="status" aria-label="Cargando">
      <Skeleton className="skeleton-card__title" />
      <Skeleton className="skeleton-card__line" />
      <Skeleton className="skeleton-card__line" />
    </div>
  );
}

export function SkeletonList({ rows = 5 }: { rows?: number }) {
  return (
    <div className="skeleton-list" role="status" aria-label="Cargando">
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} className="skeleton-list__row" />
      ))}
    </div>
  );
}
