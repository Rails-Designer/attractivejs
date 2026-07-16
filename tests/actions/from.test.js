import { describe, test, expect, vi } from "vitest";
import from from "../../src/helpers/from.js";

describe("from()", () => {
  test("maps snake_case filename to camelCase action name", () => {
    const fn = () => {};
    const files = {
      "./actions/focus_search.js": { default: fn }
    };

    const result = from(files);

    expect(result).toEqual({ focusSearch: fn });
  });

  test("strips directory path and extension", () => {
    const fn = () => {};
    const files = {
      "/app/javascript/actions/close_dropdown.js": { default: fn }
    };

    const result = from(files);

    expect(result).toEqual({ closeDropdown: fn });
  });

  test("uses module.default ?? module fallback", () => {
    const fn = () => {};
    const directFn = () => {};

    const files = {
      "./actions/foo.js": { default: fn },
      "./actions/bar.js": directFn
    };

    const result = from(files);

    expect(result.foo).toBe(fn);
    expect(result.bar).toBe(directFn);
  });

  test("accepts custom nameFor resolver", () => {
    const fn = vi.fn();
    const files = {
      "./actions/my_action.js": { default: fn }
    };

    const result = from(files, {
      nameFor(path, action) {
        return "alwaysSame";
      }
    });

    expect(result.alwaysSame).toBe(fn);
  });

  test("handles empty files object", () => {
    const result = from({});
    expect(result).toEqual({});
  });

  test("handles non-.js extensions", () => {
    const fn = () => {};
    const files = {
      "./actions/foo_bar.mjs": { default: fn }
    };

    const result = from(files);

    expect(result).toEqual({ fooBar: fn });
  });
});
