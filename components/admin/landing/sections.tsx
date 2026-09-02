"use client";

import type {
  NavContent,
  HeroContent,
  StatsContent,
  SobreContent,
  QualquerUmContent,
  ProdutosContent,
  MetodoContent,
  ResultadosContent,
  FaqContent,
  CtaContent,
  FooterContent,
} from "@/lib/landing-content";
import {
  Field,
  TextInput,
  TextArea,
  LinkFields,
  ImageField,
  StringList,
  Card,
  RemoveButton,
  AddButton,
} from "./fields";

const selectCls =
  "rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none";

type AnySection =
  | NavContent
  | HeroContent
  | StatsContent
  | SobreContent
  | QualquerUmContent
  | ProdutosContent
  | MetodoContent
  | ResultadosContent
  | FaqContent
  | CtaContent
  | FooterContent;

export type SectionFormProps<T extends AnySection> = {
  value: T;
  onChange: (next: T) => void;
};

/* ------------------------------- NAV ------------------------------- */
export function NavForm({ value, onChange }: SectionFormProps<NavContent>) {
  return (
    <Card title="Menu (Navbar)">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Logo (início)">
          <TextInput
            value={value.logoStart}
            onChange={(logoStart) => onChange({ ...value, logoStart })}
          />
        </Field>
        <Field label="Logo (destaque gold)">
          <TextInput
            value={value.logoHighlight}
            onChange={(logoHighlight) => onChange({ ...value, logoHighlight })}
          />
        </Field>
      </div>
      <div>
        <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-text-muted">
          Links do menu
        </span>
        <div className="space-y-2">
          {value.links.map((l, i) => (
            <div key={i}>
              <LinkFields
                value={l}
                onChange={(nl) =>
                  onChange({
                    ...value,
                    links: value.links.map((x, j) => (j === i ? nl : x)),
                  })
                }
              />
            </div>
          ))}
        </div>
        <div className="mt-2">
          <AddButton
            label="+ Adicionar link"
            onClick={() =>
              onChange({
                ...value,
                links: [...value.links, { label: "", href: "#" }],
              })
            }
          />
        </div>
      </div>
      <Field label="Botão (CTA do menu)">
        <LinkFields
          value={value.cta}
          onChange={(cta) => onChange({ ...value, cta })}
        />
      </Field>
    </Card>
  );
}

/* ------------------------------- HERO ------------------------------ */
export function HeroForm({ value, onChange }: SectionFormProps<HeroContent>) {
  return (
    <Card title="Hero (topo)">
      <Field label="Eyebrow (acima do título)">
        <TextInput value={value.eyebrow} onChange={(eyebrow) => onChange({ ...value, eyebrow })} />
      </Field>
      <Field label="Headline" hint="Quebras de linha com \n">
        <TextArea value={value.headline} rows={3} onChange={(headline) => onChange({ ...value, headline })} />
      </Field>
      <Field label="Headline em destaque (gold)" hint="Quebras de linha com \n">
        <TextArea value={value.headlineEm} rows={2} onChange={(headlineEm) => onChange({ ...value, headlineEm })} />
      </Field>
      <Field label="Subtítulo">
        <TextArea value={value.sub} onChange={(sub) => onChange({ ...value, sub })} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Botão primário">
          <LinkFields value={value.primaryCta} onChange={(primaryCta) => onChange({ ...value, primaryCta })} />
        </Field>
        <Field label="Botão secundário">
          <LinkFields value={value.secondaryCta} onChange={(secondaryCta) => onChange({ ...value, secondaryCta })} />
        </Field>
      </div>
      <ImageField label="Foto do hero" value={value.photoUrl} onChange={(photoUrl) => onChange({ ...value, photoUrl })} />
      <Field label="Badges (lista)">
        <StringList values={value.badges} onChange={(badges) => onChange({ ...value, badges })} itemLabel="Badge" />
      </Field>
    </Card>
  );
}

