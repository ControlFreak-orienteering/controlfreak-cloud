# controlfreak-cloud

What the ControlFreak family's apps share for Lovable Cloud (Supabase): the sign-in for
invited users, the `fetch` that carries the app's key, and the encryption and four-word
passphrases behind sharing by link. Plain TypeScript, no dependencies, built to `dist/`
(committed). Used first by ControlFreak Review; ControlFreak's own copy of the same code
(`src/lib/cloud.ts`, `share-crypto.ts`, `share-phrase.ts`, `share-words.ts`) is meant to
move here.

```ts
import { createCloud, encryptBytes, derivePhraseKey, newSharePhrase, newShareKey } from "controlfreak-cloud";

const cloud = createCloud(
  url && key ? { url, key, sessionStorageKey: "controlfreak-review.account.v1" } : null,
);
cloud.configured;                 // false without Lovable Cloud in the build
await cloud.sendSignInLink(email, `${origin}/konto`);
cloud.completeSignInFromHash(location.hash);
const session = await cloud.activeSession();
await cloud.cloudFetch("/rest/v1/my_table", { token: session?.accessToken });
```

## Sharing by link

The owner seals the content in the browser and uploads unreadable bytes; the link carries
a random key after `#`, which never reaches a server; and a passphrase of four words,
sent outside the link, is needed too, because hosting may log whole addresses.

```ts
const linkKey = newShareKey();                    // in the link after #, 43 characters
const phrase = newSharePhrase("sv");              // "bäck skog hare lykta", sent by the owner
const key = await derivePhraseKey(linkKey, phrase); // PBKDF2-SHA256, 600 000 rounds
const sealed = await encryptBytes(key, bytes, { phrase: true }); // "CFS2" + IV + AES-GCM
needsPhrase(sealed);                              // true: the reader must ask for the words
const plain = await decryptBytes(key, sealed);
```

Words are compared without case and accents (`phraseWords`), so a list never holds two
words that collide; `npm test` checks it. The lists have 179 to 617 words per language,
which gives four words 30 to 37 bits.

## Rules

- Versions follow semver and every release is tagged; apps pin a tag, never a branch.
- `npm test` builds `dist/` and runs the tests; `dist/` is committed with the source.
- No dependencies: everything here runs on the browser's own `fetch` and Web Crypto
  (Node 20+ in tests).
- Comments in English, as in the other shared packages.
