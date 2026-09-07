import { store, subscribe, has } from "./store.js";

const subscriptions = new WeakMap();

function trackSubscription(element, remove) {
  const trackedSubscriptions = subscriptions.get(element);

  if (trackedSubscriptions) {
    trackedSubscriptions.push(remove);
  } else {
    subscriptions.set(element, [remove]);
  }
}

export function inStore(element, trigger) {
  const path = element.dataset.store;
  if (!path) return;

  const fire = () => {
    if (!has(path)) return;

    trigger(store.get(path));
  };

  fire();
  trackSubscription(element, subscribe(path, fire));
}

export function unbindInStore(element) {
  const trackedSubscriptions = subscriptions.get(element);
  if (!trackedSubscriptions) return;

  trackedSubscriptions.forEach((remove) => remove());
  subscriptions.delete(element);
}
