import Attractive from "./attractive";
import builtinActions from "./actions";
import { defaultModifiers } from "./core/modifier_definitions";

Attractive.activate = function (options = {}) {
  const attractive = new this(options);

  attractive.registerActions((registry) => {
    Object.entries(builtinActions).forEach(([name, action]) =>
      registry.registerAction(name, action)
    );
  });

  attractive.registerModifiers((registry) => {
    defaultModifiers(registry);
  });

  attractive.activate(options);

  return attractive;
};

if (typeof window !== "undefined") {
  window.Attractive = Attractive;
}

export default Attractive;
