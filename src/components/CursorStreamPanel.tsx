import { Suspense, use, useEffect, useState } from "react";
import { ApiError } from "../api/client";
import { ErrorBoundary } from "./ErrorBoundary";
import { SkeletonRow, SkeletonList } from "./Skeleton";
import { useResumenResource } from "../hooks/useResumenResource";
import { useDetalleResource } from "../hooks/useDetalleResource";
import { invalidateResourcesWithPrefix } from "../hooks/useResource";

interface CursorStreamPanelProps {
  initialCursor: string;
}

function ResumenBlock({ cursor }: { cursor: string }) {
  const resumen = use(useResumenResource(cursor));
  return (
    <div className="block block--resumen">
      <strong>{resumen.titulo}</strong>
      <span> — {resumen.estado}</span>
    </div>
  );
}

function DetalleBlock({ cursor }: { cursor: string }) {
  const detalle = use(useDetalleResource(cursor));
  return (
    <ul className="block block--detalle">
      {detalle.historial.map((h, i) => (
        <li key={i}>
          {h.fecha}: {h.nota}
        </li>
      ))}
    </ul>
  );
}

function errorFallback(error: unknown, retry: () => void) {
  const message =
    error instanceof ApiError ? error.message : "Error al cargar este bloque";
  return (
    <div className="block block--error">
      <span>{message}</span>
      <button onClick={retry}>Reintentar</button>
    </div>
  );
}

export function CursorStreamPanel({ initialCursor }: CursorStreamPanelProps) {
  const [cursor, setCursor] = useState(initialCursor);

  useEffect(() => {
    return () => {
      invalidateResourcesWithPrefix(`resumen:${cursor}`);
      invalidateResourcesWithPrefix(`detalle:${cursor}`);
    };
  }, [cursor]);

  return (
    <section className="cursor-stream-panel">
      <nav className="cursor-stream-panel__nav">
        <button onClick={() => setCursor((c) => String(Number(c) - 1))}>
          Anterior
        </button>
        <button onClick={() => setCursor((c) => String(Number(c) + 1))}>
          Siguiente
        </button>
      </nav>

      <ErrorBoundary fallback={errorFallback}>
        <Suspense fallback={<SkeletonRow />}>
          <ResumenBlock cursor={cursor} />
        </Suspense>
      </ErrorBoundary>

      <ErrorBoundary fallback={errorFallback}>
        <Suspense fallback={<SkeletonList rows={6} />}>
          <DetalleBlock cursor={cursor} />
        </Suspense>
      </ErrorBoundary>
    </section>
  );
}
