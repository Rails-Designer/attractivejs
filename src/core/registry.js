class Registry {
  #actions = new Map();
  #gates = new Map();
  #triggers = new Map();
  #eventModifiers = new Map();
  #activeActions = null;

  addAction(name, action, group = null) {
    this.#actions.set(name, { action, group });
  }

  getAction(name) {
    const entry = this.#actions.get(name);

    return entry ? entry.action : undefined;
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

  addGate(name, gate) {
    this.#gates.set(name, gate);
  }

  getGate(name) {
    return this.#gates.get(name);
  }

  hasGate(name) {
    return this.#gates.has(name);
  }

  addTrigger(name, trigger) {
    this.#triggers.set(name, trigger);
  }

  getTrigger(name) {
    return this.#triggers.get(name);
  }

  hasTrigger(name) {
    return this.#triggers.has(name);
  }

  addEventModifier(name, eventModifier) {
    this.#eventModifiers.set(name, eventModifier);
  }

  getEventModifier(name) {
    return this.#eventModifiers.get(name);
  }
}

export default Registry;
