class Debug {
  static enabled = false;
  static prefix = "🧲 ";

  static logger(name) {
    if (!this.enabled) {
      return {
        log: () => {},
        error: () => {},
        group: () => {}
      };
    }

    return {
      log: (...args) => console.log(this.prefix, `[${name}]`, ...args),
      error: (...args) => console.error(this.prefix, `[${name}]`, ...args),
      group: (label, callback) => {
        console.group(this.prefix, `[${name}] ${label}`);
        callback();
        console.groupEnd();
      }
    };
  }

  static log(...args) {
    if (this.enabled) console.log(this.prefix, ...args);
  }

  static warn(...args) {
    if (this.enabled) console.warn(this.prefix, ...args);
  }

  static error(...args) {
    if (this.enabled) console.error(this.prefix, ...args);
  }

  static throw(message) {
    throw new Error(`${this.prefix}${message}`);
  }
}

export default Debug;
