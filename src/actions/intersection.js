import ActionBase from "./base";
import { sanitize } from "./../helpers/sanitize";

class Intersection extends ActionBase {
  constructor(currentElement, options = {}) {
    super(currentElement, options);

    this.classNames = sanitize(options.value);
    this.justOnce = options.actionName === "intersect-once";
  }

  start() {
    if (this.classNames.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          this.#enterViewport(observer, entry.target);
        } else {
          this.#leaveViewport();
        }
      });
    });

    observer.observe(this.currentElement);
  }

  // private

  #enterViewport(observer, observedElement) {
    this.targets.forEach((target) => target.classList.add(...this.classNames));

    if (this.justOnce) {
      observer.unobserve(observedElement);
    }
  }

  #leaveViewport() {
    if (this.justOnce) return;

    this.targets.forEach((target) =>
      target.classList.remove(...this.classNames)
    );
  }
}

export const action =
  (actionName) =>
  (element, options = {}) => {
    const instance = new Intersection(element, { ...options, actionName });

    return instance.start();
  };

export default {
  "intersect-once": action("intersect-once"),
  "intersect-toggle": action("intersect-toggle")
};
