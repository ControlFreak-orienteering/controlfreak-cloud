/**
 * The passphrase behind a shared link: four random words of four letters, in the
 * owner's language, sent by the owner outside the link. The reader types them in once.
 *
 * The link alone is not enough to read what was shared: the content is sealed with a
 * key derived from the words and the link's key (PBKDF2-SHA256, 600 000 rounds, the
 * link's key as salt). The reason is hosting that reads whole addresses, `#` included:
 * with only the link, the content stays unreadable. Four words from lists of 179 to 617
 * give 30 to 37 bits, enough against someone who happens to see the address, not
 * against days of GPU time.
 *
 * Words are compared without case and accents, so "bäck" and "back" cannot both be in
 * a list (share-words.ts).
 */
import { fromBase64Url, toBase64Url } from "./share-crypto.js";
import { shareWords } from "./share-words.js";
export const PHRASE_WORD_COUNT = 4;
export const PHRASE_ITERATIONS = 600000;
/** A random integer below `n`, without the bias of a plain modulo. */
function randomBelow(n) {
    const limit = Math.floor(4294967296 / n) * n;
    const buf = new Uint32Array(1);
    for (;;) {
        globalThis.crypto.getRandomValues(buf);
        if (buf[0] < limit)
            return buf[0] % n;
    }
}
export function newSharePhrase(lang) {
    const words = shareWords(lang);
    return Array.from({ length: PHRASE_WORD_COUNT }, () => words[randomBelow(words.length)]).join(" ");
}
/** Lower case, no accents: how a word is compared, whatever the keyboard produced. */
export function normalizePhraseWord(word) {
    return word
        .toLowerCase()
        .replace(/ø/g, "o")
        .replace(/æ/g, "ae")
        .normalize("NFD")
        .replace(/\p{M}/gu, "");
}
export function phraseWords(input) {
    return input
        .split(/[\s,.;:/_-]+/u)
        .map(normalizePhraseWord)
        .filter((w) => w !== "");
}
export function isCompletePhrase(input) {
    const words = phraseWords(input);
    return words.length === PHRASE_WORD_COUNT && words.every((w) => /^\p{L}+$/u.test(w));
}
/** The key the content is sealed with, from the link's key and the words. */
export async function derivePhraseKey(linkKey, phrase) {
    const material = await globalThis.crypto.subtle.importKey("raw", new TextEncoder().encode(phraseWords(phrase).join(" ")), "PBKDF2", false, ["deriveBits"]);
    const bits = await globalThis.crypto.subtle.deriveBits({
        name: "PBKDF2",
        hash: "SHA-256",
        salt: fromBase64Url(linkKey),
        iterations: PHRASE_ITERATIONS,
    }, material, 256);
    return toBase64Url(new Uint8Array(bits));
}
