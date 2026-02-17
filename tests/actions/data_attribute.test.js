import { describe, test, expect, beforeEach } from 'vitest';
import dataAttributeActions from '../../src/actions/data_attribute.js';

describe('DataAttribute Actions', () => {
  let element;

  beforeEach(() => {
    document.body.innerHTML = '<div id="target" data-existing="value"></div>';
    element = document.getElementById('target');
  });

  test('toggleDataAttribute adds data attribute when not present', () => {
    dataAttributeActions.toggleDataAttribute(element, { value: 'active=true', target: "target" });

    expect(element.dataset.active).toBe('true');
  });

  test('toggleDataAttribute removes data attribute when present', () => {
    dataAttributeActions.toggleDataAttribute(element, { value: 'existing', target: "target" });

    expect(element.dataset.existing).toBeUndefined();
  });

  test('addDataAttribute sets data attribute with value', () => {
    dataAttributeActions.addDataAttribute(element, { value: 'status=active', target: "target" });

    expect(element.dataset.status).toBe('active');
  });

  test('addDataAttribute sets empty data attribute when no value', () => {
    dataAttributeActions.addDataAttribute(element, { value: 'flag', target: "target" });

    expect(element.dataset.flag).toBe('');
  });

  test('removeDataAttribute removes specified data attribute', () => {
    dataAttributeActions.removeDataAttribute(element, { value: 'existing', target: "target" });

    expect(element.dataset.existing).toBeUndefined();
  });

  test('cycleDataAttribute cycles through values', () => {
    dataAttributeActions.cycleDataAttribute(element, { value: 'state=red,blue,green', target: "target" });

    expect(element.dataset.state).toBe('red');

    dataAttributeActions.cycleDataAttribute(element, { value: 'state=red,blue,green', target: "target" });

    expect(element.dataset.state).toBe('blue');
  });
});
