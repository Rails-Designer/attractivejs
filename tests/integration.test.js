import { describe, test, expect, beforeEach, vi } from 'vitest';
import Attractive from '../src/index.js';

globalThis.Node = globalThis.Node || { ELEMENT_NODE: 1 };

describe('Integration', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    vi.clearAllTimers();
    vi.useFakeTimers();
  });

  test('mounted modifier triggers addClass immediately when element is added to DOM', async () => {
    Attractive.activate();

    document.body.innerHTML = `
      <div data-action="addClass#loaded:mounted" data-target="target">
        <span id="target">Target element</span>
      </div>
    `;

    await vi.runAllTimersAsync();

    const target = document.getElementById('target');
    expect(target.classList.contains('loaded')).toBe(true);
  });

  test('custom event types', async () => {
    Attractive.activate();

   document.body.innerHTML = `
      <button id="trigger" data-action="mouseenter->addClass#hovered">Hover me</button>
    `;

    await vi.runAllTimersAsync();

    const trigger = document.getElementById('trigger');
    trigger.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));

    expect(trigger.classList.contains('hovered')).toBe(true);
  });

  test('whenVisible modifier triggers when element becomes visible', async () => {
    const mockObserve = vi.fn();
    const mockDisconnect = vi.fn();

    global.IntersectionObserver = vi.fn().mockImplementation((_) => ({
      observe: mockObserve,
      disconnect: mockDisconnect
    }));

    Attractive.activate();

    document.body.innerHTML = `
      <div data-action="addClass#visible:whenVisible" data-target="target">
        <span id="target">Target</span>
      </div>
    `;

    await vi.runAllTimersAsync();

    expect(mockObserve).toHaveBeenCalled();
  });

  test('fallback action syntax with hash', async () => {
    Attractive.activate();

    document.body.innerHTML = `
      <button data-action="nonExistentAction#addClass#fallback:mounted" data-target="target">
        <div id="target">Target</div>
      </button>
    `;

    await vi.runAllTimersAsync();

    const target = document.getElementById('target');
    expect(target.classList.contains('fallback')).toBe(true);
  });
});
