/**
 * Logo de planIA en vector (nítido en cualquier tamaño).
 * Ícono de red neuronal + palabra "planIA" con los colores de la marca.
 */

function NetworkIcon({ size = 36 }: { size?: number }) {
  // 6 nodos alrededor de un centro, en radio 16 sobre un lienzo de 48x48.
  const cx = 24;
  const cy = 24;
  const r = 16;
  const nodes = [0, 60, 120, 180, 240, 300].map((deg) => {
    const rad = (deg * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  });

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      {/* Conexiones al centro */}
      {nodes.map((n, i) => (
        <line
          key={`c${i}`}
          x1={cx}
          y1={cy}
          x2={n.x}
          y2={n.y}
          stroke="#c9bfae"
          strokeWidth="1.3"
        />
      ))}
      {/* Anillo entre nodos */}
      {nodes.map((n, i) => {
        const m = nodes[(i + 1) % nodes.length];
        return (
          <line
            key={`r${i}`}
            x1={n.x}
            y1={n.y}
            x2={m.x}
            y2={m.y}
            stroke="#d9d0c0"
            strokeWidth="1"
          />
        );
      })}
      {/* Nodos exteriores (alternan salvia e ink) */}
      {nodes.map((n, i) => (
        <circle
          key={`n${i}`}
          cx={n.x}
          cy={n.y}
          r="4"
          fill={i % 2 === 0 ? "#3a3f45" : "#8fb7a1"}
        />
      ))}
      {/* Centro terracota con destello */}
      <circle cx={cx} cy={cy} r="4.5" fill="#a45c3c" />
      <path
        d="M24 17 L25.2 22.8 L31 24 L25.2 25.2 L24 31 L22.8 25.2 L17 24 L22.8 22.8 Z"
        fill="#f0e6d4"
      />
    </svg>
  );
}

export function Logo({
  iconSize = 34,
  textClass = "text-xl",
  tagline = false,
  className = "",
}: {
  iconSize?: number;
  textClass?: string;
  tagline?: boolean;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <NetworkIcon size={iconSize} />
      <span className="leading-none">
        <span className={`font-heading font-extrabold tracking-tight ${textClass}`}>
          <span className="text-ink">plan</span>
          <span className="text-brand">IA</span>
        </span>
        {tagline && (
          <span className="mt-1 block text-xs font-semibold text-muted">
            PlanIA propone. La docente decide.
          </span>
        )}
      </span>
    </span>
  );
}
