import { describe, test, expect, beforeEach, vi } from 'vitest';
import reloadActions from '../../src/actions/reload.js';

describe('Reload Actions', () => {
  beforeEach(() => {
    document.body.innerHTML = '';

    delete window.location;

    window.location = { reload: vi.fn() };
  });

  describe('reload', () => {
    test('reloads turbo-frame element', () => {
      document.body.innerHTML = `
        <button id="trigger">Reload</button>
        <turbo-frame id="target"></turbo-frame>
      `;
      const element = document.getElementById('trigger');
      const frame = document.getElementById('target');

      frame.reload = vi.fn();

      reloadActions.reload(element, { target: 'target' });

      expect(frame.reload).toHaveBeenCalled();
      expect(window.location.reload).not.toHaveBeenCalled();
    });

    test('reloads window for non-turbo-frame elements', () => {
      document.body.innerHTML = `
        <button id="trigger">Reload</button>
        <div id="target">Regular div</div>
      `;
      const element = document.getElementById('trigger');

      reloadActions.reload(element, { target: 'target' });

      expect(window.location.reload).toHaveBeenCalled();
    });

    test('reloads window when turbo-frame lacks reload method', () => {
      document.body.innerHTML = `
        <button id="trigger">Reload</button>
        <turbo-frame id="target"></turbo-frame>
      `;
      const element = document.getElementById('trigger');

      reloadActions.reload(element, { target: 'target' });

      expect(window.location.reload).toHaveBeenCalled();
    });

    test('handles multiple targets with mixed types', () => {
      document.body.innerHTML = `
        <button id="trigger">Reload</button>
        <turbo-frame class="target"></turbo-frame>
        <div class="target">Regular div</div>
      `;
      const element = document.getElementById('trigger');
      const frame = document.querySelector('turbo-frame');

      frame.reload = vi.fn();

      reloadActions.reload(element, { targets: '.target' });

      expect(frame.reload).toHaveBeenCalled();
      expect(window.location.reload).toHaveBeenCalled();
    });
  });

  describe('refresh', () => {
    test('is alias for reload', () => {
      document.body.innerHTML = `
        <button id="trigger">Refresh</button>
        <div id="target">Content</div>
      `;
      const element = document.getElementById('trigger');

      reloadActions.refresh(element, { target: 'target' });

      expect(window.location.reload).toHaveBeenCalled();
    });
  });
});
