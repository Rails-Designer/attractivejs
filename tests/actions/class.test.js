import { describe, test, expect, beforeEach } from 'vitest';
import classActions from '../../src/actions/class.js';

describe('Class Actions', () => {
  let element;

  beforeEach(() => {
    document.body.innerHTML = '<div id="target" class="existing"></div>';
    element = document.getElementById('target');
  });

  test('toggleClass adds class when not present', () => {
    classActions.toggleClass(element, { value: 'active', target: "target" });

    expect(element.classList.contains('active')).toBe(true);
  });

  test('toggleClass removes class when present', () => {
    element.classList.add('active');
    classActions.toggleClass(element, { value: 'active', target: "target" });

    expect(element.classList.contains('active')).toBe(false);
  });

  test('addClass adds multiple classes', () => {
    classActions.addClass(element, { value: 'active,visible', target: "target" });

    expect([...element.classList]).toEqual(['existing', 'active', 'visible']);
  });

  test('removeClass removes specified classes', () => {
    classActions.removeClass(element, { value: 'existing', target: "target" });

    expect(element.classList.contains('existing')).toBe(false);
  });

  test('cycleClass cycles through class array', () => {
    classActions.cycleClass(element, { value: 'red,blue,green', target: "target" });
    expect(element.classList.contains('red')).toBe(true);

    classActions.cycleClass(element, { value: 'red,blue,green', target: "target" });
    expect(element.classList.contains('blue')).toBe(true);
  });
});