/* ------------------------------- STATS ----------------------------- */
export function StatsForm({ value, onChange }: SectionFormProps<StatsContent>) {
  return (
    <Card title="Estatísticas (faixa gold)">
      <div className="space-y-3">
        {value.items.map((it, i) => (
          <div key={i} className="flex items-end gap-2">
            <Field label={`Número ${i + 1}`}>
              <TextInput value={it.num} onChange={(num) => onChange({ ...value, items: value.items.map((x, j) => (j === i ? { ...x, num } : x)) })} />
            </Field>
            <Field label="Rótulo">
              <TextInput value={it.label} onChange={(label) => onChange({ ...value, items: value.items.map((x, j) => (j === i ? { ...x, label } : x)) })} />
            </Field>
            <RemoveButton onClick={() => onChange({ ...value, items: value.items.filter((_, j) => j !== i) })} />
          </div>
        ))}
        <AddButton onClick={() => onChange({ ...value, items: [...value.items, { num: "", label: "" }] })} />
      </div>
    </Card>
  );
}

/* ------------------------------- SOBRE ----------------------------- */
export function SobreForm({ value, onChange }: SectionFormProps<SobreContent>) {
  return (
    <Card title="Sobre (Quem é)">
      <Field label="Eyebrow">
        <TextInput value={value.eyebrow} onChange={(eyebrow) => onChange({ ...value, eyebrow })} />
      </Field>
      <Field label="Título">
        <TextInput value={value.title} onChange={(title) => onChange({ ...value, title })} />
      </Field>
      <Field label="Parágrafos" hint="Use **texto** para negrito.">
        <StringList values={value.paragraphs} onChange={(paragraphs) => onChange({ ...value, paragraphs })} itemLabel="Parágrafo" />
      </Field>
      <Field label="Tags">
        <StringList values={value.tags} onChange={(tags) => onChange({ ...value, tags })} itemLabel="Tag" />
      </Field>
      <div className="grid gap-4 sm:grid-cols-3">
        <ImageField label="Foto principal" value={value.photoMain} onChange={(photoMain) => onChange({ ...value, photoMain })} />
        <ImageField label="Foto pequena 1" value={value.photoSm1} onChange={(photoSm1) => onChange({ ...value, photoSm1 })} />
        <ImageField label="Foto pequena 2" value={value.photoSm2} onChange={(photoSm2) => onChange({ ...value, photoSm2 })} />
      </div>
    </Card>
  );
}

/* --------------------------- QUALQUER UM --------------------------- */
export function QualquerUmForm({ value, onChange }: SectionFormProps<QualquerUmContent>) {
  return (
    <Card title="Qualquer pessoa pode vender">
      <Field label="Eyebrow">
        <TextInput value={value.eyebrow} onChange={(eyebrow) => onChange({ ...value, eyebrow })} />
      </Field>
      <Field label="Título" hint="Quebras de linha com \n">
        <TextArea value={value.title} rows={2} onChange={(title) => onChange({ ...value, title })} />
      </Field>
      <Field label="Título em destaque (gold)">
        <TextInput value={value.titleEm} onChange={(titleEm) => onChange({ ...value, titleEm })} />
      </Field>
      <Field label="Subtítulo">
        <TextArea value={value.sub} onChange={(sub) => onChange({ ...value, sub })} />
      </Field>
      <div>
        <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-text-muted">
          Cards de exemplos
        </span>
        <div className="space-y-2">
          {value.cards.map((c, i) => (
            <div key={i} className="flex items-end gap-2">
              <Field label="Emoji">
                <TextInput value={c.emoji} onChange={(emoji) => onChange({ ...value, cards: value.cards.map((x, j) => (j === i ? { ...x, emoji } : x)) })} />
              </Field>
              <Field label="Item">
                <TextInput value={c.item} onChange={(item) => onChange({ ...value, cards: value.cards.map((x, j) => (j === i ? { ...x, item } : x)) })} />
              </Field>
              <RemoveButton onClick={() => onChange({ ...value, cards: value.cards.filter((_, j) => j !== i) })} />
            </div>
          ))}
          <AddButton onClick={() => onChange({ ...value, cards: [...value.cards, { emoji: "", item: "" }] })} />
        </div>
      </div>
      <Field label="Frases de CTA" hint="Use **texto** para negrito.">
        <StringList values={value.cta} onChange={(cta) => onChange({ ...value, cta })} itemLabel="Frase" />
      </Field>
    </Card>
  );
}

