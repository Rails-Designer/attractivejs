import { describe, test, expect, beforeEach, vi } from 'vitest';
import confirmActions from '../src/actions/confirm.js';

describe('Confirm Actions', () => {
  let element;

  beforeEach(() => {
    document.body.innerHTML = '<button id="trigger">Confirm</button>';
    element = document.getElementById('trigger');
    vi.clearAllMocks();
  });

  describe('confirm', () => {
    test('shows default confirmation message', () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

      const result = confirmActions.confirm(element, {});

      expect(confirmSpy).toHaveBeenCalledWith('Are you sure?');
      expect(result).toBe(true);
    });

    test('shows custom confirmation message', () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
      element.dataset.confirmMessage = 'Delete this item?';

      const result = confirmActions.confirm(element, {});

      expect(confirmSpy).toHaveBeenCalledWith('Delete this item?');
      expect(result).toBe(false);
    });

    test('sets success attribute on confirmation', () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true);

      confirmActions.confirm(element, {});

      expect(element.getAttribute('data-confirm-success')).toBe('true');
    });

    test('sets failure attribute on cancellation', () => {
      vi.spyOn(window, 'confirm').mockReturnValue(false);

      confirmActions.confirm(element, {});

      expect(element.getAttribute('data-confirm-success')).toBe('false');
    });

    test('removes success attribute after duration', () => {
      vi.useFakeTimers();
      vi.spyOn(window, 'confirm').mockReturnValue(true);
      element.dataset.confirmDuration = '2000';

      confirmActions.confirm(element, {});

      expect(element.hasAttribute('data-confirm-success')).toBe(true);

      vi.advanceTimersByTime(2000);

      expect(element.hasAttribute('data-confirm-success')).toBe(false);
      vi.useRealTimers();
    });
  });
});
