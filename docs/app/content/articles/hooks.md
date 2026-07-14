---
title: Hooks
description: Lifecycle hooks for before, after and error handling
category: advanced
position: 2
---

Lifecycle hooks let you run code before or after every action and handle errors centrally.


## beforeAction

Runs before each action. Return `false` to cancel the action.

```js
const attractive = Attractive.activate();

attractive.beforeAction(({ name, element, options, event }) => {
  if (!element.classList.contains("enabled")) {
    return false;
  }
});
```


## afterAction

Runs after each successful action.
```js
attractive.afterAction(({ name, element, options, event, result }) => {
  console.log(`Action ${name} completed`);
});
```


## onError

Runs when an action throws an error.
```js
attractive.onError(({ name, element, options, event, error }) => {
  console.warn(`Action ${name} failed:`, error.message);
});
```


## Global onError

Set a fallback for all instances:
```js
Attractive.onError = (error, message, detail) => {
  Sentry.captureException(error, { extra: detail });
};
```

By default it logs to console and delegates to `window.onerror`.


## Error propagation

When an action throws, Attractive catches it and forwards to two layers:

1. Instance `onError` hooks (per-component UI feedback)
2. Global `Attractive.onError` fallback (monitoring services like Sentry, Rollbar)

The error is contained. No unhandled rejection. Remaining actions in a chain still run.