/* ----------------------------- PRODUTOS ---------------------------- */
export function ProdutosForm({ value, onChange }: SectionFormProps<ProdutosContent>) {
  return (
    <Card title="Produtos / Programas">
      <Field label="Eyebrow">
        <TextInput value={value.eyebrow} onChange={(eyebrow) => onChange({ ...value, eyebrow })} />
      </Field>
      <Field label="Título">
        <TextInput value={value.title} onChange={(title) => onChange({ ...value, title })} />
      </Field>
      <Field label="Subtítulo">
        <TextArea value={value.sub} onChange={(sub) => onChange({ ...value, sub })} />
      </Field>
      <div>
        <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-text-muted">
          Cards de produto
        </span>
        <div className="space-y-4">
          {value.cards.map((card, i) => (
            <Card
              key={i}
              title={`Produto ${i + 1}`}
              actions={
                <RemoveButton onClick={() => onChange({ ...value, cards: value.cards.filter((_, j) => j !== i) })} />
              }
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Badge (texto)">
                  <TextInput value={card.badge} onChange={(badge) => onChange({ ...value, cards: value.cards.map((x, j) => (j === i ? { ...x, badge } : x)) })} />
                </Field>
                <Field label="Cor da badge">
                  <select
                    className={selectCls}
                    value={card.badgeClass}
                    onChange={(e) => onChange({ ...value, cards: value.cards.map((x, j) => (j === i ? { ...x, badgeClass: e.target.value as "bm" | "ba" | "be" } : x)) })}
                  >
                    <option value="bm">Mentoria</option>
                    <option value="ba">Assinatura</option>
                    <option value="be">Empresarial</option>
                  </select>
                </Field>
              </div>
              <Field label="Título do produto">
                <TextInput value={card.title} onChange={(title) => onChange({ ...value, cards: value.cards.map((x, j) => (j === i ? { ...x, title } : x)) })} />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Preço">
                  <TextInput value={card.price} placeholder="R$ 19,90" onChange={(price) => onChange({ ...value, cards: value.cards.map((x, j) => (j === i ? { ...x, price } : x)) })} />
                </Field>
                <Field label="Sufixo do preço">
                  <TextInput value={card.priceSuffix} placeholder="/mês" onChange={(priceSuffix) => onChange({ ...value, cards: value.cards.map((x, j) => (j === i ? { ...x, priceSuffix } : x)) })} />
                </Field>
              </div>
              <Field label="Descrição">
                <TextArea value={card.desc} onChange={(desc) => onChange({ ...value, cards: value.cards.map((x, j) => (j === i ? { ...x, desc } : x)) })} />
              </Field>
              <Field label="Benefícios">
                <StringList values={card.benefits} onChange={(benefits) => onChange({ ...value, cards: value.cards.map((x, j) => (j === i ? { ...x, benefits } : x)) })} itemLabel="Benefício" />
              </Field>
              <div className="grid gap-4 sm:grid-cols-[2fr_2fr_1fr]">
                <Field label="Botão (texto)">
                  <TextInput value={card.button.label} onChange={(label) => onChange({ ...value, cards: value.cards.map((x, j) => (j === i ? { ...x, button: { ...x.button, label } } : x)) })} />
                </Field>
                <Field label="Botão (link)">
                  <TextInput value={card.button.href} placeholder="/checkout" onChange={(href) => onChange({ ...value, cards: value.cards.map((x, j) => (j === i ? { ...x, button: { ...x.button, href } } : x)) })} />
                </Field>
                <Field label="Estilo">
                  <select
                    className={selectCls}
                    value={card.button.variant}
                    onChange={(e) => onChange({ ...value, cards: value.cards.map((x, j) => (j === i ? { ...x, button: { ...x.button, variant: e.target.value as "navy" | "gold" } } : x)) })}
                  >
                    <option value="gold">Gold (destaque)</option>
                    <option value="navy">Navy</option>
                  </select>
                </Field>
              </div>
              <label className="flex items-center gap-2 text-sm text-text-secondary">
                <input
                  type="checkbox"
                  checked={!!card.featured}
                  onChange={(e) => onChange({ ...value, cards: value.cards.map((x, j) => (j === i ? { ...x, featured: e.target.checked } : x)) })}
                />
                Card em destaque (destaque visual)
              </label>
            </Card>
          ))}
          <AddButton
            label="+ Adicionar produto"
            onClick={() =>
              onChange({
                ...value,
                cards: [
                  ...value.cards,
                  { badge: "", badgeClass: "ba", title: "", price: "", priceSuffix: "", desc: "", benefits: [], button: { label: "", href: "/checkout", variant: "gold" } },
                ],
              })
            }
          />
        </div>
      </div>
    </Card>
  );
}

