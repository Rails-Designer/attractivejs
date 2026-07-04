const onceTracker = new WeakSet();

export function defaultModifiers(registry) {
  registry.registerModifier("mounted", (_, trigger) => {
    trigger();
  });

  registry.registerModifier("now", (_, trigger) => {
    trigger();
  });

  const whenIntersecting = (check) => (element, trigger) => {
    let fired = false;

    const observer = new IntersectionObserver((entries) => {
      if (check(entries) && !fired) {
        fired = true;

        observer.disconnect();

        trigger();
      }
    });

    observer.observe(element);
  };

  registry.registerModifier(
    "whenVisible",
    whenIntersecting((entries) => entries.some((entry) => entry.isIntersecting))
  );

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

  registry.registerModifier(
    "whenInView",
    whenIntersecting((entries) => entries[0].isIntersecting)
  );

  registry.registerModifier("preventDefault", ({ event }) => {
    event.preventDefault();

    return true;
  });

  registry.registerModifier("stopPropagation", ({ event }) => {
    event.stopPropagation();

    return true;
  });
}
