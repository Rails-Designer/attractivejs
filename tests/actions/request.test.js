import { describe, test, expect, beforeEach, vi } from 'vitest';
import requestActions from '../../src/actions/request.js';

describe('Request Actions', () => {
  beforeEach(() => {
    document.body.innerHTML = '';

    vi.clearAllTimers();
    vi.useFakeTimers();

    global.fetch = vi.fn();
    console.warn = vi.fn();
    console.error = vi.fn();

    vi.mock('../src/actions/request/csrf', () => ({
      CSRF: {
        get: () => null
      }
    }));
  });

  describe('get', () => {
    test('fetches and updates target with response', async () => {
      document.body.innerHTML = `
        <button id="trigger">Get</button>
        <div id="target"></div>
      `;
      const element = document.getElementById('trigger');
      const target = document.getElementById('target');

      fetch.mockResolvedValue({
        ok: true,
        text: () => Promise.resolve('<p>Response content</p>')
      });

      await requestActions.get(element, { target: 'target', value: '/api/data' });

      expect(fetch).toHaveBeenCalledWith('/api/data', { method: 'GET' });
      expect(target.innerHTML).toBe('<p>Response content</p>');
    });

    test('sets busy state during request', async () => {
      document.body.innerHTML = `
        <button id="trigger">Get</button>
        <div id="target"></div>
      `;
      const element = document.getElementById('trigger');
      const target = document.getElementById('target');

      fetch.mockImplementation(() => new Promise(resolve => {
        expect(target.getAttribute('data-request-busy')).toBe('true');
        resolve({ ok: true, text: () => Promise.resolve('content') });
      }));

      await requestActions.get(element, { target: 'target', value: '/api/data' });
    });

    test('sets success state after successful request', async () => {
      document.body.innerHTML = `
        <button id="trigger">Get</button>
        <div id="target"></div>
      `;
      const element = document.getElementById('trigger');
      const target = document.getElementById('target');

      fetch.mockResolvedValue({
        ok: true,
        text: () => Promise.resolve('content')
      });

      await requestActions.get(element, { target: 'target', value: '/api/data' });

      expect(target.getAttribute('data-request-success')).toBe('true');
      expect(target.hasAttribute('data-request-busy')).toBe(false);
    });

    test('sets error state on failed request', async () => {
      document.body.innerHTML = `
        <button id="trigger">Get</button>
        <div id="target"></div>
      `;
      const element = document.getElementById('trigger');
      const target = document.getElementById('target');

      fetch.mockResolvedValue({ ok: false, status: 404 });

      await expect(requestActions.get(element, { target: 'target', value: '/api/data' }))
        .rejects.toThrow('HTTP error! status: 404');

      expect(target.getAttribute('data-request-success')).toBe('false');
    });

    test('warns about missing URL', async () => {
      document.body.innerHTML = `
        <button id="trigger">Get</button>
        <div id="target"></div>
      `;
      const element = document.getElementById('trigger');

      await requestActions.get(element, { target: 'target' });

      expect(console.warn).toHaveBeenCalledWith('No URL provided in the action value');
    });

    test('warns about cross-origin requests', async () => {
      document.body.innerHTML = `
        <button id="trigger">Get</button>
        <div id="target"></div>
      `;
      const element = document.getElementById('trigger');

      fetch.mockResolvedValue({
        ok: true,
        text: () => Promise.resolve('content')
      });

      await requestActions.get(element, { target: 'target', value: 'https://external.com/api' });

      expect(console.warn).toHaveBeenCalledWith(
        'Cross-origin request to: https://external.com/api. Missing the correct CORS headers.'
      );
    });

    test('removes success state after duration', async () => {
      document.body.innerHTML = `
        <button id="trigger" data-request-duration="100">Get</button>
        <div id="target"></div>
      `;
      const element = document.getElementById('trigger');
      const target = document.getElementById('target');

      fetch.mockResolvedValue({
        ok: true,
        text: () => Promise.resolve('content')
      });

      await requestActions.get(element, { target: 'target', value: '/api/data' });

      expect(target.hasAttribute('data-request-success')).toBe(true);

      vi.advanceTimersByTime(100);

      expect(target.hasAttribute('data-request-success')).toBe(false);
    });
  });

  describe('post', () => {
    test('sends POST request with form data', async () => {
      document.body.innerHTML = `
        <button id="trigger">Post</button>
        <form id="target">
          <input name="name" value="John">
          <input name="email" value="john@example.com">
        </form>
      `;
      const element = document.getElementById('trigger');

      fetch.mockResolvedValue({ ok: true });

      await requestActions.post(element, { target: 'target', value: '/api/users' });

      expect(fetch).toHaveBeenCalledWith('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': null
        },
        body: JSON.stringify({ name: 'John', email: 'john@example.com' })
      });
    });

    test('sends POST request with input field data', async () => {
      document.body.innerHTML = `
        <input id="trigger" name="message" value="Hello">
        <div id="target"></div>
      `;
      const element = document.getElementById('trigger');

      fetch.mockResolvedValue({ ok: true });

      await requestActions.post(element, { target: 'target', value: '/api/messages' });

      expect(fetch).toHaveBeenCalledWith('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': null
        },
        body: JSON.stringify({ message: 'Hello' })
      });
    });
  });

  describe('patch', () => {
    test('sends PATCH request', async () => {
      document.body.innerHTML = `
        <button id="trigger">Patch</button>
        <div id="target"></div>
      `;
      const element = document.getElementById('trigger');

      fetch.mockResolvedValue({ ok: true });

      await requestActions.patch(element, { target: 'target', value: '/api/users/1' });

      expect(fetch).toHaveBeenCalledWith('/api/users/1', expect.objectContaining({
        method: 'PATCH'
      }));
    });
  });

  describe('put', () => {
    test('sends PUT request', async () => {
      document.body.innerHTML = `
        <button id="trigger">Put</button>
        <div id="target"></div>
      `;
      const element = document.getElementById('trigger');

      fetch.mockResolvedValue({ ok: true });

      await requestActions.put(element, { target: 'target', value: '/api/users/1' });

      expect(fetch).toHaveBeenCalledWith('/api/users/1', expect.objectContaining({
        method: 'PUT'
      }));
    });
  });
});
