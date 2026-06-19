/**
 * Validates if a string is a safe URL to be used in href or src.
 * Prevents javascript: and other dangerous protocols.
 */
export function isValidUrl(url: string | undefined | null): boolean {
  if (!url) return false;
  
  // Allow relative URLs starting with /
  if (url.startsWith('/')) return true;
  
  try {
    const parsed = new URL(url);
    // Only allow http: and https: protocols
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * Returns a safe URL or a fallback if the URL is invalid.
 */
export function getSafeUrl(url: string | undefined | null, fallback: string = '#'): string {
  if (isValidUrl(url)) return url!;
  return fallback;
}
