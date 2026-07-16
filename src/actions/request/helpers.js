import Debug from "./../../debug";
import delay from "../helpers/delay";

const clearFeedback = delay();

const requests = new WeakMap();

export const activeRequests = {
  get({ on: element }) {
    return requests.get(element);
  },

  set({ on: element, with: controller }) {
    requests.set(element, controller);
  },

  delete({ on: element }) {
    requests.delete(element);
  }
};

export function setFeedback(state, { on: element, for: targets }) {
  const duration = element.dataset.requestFeedback;

  targets.forEach((target) => {
    if (state === "busy") {
      target.setAttribute("data-request-busy", "true");

      target.removeAttribute("data-request-success");
    } else {
      target.removeAttribute("data-request-busy");

      target.setAttribute("data-request-success", state === "success");
    }
  });

  if (!duration || state === "busy") return;

  clearFeedback(() => {
    targets.forEach((target) => target.removeAttribute("data-request-success"));
  }, parseInt(duration));
}

export function crossingOrigin({ for: url }) {
  try {
    const requestUrl = new URL(url, window.location.href);

    return requestUrl.origin !== window.location.origin;
  } catch {
    Debug.error("Invalid URL:", url);

    return false;
  }
}
