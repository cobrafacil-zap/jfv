"use client";

import type { ProductFilter as ProductFilterType } from "@/lib/landing-content";

/**
 * ProductFilter — barra horizontal de filtros com underline animado.
 */
export function ProductFilter({
  filters,
  active,
  onChange,
}: {
  filters: ProductFilterType[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="ps-pfilter" role="tablist" aria-label="Filtrar programas">
      {filters.map((f) => {
        const isActive = active === f.id;
        return (
          <button
            key={f.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`ps-pfilter-btn${isActive ? " is-active" : ""}`}
            onClick={() => onChange(f.id)}
          >
            {f.label}
          </button>
        );
      })}
    </div>
  );
}