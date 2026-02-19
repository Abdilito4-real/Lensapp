const PIPED_INSTANCES = [
  'https://pipedapi.kavin.rocks',
  'https://pipedapi.adminforge.de',
  'https://piped-api.garudalinux.org',
];

const INVIDIOUS_INSTANCES = [
  'https://invidious.nerdvpn.de',
  'https://invidious.privacydev.net',
  'https://yt.cdaut.de',
];

export async function getAudioUrl(videoId: string): Promise<string> {
  // Try Piped instances
  for (const instance of PIPED_INSTANCES) {
    try {
      const res = await fetch(`${instance}/streams/${videoId}`, { signal: AbortSignal.timeout(5000) });
      if (!res.ok) continue;
      const meta = await res.json();
      const stream = meta.audioStreams
        ?.sort((a: any, b: any) => b.bitrate - a.bitrate)
        .find((s: any) => s.mimeType?.includes('audio'));
      if (stream?.url) return stream.url;
    } catch {}
  }

  // Try Invidious instances
  for (const instance of INVIDIOUS_INSTANCES) {
    try {
      const res = await fetch(`${instance}/api/v1/videos/${videoId}`, { signal: AbortSignal.timeout(5000) });
      if (!res.ok) continue;
      const meta = await res.json();
      const stream = meta.adaptiveFormats
        ?.filter((f: any) => f.type?.includes('audio'))
        .sort((a: any, b: any) => b.bitrate - a.bitrate)[0];
      if (stream?.url) return stream.url;
    } catch {}
  }

  throw new Error('No audio stream found');
}
