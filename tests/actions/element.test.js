import { describe, test, expect, beforeEach, vi } from 'vitest';
import elementActions from '../../src/actions/element.js';

describe('Element Actions', () => {
  beforeEach(() => {
    vi.clearAllTimers();
  });

  describe('add', () => {
    test('clones and adds element to target', () => {
      document.body.innerHTML = `
        <button id="trigger" data-add-source="#source">Add</button>
        <div id="target"></div>
        <div id="source">Source content</div>
      `;
      const element = document.getElementById('trigger');
      const target = document.getElementById('target');

      elementActions.add(element, { target: 'target' });

      expect(target.children.length).toBe(1);
      expect(target.firstElementChild.textContent).toBe('Source content');
    });

    test('adds element at specified position', () => {
      document.body.innerHTML = `
        <button id="trigger" data-add-source="#source" data-add-at="afterbegin">Add</button>
        <div id="target"><span>existing</span></div>
        <div id="source">Source content</div>
      `;
      const element = document.getElementById('trigger');
      const target = document.getElementById('target');

      elementActions.add(element, { target: 'target' });

      expect(target.firstElementChild.textContent).toBe('Source content');
      expect(target.lastElementChild.textContent).toBe('existing');
    });

    test('clones template content correctly', () => {
      document.body.innerHTML = `
        <button id="trigger" data-add-source="#template">Add</button>
        <div id="target"></div>
        <template id="template"><p>Template content</p></template>
      `;
      const element = document.getElementById('trigger');
      const target = document.getElementById('target');

      elementActions.add(element, { target: 'target' });

      expect(target.innerHTML).toBe('<p>Template content</p>');
    });

    test('does nothing when no source found', () => {
      document.body.innerHTML = `
        <button id="trigger" data-add-source="#nonexistent">Add</button>
        <div id="target"></div>
      `;
      const element = document.getElementById('trigger');
      const target = document.getElementById('target');

      elementActions.add(element, { target: 'target' });

      expect(target.children.length).toBe(0);
    });
  });

  describe('remove', () => {
    test('removes target elements immediately', () => {
      document.body.innerHTML = `
        <button id="trigger">Remove</button>
        <div id="target">Target content</div>
      `;
      const element = document.getElementById('trigger');

      elementActions.remove(element, { target: 'target' });

      expect(document.getElementById('target')).toBeNull();
    });

    test('removes target elements after delay', () => {
      vi.useFakeTimers();
      document.body.innerHTML = `
        <button id="trigger" data-remove-delay="1000">Remove</button>
        <div id="target">Target content</div>
      `;
      const element = document.getElementById('trigger');

      elementActions.remove(element, { target: 'target' });

      expect(document.getElementById('target')).not.toBeNull();

      vi.advanceTimersByTime(1000);

      expect(document.getElementById('target')).toBeNull();
      vi.useRealTimers();
    });
  });
});
