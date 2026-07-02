class Registry {
  #actions = new Map();
  #modifiers = new Map();
  #eventTypeOverrides = new Map();
  #activeActions = null;

  registerAction(name, action, group = null) {
    this.#actions.set(name, { handler: action, group });
  }

  getAction(name) {
    const entry = this.#actions.get(name);

    return entry ? entry.handler : undefined;
  }

  hasAction(name) {
    return this.#actions.has(name);
  }

  actionGroup(name) {
    const entry = this.#actions.get(name);

    return entry ? entry.group : null;
  }

  setActiveActions(actionNames) {
    this.#activeActions = actionNames;
  }

  isAllowed(actionName) {
    if (!this.#activeActions) return true;

    return this.#activeActions.has(actionName);
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
