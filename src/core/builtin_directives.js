const onceTracker = new WeakSet();

export function defaultDirectives(directives) {
  directives.addDirective("mounted", (_, trigger) => {
    trigger();
  });

  directives.addDirective("now", (_, trigger) => {
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

  directives.addDirective(
    "whenVisible",
    whenIntersecting((entries) => entries.some((entry) => entry.isIntersecting))
  );

  directives.addDirective("whenOutside", ({ event, element }) => {
    if (
      typeof element.checkVisibility === "function" &&
      !element.checkVisibility()
    )
      return false;

    return !element.contains(event.target);
  });

  directives.addDirective("once", ({ element }) => {
    if (onceTracker.has(element)) return false;

    onceTracker.add(element);

    return true;
  });

  directives.addDirective(
    "whenInView",
    whenIntersecting((entries) => entries[0].isIntersecting)
  );

  directives.addDirective("preventDefault", ({ event }) => {
    event.preventDefault();

    return true;
  });

  directives.addDirective("stopPropagation", ({ event }) => {
    event.stopPropagation();

    return true;
  });
}
