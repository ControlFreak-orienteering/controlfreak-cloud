/**
 * The words of the passphrases behind sharing by link (see share-phrase.ts): common
 * four-letter words, one list per language of the ControlFreak family. Chosen so they
 * can be said on the phone and typed on a mobile: no names, no swearing and nothing that
 * reads as demeaning.
 *
 * Two words in one list must not become the same when accents are removed ("bäck" and
 * "back"), since a passphrase is compared without them (`normalizePhraseWord`); the
 * tests check it. Words may be added: each one makes passphrases harder to guess. Words
 * may be removed without breaking old passphrases, which are compared as text, never
 * against the list. The values were taken over from ControlFreak on 2026-10-25.
 */
/** The family's five languages: Swedish, English, Norwegian bokmål, Finnish, Czech. */
export type ShareLang = "sv" | "en" | "no" | "fi" | "cs";
/** The words of a language, in alphabetical order. */
export declare function shareWords(lang: ShareLang): readonly string[];
