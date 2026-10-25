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
export declare class ShareCryptoError extends Error {
    constructor();
}
export declare function toBase64Url(bytes: Uint8Array): string;
export declare function fromBase64Url(text: string): Uint8Array;
/** A fresh random key for a link, as it is written after `#`. */
export declare function newShareKey(): string;
export declare function isShareKey(text: string): boolean;
/** Seals bytes with the key; `phrase: true` marks the blob as needing a passphrase key. */
export declare function encryptBytes(key: string, plain: Uint8Array, options?: {
    phrase?: boolean;
}): Promise<Uint8Array>;
export declare function decryptBytes(key: string, blob: Uint8Array): Promise<Uint8Array>;
/** Whether the blob was sealed with a passphrase key, so the reader must ask for the words. */
export declare function needsPhrase(blob: Uint8Array): boolean;
/** Text sealed as base64url, for small things that go through a database column. */
export declare function encryptText(key: string, text: string, options?: {
    phrase?: boolean;
}): Promise<string>;
export declare function decryptText(key: string, sealed: string): Promise<string>;
