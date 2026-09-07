const root = {};
const subscriptions = new Map();
const all = new Set();

function splitPath(key) {
  return key.split(".");
}

function read(key) {
  let current = root;

  for (const segment of splitPath(key)) {
    if (current == null || typeof current !== "object") return undefined;

    current = current[segment];
  }

  return current;
}

function write(key, value) {
  const segments = splitPath(key);
  let current = root;

  for (const segment of segments.slice(0, -1)) {
    if (typeof current[segment] !== "object" || current[segment] === null)
      current[segment] = {};

    current = current[segment];
  }

  current[segments[segments.length - 1]] = value;
}

function exists(key) {
  let current = root;

  for (const segment of splitPath(key)) {
    if (current == null || typeof current !== "object" || !(segment in current))
      return false;

    current = current[segment];
  }

  return true;
}

function notify(key) {
  const segments = splitPath(key);
  let path = "";

  for (const segment of segments) {
    path = path ? `${path}.${segment}` : segment;

    const listeners = subscriptions.get(path);
    if (listeners) listeners.forEach((listener) => listener(read(path)));
  }
}

export const store = {
  set(key, value) {
    write(key, value);
    notify(key);
  },

  get(key) {
    return read(key);
  },

  has(key) {
    return exists(key);
  },

  clear() {
    all.forEach((listener) => listener(undefined));

    for (const key of Object.keys(root)) delete root[key];
  }
};

export function subscribe(key, listener) {
  if (!subscriptions.has(key)) subscriptions.set(key, new Set());

  const listeners = subscriptions.get(key);
  listeners.add(listener);
  all.add(listener);

  return () => {
    listeners.delete(listener);

    all.delete(listener);
  };
}

export function has(key) {
  return exists(key);
}
