const onceTracker = new WeakSet();

const whenIntersecting = (check) => (element, trigger) => {
  let done = false;

  const observer = new IntersectionObserver((entries) => {
    if (check(entries) && !done) {
      done = true;

      observer.disconnect();

      trigger();
    }
  });

  observer.observe(element);
};

export const builtinDirectives = {
  mounted: (_, trigger) => {
    trigger();
  },
  now: (_, trigger) => {
    trigger();
  },
  whenVisible: whenIntersecting((entries) =>
    entries.some((entry) => entry.isIntersecting)
  ),
  whenOutside: ({ event, element }) => {
    if (
      typeof element.checkVisibility === "function" &&
      !element.checkVisibility()
    )
      return false;

    return !element.contains(event.target);
  },
  once: ({ element }) => {
    if (onceTracker.has(element)) return false;

    onceTracker.add(element);

    return true;
  },
  whenInView: whenIntersecting((entries) => entries[0].isIntersecting),
  preventDefault: ({ event }) => {
    event.preventDefault();

    return true;
  },
  stopPropagation: ({ event }) => {
    event.stopPropagation();

    return true;
  }
};

export function defaultDirectives(directives) {
  for (const [name, fn] of Object.entries(builtinDirectives))
    directives.addDirective(name, fn);
}
