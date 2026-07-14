import { describe, test, expect, vi } from "vitest";
import Core from "../../src/core.js";
import { addClass } from "../../src/actions/class.js";
import { builtinDirectives } from "../../src/core/builtin_directives.js";

globalThis.Node = globalThis.Node || { ELEMENT_NODE: 1 };

describe("Extend", () => {
  test("accepts an array via extendWith", async () => {
    const attractive = new Core();

    const first = vi.fn();
    const second = vi.fn();

    attractive.activate({
      addActions: { addClass },
      addDirectives: builtinDirectives,
      extendWith: [first, second]
    });

    expect(first).toHaveBeenCalledWith(
      expect.objectContaining({
        instance: attractive,
        registry: expect.anything()
      })
    );
    expect(second).toHaveBeenCalledWith(
      expect.objectContaining({
        instance: attractive,
        registry: expect.anything()
      })
    );
  });
});
