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

export const builtinTriggers = {
  mounted: (_, trigger) => {
    queueMicrotask(trigger);
  },
  now: (_, trigger) => {
    trigger();
  },
  whenVisible: whenIntersecting((entries) =>
    entries.some((entry) => entry.isIntersecting)
  ),
  whenInView: whenIntersecting((entries) => entries[0].isIntersecting)
};

export const builtinGates = {
  whenOutside: (element, { event }) => {
    if (
      typeof element.checkVisibility === "function" &&
      !element.checkVisibility()
    )
      return false;

    return !element.contains(event.target);
  },
  once: (element) => {
    if (onceTracker.has(element)) return false;

    onceTracker.add(element);

    return true;
  },
  preventDefault: (element, { event }) => {
    event.preventDefault();

    return true;
  },
  stopPropagation: (element, { event }) => {
    event.stopPropagation();

    return true;
  }
};
