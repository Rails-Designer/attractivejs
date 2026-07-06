class Registry {
  #actions = new Map();
  #modifiers = new Map();
  #activeActions = null;

  addAction(name, action, group = null) {
    this.#actions.set(name, { handler: action, group });
  }

  getAction(name) {
    const entry = this.#actions.get(name);

    return entry ? entry.handler : undefined;
  }

  hasAction(name) {
    return this.#actions.has(name);
  }

  setActiveActions(actionNames) {
    this.#activeActions = actionNames;
  }

  isAllowed(actionName) {
    if (!this.#activeActions) return true;

    return this.#activeActions.has(actionName);
  }

  addModifier(name, setup) {
    this.#modifiers.set(name, setup);
  }

  getModifier(name) {
    return this.#modifiers.get(name);
  }

  hasModifier(name) {
    return this.#modifiers.has(name);
  }
}

export default Registry;
