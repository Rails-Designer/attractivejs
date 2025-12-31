class Modifiers {
  #modifiers = {
    mounted: (_, trigger) => {
      trigger();
    },

    now: (_, trigger) => {
      trigger();
    },

    whenVisible: (element, trigger) => {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            trigger();

            observer.disconnect();
          }
        });
      });

      observer.observe(element);
    },
  };

  setup({ for: modifier, on: element, trigger }) {
    const setup = this.#modifiers[modifier];

    if (!setup) return false;

    setup(element, trigger);

    return true;
  }
}

export default new Modifiers();
