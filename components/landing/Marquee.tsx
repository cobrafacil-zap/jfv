/** Faixa de palavras-chave em movimento (marquee CSS). Server component. */
export function Marquee({ items }: { items: string[] }) {
  const row = [...items, ...items]; // duplica para loop contínuo
  return (
    <div className="marquee" aria-hidden>
      <div className="marquee-track">
        {row.map((it, i) => (
          <span className="marquee-item" key={i}>
            <span className="star">✦</span>
            {it}
          </span>
        ))}
      </div>
    </div>
  );
}