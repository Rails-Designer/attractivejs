class Debug {
  static enabled = false;
  static prefix = "🧲 ";

  static log(...args) {
    if (this.enabled) console.log(this.prefix, ...args);
  }

  static warn(...args) {
    if (this.enabled) console.warn(this.prefix, ...args);
  }

  static error(...args) {
    if (this.enabled) console.error(this.prefix, ...args);
  }
}

export default Debug;
