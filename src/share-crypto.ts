/**
 * The encryption behind sharing by link. What is uploaded is sealed in the browser
 * with AES-GCM; the key is random, stands only in the link after `#` (which never
 * reaches a server) or is derived from the link's key and a passphrase (see
 * share-phrase.ts). The server stores unreadable bytes.
 *
 * Blob layout: a four-byte magic ("CFS1" for a link key, "CFS2" for a passphrase key),
 * a 12-byte IV, then the ciphertext with its tag. The magic lets a reader know whether
 * to ask for the passphrase before trying.
 */

const MAGIC = new Uint8Array([0x43, 0x46, 0x53, 0x31]); // "CFS1"
const MAGIC_PHRASE = new Uint8Array([0x43, 0x46, 0x53, 0x32]); // "CFS2"
const IV_BYTES = 12;
const KEY_BYTES = 32;
/** 32 bytes as base64url: 43 characters, no padding. */
const KEY_PATTERN = /^[A-Za-z0-9_-]{43}$/;

export class ShareCryptoError extends Error {
  constructor() {
    super("share content could not be decrypted");
    this.name = "ShareCryptoError";
  }
}

function subtle(): SubtleCrypto {
  return globalThis.crypto.subtle;
}

export function toBase64Url(bytes: Uint8Array): string {
  let text = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    text += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(text).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function fromBase64Url(text: string): Uint8Array {
  const b64 = text.replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64 + "=".repeat((4 - (b64.length % 4)) % 4));
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

/** A fresh random key for a link, as it is written after `#`. */
export function newShareKey(): string {
  return toBase64Url(globalThis.crypto.getRandomValues(new Uint8Array(KEY_BYTES)));
}

export function isShareKey(text: string): boolean {
  return KEY_PATTERN.test(text);
}

async function importKey(key: string): Promise<CryptoKey> {
  if (!isShareKey(key)) throw new ShareCryptoError();
  return subtle().importKey("raw", fromBase64Url(key) as BufferSource, "AES-GCM", false, [
    "encrypt",
    "decrypt",
  ]);
}

/** Seals bytes with the key; `phrase: true` marks the blob as needing a passphrase key. */
export async function encryptBytes(
  key: string,
  plain: Uint8Array,
  options: { phrase?: boolean } = {},
): Promise<Uint8Array> {
  const iv = globalThis.crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const sealed = new Uint8Array(
    await subtle().encrypt({ name: "AES-GCM", iv }, await importKey(key), plain as BufferSource),
  );
  const out = new Uint8Array(MAGIC.length + IV_BYTES + sealed.length);
  out.set(options.phrase ? MAGIC_PHRASE : MAGIC, 0);
  out.set(iv, MAGIC.length);
  out.set(sealed, MAGIC.length + IV_BYTES);
  return out;
}

export async function decryptBytes(key: string, blob: Uint8Array): Promise<Uint8Array> {
  const head = MAGIC.length + IV_BYTES;
  const ours = (magic: Uint8Array) => magic.every((b, i) => blob[i] === b);
  if (blob.length <= head || !(ours(MAGIC) || ours(MAGIC_PHRASE))) throw new ShareCryptoError();
  try {
    return new Uint8Array(
      await subtle().decrypt(
        { name: "AES-GCM", iv: blob.subarray(MAGIC.length, head) as BufferSource },
        await importKey(key),
        blob.subarray(head) as BufferSource,
      ),
    );
  } catch {
    throw new ShareCryptoError();
  }
}

/** Whether the blob was sealed with a passphrase key, so the reader must ask for the words. */
export function needsPhrase(blob: Uint8Array): boolean {
  return blob.length > MAGIC_PHRASE.length && MAGIC_PHRASE.every((b, i) => blob[i] === b);
}

/** Text sealed as base64url, for small things that go through a database column. */
export async function encryptText(
  key: string,
  text: string,
  options: { phrase?: boolean } = {},
): Promise<string> {
  return toBase64Url(await encryptBytes(key, new TextEncoder().encode(text), options));
}

export async function decryptText(key: string, sealed: string): Promise<string> {
  let blob: Uint8Array;
  try {
    blob = fromBase64Url(sealed);
  } catch {
    throw new ShareCryptoError();
  }
  return new TextDecoder().decode(await decryptBytes(key, blob));
}