/* ----------------------------- MÉTODO ------------------------------ */
export function MetodoForm({ value, onChange }: SectionFormProps<MetodoContent>) {
  return (
    <Card title="Método JFV (passos)">
      <Field label="Eyebrow">
        <TextInput value={value.eyebrow} onChange={(eyebrow) => onChange({ ...value, eyebrow })} />
      </Field>
      <Field label="Título">
        <TextInput value={value.title} onChange={(title) => onChange({ ...value, title })} />
      </Field>
      <Field label="Subtítulo">
        <TextArea value={value.sub} onChange={(sub) => onChange({ ...value, sub })} />
      </Field>
      <div className="space-y-4">
        {value.steps.map((s, i) => (
          <Card
            key={i}
            title={`Passo ${i + 1}`}
            actions={<RemoveButton onClick={() => onChange({ ...value, steps: value.steps.filter((_, j) => j !== i) })} />}
          >
            <div className="grid gap-4 sm:grid-cols-[1fr_2fr_3fr]">
              <Field label="Emoji">
                <TextInput value={s.emoji} onChange={(emoji) => onChange({ ...value, steps: value.steps.map((x, j) => (j === i ? { ...x, emoji } : x)) })} />
              </Field>
              <Field label="Etiqueta">
                <TextInput value={s.step} onChange={(step) => onChange({ ...value, steps: value.steps.map((x, j) => (j === i ? { ...x, step } : x)) })} />
              </Field>
              <Field label="Nome">
                <TextInput value={s.name} onChange={(name) => onChange({ ...value, steps: value.steps.map((x, j) => (j === i ? { ...x, name } : x)) })} />
              </Field>
            </div>
            <Field label="Descrição">
              <TextInput value={s.desc} onChange={(desc) => onChange({ ...value, steps: value.steps.map((x, j) => (j === i ? { ...x, desc } : x)) })} />
            </Field>
          </Card>
        ))}
        <AddButton
          label="+ Adicionar passo"
          onClick={() => onChange({ ...value, steps: [...value.steps, { emoji: "", step: "", name: "", desc: "" }] })}
        />
      </div>
    </Card>
  );
}

/* --------------------------- RESULTADOS ---------------------------- */
export function ResultadosForm({ value, onChange }: SectionFormProps<ResultadosContent>) {
  return (
    <Card title="Resultados">
      <Field label="Eyebrow">
        <TextInput value={value.eyebrow} onChange={(eyebrow) => onChange({ ...value, eyebrow })} />
      </Field>
      <Field label="Título">
        <TextInput value={value.title} onChange={(title) => onChange({ ...value, title })} />
      </Field>
      <Field label="Subtítulo">
        <TextArea value={value.sub} onChange={(sub) => onChange({ ...value, sub })} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        {value.photos.map((p, i) => (
          <ImageField
            key={i}
            label={`Foto mosaico ${i + 1}`}
            value={p}
            onChange={(url) => onChange({ ...value, photos: value.photos.map((x, j) => (j === i ? url : x)) })}
          />
        ))}
      </div>
      <div>
        <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-text-muted">
          Vídeos do mosaico (links)
        </span>
        <div className="space-y-2">
          {value.videos.map((v, i) => (
            <div key={i} className="flex items-end gap-2">
              <Field label={`Rótulo ${i + 1}`}>
                <TextInput value={v.label} onChange={(label) => onChange({ ...value, videos: value.videos.map((x, j) => (j === i ? { ...x, label } : x)) })} />
              </Field>
              <Field label="URL do vídeo">
                <TextInput value={v.url} placeholder="https://..." onChange={(url) => onChange({ ...value, videos: value.videos.map((x, j) => (j === i ? { ...x, url } : x)) })} />
              </Field>
            </div>
          ))}
        </div>
      </div>
      <div>
        <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-text-muted">
          Depoimentos
        </span>
        <div className="space-y-4">
          {value.testimonials.map((t, i) => (
            <Card
              key={i}
              title={`Depoimento ${i + 1}`}
              actions={<RemoveButton onClick={() => onChange({ ...value, testimonials: value.testimonials.filter((_, j) => j !== i) })} />}
            >
              <div className="grid gap-4 sm:grid-cols-[1fr_3fr]">
                <Field label="Avatar (emoji)">
                  <TextInput value={t.avatar} onChange={(avatar) => onChange({ ...value, testimonials: value.testimonials.map((x, j) => (j === i ? { ...x, avatar } : x)) })} />
                </Field>
                <Field label="Nome">
                  <TextInput value={t.name} onChange={(name) => onChange({ ...value, testimonials: value.testimonials.map((x, j) => (j === i ? { ...x, name } : x)) })} />
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Cargo / cidade">
                  <TextInput value={t.role} onChange={(role) => onChange({ ...value, testimonials: value.testimonials.map((x, j) => (j === i ? { ...x, role } : x)) })} />
                </Field>
                <Field label="Produto">
                  <TextInput value={t.product} onChange={(product) => onChange({ ...value, testimonials: value.testimonials.map((x, j) => (j === i ? { ...x, product } : x)) })} />
                </Field>
              </div>
              <Field label="Texto">
                <TextArea value={t.text} rows={3} onChange={(text) => onChange({ ...value, testimonials: value.testimonials.map((x, j) => (j === i ? { ...x, text } : x)) })} />
              </Field>
            </Card>
          ))}
          <AddButton
            label="+ Adicionar depoimento"
            onClick={() => onChange({ ...value, testimonials: [...value.testimonials, { text: "", avatar: "⭐", name: "", role: "", product: "" }] })}
          />
        </div>
      </div>
    </Card>
  );
}

