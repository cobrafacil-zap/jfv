import React from "react";

/**
 * Renderiza texto simples com suporte a:
 *  - **negrito**  -> <strong>
 *  - \n           -> <br/>
 * Usado nas seções da landing (sobre, qualquer-um, etc.).
 */
export function RichText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const lines = text.split("\n");
  return (
    <span className={className}>
      {lines.map((line, i) => (
        <React.Fragment key={i}>
          {renderBold(line)}
          {i < lines.length - 1 && <br />}
        </React.Fragment>
      ))}
    </span>
  );
}

function renderBold(line: string) {
  const parts = line.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}