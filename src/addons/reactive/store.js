const data = new Map();
const subscriptions = new Map();
const all = new Set();

export const store = {
  set(key, { with: value }) {
    data.set(key, value);

    const trackedSubscriptions = subscriptions.get(key);
    if (!trackedSubscriptions) return;

    for (const listener of trackedSubscriptions) {
      listener(value);
    }
  },

  get(key) {
    return data.get(key);
  },

  /**
   * Remove all keys from the store.
   * All subscribers are notified with undefined so bound elements clear their content.
   */
  clear() {
    all.forEach((listener) => listener(undefined));

    data.clear();
  }
};

export function has(key) {
  return data.has(key);
}

export function subscribe(key, { with: listener }) {
  if (!subscriptions.has(key)) {
    subscriptions.set(key, new Set());
  }

  subscriptions.get(key).add(listener);
  all.add(listener);

  return () => {
    subscriptions.get(key)?.delete(listener);
    all.delete(listener);
  };
}
