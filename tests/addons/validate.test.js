import { describe, test, expect, beforeEach, vi } from "vitest";

import Attractive from "../../src/index.js";
import builtinActions from "../../src/actions/index.js";
import {
  builtinGates,
  builtinTriggers
} from "../../src/core/builtin_directives.js";
import { validate } from "../../src/addons/validate/index.js";
import { attract } from "../../src/addons/attract/index.js";

const allBuiltinActions = builtinActions;

let attractive;

beforeEach(() => {
  if (attractive) attractive.deactivate();
  document.body.innerHTML = "";
  vi.clearAllTimers();
  vi.useFakeTimers();
  attractive = new Attractive();
});

describe("validate addon", () => {
  function activate() {
    attractive.activate({
      addActions: allBuiltinActions,
      addGates: builtinGates,
      addTriggers: builtinTriggers,
      extendWith: [validate]
    });
  }

  test("blocks submit when inputs are invalid", () => {
    document.body.innerHTML = `
      <form @validate>
        <input type="email" required id="email" />
        <button>Submit</button>
      </form>
    `;
    activate();

    const form = document.querySelector("form");
    const event = new Event("submit", { bubbles: true, cancelable: true });
    form.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
  });

  test("does not block submit when all inputs are valid", () => {
    document.body.innerHTML = `
      <form @validate>
        <input type="email" required id="email" value="a@b.com" />
        <button>Submit</button>
      </form>
    `;
    activate();

    const form = document.querySelector("form");
    const event = new Event("submit", { bubbles: true, cancelable: true });
    form.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(false);
  });

  test("shows error label on submit when input is invalid", () => {
    document.body.innerHTML = `
      <form @validate>
        <input type="email" required id="email" />
        <button>Submit</button>
      </form>
    `;
    activate();

    const form = document.querySelector("form");
    form.dispatchEvent(
      new Event("submit", { bubbles: true, cancelable: true })
    );

    const span = document.querySelector(".error-label");
    expect(span).toBeTruthy();
    expect(span.textContent).not.toBe("");
    expect(span.style.display).toBe("block");
  });

  test("shows error label on change (blur) when input is invalid", () => {
    document.body.innerHTML = `
      <form @validate>
        <input type="email" required id="email" />
        <button>Submit</button>
      </form>
    `;
    activate();

    const input = document.querySelector("input");
    input.dispatchEvent(new Event("change", { bubbles: true }));

    const span = document.querySelector(".error-label");
    expect(span).toBeTruthy();
    expect(span.textContent).not.toBe("");
    expect(span.style.display).toBe("block");
  });

  test("clears error label on input (keystroke)", () => {
    document.body.innerHTML = `
      <form @validate>
        <input type="email" required id="email" />
        <button>Submit</button>
      </form>
    `;
    activate();

    const input = document.querySelector("input");

    input.dispatchEvent(new Event("change", { bubbles: true }));
    expect(document.querySelector(".error-label").style.display).toBe("block");

    input.dispatchEvent(new Event("input", { bubbles: true }));
    const span = document.querySelector(".error-label");
    expect(span.textContent).toBe("");
    expect(span.style.display).toBe("none");
  });

  test("re-appears on blur after input if still invalid", () => {
    document.body.innerHTML = `
      <form @validate>
        <input type="email" required id="email" />
        <button>Submit</button>
      </form>
    `;
    activate();

    const input = document.querySelector("input");

    input.dispatchEvent(new Event("change", { bubbles: true }));
    expect(document.querySelector(".error-label").style.display).toBe("block");

    input.dispatchEvent(new Event("input", { bubbles: true }));
    expect(document.querySelector(".error-label").style.display).toBe("none");

    input.dispatchEvent(new Event("change", { bubbles: true }));
    expect(document.querySelector(".error-label").style.display).toBe("block");
  });

  test("does not re-appear on blur if input is now valid", () => {
    document.body.innerHTML = `
      <form @validate>
        <input minlength="3" required id="name" />
        <button>Submit</button>
      </form>
    `;
    activate();

    const input = document.querySelector("input");

    input.dispatchEvent(new Event("change", { bubbles: true }));
    expect(document.querySelector(".error-label").style.display).toBe("block");

    input.value = "abc";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    expect(document.querySelector(".error-label").style.display).toBe("none");

    input.dispatchEvent(new Event("change", { bubbles: true }));
    expect(document.querySelector(".error-label").style.display).toBe("none");
  });

  test("sets aria-describedby on the input", () => {
    document.body.innerHTML = `
      <form @validate>
        <input type="email" required id="email" />
        <button>Submit</button>
      </form>
    `;
    activate();

    const input = document.querySelector("input");
    input.dispatchEvent(new Event("change", { bubbles: true }));

    expect(input.getAttribute("aria-describedby")).toBe("email-error");
  });

  test("error span id derives from input id", () => {
    document.body.innerHTML = `
      <form @validate>
        <input type="email" required id="email" />
        <button>Submit</button>
      </form>
    `;
    activate();

    const input = document.querySelector("input");
    input.dispatchEvent(new Event("change", { bubbles: true }));

    const span = document.querySelector(".error-label");
    expect(span.id).toBe("email-error");
  });

  test("error span id falls back to input name", () => {
    document.body.innerHTML = `
      <form @validate>
        <input type="email" required name="user_email" />
        <button>Submit</button>
      </form>
    `;
    activate();

    const input = document.querySelector("input");
    input.dispatchEvent(new Event("change", { bubbles: true }));

    const span = document.querySelector(".error-label");
    expect(span.id).toBe("user_email-error");
  });

  test("error span id falls back to field-error when no id or name", () => {
    document.body.innerHTML = `
      <form @validate>
        <input type="email" required />
        <button>Submit</button>
      </form>
    `;
    activate();

    const input = document.querySelector("input");
    input.dispatchEvent(new Event("change", { bubbles: true }));

    const span = document.querySelector(".error-label");
    expect(span.id).toBe("field-error");
  });

  test("novalidate attribute skips validation", () => {
    document.body.innerHTML = `
      <form @validate novalidate>
        <input type="email" required id="email" />
        <button>Submit</button>
      </form>
    `;
    activate();

    const form = document.querySelector("form");
    form.dispatchEvent(
      new Event("submit", { bubbles: true, cancelable: true })
    );

    expect(document.querySelector(".error-label")).toBeNull();
  });

  test("form without @validate is not affected", () => {
    document.body.innerHTML = `
      <form>
        <input type="email" required id="email" />
        <button>Submit</button>
      </form>
    `;
    activate();

    const form = document.querySelector("form");
    const event = new Event("submit", { bubbles: true, cancelable: true });
    form.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(false);
    expect(document.querySelector(".error-label")).toBeNull();
  });

  test("reset button clears all error labels", () => {
    document.body.innerHTML = `
      <form @validate>
        <input type="email" required id="email" />
        <input type="text" required id="name" />
        <button type="reset">Reset</button>
      </form>
    `;
    activate();

    const form = document.querySelector("form");

    form.dispatchEvent(
      new Event("submit", { bubbles: true, cancelable: true })
    );

    const spans = document.querySelectorAll(".error-label");
    expect(spans).toHaveLength(2);
    expect(spans[0].style.display).toBe("block");
    expect(spans[1].style.display).toBe("block");

    form.dispatchEvent(new Event("reset", { bubbles: true }));

    expect(spans[0].style.display).toBe("none");
    expect(spans[1].style.display).toBe("none");
  });

  test("multiple @validate forms on the same page", () => {
    document.body.innerHTML = `
      <form @validate id="form1">
        <input type="email" required id="email1" />
        <button>Submit</button>
      </form>
      <form @validate id="form2">
        <input type="text" required id="name2" />
        <button>Submit</button>
      </form>
    `;
    activate();

    const form1 = document.querySelector("#form1");
    const form2 = document.querySelector("#form2");

    form1.dispatchEvent(
      new Event("submit", { bubbles: true, cancelable: true })
    );
    form2.dispatchEvent(
      new Event("submit", { bubbles: true, cancelable: true })
    );

    const spans = document.querySelectorAll(".error-label");
    expect(spans).toHaveLength(2);
  });

  test("dynamically added input is validated on submit", () => {
    document.body.innerHTML = `
      <form @validate id="form">
        <div id="container"></div>
        <button>Submit</button>
      </form>
    `;
    activate();

    const container = document.getElementById("container");
    const input = document.createElement("input");
    input.type = "email";
    input.required = true;
    input.id = "dynamic";
    container.appendChild(input);

    const form = document.querySelector("form");
    form.dispatchEvent(
      new Event("submit", { bubbles: true, cancelable: true })
    );

    const span = document.querySelector(".error-label");
    expect(span).toBeTruthy();
    expect(span.id).toBe("dynamic-error");
  });

  test("sibling after input position", () => {
    document.body.innerHTML = `
      <form @validate>
        <input type="email" required id="email" />
        <button>Submit</button>
      </form>
    `;
    activate();

    const input = document.querySelector("input");
    input.dispatchEvent(new Event("change", { bubbles: true }));

    const span = document.querySelector(".error-label");
    expect(span.previousElementSibling).toBe(input);
  });

  test("form-level data-validate-messages overrides browser default", () => {
    document.body.innerHTML = `
      <form @validate
            data-validate-messages='{"valueMissing":"Required","typeMismatch":"Bad email"}'>
        <input type="email" required id="email" />
        <button>Submit</button>
      </form>
    `;
    activate();

    const input = document.querySelector("input");
    input.dispatchEvent(new Event("change", { bubbles: true }));

    const span = document.querySelector(".error-label");
    expect(span.textContent).toBe("Required");
  });

  test("input-level data-validate-messages overrides form-level", () => {
    document.body.innerHTML = `
      <form @validate
            data-validate-messages='{"valueMissing":"Required from form"}'>
        <input type="email" required id="email"
               data-validate-messages='{"valueMissing":"Required from input"}' />
        <button>Submit</button>
      </form>
    `;
    activate();

    const input = document.querySelector("input");
    input.dispatchEvent(new Event("change", { bubbles: true }));

    const span = document.querySelector(".error-label");
    expect(span.textContent).toBe("Required from input");
  });

  test("input-level overrides only specific keys, inherits rest from form", () => {
    document.body.innerHTML = `
      <form @validate
            data-validate-messages='{"valueMissing":"Required","typeMismatch":"Bad format"}'>
        <input type="email" required id="email"
               data-validate-messages='{"typeMismatch":"Not a valid email"}' />
        <button>Submit</button>
      </form>
    `;
    activate();

    const input = document.querySelector("input");

    input.dispatchEvent(new Event("change", { bubbles: true }));
    const span = document.querySelector(".error-label");
    expect(span.textContent).toBe("Required");

    input.dispatchEvent(new Event("input", { bubbles: true }));

    input.value = "notanemail";
    input.dispatchEvent(new Event("change", { bubbles: true }));
    expect(span.textContent).toBe("Not a valid email");
  });

  test("falls back to browser validationMessage when no message key matches", () => {
    document.body.innerHTML = `
      <form @validate
            data-validate-messages='{"tooShort":"Too short"}'>
        <input type="email" required id="email" />
        <button>Submit</button>
      </form>
    `;
    activate();

    const input = document.querySelector("input");
    input.dispatchEvent(new Event("change", { bubbles: true }));

    const span = document.querySelector(".error-label");
    expect(span.textContent).toBe("Constraints not satisfied");
  });

  test("invalid JSON in data-validate-messages is silently ignored", () => {
    document.body.innerHTML = `
      <form @validate
            data-validate-messages='not valid json'>
        <input type="email" required id="email" />
        <button>Submit</button>
      </form>
    `;
    activate();

    const input = document.querySelector("input");
    input.dispatchEvent(new Event("change", { bubbles: true }));

    const span = document.querySelector(".error-label");
    expect(span.textContent).toBe("Constraints not satisfied");
  });

  test("customError from setCustomValidity is not overridden by messages", () => {
    document.body.innerHTML = `
      <form @validate
            data-validate-messages='{"customError":"ignored"}'>
        <input type="email" required id="email" />
        <button>Submit</button>
      </form>
    `;
    activate();

    const input = document.querySelector("input");
    input.setCustomValidity("Server says no");
    input.dispatchEvent(new Event("change", { bubbles: true }));

    const span = document.querySelector(".error-label");
    expect(span.textContent).toBe("Server says no");
  });
});