/* ------------------------------- FAQ ------------------------------- */
export function FaqForm({ value, onChange }: SectionFormProps<FaqContent>) {
  return (
    <Card title="Perguntas frequentes">
      <div className="space-y-4">
        {value.items.map((it, i) => (
          <Card
            key={i}
            title={`Pergunta ${i + 1}`}
            actions={<RemoveButton onClick={() => onChange({ ...value, items: value.items.filter((_, j) => j !== i) })} />}
          >
            <Field label="Pergunta">
              <TextInput value={it.q} onChange={(q) => onChange({ ...value, items: value.items.map((x, j) => (j === i ? { ...x, q } : x)) })} />
            </Field>
            <Field label="Resposta">
              <TextArea value={it.a} onChange={(a) => onChange({ ...value, items: value.items.map((x, j) => (j === i ? { ...x, a } : x)) })} />
            </Field>
          </Card>
        ))}
        <AddButton
          label="+ Adicionar pergunta"
          onClick={() => onChange({ ...value, items: [...value.items, { q: "", a: "" }] })}
        />
      </div>
    </Card>
  );
}

/* ------------------------------- CTA ------------------------------- */
export function CtaForm({ value, onChange }: SectionFormProps<CtaContent>) {
  return (
    <Card title="CTA final">
      <Field label="Eyebrow">
        <TextInput value={value.eyebrow} onChange={(eyebrow) => onChange({ ...value, eyebrow })} />
      </Field>
      <Field label="Headline">
        <TextInput value={value.headline} onChange={(headline) => onChange({ ...value, headline })} />
      </Field>
      <Field label="Headline em destaque (gold)">
        <TextInput value={value.headlineEm} onChange={(headlineEm) => onChange({ ...value, headlineEm })} />
      </Field>
      <Field label="Subtítulo">
        <TextArea value={value.sub} onChange={(sub) => onChange({ ...value, sub })} />
      </Field>
      <div>
        <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-text-muted">
          Botões
        </span>
        <div className="space-y-3">
          {value.buttons.map((b, i) => (
            <div key={i} className="rounded-lg border border-border bg-bg-elevated/40 p-3">
              <div className="flex items-start justify-end">
                <RemoveButton onClick={() => onChange({ ...value, buttons: value.buttons.filter((_, j) => j !== i) })} />
              </div>
              <div className="mt-2 grid gap-3 sm:grid-cols-[2fr_2fr_1fr]">
                <Field label="Texto">
                  <TextInput value={b.label} onChange={(label) => onChange({ ...value, buttons: value.buttons.map((x, j) => (j === i ? { ...x, label } : x)) })} />
                </Field>
                <Field label="Link">
                  <TextInput value={b.href} onChange={(href) => onChange({ ...value, buttons: value.buttons.map((x, j) => (j === i ? { ...x, href } : x)) })} />
                </Field>
                <Field label="Estilo">
                  <select
                    className={selectCls}
                    value={b.variant}
                    onChange={(e) => onChange({ ...value, buttons: value.buttons.map((x, j) => (j === i ? { ...x, variant: e.target.value as "gold" | "outline" } : x)) })}
                  >
                    <option value="gold">Gold</option>
                    <option value="outline">Outline</option>
                  </select>
                </Field>
              </div>
            </div>
          ))}
          <AddButton
            label="+ Adicionar botão"
            onClick={() => onChange({ ...value, buttons: [...value.buttons, { label: "", href: "/checkout", variant: "gold" }] })}
          />
        </div>
      </div>
    </Card>
  );
}

