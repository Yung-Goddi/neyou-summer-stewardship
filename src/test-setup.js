// Vitest's Node test environment doesn't expose the Web Crypto API as a
// global the way browsers do, so pin.js (which intentionally only touches
// the browser-standard `crypto.subtle`, no Node-specific imports) can't
// find it under test. Polyfill it here, test-only - this file is never
// part of the app bundle.
import { webcrypto } from 'node:crypto'

if (!globalThis.crypto) {
  globalThis.crypto = webcrypto
}
