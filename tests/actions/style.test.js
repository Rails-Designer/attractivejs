import { describe, test, expect, beforeEach } from "vitest";
import {
  setStyle,
  removeStyle,
  toggleStyle,
  cycleStyle
} from "../../src/actions/style.js";

describe("Style Actions", () => {
  let element;

  beforeEach(() => {
    document.body.innerHTML = '<div id="target" style="color: black"></div>';
    element = document.getElementById("target");
  });

  test("setStyle sets a CSS property with value", () => {
    setStyle(element, {
      value: "color=red",
      target: "target"
    });

    expect(element.style.color).toBe("red");
  });

  test("setStyle sets a custom property", () => {
    setStyle(element, {
      value: "--index=2",
      target: "target"
    });

    expect(element.style.getPropertyValue("--index")).toBe("2");
  });

  test("setStyle with no value sets empty", () => {
    setStyle(element, {
      value: "opacity",
      target: "target"
    });

    expect(element.style.opacity).toBe("");
  });

  test("removeStyle removes a CSS property", () => {
    element.style.color = "red";

    removeStyle(element, {
      value: "color",
      target: "target"
    });

    expect(element.style.color).toBe("");
  });

  test("removeStyle removes a custom property", () => {
    element.style.setProperty("--index", "0");

    removeStyle(element, {
      value: "--index",
      target: "target"
    });

    expect(element.style.getPropertyValue("--index")).toBe("");
  });

  test("toggleStyle adds a property when not set", () => {
    toggleStyle(element, {
      value: "--active=true",
      target: "target"
    });

    expect(element.style.getPropertyValue("--active")).toBe("true");
  });

  test("toggleStyle removes a property when already set", () => {
    element.style.setProperty("--active", "true");

    toggleStyle(element, {
      value: "--active=true",
      target: "target"
    });

    expect(element.style.getPropertyValue("--active")).toBe("");
  });

  test("cycleStyle cycles through values forward", () => {
    cycleStyle(element, {
      value: "--index=0,1,2,3",
      target: "target"
    });

    expect(element.style.getPropertyValue("--index")).toBe("0");

    cycleStyle(element, {
      value: "--index=0,1,2,3",
      target: "target"
    });

    expect(element.style.getPropertyValue("--index")).toBe("1");
  });

  test("cycleStyle wraps around after last value", () => {
    element.style.setProperty("--index", "3");

    cycleStyle(element, {
      value: "--index=0,1,2,3",
      target: "target"
    });

    expect(element.style.getPropertyValue("--index")).toBe("0");
  });

  test("cycleStyle works with reversed values for backward cycling", () => {
    element.style.setProperty("--index", "1");

    cycleStyle(element, {
      value: "--index=3,2,1,0",
      target: "target"
    });

    expect(element.style.getPropertyValue("--index")).toBe("0");
  });

  test("cycleStyle starts from first value when property is not set", () => {
    cycleStyle(element, {
      value: "--index=0,1,2,3",
      target: "target"
    });

    expect(element.style.getPropertyValue("--index")).toBe("0");
  });
});
