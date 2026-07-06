class Registry {
  #actions = new Map();
  #directives = new Map();
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

  addDirective(name, directive) {
    this.#directives.set(name, directive);
  }

  getDirective(name) {
    return this.#directives.get(name);
  }

  hasDirective(name) {
    return this.#directives.has(name);
  }
}

export default Registry;
