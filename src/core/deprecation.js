const warned = new Set();
const removalVersion = "1.0.0";

const deprecation = {
  warn(message) {
    if (warned.has(message)) return;

    warned.add(message);

    console.warn(
      `[deprecation] ${message} (will be removed in ${removalVersion}) ` +
        `See https://attractivejs.railsdesigner.com/upgrade`
    );
  }
};

export default deprecation;
