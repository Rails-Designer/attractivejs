import Attractive from "./core";
import builtinActions from "./actions";
import { builtinDirectives } from "./core/builtin_directives";

const allBuiltinActions = builtinActions;

Attractive.activate = function (options = {}) {
  const attractive = new this(options);

  attractive.activate({
    ...options,
    addActions: { ...allBuiltinActions, ...options.addActions },
    addDirectives: { ...builtinDirectives, ...options.addDirectives }
  });

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
