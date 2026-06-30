class Registry {
  #actions = new Map();
  #modifiers = new Map();
  #eventTypeOverrides = new Map();

  registerAction(name, action) {
    this.#actions.set(name, action);
  }

  getAction(name) {
    return this.#actions.get(name);
  }

  hasAction(name) {
    return this.#actions.has(name);
  }

  allActions() {
    return this.#actions;
  }

  registerModifier(name, setup) {
    this.#modifiers.set(name, setup);
  }

  getModifier(name) {
    return this.#modifiers.get(name);
  }

  hasModifier(name) {
    return this.#modifiers.has(name);
  }

  registerEventTypeOverride(tagName, eventType) {
    this.#eventTypeOverrides.set(tagName, eventType);
  }

  getEventTypeOverride(tagName) {
    return this.#eventTypeOverrides.get(tagName);
  }
}

export default Registry;
