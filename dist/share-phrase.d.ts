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
import { type ShareLang } from "./share-words.js";
export declare const PHRASE_WORD_COUNT = 4;
export declare const PHRASE_ITERATIONS = 600000;
export declare function newSharePhrase(lang: ShareLang): string;
/** Lower case, no accents: how a word is compared, whatever the keyboard produced. */
export declare function normalizePhraseWord(word: string): string;
export declare function phraseWords(input: string): string[];
export declare function isCompletePhrase(input: string): boolean;
/** The key the content is sealed with, from the link's key and the words. */
export declare function derivePhraseKey(linkKey: string, phrase: string): Promise<string>;
