// Build a repeating ECG (heartbeat) path across a given box.
// Each "beat" is one PQRST complex. Returns an SVG path `d` string.
export function ecgPath(beats: number, w: number, h: number): string {
  const baseline = h * 0.56;
  const seg = w / beats;
  // fraction-of-segment -> fraction-of-height (0 = top, 1 = bottom)
  const shape: [number, number][] = [
    [0.0, 0.56],
    [0.14, 0.56],
    [0.19, 0.46], // P
    [0.24, 0.56],
    [0.3, 0.66], // Q
    [0.35, 0.12], // R (tall spike)
    [0.4, 0.78], // S
    [0.46, 0.56],
    [0.58, 0.4], // T
    [0.66, 0.56],
    [1.0, 0.56],
  ];
  let d = `M 0 ${baseline.toFixed(1)}`;
  for (let b = 0; b < beats; b++) {
    for (const [fx, fy] of shape) {
      const x = (b + fx) * seg;
      const y = fy * h;
      d += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
    }
  }
  return d;
}
