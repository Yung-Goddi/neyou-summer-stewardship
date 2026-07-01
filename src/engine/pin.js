// Gates the parent dashboard with one shared PIN (not per-operator - Dad
// and Mom pick their name after unlocking, purely so approvedBy is
// accurate, not as a second factor). This is a soft deterrent on a
// single family tablet, not real security: the PIN is hashed with
// SHA-256 before it's stored so it isn't sitting in localStorage in
// plain text, but there's no salt or rate limiting.

async function sha256Hex(text) {
  const data = new TextEncoder().encode(text)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

export async function hashPin(pin) {
  return sha256Hex(pin)
}

export async function verifyPin(pin, hash) {
  return (await sha256Hex(pin)) === hash
}
