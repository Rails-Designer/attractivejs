import { describe, test, expect, vi } from "vitest";
import Core from "../../src/core.js";
import { addClass } from "../../src/actions/class.js";
import { defaultDirectives } from "../../src/core/builtin_directives.js";

globalThis.Node = globalThis.Node || { ELEMENT_NODE: 1 };

describe("Extend", () => {
  test("accepts an array via extendWith", async () => {
    const attractive = new Core();

    attractive.addAction("addClass", addClass);
    attractive.registerDirectives((directives) => {
      defaultDirectives(directives);
    });

    const first = vi.fn();
    const second = vi.fn();

    attractive.activate({ extendWith: [first, second] });

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
