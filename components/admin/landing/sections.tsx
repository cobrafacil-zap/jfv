"use client";

import type {
  NavContent,
  HeroContent,
  PositioningContent,
  SobreContent,
  ConceptualContent,
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
  | PositioningContent
  | SobreContent
  | ConceptualContent
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
      <Field label="Marca">
        <TextInput value={value.brand} onChange={(brand) => onChange({ ...value, brand })} />
      </Field>
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
      <Field label="Headline (linhas)" hint="Cada linha em um item.">
        <StringList
          values={value.headline}
          onChange={(headline) => onChange({ ...value, headline })}
          itemLabel="Linha"
        />
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
      <Field label="Provas (lista curta — máximo ~4)">
        <StringList values={value.proof} onChange={(proof) => onChange({ ...value, proof })} itemLabel="Prova" />
      </Field>
    </Card>
  );
}

/* ----------------------------- POSICIONAMENTO ----------------------- */
export function PositioningForm({ value, onChange }: SectionFormProps<PositioningContent>) {
  return (
    <Card title="Posicionamento (Vendas não são talento. São processo.)">
      <Field label="Eyebrow">
        <TextInput value={value.eyebrow} onChange={(eyebrow) => onChange({ ...value, eyebrow })} />
      </Field>
      <Field label="Título (linhas)">
        <StringList values={value.title} onChange={(title) => onChange({ ...value, title })} itemLabel="Linha" />
      </Field>
      <Field label="Parágrafos">
        <StringList values={value.paragraphs} onChange={(paragraphs) => onChange({ ...value, paragraphs })} itemLabel="Parágrafo" />
      </Field>
      <Field label="Chips (etapas do método)">
        <StringList values={value.chips} onChange={(chips) => onChange({ ...value, chips })} itemLabel="Chip" />
      </Field>
      <Field label="Frase de destaque (quote)">
        <TextArea value={value.quote} onChange={(quote) => onChange({ ...value, quote })} />
      </Field>
      <Field label="Autor da frase">
        <TextInput value={value.quoteSource} onChange={(quoteSource) => onChange({ ...value, quoteSource })} />
      </Field>
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
      <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
        <Field label="Título (frase principal)">
          <TextInput value={value.title} onChange={(title) => onChange({ ...value, title })} />
        </Field>
        <Field label="Destaque (em itálico roxo)">
          <TextInput value={value.highlight} onChange={(highlight) => onChange({ ...value, highlight })} />
        </Field>
      </div>
      <Field label="Parágrafos">
        <StringList values={value.paragraphs} onChange={(paragraphs) => onChange({ ...value, paragraphs })} itemLabel="Parágrafo" />
      </Field>
      <div>
        <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-text-muted">
          Indicadores (valor + rótulo)
        </span>
        <div className="space-y-2">
          {value.stats.map((s, i) => (
            <div key={i} className="grid grid-cols-[1fr_2fr_auto] gap-2 items-end">
              <Field label="Valor">
                <TextInput
                  value={s.value}
                  onChange={(val) =>
                    onChange({
                      ...value,
                      stats: value.stats.map((x, j) => (j === i ? { ...x, value: val } : x)),
                    })
                  }
                />
              </Field>
              <Field label="Rótulo">
                <TextInput
                  value={s.label}
                  onChange={(val) =>
                    onChange({
                      ...value,
                      stats: value.stats.map((x, j) => (j === i ? { ...x, label: val } : x)),
                    })
                  }
                />
              </Field>
              <RemoveButton
                onClick={() =>
                  onChange({ ...value, stats: value.stats.filter((_, j) => j !== i) })
                }
              />
            </div>
          ))}
          <AddButton
            label="+ Adicionar indicador"
            onClick={() => onChange({ ...value, stats: [...value.stats, { value: "", label: "" }] })}
          />
        </div>
      </div>
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

/* --------------------------- CONCEITUAL --------------------------- */
export function ConceptualForm({ value, onChange }: SectionFormProps<ConceptualContent>) {
  return (
    <Card title="Conceitual (O produto muda. A lógica da venda não.)">
      <Field label="Eyebrow">
        <TextInput value={value.eyebrow} onChange={(eyebrow) => onChange({ ...value, eyebrow })} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Título">
          <TextInput value={value.title} onChange={(title) => onChange({ ...value, title })} />
        </Field>
        <Field label="Destaque">
          <TextInput value={value.titleEm} onChange={(titleEm) => onChange({ ...value, titleEm })} />
        </Field>
      </div>
      <Field label="Subtítulo">
        <TextArea value={value.sub} onChange={(sub) => onChange({ ...value, sub })} />
      </Field>
      <div>
        <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-text-muted">
          Cards conceituais
        </span>
        <div className="space-y-3">
          {value.cards.map((c, i) => (
            <div key={i} className="rounded-lg border border-border bg-bg-elevated p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-text-muted">Card {i + 1}</span>
                <RemoveButton
                  onClick={() =>
                    onChange({ ...value, cards: value.cards.filter((_, idx) => idx !== i) })
                  }
                />
              </div>
              <Field label="Título">
                <TextInput
                  value={c.title}
                  onChange={(title) => {
                    const cards = [...value.cards];
                    cards[i] = { ...cards[i], title };
                    onChange({ ...value, cards });
                  }}
                />
              </Field>
              <Field label="Texto">
                <TextArea
                  value={c.text}
                  onChange={(text) => {
                    const cards = [...value.cards];
                    cards[i] = { ...cards[i], text };
                    onChange({ ...value, cards });
                  }}
                />
              </Field>
            </div>
          ))}
          <AddButton
            label="Adicionar card"
            onClick={() =>
              onChange({
                ...value,
                cards: [...value.cards, { title: "", text: "" }],
              })
            }
          />
        </div>
      </div>
      <Field label="Palavras (faixa marquee)">
        <StringList values={value.words} onChange={(words) => onChange({ ...value, words })} itemLabel="Palavra" />
      </Field>
      <Field label="Frase de fechamento">
        <TextArea value={value.closing} onChange={(closing) => onChange({ ...value, closing })} />
      </Field>
    </Card>
  );
}

/* ----------------------------- PRODUTOS ---------------------------- */
export function ProdutosForm({ value, onChange }: SectionFormProps<ProdutosContent>) {
  return (
    <Card title="Programas">
      <Field label="Eyebrow">
        <TextInput value={value.eyebrow} onChange={(eyebrow) => onChange({ ...value, eyebrow })} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Título">
          <TextInput value={value.title} onChange={(title) => onChange({ ...value, title })} />
        </Field>
        <Field label="Destaque (itálico)">
          <TextInput value={value.titleEm} onChange={(titleEm) => onChange({ ...value, titleEm })} />
        </Field>
      </div>
      <Field label="Subtítulo">
        <TextArea value={value.sub} onChange={(sub) => onChange({ ...value, sub })} />
      </Field>
      <div className="rounded-lg border border-border bg-bg-elevated/40 px-4 py-3 text-xs text-text-muted">
        Catálogo fixo: até <strong className="text-text-primary">3 programas</strong>. Filtros foram removidos para uma leitura mais limpa.
      </div>
      <div>
        <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-text-muted">
          Cards de produto
        </span>
        <div className="space-y-4">
          {value.cards.map((card, i) => (
            <Card
              key={i}
              title={card.title || `Produto ${i + 1}`}
              actions={
                <RemoveButton
                  onClick={() =>
                    onChange({ ...value, cards: value.cards.filter((_, j) => j !== i) })
                  }
                />
              }
            >
              <div className="grid gap-4 sm:grid-cols-[1fr_2fr]">
                <Field label="ID">
                  <TextInput
                    value={card.id}
                    onChange={(id) =>
                      onChange({
                        ...value,
                        cards: value.cards.map((x, j) => (j === i ? { ...x, id } : x)),
                      })
                    }
                  />
                </Field>
                <Field label="Categoria (id do filtro)">
                  <TextInput
                    value={card.category}
                    onChange={(category) =>
                      onChange({
                        ...value,
                        cards: value.cards.map((x, j) => (j === i ? { ...x, category } : x)),
                      })
                    }
                  />
                </Field>
              </div>
              <Field label="Rótulo da categoria (ex: Assinatura)">
                <TextInput
                  value={card.categoryLabel}
                  onChange={(categoryLabel) =>
                    onChange({
                      ...value,
                      cards: value.cards.map((x, j) => (j === i ? { ...x, categoryLabel } : x)),
                    })
                  }
                />
              </Field>
              <Field label="Título do produto">
                <TextInput
                  value={card.title}
                  onChange={(title) =>
                    onChange({
                      ...value,
                      cards: value.cards.map((x, j) => (j === i ? { ...x, title } : x)),
                    })
                  }
                />
              </Field>
              <Field label="Descrição">
                <TextArea
                  value={card.desc}
                  onChange={(desc) =>
                    onChange({
                      ...value,
                      cards: value.cards.map((x, j) => (j === i ? { ...x, desc } : x)),
                    })
                  }
                />
              </Field>
              <Field label="Ideal para">
                <TextInput
                  value={card.idealFor}
                  onChange={(idealFor) =>
                    onChange({
                      ...value,
                      cards: value.cards.map((x, j) => (j === i ? { ...x, idealFor } : x)),
                    })
                  }
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Preço (vazio = Sob consulta)">
                  <TextInput
                    value={card.price ?? ""}
                    placeholder="R$ 19,90"
                    onChange={(price) =>
                      onChange({
                        ...value,
                        cards: value.cards.map((x, j) => (j === i ? { ...x, price } : x)),
                      })
                    }
                  />
                </Field>
                <Field label="Sufixo do preço">
                  <TextInput
                    value={card.priceSuffix ?? ""}
                    placeholder="/mês"
                    onChange={(priceSuffix) =>
                      onChange({
                        ...value,
                        cards: value.cards.map((x, j) => (j === i ? { ...x, priceSuffix } : x)),
                      })
                    }
                  />
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-[1fr_2fr]">
                <Field label="Botão (texto)">
                  <TextInput
                    value={card.buttonLabel}
                    onChange={(buttonLabel) =>
                      onChange({
                        ...value,
                        cards: value.cards.map((x, j) => (j === i ? { ...x, buttonLabel } : x)),
                      })
                    }
                  />
                </Field>
                <Field label="Botão (link)">
                  <TextInput
                    value={card.href}
                    placeholder="#programas"
                    onChange={(href) =>
                      onChange({
                        ...value,
                        cards: value.cards.map((x, j) => (j === i ? { ...x, href } : x)),
                      })
                    }
                  />
                </Field>
              </div>
              <label className="flex items-center gap-2 text-sm text-text-secondary">
                <input
                  type="checkbox"
                  checked={!!card.featured}
                  onChange={(e) =>
                    onChange({
                      ...value,
                      cards: value.cards.map((x, j) =>
                        j === i ? { ...x, featured: e.target.checked } : x
                      ),
                    })
                  }
                />
                Card em destaque
              </label>
            </Card>
          ))}
          {value.cards.length < 3 && (
            <AddButton
              label="+ Adicionar produto"
              onClick={() =>
                onChange({
                  ...value,
                  cards: [
                    ...value.cards,
                    {
                      id: `p${value.cards.length + 1}`,
                      category: "vendas",
                      categoryLabel: "Programa",
                      title: "",
                      desc: "",
                      idealFor: "",
                      buttonLabel: "Conhecer",
                      href: "#programas",
                    },
                  ],
                })
              }
            />
          )}
        </div>
      </div>
      <Field label="CTA (rodapé)">
        <LinkFields
          value={value.allCta}
          onChange={(allCta) => onChange({ ...value, allCta })}
        />
      </Field>
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
      <Field label="Título sticky (lateral desktop)">
        <TextInput value={value.stickyTitle} onChange={(stickyTitle) => onChange({ ...value, stickyTitle })} />
      </Field>
      <Field label="Subtítulo sticky">
        <TextArea value={value.stickySub} onChange={(stickySub) => onChange({ ...value, stickySub })} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Título do bloco">
          <TextInput value={value.title} onChange={(title) => onChange({ ...value, title })} />
        </Field>
        <Field label="Subtítulo do bloco">
          <TextInput value={value.sub} onChange={(sub) => onChange({ ...value, sub })} />
        </Field>
      </div>
      <div className="space-y-4">
        {value.steps.map((s, i) => (
          <Card
            key={i}
            title={s.name || `Passo ${i + 1}`}
            actions={
              <RemoveButton
                onClick={() => onChange({ ...value, steps: value.steps.filter((_, j) => j !== i) })}
              />
            }
          >
            <div className="grid gap-4 sm:grid-cols-[1fr_3fr]">
              <Field label="Número">
                <TextInput
                  value={s.num}
                  placeholder="01"
                  onChange={(num) =>
                    onChange({
                      ...value,
                      steps: value.steps.map((x, j) => (j === i ? { ...x, num } : x)),
                    })
                  }
                />
              </Field>
              <Field label="Nome">
                <TextInput
                  value={s.name}
                  onChange={(name) =>
                    onChange({
                      ...value,
                      steps: value.steps.map((x, j) => (j === i ? { ...x, name } : x)),
                    })
                  }
                />
              </Field>
            </div>
            <Field label="Descrição">
              <TextArea
                value={s.desc}
                onChange={(desc) =>
                  onChange({
                    ...value,
                    steps: value.steps.map((x, j) => (j === i ? { ...x, desc } : x)),
                  })
                }
              />
            </Field>
          </Card>
        ))}
        <AddButton
          label="+ Adicionar passo"
          onClick={() => onChange({ ...value, steps: [...value.steps, { num: "", name: "", desc: "" }] })}
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
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Título">
          <TextInput value={value.title} onChange={(title) => onChange({ ...value, title })} />
        </Field>
        <Field label="Destaque">
          <TextInput value={value.titleEm} onChange={(titleEm) => onChange({ ...value, titleEm })} />
        </Field>
      </div>
      <Field label="Subtítulo">
        <TextArea value={value.sub} onChange={(sub) => onChange({ ...value, sub })} />
      </Field>
      <div>
        <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-text-muted">
          Depoimentos (carrossel)
        </span>
        <div className="space-y-4">
          {value.testimonials.map((t, i) => (
            <Card
              key={i}
              title={t.name || `Depoimento ${i + 1}`}
              actions={
                <RemoveButton
                  onClick={() =>
                    onChange({
                      ...value,
                      testimonials: value.testimonials.filter((_, j) => j !== i),
                    })
                  }
                />
              }
            >
              <Field label="Frase principal (destaque)">
                <TextInput
                  value={t.phrase}
                  onChange={(phrase) =>
                    onChange({
                      ...value,
                      testimonials: value.testimonials.map((x, j) =>
                        j === i ? { ...x, phrase } : x
                      ),
                    })
                  }
                />
              </Field>
              <Field label="Texto do depoimento">
                <TextArea
                  value={t.text}
                  rows={3}
                  onChange={(text) =>
                    onChange({
                      ...value,
                      testimonials: value.testimonials.map((x, j) =>
                        j === i ? { ...x, text } : x
                      ),
                    })
                  }
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Nome">
                  <TextInput
                    value={t.name}
                    onChange={(name) =>
                      onChange({
                        ...value,
                        testimonials: value.testimonials.map((x, j) =>
                          j === i ? { ...x, name } : x
                        ),
                      })
                    }
                  />
                </Field>
                <Field label="Profissão / empresa">
                  <TextInput
                    value={t.role}
                    onChange={(role) =>
                      onChange({
                        ...value,
                        testimonials: value.testimonials.map((x, j) =>
                          j === i ? { ...x, role } : x
                        ),
                      })
                    }
                  />
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Produto utilizado">
                  <TextInput
                    value={t.product}
                    onChange={(product) =>
                      onChange({
                        ...value,
                        testimonials: value.testimonials.map((x, j) =>
                          j === i ? { ...x, product } : x
                        ),
                      })
                    }
                  />
                </Field>
                <Field label="Resultado alcançado">
                  <TextInput
                    value={t.result}
                    onChange={(result) =>
                      onChange({
                        ...value,
                        testimonials: value.testimonials.map((x, j) =>
                          j === i ? { ...x, result } : x
                        ),
                      })
                    }
                  />
                </Field>
              </div>
              <label className="flex items-center gap-2 text-sm text-text-secondary">
                <input
                  type="checkbox"
                  checked={!!t.isPlaceholder}
                  onChange={(e) =>
                    onChange({
                      ...value,
                      testimonials: value.testimonials.map((x, j) =>
                        j === i ? { ...x, isPlaceholder: e.target.checked } : x
                      ),
                    })
                  }
                />
                Marcar como placeholder (aguardando conteúdo real)
              </label>
            </Card>
          ))}
          <AddButton
            label="+ Adicionar depoimento"
            onClick={() =>
              onChange({
                ...value,
                testimonials: [
                  ...value.testimonials,
                  {
                    phrase: "",
                    text: "",
                    name: "",
                    role: "",
                    product: "",
                    result: "",
                    isPlaceholder: true,
                  },
                ],
              })
            }
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
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Eyebrow">
          <TextInput value={value.eyebrow} onChange={(eyebrow) => onChange({ ...value, eyebrow })} />
        </Field>
        <Field label="Título">
          <TextInput value={value.title} onChange={(title) => onChange({ ...value, title })} />
        </Field>
      </div>
      <div className="space-y-4">
        {value.items.map((it, i) => (
          <Card
            key={i}
            title={it.q || `Pergunta ${i + 1}`}
            actions={
              <RemoveButton
                onClick={() =>
                  onChange({ ...value, items: value.items.filter((_, j) => j !== i) })
                }
              />
            }
          >
            <Field label="Pergunta">
              <TextInput
                value={it.q}
                onChange={(q) =>
                  onChange({
                    ...value,
                    items: value.items.map((x, j) => (j === i ? { ...x, q } : x)),
                  })
                }
              />
            </Field>
            <Field label="Resposta">
              <TextArea
                value={it.a}
                onChange={(a) =>
                  onChange({
                    ...value,
                    items: value.items.map((x, j) => (j === i ? { ...x, a } : x)),
                  })
                }
              />
            </Field>
          </Card>
        ))}
        <AddButton
          label="+ Adicionar pergunta"
          onClick={() => onChange({ ...value, items: [...value.items, { q: "", a: "" }] })}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-[1fr_2fr]">
        <Field label="CTA — texto">
          <TextInput
            value={value.ctaText}
            onChange={(ctaText) => onChange({ ...value, ctaText })}
          />
        </Field>
        <Field label="CTA — botão (label + link)">
          <LinkFields
            value={{ label: value.ctaLabel, href: value.ctaHref }}
            onChange={({ label, href }) =>
              onChange({ ...value, ctaLabel: label, ctaHref: href })
            }
          />
        </Field>
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
      <Field label="Título (linhas)" hint="Cada linha em um item.">
        <StringList values={value.title} onChange={(title) => onChange({ ...value, title })} itemLabel="Linha" />
      </Field>
      <Field label="Subtítulo">
        <TextArea value={value.sub} onChange={(sub) => onChange({ ...value, sub })} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Botão primário">
          <LinkFields
            value={value.primary}
            onChange={(primary) => onChange({ ...value, primary })}
          />
        </Field>
        <Field label="Botão secundário">
          <LinkFields
            value={value.secondary}
            onChange={(secondary) => onChange({ ...value, secondary })}
          />
        </Field>
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
          <TextInput value={value.brand} onChange={(brand) => onChange({ ...value, brand })} />
        </Field>
        <Field label="Método (subtítulo)">
          <TextInput value={value.method} onChange={(method) => onChange({ ...value, method })} />
        </Field>
      </div>
      <Field label="Frase (tagline)">
        <TextArea value={value.tagline} onChange={(tagline) => onChange({ ...value, tagline })} />
      </Field>
      <div>
        <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-text-muted">
          Redes sociais
        </span>
        <div className="space-y-2">
          {value.socials.map((s, i) => (
            <div key={i} className="grid grid-cols-[1fr_2fr_auto] gap-2 items-end">
              <Field label="Rótulo">
                <TextInput
                  value={s.label}
                  onChange={(label) =>
                    onChange({
                      ...value,
                      socials: value.socials.map((x, j) => (j === i ? { ...x, label } : x)),
                    })
                  }
                />
              </Field>
              <Field label="Link">
                <TextInput
                  value={s.href}
                  onChange={(href) =>
                    onChange({
                      ...value,
                      socials: value.socials.map((x, j) => (j === i ? { ...x, href } : x)),
                    })
                  }
                />
              </Field>
              <RemoveButton
                onClick={() =>
                  onChange({ ...value, socials: value.socials.filter((_, j) => j !== i) })
                }
              />
            </div>
          ))}
          <AddButton
            label="+ Adicionar rede"
            onClick={() => onChange({ ...value, socials: [...value.socials, { label: "", href: "" }] })}
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
              actions={
                <RemoveButton
                  onClick={() =>
                    onChange({ ...value, columns: value.columns.filter((_, j) => j !== i) })
                  }
                />
              }
            >
              <Field label="Título da coluna">
                <TextInput
                  value={col.title}
                  onChange={(title) =>
                    onChange({
                      ...value,
                      columns: value.columns.map((x, j) => (j === i ? { ...x, title } : x)),
                    })
                  }
                />
              </Field>
              <div className="space-y-2">
                {col.links.map((l, j) => (
                  <div key={j} className="flex items-end gap-2">
                    <LinkFields
                      value={l}
                      onChange={(nl) =>
                        onChange({
                          ...value,
                          columns: value.columns.map((x, k) =>
                            k === i
                              ? { ...x, links: x.links.map((y, m) => (m === j ? nl : y)) }
                              : x
                          ),
                        })
                      }
                    />
                    <RemoveButton
                      onClick={() =>
                        onChange({
                          ...value,
                          columns: value.columns.map((x, k) =>
                            k === i
                              ? { ...x, links: x.links.filter((_, m) => m !== j) }
                              : x
                          ),
                        })
                      }
                    />
                  </div>
                ))}
                <AddButton
                  label="+ Adicionar link"
                  onClick={() =>
                    onChange({
                      ...value,
                      columns: value.columns.map((x, k) =>
                        k === i ? { ...x, links: [...x.links, { label: "", href: "#" }] } : x
                      ),
                    })
                  }
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
          <TextInput value={value.copyright} onChange={(copyright) => onChange({ ...value, copyright })} />
        </Field>
      </div>
      <div>
        <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-text-muted">
          Legal
        </span>
        <StringList
          values={value.legal}
          onChange={(legal) => onChange({ ...value, legal })}
          itemLabel="Item"
        />
      </div>
    </Card>
  );
}