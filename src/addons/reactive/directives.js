import { subscribe } from "./store.js";

const subscriptions = new WeakMap();

function trackSubscription(element, remove) {
  const trackedSubscriptions = subscriptions.get(element);

  if (trackedSubscriptions) {
    trackedSubscriptions.push(remove);
  } else {
    subscriptions.set(element, [remove]);
  }
}

export function whenTrue(element, trigger) {
  const key = element.dataset.store;
  if (!key) return;

  trackSubscription(
    element,
    subscribe(key, {
      with: (value) => {
        if (value) trigger();
      }
    })
  );
}

export function whenFalse(element, trigger) {
  const key = element.dataset.store;
  if (!key) return;

  trackSubscription(
    element,
    subscribe(key, {
      with: (value) => {
        if (!value) trigger();
      }
    })
  );
}

export function unbindStore(element) {
  const trackedSubscriptions = subscriptions.get(element);
  if (!trackedSubscriptions) return;

  trackedSubscriptions.forEach((remove) => remove());
  subscriptions.delete(element);
}
