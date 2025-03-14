/**
 * 🧲 Attractive.js — A light-weight library for declarative DOM actions using data attributes
*/
import Attractive from "./attractive"

const activateAttractive = (element = document) => {
  if (window.Attractive && window.Attractive._initialized) return;

  Attractive.activate({ element });
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
