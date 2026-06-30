const onceTracker = new WeakSet();

export function defaultModifiers(registry) {
  registry.registerModifier("mounted", (_, trigger) => {
    trigger();
  });

  registry.registerModifier("now", (_, trigger) => {
    trigger();
  });

  registry.registerModifier("whenVisible", (element, trigger) => {
    let fired = false;

    const observer = new IntersectionObserver((entries) => {
      const intersecting = entries.some((entry) => entry.isIntersecting);

      if (intersecting && !fired) {
        fired = true;

        observer.disconnect();
        trigger();
      }
    });

    observer.observe(element);
  });

  registry.registerModifier("whenOutside", ({ event, element }) => {
    if (
      typeof element.checkVisibility === "function" &&
      !element.checkVisibility()
    )
      return false;

    return !element.contains(event.target);
  });

  registry.registerModifier("once", ({ element }) => {
    if (onceTracker.has(element)) return false;

    onceTracker.add(element);

    return true;
  });

  registry.registerModifier("whenInView", (element, trigger) => {
    let fired = false;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !fired) {
        fired = true;

        observer.disconnect();
        trigger();
      }
    });

    observer.observe(element);
  });

  registry.registerModifier("preventDefault", ({ event }) => {
    event.preventDefault();

    return true;
  });

  registry.registerModifier("stopPropagation", ({ event }) => {
    event.stopPropagation();

    return true;
  });
}
