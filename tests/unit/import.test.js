import { describe, it, expect } from "vitest";
import { parseImport, mergeItems, changelogEntries } from "../../src/app-ui.js";

describe("import", () => {
  it("rejects other files", () => expect(parseImport('{"a":1}').error).toBeTruthy());
  it("accepts the legacy export format", () => {
    const r = parseImport(JSON.stringify({ app: "The Belief Lab", exported_at: "x", items: [{ _id: "a", kind: "entry" }, { nope: 1 }] }));
    expect(r.items).toHaveLength(1);
  });
  it("merges by _id and never overwrites", () => {
    const m = mergeItems([{ _id: "a", v: 1 }], [{ _id: "a", v: 2 }, { _id: "b" }]);
    expect(m.added).toBe(1); expect(m.skipped).toBe(1);
    expect(m.merged.find((x) => x._id === "a").v).toBe(1);
  });
});
describe("changelog", () => {
  it("skips Unreleased and caps entries", () => {
    const md = "## Unreleased\n- hidden\n## 0.2.0\n- a (#3)\n- b\n## 0.1.0\n- c";
    expect(changelogEntries(md, 2).map((e) => e.text)).toEqual(["a (#3)", "b"]);
  });
});
