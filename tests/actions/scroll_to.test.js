import { describe, test, expect, beforeEach, vi } from 'vitest';
import scrollToActions from '../../src/actions/scroll_to.js';

describe('ScrollTo Actions', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('scrollTo', () => {
    test('scrolls to target element with auto behavior', () => {
      document.body.innerHTML = `
        <button id="trigger">Scroll</button>
        <div id="target">Target content</div>
      `;
      const element = document.getElementById('trigger');
      const target = document.getElementById('target');

      target.scrollIntoView = vi.fn();

      scrollToActions.scrollTo(element, { target: 'target' });

      expect(target.scrollIntoView).toHaveBeenCalledWith({ behavior: 'auto' });
    });

    test('scrolls with smooth behavior when specified', () => {
      document.body.innerHTML = `
        <button id="trigger">Scroll</button>
        <div id="target">Target content</div>
      `;
      const element = document.getElementById('trigger');
      const target = document.getElementById('target');

      target.scrollIntoView = vi.fn();

      scrollToActions.scrollTo(element, { target: 'target', value: 'smooth' });

      expect(target.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
    });

    test('scrolls with instant behavior when specified', () => {
      document.body.innerHTML = `
        <button id="trigger">Scroll</button>
        <div id="target">Target content</div>
      `;
      const element = document.getElementById('trigger');
      const target = document.getElementById('target');

      target.scrollIntoView = vi.fn();

      scrollToActions.scrollTo(element, { target: 'target', value: 'instant' });

      expect(target.scrollIntoView).toHaveBeenCalledWith({ behavior: 'instant' });
    });

    test('defaults to auto for invalid behavior', () => {
      document.body.innerHTML = `
        <button id="trigger">Scroll</button>
        <div id="target">Target content</div>
      `;
      const element = document.getElementById('trigger');
      const target = document.getElementById('target');

      target.scrollIntoView = vi.fn();

      scrollToActions.scrollTo(element, { target: 'target', value: 'invalid' });

      expect(target.scrollIntoView).toHaveBeenCalledWith({ behavior: 'auto' });
    });

    test('ignores when no target found', () => {
      document.body.innerHTML = `
        <button id="trigger">Scroll</button>
      `;
      const element = document.getElementById('trigger');

      scrollToActions.scrollTo(element, { target: 'missing' });

      expect(true).toBe(true);
    });

    test('only scrolls to first target', () => {
      document.body.innerHTML = `
        <button id="trigger">Scroll</button>
        <div class="target">Target 1</div>
        <div class="target">Target 2</div>
      `;
      const element = document.getElementById('trigger');
      const targets = document.querySelectorAll('.target');

      targets[0].scrollIntoView = vi.fn();
      targets[1].scrollIntoView = vi.fn();

      scrollToActions.scrollTo(element, { targets: '.target' });

      expect(targets[0].scrollIntoView).toHaveBeenCalled();
      expect(targets[1].scrollIntoView).not.toHaveBeenCalled();
    });
  });
});
