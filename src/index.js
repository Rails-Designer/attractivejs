import Attractive from "./core";
import builtinActions, { Action } from "./actions";
import { builtinGates, builtinTriggers } from "./core/builtin_directives";
import from from "./helpers/from";

const allBuiltinActions = builtinActions;

Attractive.activate = function (options = {}) {
  const attractive = new this(options);

  attractive.activate({
    ...options,
    addActions: { ...allBuiltinActions, ...options.addActions },
    addGates: { ...builtinGates, ...options.addGates },
    addTriggers: { ...builtinTriggers, ...options.addTriggers }
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

export { from, Action };
export default Attractive;
