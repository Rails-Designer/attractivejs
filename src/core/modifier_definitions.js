const onceTracker = new WeakSet();

export function defaultModifiers(registry) {
  registry.addModifier("mounted", (_, trigger) => {
    trigger();
  });

  registry.addModifier("now", (_, trigger) => {
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

  registry.addModifier(
    "whenVisible",
    whenIntersecting((entries) => entries.some((entry) => entry.isIntersecting))
  );

  registry.addModifier("whenOutside", ({ event, element }) => {
    if (
      typeof element.checkVisibility === "function" &&
      !element.checkVisibility()
    )
      return false;

    return !element.contains(event.target);
  });

  registry.addModifier("once", ({ element }) => {
    if (onceTracker.has(element)) return false;

    onceTracker.add(element);

    return true;
  });

  registry.addModifier(
    "whenInView",
    whenIntersecting((entries) => entries[0].isIntersecting)
  );

  registry.addModifier("preventDefault", ({ event }) => {
    event.preventDefault();

    return true;
  });

  registry.addModifier("stopPropagation", ({ event }) => {
    event.stopPropagation();

    return true;
  });
}
