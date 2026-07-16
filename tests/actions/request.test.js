import { describe, test, expect, beforeEach, vi } from "vitest";
import { get, post, patch, put } from "../../src/actions/request.js";
import Debug from "../../src/debug.js";
import { csrf } from "../../src/actions/request/csrf.js";

describe("Request Actions", () => {
  beforeEach(() => {
    document.body.innerHTML = "";

    vi.clearAllTimers();
    vi.useFakeTimers();

    global.fetch = vi.fn();
    Debug.enabled = true;

    csrf.header = null;
    csrf.token = null;
  });

  describe("get", () => {
    test("fetches and updates target with response", async () => {
      document.body.innerHTML = `
        <button id="trigger">Get</button>
        <div id="target"></div>
      `;
      const element = document.getElementById("trigger");
      const target = document.getElementById("target");

      fetch.mockResolvedValue({
        ok: true,
        headers: new Headers({ "Content-Type": "text/html" }),
        text: () => Promise.resolve("<p>Response content</p>")
      });

      await get(element, {
        target: "target",
        value: "/api/data"
      });

      expect(fetch).toHaveBeenCalledWith(
        "/api/data",
        expect.objectContaining({ method: "GET" })
      );
      expect(target.innerHTML).toBe("<p>Response content</p>");
    });

    test("sets busy state during request", async () => {
      document.body.innerHTML = `
        <button id="trigger">Get</button>
        <div id="target"></div>
      `;
      const element = document.getElementById("trigger");
      const target = document.getElementById("target");

      fetch.mockImplementation(
        () =>
          new Promise((resolve) => {
            expect(target.getAttribute("data-request-busy")).toBe("true");
            resolve({
              ok: true,
              headers: new Headers({ "Content-Type": "text/html" }),
              text: () => Promise.resolve("content")
            });
          })
      );

      await get(element, {
        target: "target",
        value: "/api/data"
      });
    });

    test("sets success state after successful request", async () => {
      document.body.innerHTML = `
        <button id="trigger">Get</button>
        <div id="target"></div>
      `;
      const element = document.getElementById("trigger");
      const target = document.getElementById("target");

      fetch.mockResolvedValue({
        ok: true,
        headers: new Headers({ "Content-Type": "text/html" }),
        text: () => Promise.resolve("content")
      });

      await get(element, {
        target: "target",
        value: "/api/data"
      });

      expect(target.getAttribute("data-request-success")).toBe("true");
      expect(target.hasAttribute("data-request-busy")).toBe(false);
    });

    test("sets error state on failed request", async () => {
      document.body.innerHTML = `
        <button id="trigger">Get</button>
        <div id="target"></div>
      `;
      const element = document.getElementById("trigger");
      const target = document.getElementById("target");

      fetch.mockResolvedValue({ ok: false, status: 404 });

      await expect(
        get(element, { target: "target", value: "/api/data" })
      ).rejects.toThrow("HTTP error! status: 404");

      expect(target.getAttribute("data-request-success")).toBe("false");
    });

    test("warns about missing URL", async () => {
      document.body.innerHTML = `
        <button id="trigger">Get</button>
        <div id="target"></div>
      `;
      const element = document.getElementById("trigger");

      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      await get(element, { target: "target" });

      expect(warnSpy).toHaveBeenCalledWith(
        "🧲 ",
        "No URL provided in the action value"
      );

      warnSpy.mockRestore();
    });

    test("warns about cross-origin requests", async () => {
      document.body.innerHTML = `
        <button id="trigger">Get</button>
        <div id="target"></div>
      `;
      const element = document.getElementById("trigger");

      fetch.mockResolvedValue({
        ok: true,
        headers: new Headers({ "Content-Type": "text/html" }),
        text: () => Promise.resolve("content")
      });

      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      await get(element, {
        target: "target",
        value: "https://external.com/api"
      });

      expect(warnSpy).toHaveBeenCalledWith(
        "🧲 ",
        "Cross-origin request to: https://external.com/api. Missing the correct CORS headers."
      );

      warnSpy.mockRestore();
    });

    test("removes success state after duration", async () => {
      document.body.innerHTML = `
        <button id="trigger" data-request-feedback="100">Get</button>
        <div id="target"></div>
      `;
      const element = document.getElementById("trigger");
      const target = document.getElementById("target");

      fetch.mockResolvedValue({
        ok: true,
        headers: new Headers({ "Content-Type": "text/html" }),
        text: () => Promise.resolve("content")
      });

      await get(element, {
        target: "target",
        value: "/api/data"
      });

      expect(target.hasAttribute("data-request-success")).toBe(true);

      vi.advanceTimersByTime(100);

      expect(target.hasAttribute("data-request-success")).toBe(false);
    });

    test("calls onJSON with parsed JSON when Content-Type is application/json", async () => {
      document.body.innerHTML = `
        <button id="trigger">Get</button>
        <div id="target"></div>
      `;
      const element = document.getElementById("trigger");
      const jsonData = { message: "hello" };
      const onJSON = vi.fn();

      get.onJSON = onJSON;

      fetch.mockResolvedValue({
        ok: true,
        headers: new Headers({ "Content-Type": "application/json" }),
        json: () => Promise.resolve(jsonData),
        text: () => Promise.resolve("should not be called")
      });

      await get(element, {
        target: "target",
        value: "/api/data"
      });

      expect(onJSON).toHaveBeenCalledWith(jsonData);
    });

    test("does not call onJSON when Content-Type is text/html", async () => {
      document.body.innerHTML = `
        <button id="trigger">Get</button>
        <div id="target"></div>
      `;
      const element = document.getElementById("trigger");
      const onJSON = vi.fn();

      get.onJSON = onJSON;

      fetch.mockResolvedValue({
        ok: true,
        headers: new Headers({ "Content-Type": "text/html" }),
        text: () => Promise.resolve("<p>html</p>")
      });

      await get(element, {
        target: "target",
        value: "/api/data"
      });

      expect(onJSON).not.toHaveBeenCalled();
    });
  });

  describe("post", () => {
    test("sends POST request with form data", async () => {
      document.body.innerHTML = `
        <button id="trigger">Post</button>
        <form id="target">
          <input name="name" value="John">
          <input name="email" value="john@example.com">
        </form>
      `;
      const element = document.getElementById("trigger");

      fetch.mockResolvedValue({
        ok: true,
        headers: new Headers({ "Content-Type": "application/json" }),
        json: () => Promise.resolve({})
      });

      await post(element, {
        target: "target",
        value: "/api/users"
      });

      expect(fetch).toHaveBeenCalledWith(
        "/api/users",
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Attract: "true"
          },
          body: JSON.stringify({ name: "John", email: "john@example.com" })
        })
      );
    });

    test("sends POST request with input field data", async () => {
      document.body.innerHTML = `
        <input id="trigger" name="message" value="Hello">
        <div id="target"></div>
      `;
      const element = document.getElementById("trigger");

      fetch.mockResolvedValue({
        ok: true,
        headers: new Headers({ "Content-Type": "application/json" }),
        json: () => Promise.resolve({})
      });

      await post(element, {
        target: "target",
        value: "/api/messages"
      });

      expect(fetch).toHaveBeenCalledWith(
        "/api/messages",
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Attract: "true"
          },
          body: JSON.stringify({ message: "Hello" })
        })
      );
    });

    test("calls onJSON with parsed JSON for POST", async () => {
      document.body.innerHTML = `
        <button id="trigger">Post</button>
        <div id="target"></div>
      `;
      const element = document.getElementById("trigger");
      const jsonData = { status: "saved" };
      const onJSON = vi.fn();

      post.onJSON = onJSON;

      fetch.mockResolvedValue({
        ok: true,
        headers: new Headers({ "Content-Type": "application/json" }),
        json: () => Promise.resolve(jsonData)
      });

      await post(element, {
        target: "target",
        value: "/api/save"
      });

      expect(onJSON).toHaveBeenCalledWith(jsonData);
    });
  });

  describe("patch", () => {
    test("sends PATCH request", async () => {
      document.body.innerHTML = `
        <button id="trigger">Patch</button>
        <div id="target"></div>
      `;
      const element = document.getElementById("trigger");

      fetch.mockResolvedValue({
        ok: true,
        headers: new Headers({ "Content-Type": "application/json" }),
        json: () => Promise.resolve({})
      });

      await patch(element, {
        target: "target",
        value: "/api/users/1"
      });

      expect(fetch).toHaveBeenCalledWith(
        "/api/users/1",
        expect.objectContaining({
          method: "PATCH"
        })
      );
    });

    test("calls onJSON with parsed JSON for PATCH", async () => {
      document.body.innerHTML = `
        <button id="trigger">Patch</button>
        <div id="target"></div>
      `;
      const element = document.getElementById("trigger");
      const jsonData = { status: "updated" };
      const onJSON = vi.fn();

      patch.onJSON = onJSON;

      fetch.mockResolvedValue({
        ok: true,
        headers: new Headers({ "Content-Type": "application/json" }),
        json: () => Promise.resolve(jsonData)
      });

      await patch(element, {
        target: "target",
        value: "/api/users/1"
      });

      expect(onJSON).toHaveBeenCalledWith(jsonData);
    });
  });

  describe("put", () => {
    test("sends PUT request", async () => {
      document.body.innerHTML = `
        <button id="trigger">Put</button>
        <div id="target"></div>
      `;
      const element = document.getElementById("trigger");

      fetch.mockResolvedValue({
        ok: true,
        headers: new Headers({ "Content-Type": "application/json" }),
        json: () => Promise.resolve({})
      });

      await put(element, {
        target: "target",
        value: "/api/users/1"
      });

      expect(fetch).toHaveBeenCalledWith(
        "/api/users/1",
        expect.objectContaining({
          method: "PUT"
        })
      );
    });

    test("calls onJSON with parsed JSON for PUT", async () => {
      document.body.innerHTML = `
        <button id="trigger">Put</button>
        <div id="target"></div>
      `;
      const element = document.getElementById("trigger");
      const jsonData = { status: "replaced" };
      const onJSON = vi.fn();

      put.onJSON = onJSON;

      fetch.mockResolvedValue({
        ok: true,
        headers: new Headers({ "Content-Type": "application/json" }),
        json: () => Promise.resolve(jsonData)
      });

      await put(element, {
        target: "target",
        value: "/api/users/1"
      });

      expect(onJSON).toHaveBeenCalledWith(jsonData);
    });
  });

  describe("CSRF", () => {
    test("omits CSRF header when csrf.token is null", async () => {
      document.body.innerHTML = `
        <button id="trigger">Post</button>
        <form id="target">
          <input name="name" value="John">
        </form>
      `;
      const element = document.getElementById("trigger");

      csrf.header = "X-CSRF-Token";
      csrf.token = null;

      fetch.mockResolvedValue({
        ok: true,
        headers: new Headers({ "Content-Type": "application/json" }),
        json: () => Promise.resolve({})
      });

      await post(element, {
        target: "target",
        value: "/api/users"
      });

      expect(fetch).toHaveBeenCalledWith(
        "/api/users",
        expect.objectContaining({
          headers: {
            "Content-Type": "application/json",
            Attract: "true"
          }
        })
      );
    });

    test("includes CSRF header when csrf.token and csrf.header are set", async () => {
      document.body.innerHTML = `
        <button id="trigger">Post</button>
        <form id="target">
          <input name="name" value="John">
        </form>
      `;
      const element = document.getElementById("trigger");

      csrf.header = "X-CSRF-Token";
      csrf.token = "abc123";

      fetch.mockResolvedValue({
        ok: true,
        headers: new Headers({ "Content-Type": "application/json" }),
        json: () => Promise.resolve({})
      });

      await post(element, {
        target: "target",
        value: "/api/users"
      });

      expect(fetch).toHaveBeenCalledWith(
        "/api/users",
        expect.objectContaining({
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": "abc123",
            Attract: "true"
          }
        })
      );
    });

    test("calls csrf.token as a function", async () => {
      document.body.innerHTML = `
        <button id="trigger">Post</button>
        <form id="target">
          <input name="name" value="John">
        </form>
      `;
      const element = document.getElementById("trigger");

      csrf.header = "X-CSRF-Token";
      csrf.token = () => "dynamic-token";

      fetch.mockResolvedValue({
        ok: true,
        headers: new Headers({ "Content-Type": "application/json" }),
        json: () => Promise.resolve({})
      });

      await post(element, {
        target: "target",
        value: "/api/users"
      });

      expect(fetch).toHaveBeenCalledWith(
        "/api/users",
        expect.objectContaining({
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": "dynamic-token",
            Attract: "true"
          }
        })
      );
    });
  });

  describe("post cross-origin", () => {
    test("warns about cross-origin POST request", async () => {
      document.body.innerHTML = `
        <button id="trigger">Post</button>
        <div id="target"></div>
      `;
      const element = document.getElementById("trigger");

      fetch.mockResolvedValue({
        ok: true,
        headers: new Headers({ "Content-Type": "application/json" }),
        json: () => Promise.resolve({})
      });

      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      await post(element, {
        target: "target",
        value: "https://external.com/api"
      });

      expect(warnSpy).toHaveBeenCalledWith(
        "🧲 ",
        "Cross-origin request to: https://external.com/api. Missing the correct CORS headers."
      );

      warnSpy.mockRestore();
    });
  });
});
