---
title: Validate
description: Client-side form validation with @validate using the native Constraint Validation API. Styled error labels, custom messages, zero configuration.
category: extensions
position: 4
---

The `@validate` attribute adds client-side form validation using the browser's native [Constraint Validation API](https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Constraint_validation). Validation rules come from HTML attributes like `required`, `minlength`, `type="email"`.
```js
import Attractive from "attractivejs";
import { validate } from "attractivejs/validate";

Attractive.activate({ extendWith: [validate] });
```


## `@validate` attribute

Add `@validate` to any `<form>` to enable validation. The form submit is blocked until all inputs are valid.
```html
<form @validate>
  <input type="email" required />
  <input minlength="3" required />

  <button>Submit</button>
</form>
```

Validation runs on change and on submit. Errors clear as the user types.


## Styling

Use the `:user-invalid` CSS pseudo-class to style invalid inputs. It applies automatically after the user has interacted with the field.
```css
input:user-invalid,
select:user-invalid,
textarea:user-invalid {
  border-color: red;
}
```

Error messages appear as `<span class="error-label">` elements inserted after the invalid input.
```css
span.error-label {
  color: red;
  font-size: 0.85em;
  display: block;
}
```


## Custom validation messages

Override the browser's default messages with `data-validate-messages`. A JSON object mapping `ValidityState` keys to custom strings.

Lookup order per input:
1. Input's own `data-validate-messages`
2. Form's `data-validate-messages`
3. Browser default (`input.validationMessage`)

```html
<form @validate data-validate-messages='{"valueMissing":"This field is required","tooShort":"Too short"}'>
  <input type="email" required name="email" data-validate-messages='{"typeMismatch":"Not a valid email"}' />
  <input type="url" required name="website" data-validate-messages='{"typeMismatch":"Not a valid URL"}' />
  <input name="name" minlength="3" required />

  <button>Submit</button>
</form>
```

Supported keys (match the browser's `ValidityState` property names):

| ValidityState key | Trigger |
|---|---|
| `valueMissing` | `required` |
| `tooShort` | `minlength` |
| `tooLong` | `maxlength` |
| `typeMismatch` | `type="email"`, `type="url"` |
| `patternMismatch` | `pattern` |
| `rangeUnderflow` | `min` |
| `rangeOverflow` | `max` |
| `stepMismatch` | `step` |
| `badInput` | Invalid browser-parsed value |


## Integration with Attract

When used together, `@validate` and [`@attract`](/docs/attract/) compose naturally through shared DOM events.
```html
<form @validate @attract action="/messages" method="post">
  <input name="body" required />

  <button>Submit</button>
</form>
```

`@attract` intercepts the submit and sends the request. If the server returns `{ errors: { body: "Cannot be empty" } }`, `@attract` sets the error via `setCustomValidity` and calls `reportValidity`. `@validate` catches the `invalid` event and renders a styled `<span class="error-label">`, the same way it renders client-side validation errors. The result is identical regardless of whether the error came from the browser or the server.
