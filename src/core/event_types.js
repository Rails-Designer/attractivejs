class EventTypes {
  identify({ by: value }) {
    const actions = value.split(" ");

    return actions
      .filter((action) => action.includes("->"))
      .map((action) => action.split("->")[0]);
  }

  getDefault({ from: element }) {
    const tagName = element.tagName.toLowerCase();

    const isInput = tagName === "input";
    const inputType = isInput ? element.type || "text" : null;

    return isInput
      ? this.#defaultEvents.input[inputType] ||
          this.#defaultEvents.input.default
      : this.#defaultEvents[tagName] || this.#defaultEvents.default;
  }

  // private

  #defaultEvents = {
    a: "click",
    button: "click",
    input: {
      checkbox: "change",
      radio: "change",
      submit: "click",
      button: "click",
      reset: "click",
      default: "input"
    },
    select: "change",
    textarea: "input",
    form: "submit",
    default: "click"
  };
}

export default new EventTypes();
