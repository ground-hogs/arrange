import type { PlainTest } from "./types";

export function ensureTest(obj: unknown): PlainTest {
  if (isTest(obj)) {
    return obj as PlainTest;
  }
  throw new Error("Is not a well-formed test");
}

export function isTest(obj: unknown): obj is PlainTest {
  function TestFn() {}
  async function AsyncTestFn() {}
  const exists = Boolean(obj);
  const hasTest = "test" in (obj as object);
  const testIsFn = [TestFn, AsyncTestFn].some(
    (fn) => fn.constructor === (obj as any).test.constructor
  );

  return exists && hasTest && testIsFn;
}

export const randomString = (length = 10) =>
  "abcdefghijklmnopqrstuvwxyz0123456789_-"
    .split("")
    .sort(() => (Math.random() > 0.5 ? 1 : -1))
    .slice(0, length)
    .join("");
