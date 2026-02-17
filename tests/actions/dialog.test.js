import { describe, test, expect, beforeEach, vi } from 'vitest';
import dialogActions from '../../src/actions/dialog.js';

describe('Dialog Actions', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('open', () => {
    test('calls show on dialog element', () => {
      document.body.innerHTML = `
        <button id="trigger">Open</button>
        <dialog id="modal">Dialog content</dialog>
      `;
      const element = document.getElementById('trigger');
      const dialog = document.getElementById('modal');

      dialog.show = vi.fn();

      dialogActions.open(element, { target: 'modal' });

      expect(dialog.show).toHaveBeenCalled();
    });

    test('ignores non-dialog elements', () => {
      document.body.innerHTML = `
        <button id="trigger">Open</button>
        <div id="not-dialog">Not a dialog</div>
      `;
      const element = document.getElementById('trigger');

      dialogActions.open(element, { target: 'not-dialog' });

      expect(true).toBe(true);
    });
  });

  describe('openModal', () => {
    test('calls showModal on dialog element', () => {
      document.body.innerHTML = `
        <button id="trigger">Open Modal</button>
        <dialog id="modal">Dialog content</dialog>
      `;
      const element = document.getElementById('trigger');
      const dialog = document.getElementById('modal');

      dialog.showModal = vi.fn();

      dialogActions.openModal(element, { target: 'modal' });

      expect(dialog.showModal).toHaveBeenCalled();
    });
  });

  describe('close', () => {
    test('calls close on dialog element', () => {
      document.body.innerHTML = `
        <button id="trigger">Close</button>
        <dialog id="modal" open>Dialog content</dialog>
      `;
      const element = document.getElementById('trigger');
      const dialog = document.getElementById('modal');

      dialog.close = vi.fn();

      dialogActions.close(element, { target: 'modal' });

      expect(dialog.close).toHaveBeenCalled();
    });
  });

  describe('multiple targets', () => {
    test('operates on multiple dialog elements', () => {
      document.body.innerHTML = `
        <button id="trigger">Open All</button>
        <dialog id="modal1">Dialog 1</dialog>
        <dialog id="modal2">Dialog 2</dialog>
      `;
      const element = document.getElementById('trigger');
      const dialog1 = document.getElementById('modal1');
      const dialog2 = document.getElementById('modal2');

      dialog1.show = vi.fn();
      dialog2.show = vi.fn();

      dialogActions.open(element, { targets: 'dialog' });

      expect(dialog1.show).toHaveBeenCalled();
      expect(dialog2.show).toHaveBeenCalled();
    });
  });
});
