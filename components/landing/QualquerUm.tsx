import type { QualquerUmContent } from "@/lib/landing-content";
import { RichText } from "./RichText";

export function QualquerUm({ content }: { content: QualquerUmContent }) {
  return (
    <section id="qualquer-um">
      <div className="container">
        <div
          className="section-eyebrow eyebrow-center fade-up"
          style={{ justifyContent: "center", marginBottom: 16 }}
        >
          {content.eyebrow}
        </div>
        <h2 className="sell-anything-title fade-up">
          {content.title.split("\n").map((line, i) => (
            <span key={i}>
              {line}
              {i < content.title.split("\n").length - 1 && <br />}
            </span>
          ))}{" "}
          <em>
            {content.titleEm.split("\n").map((line, i) => (
              <span key={i}>
                {line}
                {i < content.titleEm.split("\n").length - 1 && <br />}
              </span>
            ))}
          </em>
        </h2>
        <p className="sell-anything-sub fade-up">{content.sub}</p>
        <div className="sell-examples">
          {content.cards.map((c, i) => (
            <div className="sell-card fade-up" key={i}>
              <span className="sell-emoji">{c.emoji}</span>
              <span className="sell-item">{c.item}</span>
              <span className="sell-arrow">→ vende</span>
            </div>
          ))}
        </div>
        <p className="sell-cta fade-up">
          {content.cta.map((line, i) => (
            <span key={i}>
              <RichText text={line} />
              {i < content.cta.length - 1 && <br />}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}