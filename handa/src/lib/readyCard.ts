import type { ScenarioId } from '@/domain/types';

/**
 * Renders the shareable Ready Card (1200×630) on a 2D canvas.
 * OPSEC: shows a score, scenario and days — never the inventory.
 */
export interface ReadyCardData {
  pct: number; scenario: ScenarioId; scenarioLabel: string; daysLabel: string; levelLabel: string; tagline: string; readyLabel: string; hue: string; lang: 'en' | 'tl';
}

export async function renderReadyCard(data: ReadyCardData): Promise<HTMLCanvasElement> {
  const W = 1200, H = 630;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const g = c.getContext('2d')!;
  try { await (document as Document & { fonts?: FontFaceSet }).fonts?.load('800 80px Sora'); } catch { /* ignore */ }

  // background
  g.fillStyle = '#0b0d12'; g.fillRect(0, 0, W, H);
  const grad = g.createRadialGradient(W * .82, H * .25, 40, W * .82, H * .25, 620);
  grad.addColorStop(0, hexA(data.hue, .55)); grad.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = grad; g.fillRect(0, 0, W, H);
  // grid lines
  g.strokeStyle = 'rgba(255,255,255,.05)'; g.lineWidth = 1;
  for (let x = 0; x < W; x += 60) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); }
  for (let y = 0; y < H; y += 60) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }

  // logo mark
  g.fillStyle = '#ff6a1a';
  g.beginPath(); g.moveTo(72, 118); g.lineTo(120, 74); g.lineTo(168, 118); g.lineTo(168, 162); g.lineTo(72, 162); g.closePath(); g.fill();
  g.fillStyle = '#0b0d12'; g.fillRect(108, 126, 24, 36);
  g.fillStyle = '#f2f4f8'; g.font = '800 40px Sora, system-ui'; g.textBaseline = 'alphabetic';
  g.fillText('HANDA', 190, 128);
  g.fillStyle = '#8b93a7'; g.font = '500 22px "JetBrains Mono", monospace';
  g.fillText('READY CARD', 192, 158);

  // ring
  const cx = 300, cy = 380, r = 150;
  g.lineWidth = 28; g.lineCap = 'round';
  g.strokeStyle = 'rgba(255,255,255,.08)';
  g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.stroke();
  const color = data.pct >= 80 ? '#3ddc97' : data.pct >= 50 ? '#ffc247' : '#ff5d6c';
  g.strokeStyle = color;
  g.beginPath(); g.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * data.pct) / 100); g.stroke();
  g.fillStyle = '#f2f4f8'; g.font = '800 92px "JetBrains Mono", monospace'; g.textAlign = 'center';
  g.fillText(`${data.pct}%`, cx, cy + 22);
  g.fillStyle = '#8b93a7'; g.font = '500 26px "Inter Tight", system-ui';
  g.fillText(data.readyLabel, cx, cy + 66);

  // right side text
  g.textAlign = 'left';
  g.fillStyle = '#f2f4f8'; g.font = '800 64px Sora, system-ui';
  wrap(g, data.levelLabel, 520, 300, 620, 70);
  g.fillStyle = data.hue; g.font = '700 34px "Inter Tight", system-ui';
  g.fillText(data.scenarioLabel, 520, 372);
  g.fillStyle = '#c5cbd8'; g.font = '500 30px "Inter Tight", system-ui';
  g.fillText(data.daysLabel, 520, 420);

  // footer
  g.fillStyle = '#5d6578'; g.font = '500 24px "JetBrains Mono", monospace';
  g.fillText(data.tagline, 520, 560);
  g.fillStyle = '#ff6a1a'; g.fillRect(520, 580, 160, 6);
  return c;
}

function wrap(g: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, lh: number) {
  const words = text.split(' ');
  let line = '';
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (g.measureText(test).width > maxW && line) { g.fillText(line, x, y); line = w; y += lh; } else line = test;
  }
  g.fillText(line, x, y);
}
function hexA(hex: string, a: number): string {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

export function canvasToBlob(c: HTMLCanvasElement): Promise<Blob> {
  return new Promise((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error('toBlob'))), 'image/png'));
}
