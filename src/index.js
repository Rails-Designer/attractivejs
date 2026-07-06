import Attractive from "./attractive";
import builtinActions from "./actions";
import { defaultModifiers } from "./core/modifier_definitions";

Attractive.activate = function (options = {}) {
  const attractive = new this(options);

  attractive.registerActions((registry) => {
    Object.entries(builtinActions).forEach(([name, action]) =>
      registry.addAction(name, action)
    );
  });

  attractive.registerModifiers((registry) => {
    defaultModifiers(registry);
  });

  attractive.activate(options);

  return attractive;
};

if (
  typeof document !== "undefined" &&
  typeof window !== "undefined" &&
  (
    document.currentScript ??
    document.querySelector('script[src*="attractive"][activate]')
  )?.hasAttribute("activate")
) {
  window.Attractive = Attractive;

  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", () => Attractive.activate())
    : Attractive.activate();
}

export default Attractive;
