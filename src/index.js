/**
 * 🧲 Attractive.js — A light-weight library for declarative DOM actions using data attributes
 */
import Attractive from "./attractive";

const activateAttractive = (element = document) => {
  Attractive.activate({ on: element });
};

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => activateAttractive());
  } else {
    activateAttractive();
  }

  document.addEventListener("turbo:load", () => activateAttractive());
}

if (typeof window !== "undefined") {
  window.Attractive = Attractive;
}

export default Attractive;
