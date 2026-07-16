export default function from(files, { nameFor } = {}) {
  return Object.fromEntries(
    Object.entries(files).map(([path, module]) => {
      const action = module.default ?? module;
      const name = nameFor
        ? nameFor(path, action)
        : toCamelCase(filename(path));

      return [name, action];
    })
  );
}

function filename(path) {
  return path
    .split("/")
    .pop()
    .replace(/\.\w+$/, "");
}

function toCamelCase(string) {
  return string.replace(/_([a-z])/g, (_, cased) => cased.toUpperCase());
}
