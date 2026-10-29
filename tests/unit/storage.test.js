import { describe, it, expect } from "vitest";
import { newest } from "../../src/storage.js";
const c = (at, n) => ({ at, items: Array.from({ length: n }, (_, i) => ({ _id: String(i) })) });
describe("newest copy wins", () => {
  it("takes the later save", () => expect(newest(c(1, 5), c(2, 3)).at).toBe(2));
  it("takes the other when one is missing", () => { expect(newest(null, c(1, 1)).at).toBe(1); expect(newest(c(1, 1), null).at).toBe(1); });
  it("on a tie, keeps the fuller copy", () => expect(newest(c(5, 2), c(5, 4)).items).toHaveLength(4));
  it("is null when nothing is stored", () => expect(newest(null, null)).toBeNull());
});
