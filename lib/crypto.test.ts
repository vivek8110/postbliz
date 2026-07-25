import { test, expect, beforeAll } from "bun:test";
import { encrypt, decrypt } from "./crypto";

beforeAll(() => {
  // Deterministic key for the test run if the env didn't supply one.
  if (!process.env.ENCRYPTION_KEY) {
    process.env.ENCRYPTION_KEY = Buffer.alloc(32, 7).toString("base64");
  }
});

test("round-trips plaintext", () => {
  const secret = "reddit-oauth-token-abc123";
  expect(decrypt(encrypt(secret))).toBe(secret);
});

test("round-trips empty string and unicode", () => {
  expect(decrypt(encrypt(""))).toBe("");
  expect(decrypt(encrypt("café — 你好 🔑"))).toBe("café — 你好 🔑");
});

test("uses a fresh iv each call, so ciphertext differs", () => {
  const a = encrypt("same");
  const b = encrypt("same");
  expect(a).not.toBe(b);
  expect(decrypt(a)).toBe(decrypt(b));
});

test("rejects tampered ciphertext (GCM auth tag)", () => {
  const parts = encrypt("integrity-matters").split(".");
  const [iv, tag, data] = parts;
  const bad = Buffer.from(data!, "base64");
  bad[0] = bad[0]! ^ 0xff; // flip a byte
  expect(() => decrypt(`${iv}.${tag}.${bad.toString("base64")}`)).toThrow();
});

test("rejects malformed payloads", () => {
  expect(() => decrypt("not-a-valid-payload")).toThrow("malformed ciphertext");
});
