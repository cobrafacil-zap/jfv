"use client";

import { ImageUploader } from "@/components/admin/ImageUploader";

/* Primitivas de formulário reutilizáveis pelo editor de conteúdo da landing.
   Todas controladas — o estado vive no LandingEditor e desce via props. */

export function Field({
  label,
  hint,
  children,
}: {
  label?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      {label && (
        <span className="block text-xs font-semibold uppercase tracking-wide text-text-muted">
          {label}
        </span>
      )}
      {children}
      {hint && <span className="block text-xs text-text-muted">{hint}</span>}
    </label>
  );
}

const inputCls =
  "w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/60 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/40";

export function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      type="text"
      className={inputCls}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export function TextArea({
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      className={`${inputCls} resize-y`}
      rows={rows}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

/** Par label + href (links e botões). */
export function LinkFields({
  value,
  onChange,
  labelLabel = "Texto",
}: {
  value: { label: string; href: string };
  onChange: (v: { label: string; href: string }) => void;
  labelLabel?: string;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <Field label={labelLabel}>
        <TextInput
          value={value.label}
          onChange={(label) => onChange({ ...value, label })}
        />
      </Field>
      <Field label="Link (URL ou #ancora)">
        <TextInput
          value={value.href}
          placeholder="/checkout, #produtos, https://..."
          onChange={(href) => onChange({ ...value, href })}
        />
      </Field>
    </div>
  );
}

/** Campo de imagem — usa o ImageUploader (upload p/ Supabase Storage). */
export function ImageField({
  value,
  onChange,
  label,
  aspect = "4/5",
  hint,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  aspect?: string;
  hint?: string;
}) {
  return (
    <Field label={label} hint={hint ?? "Troque a foto ou cole uma URL."}>
      <ImageUploader
        value={value || undefined}
        onChange={(data) => onChange(data ? data.url : "")}
        uploadType="image"
        aspect={aspect}
        label="Clique para enviar"
      />
      <TextInput
        value={value}
        placeholder="URL da imagem"
        onChange={onChange}
      />
    </Field>
  );
}

/** Editor de lista de strings (badges, tags, beneficios, etc.). */
export function StringList({
  values,
  onChange,
  itemLabel = "Item",
}: {
  values: string[];
  onChange: (v: string[]) => void;
  itemLabel?: string;
}) {
  return (
    <div className="space-y-2">
      {values.map((v, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            className={inputCls}
            value={v}
            placeholder={`${itemLabel} ${i + 1}`}
            onChange={(e) =>
              onChange(values.map((x, j) => (j === i ? e.target.value : x)))
            }
          />
          <button
            type="button"
            onClick={() => onChange(values.filter((_, j) => j !== i))}
            className="shrink-0 rounded-lg border border-border px-2 py-2 text-xs text-text-secondary hover:border-red-500/50 hover:text-red-300"
            aria-label="Remover"
          >
            ✕
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...values, ""])}
        className="rounded-lg border border-dashed border-border px-3 py-2 text-xs font-medium text-text-secondary hover:border-accent hover:text-accent"
      >
        + Adicionar
      </button>
    </div>
  );
}

/** Card visual para agrupar campos de uma seção/subitem. */
export function Card({
  title,
  children,
  actions,
}: {
  title?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-bg-card/40 p-5">
      {(title || actions) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && (
            <h3 className="font-display text-sm font-bold text-text-primary">
              {title}
            </h3>
          )}
          {actions}
        </div>
      )}
      <div className="space-y-4">{children}</div>
    </div>
  );
}

/** Botão para remover um item de lista (usado nos editores de arrays de objeto). */
export function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="shrink-0 rounded-lg border border-border px-3 py-2 text-xs font-medium text-text-secondary hover:border-red-500/50 hover:text-red-300"
    >
      Remover
    </button>
  );
}

export function AddButton({
  onClick,
  label = "+ Adicionar item",
}: {
  onClick: () => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg border border-dashed border-border px-3 py-2 text-xs font-medium text-text-secondary hover:border-accent hover:text-accent"
    >
      {label}
    </button>
  );
}