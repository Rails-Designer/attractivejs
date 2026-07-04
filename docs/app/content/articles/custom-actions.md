---
title: Custom actions
description: Register your own actions, modifiers and plugins
category: advanced
position: 1
---

The same interface used by built-in actions is available to you. Register custom actions, modifiers and event type overrides.


## registerAction

```js
import Attractive from "attractivejs";

const attractive = Attractive.activate();

attractive.registerAction("sharePage", (element, { dataset }) => {
  const title = dataset.shareTitle || document.title;
  const url = dataset.shareUrl || window.location.href;

  if (navigator.share) {
    navigator.share({ title, url });
  } else {
    navigator.clipboard.writeText(url);
  }
});
```

```html
<button on="sharePage" data-share-title="Check this out!">Share</button>
```

The action function receives the element and a context object:
```js
attractive.registerAction(
  "myAction",
  (
    element,
    { value, target, targets, event, dataset, actionName, dispatchEvent }
  ) => {
    // value — the string after # (e.g. "active" from toggleClass#active)
    // target — single target element by ID
    // targets — multiple target elements by CSS selector
    // event — the triggering event
    // dataset — element.dataset
    // actionName — the registered action name
    // dispatchEvent(name, detail) — fires a CustomEvent on the element
  }
);
```


## use

Register multiple actions, modifiers and event type overrides at once:
```js
const subscribeAction = {
  name: "subscribe",
  actions: {
    async subscribe(element, { event, dataset }) {
      event.preventDefault();

      const form = event.target;
      const button = form.querySelector("[type=submit]");
      const originalLabel = button.value;

      button.value = "Subscribing...";
      button.disabled = true;

      try {
        await fetch(form.action, {
          method: "POST",
          body: new FormData(form),
          mode: "no-cors"
        });

        window.location.href = dataset.redirect || "/subscribed/";
      } catch {
        button.value = originalLabel;
        button.disabled = false;
      }
    }
  }
};

attractive.use(subscribeAction);
```

```html
<form on="subscribe" data-redirect="/thank-you/">
  <input name="email" type="email" placeholder="Your email" />

  <input type="submit" value="Subscribe" />
</form>
```


## Custom modifiers

```js
attractive.registerModifier("myModifier", (element) => {
  // Setup modifier: fires when prepared
  // Receives (element, trigger)
});

attractive.registerModifier("myGate", ({ event, element }) => {
  // Gate modifier: return false to block action
  return element.classList.contains("enabled");
});
```

```html
<button on="toggleClass#active:myGate">Toggle</button>
```
