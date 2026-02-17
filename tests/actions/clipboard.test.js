import { describe, test, expect, beforeEach, vi } from 'vitest';
import clipboardActions from '../../src/actions/clipboard.js';

describe('Clipboard Actions', () => {
  beforeEach(() => {
    document.body.innerHTML = '';

    vi.clearAllTimers();
    vi.useFakeTimers();

    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn()
      }
    });
  });

  describe('copy', () => {
    test('copies specified value to clipboard', async () => {
      document.body.innerHTML = `
        <button id="trigger">Copy</button>
        <div id="target">Target content</div>
      `;
      const element = document.getElementById('trigger');

      navigator.clipboard.writeText.mockResolvedValue();

      await clipboardActions.copy(element, { target: 'target', value: 'Custom text' });

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Custom text');
    });

    test('copies target input value when no value specified', async () => {
      document.body.innerHTML = `
        <button id="trigger">Copy</button>
        <input id="target" value="Input value">
      `;
      const element = document.getElementById('trigger');

      navigator.clipboard.writeText.mockResolvedValue();

      await clipboardActions.copy(element, { target: 'target' });

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Input value');
    });

    test('copies target text content when no value specified', async () => {
      document.body.innerHTML = `
        <button id="trigger">Copy</button>
        <div id="target">Text content</div>
      `;
      const element = document.getElementById('trigger');

      navigator.clipboard.writeText.mockResolvedValue();

      await clipboardActions.copy(element, { target: 'target' });

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Text content');
    });

    test('sets success attribute on successful copy', async () => {
      document.body.innerHTML = `
        <button id="trigger">Copy</button>
        <div id="target">Content</div>
      `;
      const element = document.getElementById('trigger');
      const target = document.getElementById('target');

      navigator.clipboard.writeText.mockResolvedValue();

      await clipboardActions.copy(element, { target: 'target', value: 'text' });

      expect(target.getAttribute('data-copy-success')).toBe('true');
    });

    test('sets failure attribute on copy error', async () => {
      document.body.innerHTML = `
        <button id="trigger">Copy</button>
        <div id="target">Content</div>
      `;
      const element = document.getElementById('trigger');
      const target = document.getElementById('target');

      navigator.clipboard.writeText.mockRejectedValue(new Error('Failed'));

      await clipboardActions.copy(element, { target: 'target', value: 'text' });

      expect(target.getAttribute('data-copy-success')).toBe('false');
    });

    test('removes feedback attribute after delay', async () => {
      document.body.innerHTML = `
        <button id="trigger" data-copy-delay="100">Copy</button>
        <div id="target">Content</div>
      `;
      const element = document.getElementById('trigger');
      const target = document.getElementById('target');

      navigator.clipboard.writeText.mockResolvedValue();

      await clipboardActions.copy(element, { target: 'target', value: 'text' });

      expect(target.hasAttribute('data-copy-success')).toBe(true);

      vi.advanceTimersByTime(100);

      expect(target.hasAttribute('data-copy-success')).toBe(false);
    });

    test('ignores when no text to copy', async () => {
      document.body.innerHTML = `
        <button id="trigger">Copy</button>
      `;
      const element = document.getElementById('trigger');

      await clipboardActions.copy(element, { target: 'missing' });

      expect(navigator.clipboard.writeText).not.toHaveBeenCalled();
    });

    test('sets feedback on multiple targets', async () => {
      document.body.innerHTML = `
        <button id="trigger">Copy</button>
        <div class="target">Target 1</div>
        <div class="target">Target 2</div>
      `;
      const element = document.getElementById('trigger');
      const targets = document.querySelectorAll('.target');

      navigator.clipboard.writeText.mockResolvedValue();

      await clipboardActions.copy(element, { targets: '.target', value: 'text' });

      targets.forEach(target => {
        expect(target.getAttribute('data-copy-success')).toBe('true');
      });
    });
  });
});
