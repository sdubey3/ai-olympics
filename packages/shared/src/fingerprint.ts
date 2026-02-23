/**
 * Compute a voter fingerprint from IP + User-Agent.
 * Uses SHA-256 to avoid storing PII.
 */
export async function computeFingerprint(
  ip: string,
  userAgent: string
): Promise<string> {
  const data = `${ip}:${userAgent}`;
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(data));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
