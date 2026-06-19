const MAX_BYTES = 5 * 1024; // 5KB

export function canShare(json: string): boolean {
  return new TextEncoder().encode(json).length <= MAX_BYTES;
}

export function encodeShareUrl(json: string): string {
  const compressed = btoa(unescape(encodeURIComponent(json)));
  return `#data=${compressed}`;
}

export function decodeShareUrl(hash: string): string | null {
  try {
    const match = hash.match(/[#&]data=([^&]+)/);
    if (!match) return null;
    return decodeURIComponent(escape(atob(match[1])));
  } catch {
    return null;
  }
}
