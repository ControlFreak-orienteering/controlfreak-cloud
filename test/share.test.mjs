import assert from "node:assert/strict";
import { test } from "node:test";

import {
  createCloud,
  decryptBytes,
  decryptText,
  derivePhraseKey,
  encryptBytes,
  encryptText,
  hashCarriesSignIn,
  isCompletePhrase,
  isShareKey,
  needsPhrase,
  newSharePhrase,
  newShareKey,
  normalizePhraseWord,
  phraseWords,
  sessionFromTokens,
  shareWords,
  ShareCryptoError,
} from "../dist/index.js";

const LANGS = ["sv", "en", "no", "fi", "cs"];

test("a share key is 43 base64url characters and seals and opens bytes", async () => {
  const key = newShareKey();
  assert.ok(isShareKey(key));
  assert.ok(!isShareKey(key.slice(1)));
  const plain = new Uint8Array(100_000).map((_, i) => i % 251);
  const sealed = await encryptBytes(key, plain);
  assert.equal(needsPhrase(sealed), false);
  assert.deepEqual(await decryptBytes(key, sealed), plain);
  await assert.rejects(decryptBytes(newShareKey(), sealed), ShareCryptoError);
  await assert.rejects(decryptBytes(key, sealed.subarray(0, 10)), ShareCryptoError);
});

test("text goes through base64url and marks a passphrase blob", async () => {
  const key = newShareKey();
  const sealed = await encryptText(key, "sten saknas", { phrase: true });
  assert.equal(await decryptText(key, sealed), "sten saknas");
  await assert.rejects(decryptText(key, "not*base64"), ShareCryptoError);
});

test("a passphrase has four words from the language's list and derives a key", async () => {
  for (const lang of LANGS) {
    const phrase = newSharePhrase(lang);
    const words = phrase.split(" ");
    assert.equal(words.length, 4);
    for (const w of words) assert.ok(shareWords(lang).includes(w), `${lang}: ${w}`);
    assert.ok(isCompletePhrase(phrase));
  }
  const linkKey = newShareKey();
  const a = await derivePhraseKey(linkKey, "Bäck, Skog HARE lykta");
  const b = await derivePhraseKey(linkKey, "back skog hare lykta");
  assert.equal(a, b, "case and accents do not matter");
  assert.ok(isShareKey(a));
  assert.notEqual(a, await derivePhraseKey(newShareKey(), "back skog hare lykta"));
});

test("words are compared without accents, and no list collides on that", () => {
  assert.equal(normalizePhraseWord("Bäck"), "back");
  assert.equal(normalizePhraseWord("Søvn"), "sovn");
  assert.deepEqual(phraseWords(" a-b, C ; d "), ["a", "b", "c", "d"]);
  assert.equal(isCompletePhrase("tre ord bara"), false);
  for (const lang of LANGS) {
    const words = shareWords(lang);
    assert.ok(words.length >= 150, `${lang} has ${words.length} words`);
    const seen = new Set();
    for (const w of words) {
      const n = normalizePhraseWord(w);
      assert.ok(!seen.has(n), `${lang}: ${w} collides`);
      seen.add(n);
    }
  }
});

test("a client without configuration answers as signed out and refuses to call", async () => {
  const cloud = createCloud(null);
  assert.equal(cloud.configured, false);
  assert.equal(cloud.storedSession(), null);
  assert.equal(await cloud.activeSession(), null);
  await assert.rejects(cloud.cloudFetch("/rest/v1/x"), (e) => e.code === "not-configured");
});

test("a session is read out of tokens and a sign-in hash is recognised", () => {
  const claims = Buffer.from(JSON.stringify({ sub: "u1", email: "a@b.se" })).toString("base64url");
  const session = sessionFromTokens({
    access_token: `h.${claims}.s`,
    refresh_token: "r",
    expires_in: 3600,
  });
  assert.equal(session.userId, "u1");
  assert.equal(session.email, "a@b.se");
  assert.ok(session.expiresAt > Date.now() / 1000);
  assert.equal(sessionFromTokens({ access_token: "x", refresh_token: "r" }), null);
  assert.ok(hashCarriesSignIn("#access_token=a&refresh_token=b"));
  assert.ok(!hashCarriesSignIn("#share=1&k=2"));
});
