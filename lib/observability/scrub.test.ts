import { test, expect } from "bun:test";
import { scrubEvent } from "./scrub";

/* eslint-disable @typescript-eslint/no-explicit-any */

test("redacts values under secret-ish keys, keeps innocent ones", () => {
  const out: any = scrubEvent({
    extra: { accessToken: "tr_dev_abc123", note: "hello", nested: { apiKey: "sk-abcdefghij" } },
  } as any);
  expect(out.extra.accessToken).toBe("[redacted]");
  expect(out.extra.nested.apiKey).toBe("[redacted]");
  expect(out.extra.note).toBe("hello");
});

test("redacts token-pattern values even under innocent keys", () => {
  const out: any = scrubEvent({
    extra: { blob: "leaked tr_dev_supersecretvalue and jwt eyJhbGciOiJIUzI1NiXXXXXXXXXXXXXXXXXXXX end" },
  } as any);
  expect(out.extra.blob).not.toContain("tr_dev_supersecretvalue");
  expect(out.extra.blob).toContain("[redacted]");
});

test("redacts request cookies, auth headers, and connection strings", () => {
  const out: any = scrubEvent({
    request: {
      cookies: { session: "abc" },
      headers: { authorization: "Bearer xyz123", "user-agent": "test-agent" },
    },
    exception: { values: [{ value: "connect failed: postgresql://user:pw@ep-x.neon.tech/db" }] },
  } as any);
  expect(out.request.cookies).toBe("[redacted]");
  expect(out.request.headers.authorization).toBe("[redacted]");
  expect(out.request.headers["user-agent"]).toBe("test-agent");
  expect(out.exception.values[0].value).toContain("[redacted]");
  expect(out.exception.values[0].value).not.toContain("postgresql://");
});

test("never throws on odd input", () => {
  expect(() => scrubEvent({} as any)).not.toThrow();
  expect(() => scrubEvent(null as any)).not.toThrow();
});
