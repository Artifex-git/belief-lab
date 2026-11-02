// The ribbon of light as a UI element: level progress and the Compass stage tracker.
// Vanilla JS, no dependencies. Each function returns an SVG string to put in innerHTML
// (or port the same geometry to your framework's components).
//
// Meaning, as in the book: the ribbon is the pull, the sun marks where you are now.
// Lake blue = the part already walked ("when it flows"), sun gold = your current point.

const DAWN = {
  lake: "var(--color-lake, #2A5F8F)",
  line: "var(--color-line, #D3DCE0)",
  sun: "var(--color-sun, #D9A441)",
  surface: "var(--color-surface, #FBFCFC)",
  glow: "#F6D290",
  halo: "#FFE2A6",
};

let uid = 0;

function wave(width, amp, cycles, baseline, steps = 60) {
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * width;
    pts.push([x, baseline + amp * Math.sin((x / width) * Math.PI * cycles)]);
  }
  return pts;
}

const d = (pts) => "M" + pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(" L");

/**
 * Level progress: a gently waving line, lit up to `fraction`, with the sun at the current point.
 * @param {number} fraction 0..1
 * @param {object} [opts] { width = 240, label = "Level progress" }
 */
export function progressRibbon(fraction, opts = {}) {
  const width = opts.width ?? 240;
  const id = `dawn-pg-${++uid}`;
  const pts = wave(width, 3.2, 2.2, 11);
  const k = Math.max(0, Math.min(60, Math.round(60 * fraction)));
  const done = pts.slice(0, k + 1);
  const rest = pts.slice(k);
  const [sx, sy] = pts[k];
  const pct = Math.round(fraction * 100);
  return `<svg width="100%" height="22" viewBox="0 0 ${width} 22" preserveAspectRatio="none" role="img" aria-label="${opts.label ?? "Level progress"}: ${pct}%" style="display:block;overflow:visible">
  <defs><filter id="${id}" x="-20%" y="-200%" width="140%" height="500%"><feGaussianBlur stdDeviation="3"/></filter></defs>
  <path d="${d(rest)}" stroke="${DAWN.line}" stroke-width="3" fill="none" stroke-linecap="round"/>
  <path d="${d(done)}" stroke="${DAWN.glow}" stroke-width="9" fill="none" stroke-linecap="round" filter="url(#${id})" opacity="0.8"/>
  <path d="${d(done)}" stroke="${DAWN.lake}" stroke-width="3" fill="none" stroke-linecap="round"/>
  <circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="9" fill="${DAWN.halo}" opacity="0.8" filter="url(#${id})"/>
  <circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="5.5" fill="${DAWN.sun}" stroke="#FFFFFF" stroke-width="2"/>
</svg>`;
}

/**
 * Compass stage tracker: Pull → Step → Let go along the ribbon.
 * @param {number} current index of the current stage (0, 1 or 2)
 * @param {string[]} [labels]
 */
export function stageTracker(current, labels = ["Pull", "Step", "Let go"]) {
  const width = 300;
  const id = `dawn-st-${++uid}`;
  const pts = wave(width, 6, 2, 26, 80);
  const at = [0.06, 0.5, 0.94].map((f) => Math.round(f * 80));
  const litEnd = Math.min(80, at[current] + 12);
  let nodes = "";
  at.forEach((i, n) => {
    const [x, y] = pts[i];
    if (n === current) {
      nodes += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="12" fill="${DAWN.halo}" opacity="0.85" filter="url(#${id})"/>
      <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="7" fill="${DAWN.sun}" stroke="#FFFFFF" stroke-width="2.5"/>`;
    } else if (n < current) {
      nodes += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="6" fill="${DAWN.lake}"/>`;
    } else {
      nodes += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="6" fill="${DAWN.surface}" stroke="${DAWN.line}" stroke-width="2"/>`;
    }
  });
  const labelRow = labels
    .map((l, n) => `<span style="flex:1;text-align:${["left", "center", "right"][n]};font-size:13px;font-weight:${n === current ? 600 : 500};color:${n === current ? "var(--color-ink)" : "var(--color-muted)"}">${l}</span>`)
    .join("");
  return `<div role="group" aria-label="Step ${current + 1} of 3: ${labels[current]}">
<svg width="100%" height="52" viewBox="0 0 ${width} 52" preserveAspectRatio="none" aria-hidden="true" style="display:block;overflow:visible">
  <defs><filter id="${id}" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="4"/></filter></defs>
  <path d="${d(pts.slice(at[0]))}" stroke="${DAWN.line}" stroke-width="2.5" fill="none" stroke-dasharray="1 6" stroke-linecap="round"/>
  <path d="${d(pts.slice(0, litEnd))}" stroke="${DAWN.glow}" stroke-width="8" fill="none" stroke-linecap="round" opacity="0.7" filter="url(#${id})"/>
  <path d="${d(pts.slice(0, litEnd))}" stroke="${DAWN.lake}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  ${nodes}
</svg>
<div style="display:flex;padding:0 2px">${labelRow}</div>
</div>`;
}
