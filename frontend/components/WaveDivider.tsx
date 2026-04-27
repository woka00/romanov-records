// ROMANOV RECORDS — organic wave divider between sections
// Renders an SVG blob/wave shape that visually separates dark teal sections
// Props:
//   flip  — mirror vertically (for bottom-entry waves)
//   color — fill colour (default near-white cream)
//   opacity — 0–1

interface Props {
  flip?: boolean;
  color?: string;
  opacity?: number;
  className?: string;
}

export default function WaveDivider({
  flip = false,
  color = "#f5f2ed",
  opacity = 0.12,
  className = "",
}: Props) {
  return (
    <div
      className={`pointer-events-none w-full overflow-hidden leading-none ${className}`}
      style={{ transform: flip ? "scaleY(-1)" : undefined }}
    >
      <svg
        viewBox="0 0 1440 120"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        style={{ width: "100%", height: 120, display: "block" }}
      >
        {/* two overlapping organic waves for depth */}
        <path
          d="M0,60 C180,10 360,110 540,70 C720,30 900,100 1080,60 C1220,28 1360,90 1440,55 L1440,120 L0,120 Z"
          fill={color}
          opacity={opacity}
        />
        <path
          d="M0,90 C200,40 420,120 660,80 C900,40 1140,110 1440,70 L1440,120 L0,120 Z"
          fill={color}
          opacity={opacity * 0.6}
        />
      </svg>
    </div>
  );
}