/* ------------------------------ FOOTER ----------------------------- */
export function FooterForm({ value, onChange }: SectionFormProps<FooterContent>) {
  return (
    <Card title="Rodapé">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nome da marca">
          <TextInput value={value.brandName} onChange={(brandName) => onChange({ ...value, brandName })} />
        </Field>
        <Field label="Subtítulo da marca">
          <TextInput value={value.brandSub} onChange={(brandSub) => onChange({ ...value, brandSub })} />
        </Field>
      </div>
      <Field label="Descrição">
        <TextArea value={value.desc} onChange={(desc) => onChange({ ...value, desc })} />
      </Field>
      <div>
        <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-text-muted">
          Redes sociais
        </span>
        <div className="space-y-2">
          {value.socials.map((s, i) => (
            <div key={i} className="flex items-end gap-2">
              <Field label="Emoji">
                <TextInput value={s.icon} onChange={(icon) => onChange({ ...value, socials: value.socials.map((x, j) => (j === i ? { ...x, icon } : x)) })} />
              </Field>
              <Field label="Título">
                <TextInput value={s.title} onChange={(title) => onChange({ ...value, socials: value.socials.map((x, j) => (j === i ? { ...x, title } : x)) })} />
              </Field>
              <Field label="Link">
                <TextInput value={s.href} onChange={(href) => onChange({ ...value, socials: value.socials.map((x, j) => (j === i ? { ...x, href } : x)) })} />
              </Field>
              <RemoveButton onClick={() => onChange({ ...value, socials: value.socials.filter((_, j) => j !== i) })} />
            </div>
          ))}
          <AddButton
            label="+ Adicionar rede"
            onClick={() => onChange({ ...value, socials: [...value.socials, { icon: "", title: "", href: "" }] })}
          />
        </div>
      </div>
      <div>
        <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-text-muted">
          Colunas de links
        </span>
        <div className="space-y-4">
          {value.columns.map((col, i) => (
            <Card
              key={i}
              title={col.title || `Coluna ${i + 1}`}
              actions={<RemoveButton onClick={() => onChange({ ...value, columns: value.columns.filter((_, j) => j !== i) })} />}
            >
              <Field label="Título da coluna">
                <TextInput value={col.title} onChange={(title) => onChange({ ...value, columns: value.columns.map((x, j) => (j === i ? { ...x, title } : x)) })} />
              </Field>
              <div className="space-y-2">
                {col.links.map((l, j) => (
                  <div key={j} className="flex items-end gap-2">
                    <LinkFields
                      value={l}
                      onChange={(nl) => onChange({ ...value, columns: value.columns.map((x, k) => (k === i ? { ...x, links: x.links.map((y, m) => (m === j ? nl : y)) } : x)) })}
                    />
                    <RemoveButton onClick={() => onChange({ ...value, columns: value.columns.map((x, k) => (k === i ? { ...x, links: x.links.filter((_, m) => m !== j) } : x)) })} />
                  </div>
                ))}
                <AddButton
                  label="+ Adicionar link"
                  onClick={() => onChange({ ...value, columns: value.columns.map((x, k) => (k === i ? { ...x, links: [...x.links, { label: "", href: "#" }] } : x)) })}
                />
              </div>
            </Card>
          ))}
          <AddButton
            label="+ Adicionar coluna"
            onClick={() => onChange({ ...value, columns: [...value.columns, { title: "", links: [] }] })}
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Copyright">
          <TextInput value={value.copy} onChange={(copy) => onChange({ ...value, copy })} />
        </Field>
        <Field label="Método (rodapé direito)">
          <TextInput value={value.method} onChange={(method) => onChange({ ...value, method })} />
        </Field>
      </div>
    </Card>
  );
}