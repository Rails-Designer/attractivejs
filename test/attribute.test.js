import { describe, test, expect, beforeEach } from 'vitest';
import attributeActions from '../src/actions/attribute.js';

describe('Attribute Actions', () => {
  let element;

  beforeEach(() => {
    document.body.innerHTML = '<div id="target" data-existing="value"></div>';
    element = document.getElementById('target');
  });

  test('toggleAttribute adds attribute when not present', () => {
    attributeActions.toggleAttribute(element, { value: 'data-active=true', targets: [element] });

    expect(element.hasAttribute('data-active')).toBe(true);
    expect(element.getAttribute('data-active')).toBe('true');
  });

  test('toggleAttribute removes attribute when present', () => {
    attributeActions.toggleAttribute(element, { value: 'data-existing', targets: [element] });

    expect(element.hasAttribute('data-existing')).toBe(false);
  });

  test('addAttribute sets attribute with value', () => {
    attributeActions.addAttribute(element, { value: 'data-status=active', targets: [element] });

    expect(element.getAttribute('data-status')).toBe('active');
  });

  test('addAttribute sets empty attribute when no value', () => {
    attributeActions.addAttribute(element, { value: 'disabled', targets: [element] });

    expect(element.hasAttribute('disabled')).toBe(true);
    expect(element.getAttribute('disabled')).toBe('');
  });

  test('removeAttribute removes specified attribute', () => {
    attributeActions.removeAttribute(element, { value: 'data-existing', targets: [element] });

    expect(element.hasAttribute('data-existing')).toBe(false);
  });

  test('cycleAttribute cycles through values', () => {
    attributeActions.cycleAttribute(element, { value: 'data-state=red,blue,green', targets: [element] });

    expect(element.getAttribute('data-state')).toBe('red');

    attributeActions.cycleAttribute(element, { value: 'data-state=red,blue,green', targets: [element] });

    expect(element.getAttribute('data-state')).toBe('blue');
  });
});
