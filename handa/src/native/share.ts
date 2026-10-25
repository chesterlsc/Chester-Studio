/** Share adapter. Web Share API first; Capacitor Share later behind the same signature. */
export async function shareImage(blob: Blob, filename: string, text: string, url: string): Promise<'shared' | 'downloaded' | 'failed'> {
  const file = new File([blob], filename, { type: 'image/png' });
  const n = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
  try {
    if (n.share && n.canShare?.({ files: [file] })) { await n.share({ files: [file], text, url }); return 'shared'; }
    if (n.share) { await n.share({ text, url }); return 'shared'; }
  } catch (e) { if ((e as Error).name === 'AbortError') return 'failed'; }
  downloadBlob(blob, filename);
  return 'downloaded';
}
export function downloadBlob(blob: Blob, filename: string) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
export function facebookShareUrl(url: string): string {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
}