describe("validate + attract integration", () => {
  function activate() {
    attractive.activate({
      addActions: allBuiltinActions,
      addGates: builtinGates,
      addTriggers: builtinTriggers,
      extendWith: [validate, attract]
    });
  }

  test("server errors render as styled error labels", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 422,
      headers: new Headers({ "Content-Type": "application/json" }),
      json: () => Promise.resolve({ errors: { body: "can't be blank" } })
    });
    globalThis.fetch = fetchMock;

    document.body.innerHTML = `
      <form @validate @attract action="/messages" method="post">
        <input name="body" value="" />
        <button>Submit</button>
      </form>
    `;
    activate();

    const form = document.querySelector("form");
    form.dispatchEvent(
      new Event("submit", { bubbles: true, cancelable: true })
    );
    await vi.runAllTimersAsync();

    const span = document.querySelector(".error-label");
    expect(span).toBeTruthy();
    expect(span.textContent).toBe("can't be blank");
    expect(span.style.display).toBe("block");
  });

  test("clears attract custom validity on input", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 422,
      headers: new Headers({ "Content-Type": "application/json" }),
      json: () => Promise.resolve({ errors: { body: "can't be blank" } })
    });
    globalThis.fetch = fetchMock;

    document.body.innerHTML = `
      <form @validate @attract action="/messages" method="post">
        <input name="body" value="" />
        <button>Submit</button>
      </form>
    `;
    activate();

    const form = document.querySelector("form");
    form.dispatchEvent(
      new Event("submit", { bubbles: true, cancelable: true })
    );
    await vi.runAllTimersAsync();

    const input = document.querySelector("input");
    expect(input.validationMessage).toBe("can't be blank");

    input.value = "hello";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    expect(input.validationMessage).toBe("");
  });
});
