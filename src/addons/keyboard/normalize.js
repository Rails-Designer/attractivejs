const macosSymbolLayerKeys = {
  "\u00A1": "1",
  "\u2122": "2",
  "\u00A3": "3",
  "\u00A2": "4",
  "\u221E": "5",
  "\u00A7": "6",
  "\u00B6": "7",
  "\u2022": "8",
  "\u00AA": "9",
  "\u00BA": "0",
  "\u2013": "-",
  "\u2260": "=",
  "\u2044": "!",
  "\u20AC": "@",
  "\u2039": "#",
  "\u203A": "$",
  "\uFB01": "%",
  "\uFB02": "^",
  "\u2021": "&",
  "\u00B0": "*",
  "\u00B7": "(",
  "\u201A": ")",
  "\u2014": "_",
  "\u00B1": "+",
  "\u0153": "q",
  "\u2211": "w",
  "\u00AE": "r",
  "\u2020": "t",
  "\u00A5": "y",
  "\u00F8": "o",
  "\u03C0": "p",
  "\u201C": "[",
  "\u2018": "]",
  "\u00AB": "\\",
  "\u0152": "Q",
  "\u201E": "W",
  "\u00B4": "E",
  "\u2030": "R",
  "\u02C7": "T",
  "\u00C1": "Y",
  "\u00A8": "U",
  "\u02C6": "I",
  "\u00D8": "O",
  "\u220F": "P",
  "\u201D": "{",
  "\u2019": "}",
  "\u00BB": "|",
  "\u00E5": "a",
  "\u00DF": "s",
  "\u2202": "d",
  "\u0192": "f",
  "\u00A9": "g",
  "\u02D9": "h",
  "\u2206": "j",
  "\u02DA": "k",
  "\u00AC": "l",
  "\u2026": ";",
  "\u00E6": "'",
  "\u00C5": "A",
  "\u00CD": "S",
  "\u00CE": "D",
  "\u00CF": "F",
  "\u02DD": "G",
  "\u00D3": "H",
  "\u00D4": "J",
  "\uF8FF": "K",
  "\u00D2": "L",
  "\u00DA": ":",
  "\u00C6": '"',
  "\u03A9": "z",
  "\u2248": "x",
  "\u00E7": "c",
  "\u221A": "v",
  "\u222B": "b",
  "\u00B5": "m",
  "\u2264": ",",
  "\u2265": ".",
  "\u00F7": "/",
  "\u00B8": "Z",
  "\u02DB": "X",
  "\u00C7": "C",
  "\u25CA": "V",
  "\u0131": "B",
  "\u02DC": "N",
  "\u00C2": "M",
  "\u00AF": "<",
  "\u02D8": ">",
  "\u00BF": "?"
};

const macosUppercaseLayerKeys = {
  "`": "~",
  1: "!",
  2: "@",
  3: "#",
  4: "$",
  5: "%",
  6: "^",
  7: "&",
  8: "*",
  9: "(",
  0: ")",
  "-": "_",
  "=": "+",
  "[": "{",
  "]": "}",
  "\\": "|",
  ";": ":",
  "'": '"',
  ",": "<",
  ".": ">",
  "/": "?",
  q: "Q",
  w: "W",
  e: "E",
  r: "R",
  t: "T",
  y: "Y",
  u: "U",
  i: "I",
  o: "O",
  p: "P",
  a: "A",
  s: "S",
  d: "D",
  f: "F",
  g: "G",
  h: "H",
  j: "J",
  k: "K",
  l: "L",
  z: "Z",
  x: "X",
  c: "C",
  v: "V",
  b: "B",
  n: "N",
  m: "M"
};

const syntheticKeyNames = { " ": "Space", "+": "Plus" };

const modifierKeyNames = ["Control", "Alt", "Meta", "Shift"];

const orderedModifiers = {
  Control: 0,
  Alt: 1,
  Meta: 2,
  Shift: 3
};

const matchApplePlatform = /Mac|iPod|iPhone|iPad/i;

export class Normalize {
  static match(event, { with: keyString, on: platform }) {
    const attributeString = Normalize.normalize(
      keyString,
      platform
    ).toLowerCase();
    const eventString = Normalize.#serialize(event, platform).toLowerCase();

    if (attributeString === eventString) return true;

    if (eventString.includes("shift+") && !attributeString.includes("shift+")) {
      const withoutShift = eventString.replace(/shift\+/g, "");

      if (attributeString === withoutShift) return true;
    }

    return false;
  }

  static normalize(keyString, platform) {
    let normalized = Normalize.#localizeModifier(keyString, platform);

    normalized = Normalize.#sortModifiers(normalized);

    return normalized;
  }

  static sequence(sequence, platform) {
    return sequence
      .split(" ")
      .map((part) => Normalize.normalize(part, platform))
      .join(" ");
  }

  static #serialize(event, platform) {
    const { ctrlKey, altKey, metaKey, shiftKey, key } = event;
    const keyNames = [];
    const modifierFlags = [ctrlKey, altKey, metaKey, shiftKey];

    for (const [index, flag] of modifierFlags.entries()) {
      if (flag) keyNames.push(modifierKeyNames[index]);
    }

    if (!modifierKeyNames.includes(key)) {
      const platformName = platform ?? navigator?.userAgent ?? "";
      const isApplePlatform = matchApplePlatform.test(platformName);

      const altNormalizedKey =
        keyNames.includes("Alt") && isApplePlatform
          ? (macosSymbolLayerKeys[key] ?? key)
          : key;

      const shiftNormalizedKey =
        keyNames.includes("Shift") && isApplePlatform
          ? (macosUppercaseLayerKeys[altNormalizedKey] ?? altNormalizedKey)
          : altNormalizedKey;

      const syntheticKey =
        syntheticKeyNames[shiftNormalizedKey] ?? shiftNormalizedKey;

      keyNames.push(syntheticKey);
    }

    return keyNames.join("+");
  }

  static #localizeModifier(keyString, platform) {
    const platformName = platform ?? navigator?.userAgent ?? "";
    const localModifier = matchApplePlatform.test(platformName)
      ? "Meta"
      : "Control";

    return keyString.replace(/Mod/i, localModifier);
  }

  static #sortModifiers(keyString) {
    return keyString
      .split("+")
      .sort(
        (a, b) =>
          (orderedModifiers[a] ?? Infinity) - (orderedModifiers[b] ?? Infinity)
      )
      .join("+");
  }
}
