// Farcaster integration utilities

export interface FarcasterUser {
  fid: number;
  username: string;
  displayName: string;
}

export function shareToFarcaster(text: string, embedUrl: string) {
  const url =
    `https://warpcast.com/~/compose?` +
    `text=${encodeURIComponent(text)}` +
    `&embeds[]=${encodeURIComponent(embedUrl)}`

  window.open(url, '_blank')
}

export async function getFarcasterUser(fid: number): Promise<FarcasterUser | null> {
  try {
    // Fetch user from Farcaster API
    return null;
  } catch (error) {
    console.error('Failed to fetch Farcaster user:', error);
    return null;
  }
}
