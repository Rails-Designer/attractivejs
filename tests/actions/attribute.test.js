import { describe, test, expect, beforeEach } from 'vitest';
import attributeActions from '../../src/actions/attribute.js';

describe('Attribute Actions', () => {
  let element;

  beforeEach(() => {
    document.body.innerHTML = '<div id="target" data-existing="value"></div>';
    element = document.getElementById('target');
  });

  describe('toggleAttribute', () => {
    test('adds attribute when not present', () => {
      attributeActions.toggleAttribute(element, { value: 'data-active=true', target: 'target' });

      expect(element.getAttribute('data-active')).toBe('true');
    });

    test('removes attribute when present', () => {
      attributeActions.toggleAttribute(element, { value: 'data-existing', target: 'target' });

      expect(element.hasAttribute('data-existing')).toBe(false);
    });

    test('adds attribute without value when no value specified', () => {
      attributeActions.toggleAttribute(element, { value: 'disabled', target: 'target' });

      expect(element.getAttribute('disabled')).toBe('');
    });
  });

  describe('addAttribute', () => {
    test('adds attribute with value', () => {
      attributeActions.addAttribute(element, { value: 'data-state=active', target: 'target' });

      expect(element.getAttribute('data-state')).toBe('active');
    });

    test('adds attribute without value', () => {
      attributeActions.addAttribute(element, { value: 'hidden', target: 'target' });

      expect(element.getAttribute('hidden')).toBe('');
    });

    test('overwrites existing attribute', () => {
      attributeActions.addAttribute(element, { value: 'data-existing=new-value', target: 'target' });

      expect(element.getAttribute('data-existing')).toBe('new-value');
    });
  });

  describe('removeAttribute', () => {
    test('removes existing attribute', () => {
      attributeActions.removeAttribute(element, { value: 'data-existing', target: 'target' });

      expect(element.hasAttribute('data-existing')).toBe(false);
    });

    test('ignores non-existent attribute', () => {
      attributeActions.removeAttribute(element, { value: 'non-existent', target: 'target' });

      expect(true).toBe(true);
    });
  });

  describe('cycleAttribute', () => {
    test('cycles through attribute values', () => {
      attributeActions.cycleAttribute(element, { value: 'data-theme=light,dark,auto', target: 'target' });
      expect(element.getAttribute('data-theme')).toBe('light');

      attributeActions.cycleAttribute(element, { value: 'data-theme=light,dark,auto', target: 'target' });
      expect(element.getAttribute('data-theme')).toBe('dark');

      attributeActions.cycleAttribute(element, { value: 'data-theme=light,dark,auto', target: 'target' });
      expect(element.getAttribute('data-theme')).toBe('auto');

      attributeActions.cycleAttribute(element, { value: 'data-theme=light,dark,auto', target: 'target' });
      expect(element.getAttribute('data-theme')).toBe('light');
    });

    test('starts cycle when attribute not present', () => {
      attributeActions.cycleAttribute(element, { value: 'data-size=small,medium,large', target: 'target' });

      expect(element.getAttribute('data-size')).toBe('small');
    });
  });

  describe('multiple targets', () => {
    test('operates on multiple elements', () => {
      document.body.innerHTML = `
        <button id="trigger">Toggle</button>
        <div id="target1"></div>
        <div id="target2"></div>
      `;
      const trigger = document.getElementById('trigger');
      const target1 = document.getElementById('target1');
      const target2 = document.getElementById('target2');

      attributeActions.addAttribute(trigger, { value: 'data-active=true', targets: 'div' });

      expect(target1.getAttribute('data-active')).toBe('true');
      expect(target2.getAttribute('data-active')).toBe('true');
    });
  });

  describe('edge cases', () => {
    test('handles empty value gracefully', () => {
      attributeActions.toggleAttribute(element, { value: '', target: 'target' });

      expect(true).toBe(true);
    });

    test('handles value without equals sign', () => {
      attributeActions.addAttribute(element, { value: 'readonly', target: 'target' });

      expect(element.getAttribute('readonly')).toBe('');
    });
  });
});
