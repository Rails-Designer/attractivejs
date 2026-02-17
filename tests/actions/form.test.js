import { describe, test, expect, beforeEach, vi } from 'vitest';
import formActions from '../../src/actions/form.js';

describe('Form Actions', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    vi.clearAllTimers();
    vi.useFakeTimers();
  });

  describe('submit', () => {
    test('submits form element', () => {
      document.body.innerHTML = `
        <button id="trigger">Submit</button>
        <form id="target"></form>
      `;
      const element = document.getElementById('trigger');
      const form = document.getElementById('target');

      form.requestSubmit = vi.fn();

      formActions.submit(element, { target: 'target' });

      expect(form.requestSubmit).toHaveBeenCalled();
    });

    test('submits form after delay', () => {
      document.body.innerHTML = `
        <button id="trigger" data-submit-delay="100">Submit</button>
        <form id="target"></form>
      `;
      const element = document.getElementById('trigger');
      const form = document.getElementById('target');

      form.requestSubmit = vi.fn();

      formActions.submit(element, { target: 'target' });

      expect(form.requestSubmit).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);

      expect(form.requestSubmit).toHaveBeenCalled();
    });

    test('ignores non-form elements', () => {
      document.body.innerHTML = `
        <button id="trigger">Submit</button>
        <div id="target">Not a form</div>
      `;
      const element = document.getElementById('trigger');

      formActions.submit(element, { target: 'target' });

      expect(true).toBe(true);
    });

    test('submits multiple forms', () => {
      document.body.innerHTML = `
        <button id="trigger">Submit</button>
        <form class="target"></form>
        <form class="target"></form>
      `;
      const element = document.getElementById('trigger');
      const forms = document.querySelectorAll('.target');

      forms.forEach(form => form.requestSubmit = vi.fn());

      formActions.submit(element, { targets: '.target' });

      forms.forEach(form => expect(form.requestSubmit).toHaveBeenCalled());
    });
  });

  describe('reset', () => {
    test('resets form element', () => {
      document.body.innerHTML = `
        <button id="trigger">Reset</button>
        <form id="target"></form>
      `;
      const element = document.getElementById('trigger');
      const form = document.getElementById('target');

      form.reset = vi.fn();

      formActions.reset(element, { target: 'target' });

      expect(form.reset).toHaveBeenCalled();
    });

    test('ignores non-form elements', () => {
      document.body.innerHTML = `
        <button id="trigger">Reset</button>
        <div id="target">Not a form</div>
      `;
      const element = document.getElementById('trigger');

      formActions.reset(element, { target: 'target' });

      expect(true).toBe(true);
    });

    test('resets multiple forms', () => {
      document.body.innerHTML = `
        <button id="trigger">Reset</button>
        <form class="target"></form>
        <form class="target"></form>
      `;
      const element = document.getElementById('trigger');
      const forms = document.querySelectorAll('.target');

      forms.forEach(form => form.reset = vi.fn());

      formActions.reset(element, { targets: '.target' });

      forms.forEach(form => expect(form.reset).toHaveBeenCalled());
    });
  });
});
